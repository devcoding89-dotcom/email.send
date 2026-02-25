
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
      toast({ title: "Extraction Removed", description: "The record has been permanently deleted from your history." });
    } catch (error) {
      toast({ variant: "destructive", title: "Deletion Failed", description: "Could not remove the record. Please try again." });
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
        <div className="flex flex-col items-center gap-4">
          <LayoutGrid className="w-10 h-10 animate-spin text-primary" />
          <p className="text-lg font-headline font-bold text-muted-foreground">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl font-headline font-bold text-muted-foreground">Access denied. Please sign in.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold font-headline">Intelligence Library</h1>
            <p className="text-xl text-muted-foreground">Securely manage and export your historical extraction operations.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Filter by email or content..." 
              className="pl-12 h-14 rounded-2xl text-lg bg-card/50" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8">
            <Card className="shadow-2xl border-border/50 rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
              <CardContent className="p-0">
                <Table>
                  <TableHeader className="bg-muted/30">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-[220px] px-8 py-6 text-sm font-bold uppercase tracking-widest">Date & Time</TableHead>
                      <TableHead className="py-6 text-sm font-bold uppercase tracking-widest">Preview</TableHead>
                      <TableHead className="text-center py-6 text-sm font-bold uppercase tracking-widest">Count</TableHead>
                      <TableHead className="text-right px-8 py-6 text-sm font-bold uppercase tracking-widest">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.length > 0 ? (
                      filteredHistory.map((record) => (
                        <TableRow 
                          key={record.id} 
                          className={`cursor-pointer transition-all duration-300 ${selected?.id === record.id ? 'bg-primary/10' : 'hover:bg-muted/40'}`}
                          onClick={() => setSelected(record)}
                        >
                          <TableCell className="px-8 py-6 font-bold">
                            <div className="flex items-center gap-3">
                              <Calendar className="w-4 h-4 text-primary" />
                              {record.createdAt ? format(record.createdAt.toDate(), "MMM d, yyyy HH:mm") : "Processing..."}
                            </div>
                          </TableCell>
                          <TableCell className="py-6">
                            <div className="max-w-[280px] truncate text-base text-muted-foreground italic font-medium">
                              "{record.text.substring(0, 60)}..."
                            </div>
                          </TableCell>
                          <TableCell className="text-center py-6">
                            <Badge variant="secondary" className="font-black text-sm px-4 py-1 bg-primary/20 text-primary border-primary/20">
                              {record.count}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right px-8 py-6">
                            <div className="flex justify-end gap-3">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10" 
                                onClick={(e) => deleteRecord(record.id, e)}
                              >
                                <Trash2 className="h-5 w-5" />
                              </Button>
                              <ChevronRight className={`h-6 w-6 text-muted-foreground transition-transform duration-300 ${selected?.id === record.id ? 'rotate-90 text-primary' : ''}`} />
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="h-64 text-center">
                          <div className="flex flex-col items-center gap-4 text-muted-foreground">
                            <FileText className="w-16 h-16 opacity-20" />
                            <p className="text-xl font-headline font-bold">No extraction records found</p>
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
            <Card className="sticky top-32 shadow-2xl border-primary/20 bg-primary/5 rounded-[2.5rem] overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500">
              {!selected ? (
                <div className="p-20 text-center flex flex-col items-center justify-center gap-8">
                  <div className="p-8 bg-muted rounded-[2rem] animate-bounce duration-[4000ms]">
                    <FileText className="w-16 h-16 text-muted-foreground/40" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold font-headline">Select a Record</h3>
                    <p className="text-muted-foreground font-medium">Click on any entry in your library to view detailed AI insights and export data.</p>
                  </div>
                </div>
              ) : (
                <>
                  <CardHeader className="border-b bg-card px-8 py-8">
                    <div className="flex justify-between items-center mb-2">
                      <CardTitle className="font-headline text-2xl font-black">Detailed Report</CardTitle>
                      <Button className="rounded-xl px-6 font-bold shadow-lg shadow-primary/20" onClick={exportSelection}>
                        <Download className="w-4 h-4 mr-2" />
                        Export
                      </Button>
                    </div>
                    <CardDescription className="text-base font-medium">
                      Scouted on {selected.createdAt ? format(selected.createdAt.toDate(), "PPPP 'at' p") : "Just now"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[650px]">
                      <div className="p-8 space-y-10">
                        <section>
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-6 flex items-center gap-3">
                            <Mail className="w-4 h-4" />
                            Extracted Emails ({selected.emails.length})
                          </h4>
                          <div className="flex flex-wrap gap-2.5">
                            {selected.emails.map((e, i) => (
                              <Badge key={i} variant="secondary" className="bg-background px-4 py-2 text-sm font-bold border rounded-xl">{e}</Badge>
                            ))}
                          </div>
                        </section>

                        {(selected.entities.names.length > 0 || selected.entities.companies.length > 0) && (
                          <section className="space-y-8">
                            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-accent flex items-center gap-3">
                              <ExternalLink className="w-4 h-4" />
                              AI Entity Insights
                            </h4>
                            {selected.entities.names.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Personal Names</p>
                                <div className="flex flex-wrap gap-2.5">
                                  {selected.entities.names.map((n, i) => (
                                    <Badge key={i} variant="outline" className="text-sm font-bold px-4 py-2 border-accent/20 text-accent bg-accent/5 rounded-xl">{n}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                            {selected.entities.companies.length > 0 && (
                              <div className="space-y-3">
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Organizations</p>
                                <div className="flex flex-wrap gap-2.5">
                                  {selected.entities.companies.map((c, i) => (
                                    <Badge key={i} variant="outline" className="text-sm font-bold px-4 py-2 border-accent/20 text-accent bg-accent/5 rounded-xl">{c}</Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </section>
                        )}

                        <section className="space-y-4">
                          <h4 className="text-sm font-black uppercase tracking-[0.2em] text-muted-foreground">Source Snippet</h4>
                          <div className="bg-background border rounded-2xl p-6 text-base font-body text-muted-foreground leading-relaxed italic relative">
                             <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-background to-transparent rounded-b-2xl" />
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
