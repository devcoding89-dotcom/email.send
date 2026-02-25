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
import { collection, serverTimestamp, doc } from "firebase/firestore";
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
          description: `Extracted ${data.emails.length} emails. ${useAI ? 'AI detected ' + (data.entities.names.length + data.entities.companies.length) + ' entities.' : ''}` 
        });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Extraction Failed", description: "We couldn't reach the parsing engine. Please try again." });
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
    toast({ title: "Contact Saved", description: `${email} added to your vault.` });
  };

  const clear = () => {
    setText("");
    setResult(null);
  };

  const copyToClipboard = (items: string[]) => {
    if (items.length === 0) return;
    navigator.clipboard.writeText(items.join(", "));
    toast({ title: "Copied to Clipboard", description: `Successfully copied ${items.length} items.` });
  };

  const exportCSVFile = () => {
    if (!result || result.emails.length === 0) return;
    const csvContent = generateCSV(result.emails);
    downloadFile(csvContent, `scoutier_export_${Date.now()}.csv`, "text/csv");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
      <div className="lg:col-span-7 space-y-8">
        <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardHeader className="bg-muted/30 pb-8 px-10 pt-10">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="font-headline text-3xl flex items-center gap-3">
                  <div className="p-2.5 bg-primary text-primary-foreground rounded-2xl shadow-lg shadow-primary/20">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  Raw Input
                </CardTitle>
                <CardDescription className="text-lg">Paste your logs or text for processing</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} disabled={!text} className="rounded-full h-12 w-12 hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="w-6 h-6" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              placeholder="Paste content such as: 'Contact support at help@scoutier.io or reach out to Jane Doe from Google...'"
              className="min-h-[500px] border-none focus-visible:ring-0 resize-none px-10 py-8 text-xl font-body leading-relaxed bg-transparent placeholder:text-muted-foreground/30"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-8 px-10 bg-muted/40 border-t flex flex-wrap items-center justify-between gap-8">
              <div className="flex items-center gap-8">
                <div className="flex items-center space-x-4">
                  <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} className="data-[state=checked]:bg-accent" />
                  <Label htmlFor="ai-mode" className="cursor-pointer text-base font-bold flex items-center gap-2">
                    AI Detection
                    <Badge variant="secondary" className="text-[10px] uppercase py-0 px-2 font-black bg-accent/20 text-accent">Pro</Badge>
                  </Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Info className="w-4 h-4 text-muted-foreground cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Uses Gemini AI to identify people and company names.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
              <Button 
                onClick={handleParse} 
                disabled={loading || !text.trim()} 
                className="h-16 px-12 rounded-2xl text-xl font-bold shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  "Run Extraction"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-8 sticky top-32">
        {!result ? (
          <Card className="border-dashed border-2 bg-muted/5 h-[500px] flex flex-col items-center justify-center text-center p-12 rounded-[2.5rem]">
            <div className="bg-primary/5 p-10 rounded-[3rem] mb-8 animate-pulse">
              <DownloadCloud className="w-16 h-16 text-primary/30" />
            </div>
            <h3 className="text-3xl font-bold font-headline mb-4">Awaiting Extraction</h3>
            <p className="text-muted-foreground text-lg leading-relaxed max-w-sm">
              Input data on the left and run the extraction engine. Results will appear here instantly.
            </p>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <Card className="border-primary/20 shadow-2xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-2xl flex items-center gap-3">
                    <Mail className="w-6 h-6 text-primary" />
                    Emails Detected
                  </CardTitle>
                  <CardDescription className="text-base">{result.emails.length} unique addresses found</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all" onClick={() => copyToClipboard(result.emails)}>
                    <Copy className="h-5 w-5" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl hover:bg-primary hover:text-primary-foreground transition-all" onClick={exportCSVFile}>
                    <Download className="h-5 w-5" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {result.emails.length > 0 ? (
                    result.emails.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="group px-5 py-2 text-sm font-bold bg-primary/10 text-primary border-primary/20 rounded-xl hover:bg-primary/20 transition-all cursor-default flex items-center gap-2">
                        {email}
                        <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => saveToContacts(email)}>
                          <UserPlus className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))
                  ) : (
                    <p className="text-base text-muted-foreground italic bg-muted/30 p-8 rounded-[2rem] w-full text-center">No email addresses detected.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {useAI && (
              <div className="grid gap-6">
                <Card className="border-accent/20 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-xl flex items-center gap-3">
                        <Users className="w-5 h-5 text-accent" />
                        Identified Names
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2.5">
                      {result.entities.names.length > 0 ? (
                        result.entities.names.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="px-4 py-2 text-sm font-bold border-accent/30 text-accent rounded-xl bg-accent/5">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic w-full text-center py-4">No names identified.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 shadow-xl rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-xl flex items-center gap-3">
                        <Building className="w-5 h-5 text-accent" />
                        Organizations
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2.5">
                      {result.entities.companies.length > 0 ? (
                        result.entities.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="px-4 py-2 text-sm font-bold border-accent/30 text-accent bg-accent/5 rounded-xl">
                            {company}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic w-full text-center py-4">No organizations identified.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary gap-3 h-14 rounded-2xl text-lg font-bold">
              <Share2 className="w-5 h-5" />
              Share Extraction Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
