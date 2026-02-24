
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, Download, Share2, Sparkles, Trash2, Mail, Users, Building, DownloadCloud, Loader2 } from "lucide-react";
import { generateCSV, downloadFile } from "@/lib/extractor";
import { auth, db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ExtractionResult {
  emails: string[];
  entities: {
    names: string[];
    companies: string[];
  };
}

export function ScoutView() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [useAI, setUseAI] = useState(false);
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const { toast } = useToast();

  const handleParse = async () => {
    if (!text.trim()) {
      toast({ variant: "destructive", title: "Empty input", description: "Please paste some text to extract emails." });
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

        // Save to history if logged in
        if (auth.currentUser) {
          await addDoc(collection(db, `users/${auth.currentUser.uid}/parses`), {
            text,
            emails: data.emails,
            entities: data.entities,
            createdAt: serverTimestamp(),
            count: data.emails.length
          });
        }

        toast({ title: "Success!", description: `Extracted ${data.emails.length} emails.` });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Something went wrong during extraction." });
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setText("");
    setResult(null);
  };

  const copyToClipboard = (items: string[]) => {
    navigator.clipboard.writeText(items.join(", "));
    toast({ title: "Copied!", description: "Items copied to clipboard." });
  };

  const exportCSVFile = () => {
    if (!result) return;
    const csvContent = generateCSV(result.emails);
    downloadFile(csvContent, "extracted_emails.csv", "text/csv");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      <div className="lg:col-span-7 space-y-6">
        <Card className="border-primary/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-primary/5 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="font-headline flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Text Input
                </CardTitle>
                <CardDescription>Paste raw text, logs, or code here</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={clear} disabled={!text}>
                <Trash2 className="w-4 h-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Textarea
              placeholder="Paste text containing emails and names..."
              className="min-h-[400px] border-none focus-visible:ring-0 resize-none p-6 text-base"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
            <div className="p-4 bg-muted/30 border-t flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-2">
                <Switch id="ai-mode" checked={useAI} onCheckedChange={setUseAI} />
                <Label htmlFor="ai-mode" className="cursor-pointer text-sm font-medium">Extract Names & Companies (AI)</Label>
              </div>
              <Button onClick={handleParse} disabled={loading} className="h-11 px-8 shadow-lg hover:shadow-xl transition-all">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Extract Results"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-5 space-y-6">
        {!result && (
          <Card className="border-dashed border-2 bg-muted/10 h-[400px] flex flex-col items-center justify-center text-center p-6">
            <div className="bg-muted p-4 rounded-full mb-4">
              <DownloadCloud className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-muted-foreground font-headline">Results will appear here</h3>
            <p className="text-sm text-muted-foreground max-w-[250px] mt-2">
              Run an extraction on the left to see your emails and identified entities.
            </p>
          </Card>
        )}

        {result && (
          <div className="space-y-6">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="font-headline flex items-center gap-2">
                    <Mail className="w-4 h-4 text-primary" />
                    Emails
                  </CardTitle>
                  <CardDescription>Found {result.emails.length} unique addresses</CardDescription>
                </div>
                <div className="flex gap-1">
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => copyToClipboard(result.emails)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-8 w-8" onClick={exportCSVFile}>
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mt-2">
                  {result.emails.length > 0 ? (
                    result.emails.map((email, idx) => (
                      <Badge key={idx} variant="secondary" className="px-3 py-1 text-sm bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 transition-colors">
                        {email}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No emails detected.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {useAI && (
              <>
                <Card className="border-accent/20 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="font-headline flex items-center gap-2">
                        <Users className="w-4 h-4 text-accent" />
                        People
                      </CardTitle>
                      <CardDescription>Potential names identified</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.entities.names.length > 0 ? (
                        result.entities.names.map((name, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1 text-sm border-accent/30 text-accent">
                            {name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No names found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-accent/20 shadow-md">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="space-y-1">
                      <CardTitle className="font-headline flex items-center gap-2">
                        <Building className="w-4 h-4 text-accent" />
                        Companies
                      </CardTitle>
                      <CardDescription>Organizations mentioned</CardDescription>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {result.entities.companies.length > 0 ? (
                        result.entities.companies.map((company, idx) => (
                          <Badge key={idx} variant="outline" className="px-3 py-1 text-sm border-accent/30 text-accent bg-accent/5">
                            {company}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No companies found.</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
