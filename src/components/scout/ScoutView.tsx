"use client";

import { useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Sparkles, Trash2, Mail, Users, Building, DownloadCloud, Loader2, Share2, Info, UserPlus } from "lucide-react";
import { generateCSV, downloadFile } from "@/lib/extractor";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ExtractionResult {
  emails: string[];
  entities: {
    names: string[];
    companies: string[];
  };
}

export function ScoutView() {
  const { user } = useUser();
  const db = useFirestore();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Input Required", description: "Please paste the text you want to analyze." });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, extractEntities: useAI }),
      });

      const data = await response.json();
      if (data.success) {
        const extraction = {
          emails: data.emails,
          entities: data.entities,
        };
        setResult(extraction);

        if (user && db) {
          addDocumentNonBlocking(collection(db, `users/${user.uid}/parses`), {
            userId: user.uid,
            text,
            emails: data.emails,
            entities: data.entities,
            createdAt: serverTimestamp(),
            count: data.emails.length
          });
        }

        toast({ 
          title: "Scout Successful", 
          description: `Extracted ${data.emails.length} targets.` 
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Extraction Failed", description: "Terminal error. Please retry." });
    } finally {
      setLoading(false);
    }
  };

  const saveToContacts = (email: string) => {
    if (!user || !db) return;
    addDocumentNonBlocking(collection(db, `users/${user.uid}/contacts`), {
      userId: user.uid,
      email,
      firstName: email.split('@')[0],
      lastName: "Scouted",
      company: "Unknown",
      position: "Lead",
      createdAt: serverTimestamp()
    });
    toast({ title: "Target Locked", description: `${email} saved to vault.` });
  };

  const clear = () => {
    setText("");
    setResult(null);
  };

  const copyToClipboard = (items: string[]) => {
    if (items.length === 0) return;
    navigator.clipboard.writeText(items.join(", "));
    toast({ title: "Copied", description: `${items.length} records transferred to clipboard.` });
  };

  const exportCSVFile = () => {
    if (!result || result.emails.length === 0) return;
    const csvContent = generateCSV(result.emails);
    downloadFile(csvContent, `scoutier_export_${Date.now()}.csv`, "text/csv");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pb-20">
      <div className="lg:col-span-7 space-y-10">
        <Card className="border-white/5 shadow-2xl rounded-[3rem] overflow-hidden bg-secondary/10 backdrop-blur-xl">
          <CardHeader className="bg-white/5 pb-10 px-12 pt-12">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <CardTitle className="font-headline text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                  <div className="p-3 bg-primary text-primary-foreground rounded-2xl shadow-xl shadow-primary/30">
                    <Sparkles className="w-8 h-8 fill-primary-foreground" />
                  </div>
                  System Input
                </CardTitle>
                <CardDescription className="text-lg font-medium text-muted-foreground">Initialize extraction sequence</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} disabled={!text} className="rounded-2xl h-14 w-14 hover:bg-destructive/20 hover:text-destructive transition-all">
                <Trash2 className="w-7 h-7" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              placeholder="Inject raw data here..."
              className="min-h-[550px] border-none focus-visible:ring-0 resize-none px-12 py-10 text-2xl font-body leading-relaxed bg-transparent placeholder:text-muted-foreground/20"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-10 px-12 bg-white/5 border-t border-white/5 flex flex-wrap items-center justify-between gap-10">
              <div className="flex items-center gap-10">
                <div className="flex items-center space-x-5">
                  <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} className="data-[state=checked]:bg-accent" />
                  <Label htmlFor="ai-mode" className="cursor-pointer text-lg font-black uppercase tracking-widest flex items-center gap-3">
                    AI Mode
                    <Badge variant="secondary" className="text-[10px] uppercase py-1 px-3 font-black bg-accent/20 text-accent border border-accent/20">Active</Badge>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-5 h-5 text-muted-foreground cursor-help hover:text-foreground transition-colors" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-popover border-white/10 text-foreground font-bold p-4 rounded-2xl">
                        <p>Activates neural entity mapping for people and organizations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button 
                onClick={handleParse} 
                disabled={loading || !text.trim()} 
                className="h-20 px-16 rounded-[2rem] text-2xl font-black uppercase tracking-tighter shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-4 h-8 w-8 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Execute Scan"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-10 sticky top-32">
        {!result ? (
          <Card className="border-dashed border-2 border-white/10 bg-white/5 h-[550px] flex flex-col items-center justify-center text-center p-16 rounded-[3rem]">
            <div className="bg-primary/10 p-12 rounded-[3.5rem] mb-10 animate-pulse border border-primary/20">
              <DownloadCloud className="w-20 h-20 text-primary/40" />
            </div>
            <h3 className="text-4xl font-black font-headline mb-6 uppercase tracking-tighter">System Idle</h3>
            <p className="text-muted-foreground text-xl leading-relaxed max-w-sm font-medium">
              Initialize a data scan to populate results. Neural mapping will appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-secondary/10 backdrop-blur-xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 bg-white/5 border-b border-white/5">
                <div className="space-y-2">
                  <CardTitle className="font-headline text-3xl font-black flex items-center gap-4 uppercase tracking-tighter">
                    <Mail className="w-8 h-8 text-primary" />
                    Isolated Targets
                  </CardTitle>
                  <CardDescription className="text-lg font-medium text-muted-foreground">{result.emails.length} unique records identified</CardDescription>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => copyToClipboard(result.emails)}>
                    <Copy className="h-6 w-6" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-14 w-14 rounded-2xl border-white/10 hover:bg-primary hover:text-primary-foreground transition-all" onClick={exportCSVFile}>
                    <Download className="h-6 w-6" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-10">
                <div className="flex flex-wrap gap-3">
                  {result.emails.length > 0 ? (
                    result.emails.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="group px-6 py-3 text-base font-black bg-primary/20 text-primary border border-primary/30 rounded-2xl hover:bg-primary/30 transition-all cursor-default flex items-center gap-3">
                        {email}
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-primary-foreground hover:bg-primary/80" onClick={() => saveToContacts(email)}>
                          <UserPlus className="h-4 w-4" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-lg text-muted-foreground italic bg-black/20 p-12 rounded-[2.5rem] w-full text-center border border-white/5 font-medium">Zero targets detected.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {useAI && (
              <div className="grid gap-8">
                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-secondary/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                    <div className="space-y-2">
                      <CardTitle className="font-headline text-2xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <Users className="w-7 h-7 text-accent" />
                        Neural Mapping
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <div className="flex flex-wrap gap-3">
                      {result.entities.names.length > 0 ? (
                        result.entities.names.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="px-6 py-3 text-base font-black border-accent/40 text-accent rounded-2xl bg-accent/10 uppercase tracking-tighter">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-base text-muted-foreground italic w-full text-center py-6 font-medium">No entities mapped.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-2xl rounded-[3rem] bg-secondary/10 backdrop-blur-xl">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 p-10 pb-6">
                    <div className="space-y-2">
                      <CardTitle className="font-headline text-2xl font-black flex items-center gap-4 uppercase tracking-tighter">
                        <Building className="w-7 h-7 text-accent" />
                        Organizations
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="px-10 pb-10">
                    <div className="flex flex-wrap gap-3">
                      {result.entities.companies.length > 0 ? (
                        result.entities.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="px-6 py-3 text-base font-black border-accent/40 text-accent bg-accent/10 rounded-2xl uppercase tracking-tighter">
                            {company}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-base text-muted-foreground italic w-full text-center py-6 font-medium">No organizations found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Button variant="secondary" className="w-full text-foreground hover:bg-secondary/80 gap-4 h-20 rounded-[2rem] text-xl font-black uppercase tracking-widest transition-all">
              <Share2 className="w-6 h-6" />
              Transfer Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}