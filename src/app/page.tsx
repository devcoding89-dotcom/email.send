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
        <Zap className="h-10 w-10 animate-pulse text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col selection:bg-primary/20">
      <Navbar onAuthClick={() => setShowAuth(true)} />
      
      {!user ? (
        <main className="flex-1">
          {/* Hero Section */}
          <section className="relative pt-20 pb-24 md:pt-32 md:pb-40 overflow-hidden hero-gradient border-b">
            <div className="container mx-auto px-4 relative z-10 text-center">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-xs md:text-sm font-bold tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <Zap className="w-4 h-4" />
                  NEXT-GEN DATA EXTRACTION
                </div>
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-headline leading-[0.95] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                  Scout Your Data <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary animate-gradient">With AI Precision.</span>
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 px-4">
                  Transform messy logs, raw emails, and unstructured text into clean, exportable leads. Scoutier uses pattern matching and GenAI to find what others miss.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 px-6 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                  <Button size="lg" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl rounded-2xl shadow-xl shadow-primary/25 hover:scale-105 transition-all" onClick={() => setShowAuth(true)}>
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5 md:w-6 md:h-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 md:h-16 px-8 md:px-10 text-lg md:text-xl rounded-2xl glass hover:bg-muted/50 transition-all">
                    View Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[800px] bg-primary/5 rounded-full blur-[160px] -z-10" />
          </section>

          {/* Features Section */}
          <section className="py-24 md:py-32 bg-background relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
              <div className="text-center mb-16 md:mb-20 space-y-4">
                <h2 className="text-3xl md:text-4xl font-bold font-headline">Engineered for Efficiency</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">Powerful tools designed to simplify the most tedious data tasks.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                  { icon: MousePointer2, title: "Pattern Isolation", desc: "Our surgical regex engine isolates email addresses from even the noisiest server logs and data dumps." },
                  { icon: Zap, title: "AI Entity Detection", desc: "Go beyond emails. Use Gemini to identify personal names, company roles, and organizations in one click." },
                  { icon: Layers, title: "Batch Exporting", desc: "Export thousands of results instantly to CSV or copy them to your clipboard for your CRM workflow." }
                ].map((feature, i) => (
                  <div key={i} className="group relative p-8 md:p-10 rounded-[2.5rem] bg-card border border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5">
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-6 md:mb-8 group-hover:scale-110 transition-transform duration-500">
                      <feature.icon className="w-7 h-7 md:w-8 md:h-8" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold font-headline mb-3 md:mb-4">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-base md:text-lg">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-16 md:py-24 border-t bg-muted/20">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-8 md:gap-12 text-center md:text-left">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary rounded-xl shadow-lg shadow-primary/20">
                    <Zap className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <span className="text-2xl font-bold font-headline">Scoutier</span>
                </div>
                <div className="flex flex-wrap justify-center gap-6 md:gap-10 text-sm font-semibold text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                  <a href="#" className="hover:text-primary transition-colors hover:scale-110 transition-transform"><Github className="w-6 h-6" /></a>
                </div>
                <p className="text-sm text-muted-foreground font-medium">© 2024 Scoutier Inc. Built for Power Users.</p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-8 md:py-16 max-w-7xl">
          <header className="mb-12 md:mb-16 space-y-4 md:space-y-6">
            <div className="flex items-center gap-3 text-primary font-bold text-xs md:text-sm uppercase tracking-[0.3em] animate-in slide-in-from-left duration-700">
              <div className="h-[2px] w-8 md:w-12 bg-primary/40" />
              Intelligence Workspace
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-headline leading-tight">Extraction Engine</h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-3xl leading-relaxed">
              Paste your raw data to begin the scouting operation. Use the AI mode for deeper insights into names and organizations.
            </p>
          </header>

          <ScoutView />
        </main>
      )}

      {showAuth && !user && <AuthOverlay onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
