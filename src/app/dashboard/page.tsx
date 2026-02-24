
"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ExternalLink, Calendar, Mail, FileText, ChevronRight, Download, Search } from "lucide-react";
import { format } from "date-fns";
import { generateCSV, downloadFile } from "@/lib/extractor";
import { Input } from "@/components/ui/input";

interface ParseRecord {
  id: string;
  emails: string[];
  entities: { names: string[]; companies: string[] };
  createdAt: any;
  text: string;
  count: number;
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [history, setHistory] = useState<ParseRecord[]>([]);
  const [selected, setSelected] = useState<ParseRecord | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, `users/${user.uid}/parses`),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ParseRecord[];
      setHistory(records);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/parses`, id));
      if (selected?.id === id) setSelected(null);
      toast({ title: "Deleted", description: "Record removed from history." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Could not delete record." });
    }
  };

  const filteredHistory = history.filter(h => 
    h.emails.some(e => e.includes(search.toLowerCase())) ||
    h.text.toLowerCase().includes(search.toLowerCase())
  );

  const exportSelection = () => {
    if (!selected) return;
    const csv = generateCSV(selected.emails);
    downloadFile(csv, `extraction_${selected.id}.csv`, "text/csv");
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Redirecting...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold font-headline mb-2">Extraction History</h1>
            <p className="text-muted-foreground">Manage and export your previous data discoveries.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search emails or text..." 
              className="pl-10" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8">
            <Card className="shadow-sm border-primary/10">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow>
                      <TableHead className="w-[180px]">Date</TableHead>
                      <TableHead>Summary</TableHead>
                      <TableHead className="text-center">Count</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((record) => (
                        <TableRow 
                          key={record.id} 
                          className={`cursor-pointer transition-colors ${selected?.id === record.id ? 'bg-primary/5' : ''}`}
                          onClick={() => setSelected(record)}
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-3 h-3 text-muted-foreground" />
                              {record.createdAt ? format(record.createdAt.toDate(), "MMM d, yyyy HH:mm") : "Just now"}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-[200px] truncate text-sm text-muted-foreground italic">
                              "{record.text.substring(0, 50)}..."
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="font-mono">{record.count}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => deleteRecord(record.id, e)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                          No extractions found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            <Card className="sticky top-24 shadow-md border-primary/20 bg-primary/5">
              {!selected ? (
                <div className="p-10 text-center flex flex-col items-center justify-center gap-4">
                  <FileText className="w-12 h-12 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">Select a record from the list to view full details.</p>
                </div>
              ) : (
                <>
                  <CardHeader className="border-b bg-card">
                    <div className="flex justify-between items-start">
                      <CardTitle className="font-headline text-lg">Details</CardTitle>
                      <Button variant="outline" size="sm" onClick={exportSelection}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <CardDescription>
                      Extracted on {selected.createdAt ? format(selected.createdAt.toDate(), "PPpp") : "now"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[500px]">
                      <div className="p-6 space-y-6">
                        <section>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                            <Mail className="w-3 h-3" />
                            Emails ({selected.emails.length})
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {selected.emails.map((e, i) => (
                              <Badge key={i} variant="secondary" className="bg-background">{e}</Badge>
                            ))}
                          </div>
                        </section>

                        {(selected.entities.names.length > 0 || selected.entities.companies.length > 0) && (
                          <section className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                              <ExternalLink className="w-3 h-3" />
                              AI Insights
                            </h4>
                            {selected.entities.names.length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase mb-1">Names</p>
                                <div className="flex flex-wrap gap-2">
                                  {selected.entities.names.map((n, i) => (
                                    <Badge key={i} variant="outline" className="text-[11px]">{n}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selected.entities.companies.length > 0 && (
                              <div>
                                <p className="text-[10px] text-muted-foreground uppercase mb-1">Companies</p>
                                <div className="flex flex-wrap gap-2">
                                  {selected.entities.companies.map((c, i) => (
                                    <Badge key={i} variant="outline" className="text-[11px]">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </section>
                        )}

                        <section>
                          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Original Snippet</h4>
                          <div className="bg-background rounded-md p-4 text-xs font-mono text-muted-foreground max-h-40 overflow-hidden relative">
                             <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background to-transparent" />
                             {selected.text}
                          </div>
                        </section>
                      </div>
                    </ScrollArea>
                  </CardContent>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
