
"use client";

import { useCollection, useMemoFirebase, useFirestore } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { BarChart3, Mail, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { format } from "date-fns";

interface CampaignLog {
  id: string;
  contactEmail: string;
  status: "sent" | "failed";
  timestamp: any;
  errorMessage?: string;
}

export function CampaignStatsDialog({ campaign, open, onOpenChange }: { campaign: any, open: boolean, onOpenChange: (open: boolean) => void }) {
  const db = useFirestore();

  const logsQuery = useMemoFirebase(() => {
    if (!campaign || !db) return null;
    return query(
      collection(db, `users/${campaign.userId}/campaigns/${campaign.id}/logs`),
      orderBy("timestamp", "desc"),
      limit(50)
    );
  }, [campaign, db]);

  const { data: logsData, isLoading } = useCollection<CampaignLog>(logsQuery);
  const logs = logsData || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl rounded-[3rem] overflow-hidden p-0 border-none shadow-2xl">
        <div className="bg-muted/30 p-10 border-b">
          <DialogHeader>
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-primary rounded-2xl shadow-lg shadow-primary/20">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-headline font-black">{campaign.name}</DialogTitle>
                <DialogDescription className="text-base">Real-time performance metrics and transmission logs.</DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6 mt-10">
            {[
              { label: 'Total Contacts', value: campaign.stats?.total || 0, icon: Mail, color: 'text-primary' },
              { label: 'Emails Sent', value: campaign.stats?.sent || 0, icon: CheckCircle2, color: 'text-green-500' },
              { label: 'Failed Ops', value: campaign.stats?.failed || 0, icon: AlertCircle, color: 'text-destructive' }
            ].map((stat, i) => (
              <div key={i} className="bg-card p-6 rounded-3xl border shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  <span className="text-2xl font-black font-headline">{stat.value}</span>
                </div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-10">
          <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Recent Transmission Logs
          </h4>
          <Card className="rounded-3xl overflow-hidden border">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="px-6 py-4 font-bold">Recipient</TableHead>
                    <TableHead className="py-4 font-bold">Status</TableHead>
                    <TableHead className="py-4 font-bold">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow><TableCell colSpan={3} className="text-center py-20 animate-pulse">Fetching logs...</TableCell></TableRow>
                  ) : logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="px-6 py-4 font-medium">{log.contactEmail}</TableCell>
                        <TableCell className="py-4">
                          <Badge variant={log.status === 'sent' ? 'secondary' : 'destructive'} className="rounded-full px-3">
                            {log.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 text-muted-foreground text-sm">
                          {log.timestamp ? format(log.timestamp.toDate(), "MMM d, HH:mm:ss") : "Just now"}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow><TableCell colSpan={3} className="text-center py-20 text-muted-foreground italic">No transmission logs yet.</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </ScrollArea>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
