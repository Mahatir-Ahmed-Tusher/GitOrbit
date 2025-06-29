"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { onAuthStateChanged, GithubAuthProvider, signInWithPopup, signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { type AuthUser } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: AuthUser | null;
  loading: boolean;
  signInWithGitHub: () => Promise<void>;
  signOut: () => Promise<void>;
  githubToken: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [githubToken, setGithubToken] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      if (!user) {
        setGithubToken(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGitHub = async () => {
    const provider = new GithubAuthProvider();
    provider.addScope("repo");
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GithubAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        setGithubToken(credential.accessToken);
      }
      toast({ title: "Successfully signed in!" });
    } catch (error: any) {
      console.error("GitHub sign-in error:", error);
      toast({ title: "Sign-in Failed", description: error.message, variant: "destructive" });
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      toast({ title: "Signed out successfully." });
    } catch (error: any) {
      console.error("Sign-out error:", error);
      toast({ title: "Sign-out Failed", description: error.message, variant: "destructive" });
    }
  };

  const value = { user, loading, signInWithGitHub, signOut, githubToken };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
