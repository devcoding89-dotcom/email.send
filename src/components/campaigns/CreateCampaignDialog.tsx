"use client";

import { useState, useEffect } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, serverTimestamp, query, orderBy, addDoc } from "firebase/firestore";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Send, Type, Layers, Zap, Info, ArrowRight, Eye, Users, Search, CheckCircle2, MailPlus, Loader2, PlayCircle } from "lucide-react";
import { extractEmails, personalizeTemplate } from "@/lib/extractor";
import { sendCampaignEmail } from "@/app/actions/email-actions";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
}

export function CreateCampaignDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [speed, setSpeed] = useState([10]);
  const [step, setStep] = useState<"content" | "audience" | "config">("content");
  const [search, setSearch] = useState("");
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [manualEmails, setManualEmails] = useState("");
  const [isProcessingManual, setIsProcessingManual] = useState(false);
  
  // Test Email State
  const [testEmail, setTestEmail] = useState("");
  const [isTesting, setIsTesting] = useState(false);

  // Fetch available contacts
  const contactsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(collection(db, `users/${user.uid}/contacts`), orderBy("createdAt", "desc"));
  }, [user, db]);

  const { data: contactsData } = useCollection<Contact>(contactsQuery);
  const contacts = contactsData || [];

  const tokens = ["firstName", "lastName", "email", "company", "position"];

  const insertToken = (token: string) => {
    setBody(prev => prev + `{{${token}}}`);
  };

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({ variant: "destructive", title: "Test Email Required", description: "Enter an address to receive the test." });
      return;
    }
    
    setIsTesting(true);
    try {
      // Create a mock contact for the test
      const mockContact = {
        firstName: "Test",
        lastName: "User",
        email: testEmail,
        company: "Scoutier Test Corp",
        position: "Quality Assurance"
      };

      const personalizedBody = personalizeTemplate(body || "This is a test message from Scoutier.", mockContact);
      const personalizedSubject = personalizeTemplate(subject || "Scoutier Test", mockContact);

      const result = await sendCampaignEmail(testEmail, personalizedSubject, personalizedBody);
      
      if (result.success) {
        toast({ 
          title: "Test Sent!", 
          description: result.status === 'simulated' 
            ? "Simulated delivery successful. (Add SMTP credentials for real emails)" 
            : `Email successfully delivered to ${testEmail}` 
        });
      } else {
        toast({ variant: "destructive", title: "Delivery Failed", description: result.error });
      }
    } catch (e) {
      toast({ variant: "destructive", title: "System Error", description: "Could not initiate test dispatch." });
    } finally {
      setIsTesting(false);
    }
  };

  const handleCreate = () => {
    if (!user || !db) return;
    if (!name || !subject || !body) {
      toast({ variant: "destructive", title: "Missing Information", description: "All fields are required to build a campaign." });
      return;
    }

    if (selectedContactIds.length === 0) {
      toast({ variant: "destructive", title: "No Audience", description: "Please select or add at least one contact for this campaign." });
      return;
    }

    addDocumentNonBlocking(collection(db, `users/${user.uid}/campaigns`), {
      userId: user.uid,
      name,
      subject,
      body,
      speed: speed[0],
      status: "draft",
      targetContactIds: selectedContactIds,
      stats: { total: selectedContactIds.length, sent: 0, failed: 0 },
      createdAt: serverTimestamp(),
    });

    toast({ title: "Campaign Saved", description: `Outreach designed for ${selectedContactIds.length} contacts.` });
    onOpenChange(false);
    reset();
  };

  const reset = () => {
    setName("");
    setSubject("");
    setBody("");
    setSpeed([10]);
    setStep("content");
    setSelectedContactIds([]);
    setManualEmails("");
    setTestEmail("");
  };

  const toggleContact = (id: string) => {
    setSelectedContactIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedContactIds.length === filteredContacts.length) {
      setSelectedContactIds([]);
    } else {
      setSelectedContactIds(filteredContacts.map(c => c.id));
    }
  };

  const handleProcessManualEmails = async () => {
    if (!user || !db || !manualEmails.trim()) return;
    
    setIsProcessingManual(true);
    const emails = extractEmails(manualEmails);
    
    if (emails.length === 0) {
      toast({ variant: "destructive", title: "No Emails Found", description: "We couldn't find any valid email addresses in your input." });
      setIsProcessingManual(false);
      return;
    }

    const newContactIds: string[] = [];
    
    for (const email of emails) {
      const existing = contacts.find(c => c.email.toLowerCase() === email.toLowerCase());
      if (existing) {
        if (!selectedContactIds.includes(existing.id)) {
          newContactIds.push(existing.id);
        }
        continue;
      }

      try {
        const docRef = await addDoc(collection(db, `users/${user.uid}/contacts`), {
          userId: user.uid,
          email,
          firstName: email.split('@')[0],
          lastName: "Manual",
          company: "Direct Entry",
          position: "Lead",
          createdAt: serverTimestamp()
        });
        newContactIds.push(docRef.id);
      } catch (e) {
        console.error("Error adding manual contact:", e);
      }
    }

    setSelectedContactIds(prev => Array.from(new Set([...prev, ...newContactIds])));
    setManualEmails("");
    toast({ title: "Emails Added", description: `Successfully added ${newContactIds.length} contacts to the audience.` });
    setIsProcessingManual(false);
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  const personalizedPreview = body
    .replace(/\{\{firstName\}\}/g, "John")
    .replace(/\{\{company\}\}/g, "Acme Inc")
    .replace(/\{\{position\}\}/g, "Growth Lead");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden border-none rounded-[3rem] shadow-2xl h-[90vh]">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full">
          {/* Sidebar / Progress */}
          <div className="md:col-span-4 bg-muted/30 p-10 flex flex-col justify-between border-r">
            <div className="space-y-12">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary rounded-xl">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-black font-headline tracking-tighter">SCOUTIER</span>
              </div>
              
              <div className="space-y-8">
                {[
                  { id: 'content', label: 'Message Design', icon: Type },
                  { id: 'audience', label: 'Target Audience', icon: Users },
                  { id: 'config', label: 'Speed & Drip', icon: Layers }
                ].map((s) => (
                  <div key={s.id} className={`flex items-center gap-4 transition-all ${step === s.id ? 'text-primary scale-105' : 'text-muted-foreground opacity-50'}`}>
                    <div className={`p-3 rounded-2xl ${step === s.id ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'bg-muted'}`}>
                      <s.icon className="h-5 w-5" />
                    </div>
                    <span className="font-bold">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-6 bg-primary/5 rounded-[2rem] border border-primary/10">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className={`h-4 w-4 mt-1 ${selectedContactIds.length > 0 ? 'text-green-500' : 'text-muted-foreground'}`} />
                  <p className="text-sm font-bold">
                    {selectedContactIds.length} <span className="text-muted-foreground font-medium">Contacts Selected</span>
                  </p>
                </div>
              </div>
              <div className="p-6 bg-muted/50 rounded-[2rem]">
                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                  Tip: Target specific leads from your vault or type in new ones directly.
                </p>
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="md:col-span-8 bg-card flex flex-col h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-10">
              <DialogHeader className="mb-10">
                <DialogTitle className="text-4xl font-headline font-black">Outreach Architect</DialogTitle>
                <DialogDescription className="text-lg">
                  {step === 'content' ? 'Define your outreach message template.' : 
                   step === 'audience' ? 'Select or add your target recipients.' : 
                   'Configure delivery speed and preview.'}
                </DialogDescription>
              </DialogHeader>

              {step === 'content' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Internal Label</Label>
                      <Input placeholder="e.g., Q1 Outreach" className="h-12 rounded-xl" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Subject</Label>
                      <Input placeholder="Check this out, {{firstName}}!" className="h-12 rounded-xl" value={subject} onChange={e => setSubject(e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message Body</Label>
                      <div className="flex gap-1.5">
                        {tokens.map(t => (
                          <Badge key={t} variant="secondary" className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-all rounded-lg py-1 text-[10px]" onClick={() => insertToken(t)}>
                            +{t}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Textarea 
                      placeholder="Hi {{firstName}}, I noticed {{company}}..." 
                      className="min-h-[200px] rounded-[2rem] p-6 text-lg font-body leading-relaxed border-muted-foreground/20 focus:border-primary"
                      value={body}
                      onChange={e => setBody(e.target.value)}
                    />
                  </div>

                  {/* Real-time Test Section */}
                  <div className="p-6 rounded-3xl bg-muted/30 border border-border/50 mt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <PlayCircle className="h-5 w-5 text-primary" />
                      <h4 className="font-bold text-sm">Real-time Test Delivery</h4>
                    </div>
                    <div className="flex gap-3">
                      <Input 
                        placeholder="Enter your email for a test send..." 
                        className="rounded-xl h-12" 
                        value={testEmail}
                        onChange={e => setTestEmail(e.target.value)}
                      />
                      <Button 
                        variant="secondary" 
                        className="rounded-xl h-12 px-6 font-bold" 
                        onClick={handleSendTest}
                        disabled={isTesting}
                      >
                        {isTesting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Test"}
                      </Button>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 italic">
                      Verify exactly how your email looks in your inbox before launching.
                    </p>
                  </div>
                </div>
              )}

              {step === 'audience' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500 h-full flex flex-col">
                  <Tabs defaultValue="vault" className="w-full flex flex-col h-full">
                    <TabsList className="grid w-full grid-cols-2 h-14 bg-muted/50 rounded-2xl p-1 mb-6">
                      <TabsTrigger value="vault" className="rounded-xl font-bold gap-2">
                        <Users className="h-4 w-4" />
                        Vault Leads
                      </TabsTrigger>
                      <TabsTrigger value="manual" className="rounded-xl font-bold gap-2">
                        <MailPlus className="h-4 w-4" />
                        Direct Entry
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="vault" className="space-y-6 flex-1">
                      <div className="relative">
                        <Search className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input 
                          placeholder="Search vault contacts..." 
                          className="pl-12 h-12 rounded-xl" 
                          value={search} 
                          onChange={e => setSearch(e.target.value)} 
                        />
                      </div>

                      <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2">
                          <Checkbox id="select-all" checked={selectedContactIds.length === filteredContacts.length && filteredContacts.length > 0} onCheckedChange={toggleAll} />
                          <Label htmlFor="select-all" className="text-sm font-bold cursor-pointer">Select All Visible</Label>
                        </div>
                        <span className="text-xs font-bold text-muted-foreground">{selectedContactIds.length} Selected</span>
                      </div>

                      <ScrollArea className="h-[350px] border rounded-3xl bg-muted/20">
                        <div className="p-4 space-y-2">
                          {filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => (
                              <div 
                                key={contact.id} 
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${selectedContactIds.includes(contact.id) ? 'bg-primary/10 border-primary' : 'bg-card hover:bg-muted/50'}`}
                                onClick={() => toggleContact(contact.id)}
                              >
                                <div className="flex items-center gap-4">
                                  <Checkbox checked={selectedContactIds.includes(contact.id)} />
                                  <div>
                                    <p className="font-bold text-sm">{contact.firstName} {contact.lastName}</p>
                                    <p className="text-xs text-muted-foreground">{contact.email}</p>
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px]">{contact.company || 'Private'}</Badge>
                              </div>
                            ))
                          ) : (
                            <div className="text-center py-20">
                              <Users className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
                              <p className="text-muted-foreground font-medium">No contacts found in vault.</p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>
                    </TabsContent>

                    <TabsContent value="manual" className="space-y-6 flex-1">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Type or Paste Emails</Label>
                        <Textarea 
                          placeholder="john@example.com, sarah@acme.co, test@gmail.com..." 
                          className="min-h-[250px] rounded-3xl p-6 text-base font-body"
                          value={manualEmails}
                          onChange={e => setManualEmails(e.target.value)}
                        />
                      </div>
                      <Button 
                        variant="secondary" 
                        className="w-full h-12 rounded-xl font-bold shadow-sm" 
                        onClick={handleProcessManualEmails}
                        disabled={isProcessingManual || !manualEmails.trim()}
                      >
                        {isProcessingManual ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Add to Audience"}
                      </Button>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              {step === 'config' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-right-8 duration-500">
                  <div className="space-y-6">
                    <div className="flex justify-between items-end">
                      <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Sending Velocity</Label>
                        <p className="text-muted-foreground text-sm">Control how fast your outreach is dispatched.</p>
                      </div>
                      <span className="text-3xl font-black font-headline text-primary">{speed[0]} <small className="text-xs uppercase">EPM</small></span>
                    </div>
                    <Slider value={speed} onValueChange={setSpeed} max={100} min={1} step={1} className="py-4" />
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      <span>Precision Drip</span>
                      <span>High Volume</span>
                    </div>
                  </div>

                  <div className="p-8 rounded-[2.5rem] bg-accent/5 border border-accent/10 space-y-4">
                    <h4 className="font-bold flex items-center gap-2 text-accent uppercase text-xs tracking-widest">
                      <Eye className="h-4 w-4" />
                      Personalization Preview
                    </h4>
                    <div className="bg-background/50 p-6 rounded-2xl border border-accent/10 text-sm font-medium leading-relaxed italic text-muted-foreground">
                      {body ? (
                        personalizedPreview.split('\n').map((line, i) => <p key={i}>{line}</p>)
                      ) : (
                        "Start typing your message to see a personalized preview here."
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-auto px-10 pb-10 flex items-center justify-between sm:justify-between w-full border-t pt-8 bg-card">
              {step !== 'content' ? (
                <Button variant="ghost" className="rounded-xl font-bold" onClick={() => {
                  if (step === 'audience') setStep('content');
                  if (step === 'config') setStep('audience');
                }}>
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              <div className="flex gap-4">
                <Button variant="outline" className="rounded-xl font-bold h-12" onClick={() => onOpenChange(false)}>Cancel</Button>
                {step === 'content' ? (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={() => setStep('audience')}>
                    Select Audience
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : step === 'audience' ? (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={() => setStep('config')}>
                    Configure Drip
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={handleCreate}>
                    Finalize & Launch
                  </Button>
                )}
              </div>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
