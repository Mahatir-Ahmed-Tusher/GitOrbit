
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from 'react';

export default function PrivacyPage() {
  const [lastUpdated, setLastUpdated] = useState('');
  
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Privacy Policy</CardTitle>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground">
        
        <h3 className="font-semibold text-foreground">1. Data Collection</h3>
        <p>GitOrbit is designed with privacy as a priority. All data, including your GitHub Personal Access Token (PAT), loaded repository content, and any notes or summaries you generate, is stored exclusively in your browser's local storage. This data never leaves your computer and is not sent to any third-party servers, other than the necessary API calls made directly from your browser to the GitHub API.</p>
        <h3 className="font-semibold text-foreground">2. Data Usage</h3>
        <p>The data stored locally is used solely to provide the application's features, such as caching repository data for performance, maintaining your session, and saving your notes. We do not use this data for any other purpose.</p>
        <h3 className="font-semibold text-foreground">3. Data Security</h3>
        <p>Your GitHub PAT is treated as sensitive information and is stored in local storage. While this is secure for client-side applications, you should ensure your computer is secure. You can revoke this token at any time from your GitHub account settings.</p>
        <h3 className="font-semibold text-foreground">4. Changes to This Policy</h3>
        <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>
      </CardContent>
    </Card>
  )
}
