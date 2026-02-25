"use client";

import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Send, Clock, Play, Trash2, Pause, BarChart3, ShieldCheck } from "lucide-react";
import { CreateCampaignDialog } from "@/components/campaigns/CreateCampaignDialog";
import { CampaignStatsDialog } from "@/components/campaigns/CampaignStatsDialog";
import { format } from "date-fns";
import { deleteDocumentNonBlocking, updateDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { sendCampaignEmail } from "@/app/actions/email-actions";
import { personalizeTemplate, validateEmailFormat } from "@/lib/extractor";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  status: "draft" | "scheduled" | "sending" | "completed" | "paused";
  speed: number;
  targetContactIds?: string[];
  stats?: { total: number, sent: number, failed: number };
  createdAt: any;
  userId: string;
}

export default function CampaignsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [showCreate, setShowCreate] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  const campaignsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, `users/${user.uid}/campaigns`),
      orderBy("createdAt", "desc")
    );
  }, [user, db]);

  const { data: campaignsData, isLoading } = useCollection<Campaign>(campaignsQuery);
  const campaigns = campaignsData || [];

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, id));
    toast({ title: "Campaign Deleted" });
  };

  const toggleStatus = async (campaign: Campaign) => {
    if (!user || !db) return;
    const newStatus = campaign.status === 'sending' ? 'paused' : 'sending';
    
    updateDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, campaign.id), {
      status: newStatus
    });

    toast({ 
      title: newStatus === 'sending' ? "Outreach Started" : "Outreach Paused",
      description: newStatus === 'sending' ? "Processing your targeted contacts with active validation." : "The drip feed has been halted."
    });
  };

  // Professional Outreach Engine Runner
  useEffect(() => {
    if (!user || !db || campaigns.length === 0) return;

    const activeCampaigns = campaigns.filter(c => c.status === 'sending');
    if (activeCampaigns.length === 0) return;

    const interval = setInterval(async () => {
      for (const campaign of activeCampaigns) {
        const targetIds = campaign.targetContactIds || [];
        if (targetIds.length === 0) {
          updateDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, campaign.id), { status: 'completed' });
          continue;
        }

        const currentSent = campaign.stats?.sent || 0;
        const currentFailed = campaign.stats?.failed || 0;
        
        // Determine batch size based on EPM (Emails Per Minute)
        const batchSize = Math.max(1, Math.ceil(campaign.speed / 6));
        const nextBatchEndIndex = Math.min(targetIds.length, currentSent + currentFailed + batchSize);

        if (currentSent + currentFailed >= targetIds.length) {
          updateDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, campaign.id), { status: 'completed' });
          continue;
        }

        let successfulSends = 0;
        let failedSends = 0;

        for (let i = (currentSent + currentFailed); i < nextBatchEndIndex; i++) {
          const contactId = targetIds[i];
          const contactRef = doc(db, `users/${user.uid}/contacts`, contactId);
          const contactSnap = await getDoc(contactRef);
          
          if (!contactSnap.exists()) {
            failedSends++;
            continue;
          }

          const contact = contactSnap.data();

          // Pre-send validation
          if (!validateEmailFormat(contact.email)) {
            failedSends++;
            addDocumentNonBlocking(collection(db, `users/${user.uid}/campaigns/${campaign.id}/logs`), {
              userId: user.uid,
              campaignId: campaign.id,
              contactEmail: contact.email,
              status: 'failed',
              errorMessage: "Failed validation check (Invalid Format)",
              timestamp: serverTimestamp()
            });
            continue;
          }

          const personalizedBody = personalizeTemplate(campaign.body, contact);
          const personalizedSubject = personalizeTemplate(campaign.subject, contact);

          const result = await sendCampaignEmail(contact.email, personalizedSubject, personalizedBody);

          if (result.success) {
            successfulSends++;
          } else {
            failedSends++;
          }

          addDocumentNonBlocking(collection(db, `users/${user.uid}/campaigns/${campaign.id}/logs`), {
            userId: user.uid,
            campaignId: campaign.id,
            contactEmail: contact.email,
            status: result.success ? 'sent' : 'failed',
            errorMessage: result.error || null,
            timestamp: serverTimestamp()
          });
        }

        updateDocumentNonBlocking(doc(db, `users/${user.uid}/campaigns`, campaign.id), {
          "stats.sent": currentSent + successfulSends,
          "stats.failed": currentFailed + failedSends,
          "stats.total": targetIds.length
        });
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [campaigns, user, db]);

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold font-headline">Campaign Center</h1>
            <p className="text-xl text-muted-foreground">Orchestrate your automated outreach with precision and validation.</p>
          </div>
          <Button onClick={() => setShowCreate(true)} size="lg" className="h-16 px-8 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20">
            <Plus className="mr-2 h-6 w-6" />
            New Campaign
          </Button>
        </div>

        {!isLoading && campaigns.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {campaigns.map((campaign) => {
              const total = campaign.targetContactIds?.length || campaign.stats?.total || 0;
              const sent = campaign.stats?.sent || 0;
              const progress = total > 0 ? (sent / total) * 100 : 0;
              
              return (
                <Card key={campaign.id} className={`group relative border-border/50 shadow-xl rounded-[2.5rem] overflow-hidden transition-all duration-300 ${campaign.status === 'sending' ? 'border-primary ring-2 ring-primary/20' : 'hover:border-primary/50'}`}>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-2">
                        <Badge 
                          variant={campaign.status === 'completed' ? 'default' : campaign.status === 'sending' ? 'default' : 'secondary'} 
                          className={`rounded-full px-4 py-1 font-bold ${campaign.status === 'sending' ? 'bg-primary animate-pulse' : ''}`}
                        >
                          {campaign.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="rounded-full flex items-center gap-1 border-green-500/30 text-green-600 bg-green-50 text-[10px]">
                          <ShieldCheck className="h-3 w-3" />
                          Validated
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setSelectedCampaign(campaign)}>
                          <BarChart3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-destructive" onClick={() => handleDelete(campaign.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <CardTitle className="text-2xl font-headline font-black mb-1">{campaign.name}</CardTitle>
                    <CardDescription className="line-clamp-1 italic">"{campaign.subject}"</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2 rounded-full" />
                      <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                        <span className="text-green-600 font-bold">{sent} Sent</span>
                        {campaign.stats && campaign.stats.failed > 0 && <span className="text-destructive font-bold">{campaign.stats.failed} Failed/Invalid</span>}
                        <span>{total} Contacts</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        {campaign.createdAt ? format(campaign.createdAt.toDate(), "MMM d, yyyy") : "..."}
                      </div>
                      <Badge variant="outline" className="text-[10px]">{campaign.speed} EPM</Badge>
                    </div>
                    
                    <Button 
                      variant={campaign.status === 'sending' ? 'outline' : 'default'} 
                      className="w-full rounded-xl h-12 font-bold shadow-lg"
                      onClick={() => toggleStatus(campaign)}
                      disabled={campaign.status === 'completed'}
                    >
                      {campaign.status === 'sending' ? (
                        <><Pause className="mr-2 h-4 w-4" /> Pause Outreach</>
                      ) : (
                        <><Play className="mr-2 h-4 w-4" /> {campaign.status === 'completed' ? 'Campaign Finished' : 'Launch Outreach'}</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : !isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed rounded-[3rem] bg-muted/20">
            <Send className="h-20 w-20 text-muted-foreground/20 mb-8" />
            <h3 className="text-3xl font-bold font-headline mb-4">No Campaigns Found</h3>
            <p className="text-muted-foreground text-lg mb-8 max-w-md text-center">
              Define your message and hand-pick your audience to start your first campaign.
            </p>
            <Button size="lg" className="rounded-2xl" onClick={() => setShowCreate(true)}>
              Launch First Campaign
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-[2.5rem] bg-muted/40 animate-pulse" />
            ))}
          </div>
        )}
      </main>

      <CreateCampaignDialog open={showCreate} onOpenChange={setShowCreate} />
      {selectedCampaign && (
        <CampaignStatsDialog 
          campaign={selectedCampaign} 
          open={!!selectedCampaign} 
          onOpenChange={(open) => !open && setSelectedCampaign(null)} 
        />
      )}
    </div>
  );
}
