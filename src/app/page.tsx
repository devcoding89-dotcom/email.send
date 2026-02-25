"use client";

import { useUser } from "@/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { ScoutView } from "@/components/scout/ScoutView";
import { Button } from "@/components/ui/button";
import { Zap, Github, ArrowRight, MousePointer2, Layers, Sparkles } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const { user, isUserLoading } = useUser();
  const [showAuth, setShowAuth] = useState(false);

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <Zap className="h-12 w-12 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      
      {!user ? (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-24 pb-32 md:pt-40 md:pb-52 overflow-hidden hero-gradient">
            <div className="container mx-auto px-6 relative z-10 text-center">
              <div className="max-w-5xl mx-auto space-y-10">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 text-primary-foreground text-xs md:text-sm font-black tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000 uppercase">
                  <Zap className="w-4 h-4 fill-primary" />
                  Autonomous Data Scouting
                </div>
                <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-headline leading-[0.9] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                  Precision <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">Extraction.</span>
                </h1>
                <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 px-4">
                  The ultimate intelligence layer for modern outreach. Transform chaotic data into actionable leads with surgically precise AI.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 pt-10 px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                  <Button size="lg" className="h-16 md:h-20 px-10 md:px-14 text-xl md:text-2xl rounded-3xl shadow-2xl shadow-primary/40 hover:scale-105 transition-all font-black" onClick={() => setShowAuth(true)}>
                    Initialize System
                    <ArrowRight className="ml-3 w-6 h-6" />
                  </Button>
                  <Button size="lg" variant="secondary" className="h-16 md:h-20 px-10 md:px-14 text-xl md:text-2xl rounded-3xl bg-secondary/50 backdrop-blur-md hover:bg-secondary/80 transition-all font-bold">
                    System Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[900px] bg-primary/10 rounded-full blur-[180px] -z-10" />
          </section>

          {/* Features Section */}
          <section className="py-32 md:py-48 bg-background relative border-t border-white/5">
            <div className="container mx-auto px-6 relative z-10">
              <div className="text-center mb-20 md:mb-32 space-y-6">
                <h2 className="text-4xl md:text-6xl font-black font-headline tracking-tighter uppercase">High-Frequency Intelligence</h2>
                <p className="text-muted-foreground text-xl max-w-2xl mx-auto">Proprietary engines built for speed, accuracy, and mass scale.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                {[
                  { icon: MousePointer2, title: "Neural Isolation", desc: "Our neural regex engine extracts targets from the darkest corners of data dumps with zero friction." },
                  { icon: Zap, title: "Agentic Detection", desc: "Beyond strings. Leverage multi-model GenAI to map names, roles, and organizations with contextual intent." },
                  { icon: Layers, title: "Mass Serialization", desc: "Instantly serialize thousands of records into industry-standard formats for seamless CRM ingestion." }
                ].map((feature, i) => (
                  <div key={i} className="group relative p-10 md:p-12 rounded-[3rem] bg-secondary/20 border border-white/5 hover:border-primary/50 transition-all duration-500 card-glow">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-primary/20 flex items-center justify-center text-primary mb-10 group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="w-8 h-8 md:w-10 md:h-10 fill-primary/20" />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black font-headline mb-6 uppercase tracking-tighter">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-lg md:text-xl font-medium">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-24 border-t border-white/5 bg-black/40">
            <div className="container mx-auto px-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary rounded-2xl shadow-xl shadow-primary/30">
                    <Zap className="w-8 h-8 text-primary-foreground fill-primary-foreground" />
                  </div>
                  <span className="text-3xl font-black font-headline tracking-tighter uppercase">Scoutier</span>
                </div>
                <div className="flex flex-wrap justify-center gap-10 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">Privacy Protocol</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms of Ops</a>
                  <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                  <a href="#" className="hover:text-primary transition-colors hover:scale-125 transition-transform"><Github className="w-8 h-8" /></a>
                </div>
                <p className="text-xs text-muted-foreground font-black uppercase tracking-widest">© 2024 Scoutier Inc. Built for Power Users.</p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-6 py-12 md:py-24 max-w-7xl">
          <header className="mb-16 md:mb-24 space-y-6 md:space-y-10">
            <div className="flex items-center gap-4 text-primary font-black text-xs md:text-sm uppercase tracking-[0.4em] animate-in slide-in-from-left duration-700">
              <div className="h-[2px] w-12 md:w-20 bg-primary" />
              Intelligence Terminal
            </div>
            <h1 className="text-5xl md:text-8xl font-black font-headline leading-[0.9] uppercase tracking-tighter">Extraction <br /> Engine</h1>
            <p className="text-muted-foreground text-xl md:text-2xl max-w-4xl leading-relaxed font-medium">
              Initialize a data pass to isolate targets. Activate AI Mode for deep-layer entity mapping and organization identification.
            </p>
          </header>

          <ScoutView />
        </main>
      )}

      {showAuth && !user && <AuthOverlay onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />}
    </div>
  );
}