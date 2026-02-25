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
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Zap className="h-10 w-10 text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      
      {!user ? (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden hero-gradient">
            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 text-primary-foreground text-xs font-black tracking-widest uppercase">
                  <Zap className="w-4 h-4 fill-primary" />
                  Autonomous Data Scouting
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline leading-tight text-foreground tracking-tighter">
                  Precision <br className="hidden md:block" />
                  <span className="text-primary">Extraction.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                  The ultimate intelligence layer for modern outreach. Transform chaotic data into actionable leads with surgically precise AI.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 px-4">
                  <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl rounded-2xl shadow-lg shadow-primary/20 font-black" onClick={() => setShowAuth(true)}>
                    Initialize System
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="secondary" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl rounded-2xl bg-secondary font-bold">
                    System Demo
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 md:py-32 bg-background relative border-t border-white/5">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 space-y-4">
                <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter uppercase">High-Frequency Intelligence</h2>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">Proprietary engines built for speed, accuracy, and mass scale.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { icon: MousePointer2, title: "Neural Isolation", desc: "Our neural regex engine extracts targets from data dumps with zero friction." },
                  { icon: Zap, title: "Agentic Detection", desc: "Beyond strings. Leverage GenAI to map names, roles, and organizations with contextual intent." },
                  { icon: Layers, title: "Mass Serialization", desc: "Instantly serialize thousands of records into industry-standard formats for CRM ingestion." }
                ].map((feature, i) => (
                  <div key={i} className="group relative p-8 md:p-10 rounded-3xl bg-secondary/20 border border-white/5 hover:border-primary/50 transition-colors card-glow">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/20 flex items-center justify-center text-primary mb-8">
                      <feature.icon className="w-6 h-6 md:w-7 md:h-7 fill-primary/20" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-black font-headline mb-4 uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-16 border-t border-white/5 bg-black/20">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl">
                    <Zap className="w-6 h-6 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <span className="text-2xl font-black font-headline tracking-tighter uppercase">Scoutier</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 text-xs font-black uppercase tracking-widest text-muted-foreground">
                  <a href="#" className="hover:text-primary">Privacy</a>
                  <a href="#" className="hover:text-primary">Terms</a>
                  <a href="#" className="hover:text-primary">Docs</a>
                  <a href="#" className="hover:text-primary"><Github className="w-6 h-6" /></a>
                </div>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">© 2024 Scoutier Inc.</p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-12 max-w-6xl">
          <header className="mb-12 space-y-4">
            <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-widest">
              <div className="h-[2px] w-8 bg-primary" />
              Intelligence Terminal
            </div>
            <h1 className="text-4xl md:text-6xl font-black font-headline leading-tight uppercase tracking-tighter">Extraction <br /> Engine</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed font-medium">
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
