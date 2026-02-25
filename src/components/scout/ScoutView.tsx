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
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-12">
      <div className="lg:col-span-7 space-y-8">
        <Card className="border-white/5 shadow-xl rounded-3xl overflow-hidden bg-secondary/10">
          <CardHeader className="bg-white/5 py-8 px-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-2xl font-black flex items-center gap-3 uppercase tracking-tight">
                  <Sparkles className="w-6 h-6 text-primary" />
                  System Input
                </CardTitle>
                <CardDescription className="text-sm font-medium text-muted-foreground">Inject raw data for analysis</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} disabled={!text} className="rounded-xl h-10 w-10 hover:text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              placeholder="Paste or type content here..."
              className="min-h-[400px] border-none focus-visible:ring-0 resize-none px-8 py-6 text-lg font-body leading-relaxed bg-transparent"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-8 bg-white/5 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="flex items-center space-x-3">
                  <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} />
                  <Label htmlFor="ai-mode" className="cursor-pointer text-sm font-black uppercase tracking-widest flex items-center gap-2">
                    AI Mode
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent side="top" className="bg-popover border-white/10 text-foreground font-bold p-3 rounded-xl">
                        <p className="text-xs">Activates neural entity mapping for people and organizations.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button 
                onClick={handleParse} 
                disabled={loading || !text.trim()} 
                className="w-full sm:w-auto h-14 px-10 rounded-xl text-lg font-black uppercase tracking-tight shadow-lg shadow-primary/20"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Execute Scan"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
        {!result ? (
          <Card className="border-dashed border-2 border-white/10 bg-white/5 min-h-[300px] flex flex-col items-center justify-center text-center p-8 rounded-3xl">
            <DownloadCloud className="w-12 h-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-xl font-black font-headline mb-2 uppercase tracking-tight">System Idle</h3>
            <p className="text-muted-foreground text-sm font-medium">
              Initialize a data scan to populate results.
            </p>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card className="border-white/5 shadow-xl rounded-3xl bg-secondary/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between p-6 bg-white/5 border-b border-white/5">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-xl font-black flex items-center gap-2 uppercase tracking-tight">
                    <Mail className="w-5 h-5 text-primary" />
                    Isolated Targets
                  </CardTitle>
                  <CardDescription className="text-xs font-medium text-muted-foreground">{result.emails.length} identified</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10" onClick={() => copyToClipboard(result.emails)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-white/10" onClick={exportCSVFile}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="flex flex-wrap gap-2">
                  {result.emails.length > 0 ? (
                    result.emails.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="group px-4 py-2 text-sm font-bold bg-primary/20 text-primary border border-primary/30 rounded-xl flex items-center gap-2">
                        {email}
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 bg-primary text-primary-foreground" onClick={() => saveToContacts(email)}>
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic w-full text-center py-8">Zero targets detected.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {useAI && (
              <div className="grid gap-4">
                <Card className="border-white/5 shadow-xl rounded-3xl bg-secondary/10">
                  <CardHeader className="p-6">
                    <CardTitle className="font-headline text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                      <Users className="w-5 h-5 text-accent" />
                      Neural Mapping
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {result.entities.names.length > 0 ? (
                        result.entities.names.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1.5 text-xs font-black border-accent/40 text-accent rounded-xl bg-accent/5">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic w-full text-center">No entities mapped.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-white/5 shadow-xl rounded-3xl bg-secondary/10">
                  <CardHeader className="p-6">
                    <CardTitle className="font-headline text-lg font-black flex items-center gap-2 uppercase tracking-tight">
                      <Building className="w-5 h-5 text-accent" />
                      Organizations
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-6 pb-6">
                    <div className="flex flex-wrap gap-2">
                      {result.entities.companies.length > 0 ? (
                        result.entities.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1.5 text-xs font-black border-accent/40 text-accent bg-accent/5 rounded-xl">
                            {company}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic w-full text-center">No organizations found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
