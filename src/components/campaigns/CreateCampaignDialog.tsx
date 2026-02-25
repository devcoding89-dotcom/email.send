
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
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Send, Type, Layers, Zap, Info, ArrowRight, Eye } from "lucide-react";

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
      toast({ variant: "destructive", title: "Missing Information", description: "All fields are required to build a campaign." });
      return;
    }

    addDocumentNonBlocking(collection(db, `users/${user.uid}/campaigns`), {
      userId: user.uid,
      name,
      subject,
      body,
      speed: speed[0],
      status: "draft",
      stats: { total: 0, sent: 0, failed: 0 },
      createdAt: serverTimestamp(),
    });

    toast({ title: "Campaign Saved", description: "Your outreach is ready. Launch it from the dashboard." });
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

  const personalizedPreview = body
    .replace(/\{\{firstName\}\}/g, "John")
    .replace(/\{\{company\}\}/g, "Acme Inc")
    .replace(/\{\{position\}\}/g, "Growth Lead");

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
                  { id: 'content', label: 'Message Design', icon: Type },
                  { id: 'config', label: 'Speed & Drip', icon: Layers }
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
                  Tip: Emails using personalization tokens like <code className="text-primary">firstName</code> see 40% higher reply rates.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-8 bg-card p-10">
            <DialogHeader className="mb-10">
              <DialogTitle className="text-4xl font-headline font-black">Outreach Architect</DialogTitle>
              <DialogDescription className="text-lg">Design a campaign that feels human, at scale.</DialogDescription>
            </DialogHeader>

            {step === 'content' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Label</Label>
                    <Input placeholder="e.g., Q1 Outreach" className="h-12 rounded-xl" value={name} onChange={e => setName(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Subject</Label>
                    <Input placeholder="Check this out, {{firstName}}!" className="h-12 rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message Body</Label>
                    <div className="flex gap-1.5">
                      {tokens.map(t => (
                        <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all rounded-lg py-1 text-[10px]" onClick={() => insertToken(t)}>
                          +{t}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Textarea 
                    placeholder="Hi {{firstName}}, I noticed {{company}}..." 
                    className="min-h-[250px] rounded-[2rem] p-6 text-lg font-body leading-relaxed border-muted-foreground/20 focus:border-primary"
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
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sending Velocity</Label>
                      <p className="text-muted-foreground text-sm">Control how fast your outreach is dispatched.</p>
                    </div>
                    <span className="text-3xl font-black font-headline text-primary">{speed[0]} <small className="text-xs uppercase">EPM</small></span>
                  </div>
                  <Slider value={speed} onValueChange={setSpeed} max={100} min={1} step={1} className="py-4" />
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    <span>Precision Drip</span>
                    <span>High Volume</span>
                  </div>
                </div>

                <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 space-y-4">
                  <h4 className="font-bold flex items-center gap-2 text-accent uppercase text-xs tracking-widest">
                    <Eye className="h-4 w-4" />
                    Personalization Preview
                  </h4>
                  <div className="bg-background/50 p-6 rounded-2xl border border-accent/10 text-sm font-medium leading-relaxed italic text-muted-foreground">
                    {body ? (
                      personalizedPreview.split('\n').map((line, i) => <p key={i}>{line}</p>)
                    ) : (
                      "Start typing your message to see a personalized preview here."
                    )}
                  </div>
                </div>
              </div>
            )}

            <DialogFooter className="mt-12 flex items-center justify-between sm:justify-between w-full">
              {step !== 'content' ? (
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => setStep('content')}>
                  Back to Design
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-xl font-bold h-12" onClick={() => onOpenChange(false)}>Cancel</Button>
                {step === 'content' ? (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={() => setStep('config')}>
                    Configure Drip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={handleCreate}>
                    Finalize & Save
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
