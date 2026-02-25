
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Clock, Play, Trash2, Edit3, MoreVertical, LayoutGrid, AlertCircle } from "lucide-react";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { format } from "date-fns";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  status: "draft" | "scheduled" | "sending" | "completed";
  createdAt: any;
  scheduledAt?: any;
}

export default function CampaignsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const [showCreate, setShowCreate] = useState(false);

  const campaignsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, `users/${user.uid}/campaigns`),
      orderBy("createdAt", "desc")
    );
  }, [user, db]);

  const { data: campaigns = [], isLoading } = useCollection<Campaign>(campaignsQuery);

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, id));
  };

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold font-headline">Campaign Center</h1>
            <p className="text-xl text-muted-foreground">Manage your outreach and track delivery progress in real-time.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="lg" className="h-16 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
            <Plus className="mr-2 h-6 w-6" />
            Create Campaign
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-muted/40 animate-pulse" />
            ))}
          </div>
        ) : campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => (
              <Card key={campaign.id} className="group relative border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden hover:border-primary/50 transition-all duration-300">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-4">
                    <Badge variant={campaign.status === 'draft' ? 'secondary' : 'default'} className="rounded-full px-4 py-1 font-bold">
                      {campaign.status.toUpperCase()}
                    </Badge>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => handleDelete(campaign.id)}>
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-headline font-black mb-2">{campaign.name}</CardTitle>
                  <CardDescription className="line-clamp-1">{campaign.subject}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground mb-8">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {campaign.createdAt ? format(campaign.createdAt.toDate(), "MMM d, yyyy") : "..."}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button variant="secondary" className="flex-1 rounded-xl h-12 font-bold">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                    <Button className="flex-1 rounded-xl h-12 font-bold shadow-lg shadow-primary/10">
                      <Play className="mr-2 h-4 w-4" />
                      Start
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] bg-muted/20">
            <Send className="h-20 w-20 text-muted-foreground/20 mb-8" />
            <h3 className="text-3xl font-bold font-headline mb-4">No Active Campaigns</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">
              You haven't created any outreach campaigns yet. Start by defining your message and selecting your target list.
            </p>
            <Button size="lg" className="rounded-2xl" onClick={() => setShowCreate(true)}>
              Launch First Campaign
            </Button>
          </div>
        )}
      </main>

      <CreateCampaignDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
