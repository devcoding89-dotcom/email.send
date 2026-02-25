"use client";

import { useUser } from "@/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { ScoutView } from "@/components/scout/ScoutView";
import { Button } from "@/components/ui/button";
import { Zap, Github, ArrowRight, MousePointer2, Layers } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex h-svh w-full items-center justify-center bg-background">
        <Zap className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      
      {!user ? (
        <main className="flex-1 w-full overflow-x-hidden">
          {/* Hero Section */}
          <section className="relative pt-12 pb-16 md:pt-24 md:pb-32 px-4">
            <div className="max-w-4xl mx-auto text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary text-[10px] font-black tracking-widest uppercase">
                <Zap className="w-3 h-3 fill-primary" />
                Autonomous Data Scouting
              </div>
              <h1 className="text-4xl md:text-7xl font-bold font-headline leading-tight text-foreground tracking-tighter">
                Precision <br />
                <span className="text-primary">Extraction.</span>
              </h1>
              <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                The ultimate intelligence layer for modern outreach. Transform chaotic data into actionable leads.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 pt-4">
                <Button size="lg" className="h-14 rounded-xl text-lg font-black w-full sm:w-auto" onClick={() => setShowAuth(true)}>
                  Initialize System
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 md:py-24 px-4 border-t border-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12 space-y-2">
                <h2 className="text-2xl md:text-4xl font-black font-headline tracking-tighter uppercase">High-Frequency Intelligence</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: MousePointer2, title: "Neural Isolation", desc: "Our engine extracts targets from data dumps with zero friction." },
                  { icon: Zap, title: "Agentic Detection", desc: "Leverage GenAI to map names, roles, and organizations contextual intent." },
                  { icon: Layers, title: "Mass Serialization", desc: "Instantly serialize thousands of records for CRM ingestion." }
                ].map((feature, i) => (
                  <div key={i} className="p-6 md:p-8 rounded-2xl bg-secondary/20 border border-white/5">
                    <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary mb-6">
                      <feature.icon className="w-5 h-5 fill-primary/20" />
                    </div>
                    <h3 className="text-lg md:text-xl font-black font-headline mb-3 uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm md:text-base font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-12 border-t border-white/5 bg-black/20 text-center">
            <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary fill-primary" />
                <span className="text-xl font-black font-headline tracking-tighter uppercase">Scoutier</span>
              </div>
              <div className="flex gap-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <a href="#">Privacy</a>
                <a href="#">Terms</a>
                <a href="#">Docs</a>
              </div>
              <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">© 2024 Scoutier Inc.</p>
            </div>
          </footer>
        </main>
      ) : (
        <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
          <header className="mb-8 space-y-2">
            <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest">
              <div className="h-[1px] w-6 bg-primary" />
              Intelligence Terminal
            </div>
            <h1 className="text-3xl md:text-5xl font-black font-headline uppercase tracking-tighter">Extraction Engine</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl font-medium">
              Initialize a data pass to isolate targets. Activate AI Mode for deep-layer entity mapping.
            </p>
          </header>

          <ScoutView />
        </main>
      )}

      {showAuth && !user && <AuthOverlay onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />}
    </div>
  );
}