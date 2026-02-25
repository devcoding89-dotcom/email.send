
"use client";

import { useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Type, Layers, Zap, Info, ArrowRight } from "lucide-react";

export function CreateCampaignDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [speed, setSpeed] = useState([10]);
  const [step, setStep] = useState("content");

  const tokens = ["firstName", "lastName", "company", "position"];

  const insertToken = (token: string) => {
    setBody(prev => prev + `{{${token}}}`);
  };

  const handleCreate = () => {
    if (!user || !db) return;
    if (!name || !subject || !body) {
      toast({ variant: "destructive", title: "Missing Information", description: "Please fill out all required fields." });
      return;
    }

    addDocumentNonBlocking(collection(db, `users/${user.uid}/campaigns`), {
      userId: user.uid,
      name,
      subject,
      body,
      speed: speed[0],
      status: "draft",
      createdAt: serverTimestamp(),
    });

    toast({ title: "Campaign Saved", description: "Your campaign has been created and saved as a draft." });
    onOpenChange(false);
    reset();
  };

  const reset = () => {
    setName("");
    setSubject("");
    setBody("");
    setSpeed([10]);
    setStep("content");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* Sidebar / Progress */}
          <div className="md:col-span-4 bg-muted/30 p-10 flex flex-col justify-between">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-black font-headline tracking-tighter">SCOUTIER</span>
              </div>
              
              <div className="space-y-8">
                {[
                  { id: 'content', label: 'Message Content', icon: Type },
                  { id: 'config', label: 'Configuration', icon: Layers },
                  { id: 'schedule', label: 'Scheduling', icon: Send }
                ].map((s) => (
                  <div key={s.id} className={`flex items-center gap-4 transition-all ${step === s.id ? 'text-primary scale-105' : 'text-muted-foreground opacity-50'}`}>
                    <div className={`p-3 rounded-2xl ${step === s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted'}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 text-primary mt-1" />
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Use personalization tokens to increase conversion. Your contacts will feel the human touch.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-8 bg-card p-10">
            <DialogHeader className="mb-10">
              <DialogTitle className="text-4xl font-headline font-black">Design Outreach</DialogTitle>
              <DialogDescription className="text-lg">Build a campaign that converts raw leads into conversations.</DialogDescription>
            </DialogHeader>

            {step === 'content' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Internal Name</Label>
                  <Input placeholder="e.g., Q1 Product Launch" className="h-14 rounded-2xl text-lg font-medium" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Email Subject</Label>
                  <Input placeholder="Personalized subject line..." className="h-14 rounded-2xl text-lg font-medium" value={subject} onChange={e => setSubject(e.target.value)} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Email Body</Label>
                    <div className="flex gap-1.5">
                      {tokens.map(t => (
                        <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all rounded-lg py-1" onClick={() => insertToken(t)}>
                          +{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Write your message here. Use tokens for personalization..." 
                    className="min-h-[200px] rounded-3xl p-6 text-lg font-body leading-relaxed border-muted-foreground/20 focus:border-primary"
                    value={body}
                    onChange={e => setBody(e.target.value)}
                  />
                </div>
              </div>
            )}

            {step === 'config' && (
              <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="space-y-6">
                  <div className="flex justify-between items-end">
                    <div className="space-y-2">
                      <Label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Sending Velocity</Label>
                      <p className="text-muted-foreground text-sm">Control the drip rate to avoid spam filters.</p>
                    </div>
                    <span className="text-3xl font-black font-headline text-primary">{speed[0]} <small className="text-xs uppercase">EPM</small></span>
                  </div>
                  <Slider value={speed} onValueChange={setSpeed} max={100} step={1} className="py-4" />
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Precision Drip (1)</span>
                    <span>Aggressive Outreach (100)</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-accent">
                    <Zap className="h-4 w-4" />
                    Preview Personalization
                  </h4>
                  <p className="text-sm italic text-muted-foreground bg-white/50 p-4 rounded-2xl border border-accent/10">
                    "{body.replace(/\{\{firstName\}\}/g, "Alex").substring(0, 150)}..."
                  </p>
                </div>
              </div>
            )}

            <DialogFooter className="mt-12 flex items-center justify-between sm:justify-between w-full">
              {step !== 'content' ? (
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setStep('content')}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-xl font-bold h-12" onClick={() => onOpenChange(false)}>Cancel</Button>
                {step === 'content' ? (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={() => setStep('config')}>
                    Configure
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={handleCreate}>
                    Create Campaign
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
