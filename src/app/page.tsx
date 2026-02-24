
"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { Navbar } from "@/components/layout/Navbar";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { ScoutView } from "@/components/scout/ScoutView";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Globe, Github } from "lucide-react";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Zap className="h-10 w-10 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      {!user ? (
        <AuthOverlay onSuccess={() => window.location.reload()} />
      ) : (
        <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-primary font-semibold text-sm uppercase tracking-wider">
                <Zap className="w-4 h-4" />
                Power Extraction
              </div>
              <h1 className="text-4xl font-bold font-headline leading-tight">Workspace</h1>
              <p className="text-muted-foreground text-lg max-w-2xl">
                Paste any unstructured text to instantly isolate emails and identify key entities with optional AI analysis.
              </p>
            </div>
            <div className="flex gap-3">
               <div className="flex flex-col items-center bg-card border rounded-xl p-3 shadow-sm min-w-[100px]">
                  <span className="text-2xl font-bold text-primary">Live</span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">Parser Status</span>
               </div>
            </div>
          </header>

          <ScoutView />

          <footer className="mt-20 py-10 border-t flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4" />
                GDPR Compliant
              </div>
              <div className="flex items-center gap-1">
                <Globe className="w-4 h-4" />
                Edge Global Nodes
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" className="text-muted-foreground">Privacy Policy</Button>
              <Button variant="ghost" size="sm" className="text-muted-foreground">Terms of Service</Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Github className="w-4 h-4" />
              </Button>
            </div>
          </footer>
        </main>
      )}
    </div>
  );
}
