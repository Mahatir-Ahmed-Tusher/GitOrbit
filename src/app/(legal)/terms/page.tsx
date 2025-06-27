
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useState, useEffect } from 'react';

export default function TermsPage() {
  const [lastUpdated, setLastUpdated] = useState('');
  
  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-3xl">Terms of Service</CardTitle>
        <CardDescription>Last Updated: {lastUpdated}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-muted-foreground">
        
        <h3 className="font-semibold text-foreground">1. Acceptance of Terms</h3>
        <p>By accessing or using GitOrbit, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.</p>
        <h3 className="font-semibold text-foreground">2. Use License</h3>
        <p>Permission is granted to temporarily use GitOrbit for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.</p>
        <h3 className="font-semibold text-foreground">3. Disclaimer</h3>
        <p>The materials on GitOrbit's website are provided on an 'as is' basis. GitOrbit makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.</p>
        <h3 className="font-semibold text-foreground">4. Limitations</h3>
        <p>In no event shall GitOrbit or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on GitOrbit's website.</p>
      </CardContent>
    </Card>
  )
}
