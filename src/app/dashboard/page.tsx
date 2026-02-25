"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Trash2, ExternalLink, Calendar, Mail, FileText, ChevronRight, Download, Search, LayoutGrid } from "lucide-react";
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
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [selected, setSelected] = useState<ParseRecord | null>(null);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const historyQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, `users/${user.uid}/parses`),
      orderBy("createdAt", "desc")
    );
  }, [user, db]);

  const { data: historyData, isLoading: isHistoryLoading } = useCollection<ParseRecord>(historyQuery);
  const history = historyData || [];

  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await deleteDoc(doc(db, `users/${user.uid}/parses`, id));
      if (selected?.id === id) setSelected(null);
      toast({ title: "Extraction Removed" });
    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed" });
    }
  };

  const filteredHistory = history.filter(h => 
    h.emails.some(e => e.toLowerCase().includes(search.toLowerCase())) ||
    h.text.toLowerCase().includes(search.toLowerCase())
  );

  const exportSelection = () => {
    if (!selected) return;
    const csv = generateCSV(selected.emails);
    downloadFile(csv, `extraction_${selected.id}.csv`, "text/csv");
  };

  if (isUserLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LayoutGrid className="w-8 h-8 text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg font-headline font-bold text-muted-foreground">Please sign in.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-bold font-headline uppercase tracking-tight">Intelligence Library</h1>
            <p className="text-lg text-muted-foreground font-medium">Manage and export historical extraction operations.</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Filter emails..." 
              className="pl-10 h-12 rounded-xl bg-card/50" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8">
            <Card className="shadow-xl border-border/50 rounded-3xl overflow-hidden bg-card/50">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-widest">Date</TableHead>
                      <TableHead className="py-4 text-xs font-bold uppercase tracking-widest">Preview</TableHead>
                      <TableHead className="text-center py-4 text-xs font-bold uppercase tracking-widest">Count</TableHead>
                      <TableHead className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((record) => (
                        <TableRow 
                          key={record.id} 
                          className={`cursor-pointer transition-colors ${selected?.id === record.id ? 'bg-primary/10' : 'hover:bg-muted/20'}`}
                          onClick={() => setSelected(record)}
                        >
                          <TableCell className="px-6 py-4 font-bold text-sm whitespace-nowrap">
                            {record.createdAt ? format(record.createdAt.toDate(), "MMM d, HH:mm") : "..."}
                          </TableCell>
                          <TableCell className="py-4">
                            <div className="max-w-[200px] truncate text-sm text-muted-foreground font-medium">
                              "{record.text.substring(0, 40)}..."
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-4">
                            <Badge variant="secondary" className="font-black text-xs px-3 py-0.5 bg-primary/20 text-primary">
                              {record.count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 rounded-lg text-muted-foreground hover:text-destructive" 
                                onClick={(e) => deleteRecord(record.id, e)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                              <ChevronRight className={`h-5 w-5 text-muted-foreground ${selected?.id === record.id ? 'rotate-90' : ''}`} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-48 text-center">
                          <div className="flex flex-col items-center gap-2 text-muted-foreground">
                            <FileText className="w-10 h-10 opacity-20" />
                            <p className="text-sm font-bold">No records found</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-4">
            {selected && (
              <Card className="shadow-xl border-primary/20 bg-primary/5 rounded-3xl overflow-hidden">
                <CardHeader className="border-b bg-card px-6 py-6">
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="font-headline text-xl font-black">Report</CardTitle>
                    <Button size="sm" className="rounded-xl px-4 font-bold" onClick={exportSelection}>
                      <Download className="w-3 h-3 mr-2" />
                      Export
                    </Button>
                  </div>
                  <CardDescription className="text-xs font-medium">
                    {selected.createdAt ? format(selected.createdAt.toDate(), "PPP") : "Just now"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    <div className="p-6 space-y-8">
                      <section>
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          Emails ({selected.emails.length})
                        </h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selected.emails.map((e, i) => (
                            <Badge key={i} variant="secondary" className="bg-background px-3 py-1 text-xs font-bold rounded-lg">{e}</Badge>
                          ))}
                        </div>
                      </section>

                      {(selected.entities.names.length > 0 || selected.entities.companies.length > 0) && (
                        <section className="space-y-6">
                          <h4 className="text-[10px] font-black uppercase tracking-widest text-accent flex items-center gap-2">
                            <ExternalLink className="w-3 h-3" />
                            AI Insights
                          </h4>
                          {selected.entities.names.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Names</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selected.entities.names.map((n, i) => (
                                  <Badge key={i} variant="outline" className="text-xs font-bold px-3 py-1 border-accent/20 text-accent bg-accent/5 rounded-lg">{n}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          {selected.entities.companies.length > 0 && (
                            <div className="space-y-2">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Organizations</p>
                              <div className="flex flex-wrap gap-1.5">
                                {selected.entities.companies.map((c, i) => (
                                  <Badge key={i} variant="outline" className="text-xs font-bold px-3 py-1 border-accent/20 text-accent bg-accent/5 rounded-lg">{c}</Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </section>
                      )}

                      <section className="space-y-2">
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Source</h4>
                        <div className="bg-background border rounded-xl p-4 text-xs font-body text-muted-foreground leading-relaxed italic">
                          {selected.text}
                        </div>
                      </section>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
