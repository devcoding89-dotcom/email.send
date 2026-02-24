
"use client";

import { useUser } from "@/firebase";
import { Navbar } from "@/components/layout/Navbar";
import { AuthOverlay } from "@/components/auth/AuthOverlay";
import { ScoutView } from "@/components/scout/ScoutView";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Globe, Github, Search, CheckCircle2, ArrowRight } from "lucide-react";
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
          <section className="relative pt-20 pb-32 overflow-hidden hero-gradient">
            <div className="container mx-auto px-4 relative z-10">
              <div className="max-w-4xl mx-auto text-center space-y-8">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold tracking-wide animate-in fade-in slide-in-from-bottom-4 duration-1000">
                  <Zap className="w-4 h-4" />
                  THE INTELLIGENT DATA SCOUT
                </div>
                <h1 className="text-5xl md:text-7xl font-bold font-headline leading-[1.1] text-foreground animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
                  Extract Emails & Entities <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">With Surgical Precision.</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                  Stop manual copying. Paste logs, raw text, or code and let Scoutier isolate emails, names, and organizations in seconds using advanced AI.
                </p>
                <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/20 hover:scale-105 transition-all" onClick={() => setShowAuth(true)}>
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full glass hover:bg-white/5 transition-all">
                    View Demo
                  </Button>
                </div>
              </div>
            </div>

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />
            <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[100px] -z-10" />
          </section>

          {/* Features Section */}
          <section className="py-24 bg-background">
            <div className="container mx-auto px-4">
              <div className="grid md:grid-cols-3 gap-12">
                {[
                  { icon: Search, title: "Pattern Isolation", desc: "Advanced regex patterns that isolate emails from messy logs and unstructured data." },
                  { icon: Zap, title: "AI Intelligence", desc: "GenAI flows that identify names, companies, and roles within your text snippets." },
                  { icon: ShieldCheck, title: "Privacy First", desc: "Data is processed securely and never shared. You own your extraction history." }
                ].map((feature, i) => (
                  <div key={i} className="space-y-4 p-8 rounded-3xl bg-card border border-border/50 hover:shadow-lg transition-all group">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-xl font-bold font-headline">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <footer className="py-20 border-t bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col md:flex-row justify-between items-center gap-10">
                <div className="flex items-center gap-2">
                  <Zap className="w-6 h-6 text-primary" />
                  <span className="text-xl font-bold font-headline">Scoutier</span>
                </div>
                <div className="flex items-center gap-8 text-sm font-medium text-muted-foreground">
                  <a href="#" className="hover:text-primary transition-colors">Privacy</a>
                  <a href="#" className="hover:text-primary transition-colors">Terms</a>
                  <a href="#" className="hover:text-primary transition-colors">Documentation</a>
                  <a href="#" className="hover:text-primary transition-colors"><Github className="w-5 h-5" /></a>
                </div>
                <p className="text-sm text-muted-foreground">© 2024 Scoutier Inc. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </main>
      ) : (
        <main className="flex-1 container mx-auto px-4 py-12 max-w-7xl">
          <header className="mb-12 space-y-4">
            <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-[0.2em]">
              <div className="h-px w-8 bg-primary/30" />
              Extraction Engine v2.0
            </div>
            <h1 className="text-5xl font-bold font-headline">Workspace</h1>
            <p className="text-muted-foreground text-lg max-w-2xl">
              Paste your raw data below to begin extraction. Use the AI toggle to identify key entities beyond just email addresses.
            </p>
          </header>

          <ScoutView />
        </main>
      )}

      {showAuth && !user && <AuthOverlay onSuccess={() => setShowAuth(false)} onClose={() => setShowAuth(false)} />}
    </div>
  );
}
