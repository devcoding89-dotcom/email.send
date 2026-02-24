
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
import { Copy, Download, Sparkles, Trash2, Mail, Users, Building, DownloadCloud, Loader2, Share2 } from "lucide-react";
import { generateCSV, downloadFile } from "@/lib/extractor";
import { collection, serverTimestamp } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

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
      toast({ variant: "destructive", title: "Missing Input", description: "Paste some text to start extraction." });
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
        setResult({
          emails: data.emails,
          entities: data.entities,
        });

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

        toast({ title: "Analysis Complete", description: `Found ${data.emails.length} emails and ${data.entities.names.length + data.entities.companies.length} entities.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Service Error", description: "Failed to process text. Check your connection." });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText("");
    setResult(null);
  };

  const copyToClipboard = (items: string[]) => {
    if (items.length === 0) return;
    navigator.clipboard.writeText(items.join(", "));
    toast({ title: "Copied", description: "All items added to clipboard." });
  };

  const exportCSVFile = () => {
    if (!result || result.emails.length === 0) return;
    const csvContent = generateCSV(result.emails);
    downloadFile(csvContent, `scoutier_export_${Date.now()}.csv`, "text/csv");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <div className="lg:col-span-7 space-y-8">
        <Card className="border-border/50 shadow-2xl shadow-primary/5 rounded-[2rem] overflow-hidden">
          <CardHeader className="bg-muted/30 pb-6 px-8 pt-8">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline text-2xl flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-xl">
                    <Sparkles className="w-5 h-5 text-primary" />
                  </div>
                  Data Input
                </CardTitle>
                <CardDescription className="text-base mt-1">Paste emails, logs, or unstructured text here</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} disabled={!text} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                <Trash2 className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              placeholder="Paste text like: 'John Doe <john@acme.com> is the CTO of Acme Corp...'"
              className="min-h-[450px] border-none focus-visible:ring-0 resize-none px-8 py-6 text-lg font-body leading-relaxed bg-transparent placeholder:text-muted-foreground/50"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-6 px-8 bg-muted/20 border-t flex flex-wrap items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex items-center space-x-3">
                  <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} className="data-[state=checked]:bg-accent" />
                  <Label htmlFor="ai-mode" className="cursor-pointer text-sm font-semibold flex items-center gap-2">
                    AI Entity Detection
                    <Badge variant="secondary" className="text-[10px] uppercase py-0 px-1.5 font-bold">Pro</Badge>
                  </Label>
                </div>
              </div>
              <Button onClick={handleParse} disabled={loading || !text.trim()} className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/25 hover:scale-[1.02] transition-all">
                {loading ? (
                  <>
                    <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                    Scouting...
                  </>
                ) : (
                  "Run Extraction"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-8 sticky top-28">
        {!result ? (
          <Card className="border-dashed border-2 bg-muted/5 h-[450px] flex flex-col items-center justify-center text-center p-12 rounded-[2rem]">
            <div className="bg-primary/5 p-6 rounded-[2rem] mb-6 animate-bounce duration-[3000ms]">
              <DownloadCloud className="w-12 h-12 text-primary/40" />
            </div>
            <h3 className="text-2xl font-bold font-headline mb-3">Awaiting Data</h3>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              Input text on the left to begin your scout operation. Results will be categorized and made exportable here.
            </p>
          </Card>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <Card className="border-primary/10 shadow-xl rounded-[2rem]">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <div className="space-y-1">
                  <CardTitle className="font-headline text-xl flex items-center gap-2">
                    <Mail className="w-5 h-5 text-primary" />
                    Emails
                  </CardTitle>
                  <CardDescription>Detected {result.emails.length} unique addresses</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={() => copyToClipboard(result.emails)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl" onClick={exportCSVFile}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2.5 mt-2">
                  {result.emails.length > 0 ? (
                    result.emails.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="px-4 py-1.5 text-sm font-medium bg-primary/5 text-primary border-primary/10 rounded-lg">
                        {email}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic bg-muted/30 p-4 rounded-xl w-full text-center">No emails detected in this sample.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {useAI && (
              <div className="grid gap-6">
                <Card className="border-accent/10 shadow-lg rounded-[2rem]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Users className="w-5 h-5 text-accent" />
                        Names
                      </CardTitle>
                      <CardDescription>AI-identified individuals</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2.5">
                      {result.entities.names.length > 0 ? (
                        result.entities.names.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="px-4 py-1.5 text-sm font-medium border-accent/20 text-accent rounded-lg">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic w-full text-center py-2">No personal names identified.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/10 shadow-lg rounded-[2rem]">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                    <div className="space-y-1">
                      <CardTitle className="font-headline text-xl flex items-center gap-2">
                        <Building className="w-5 h-5 text-accent" />
                        Organizations
                      </CardTitle>
                      <CardDescription>Companies and groups</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2.5">
                      {result.entities.companies.length > 0 ? (
                        result.entities.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="px-4 py-1.5 text-sm font-medium border-accent/20 text-accent bg-accent/5 rounded-lg">
                            {company}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-xs text-muted-foreground italic w-full text-center py-2">No organizations identified.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            <Button variant="ghost" className="w-full text-muted-foreground hover:text-primary gap-2 h-12 rounded-xl">
              <Share2 className="w-4 h-4" />
              Share Report
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
