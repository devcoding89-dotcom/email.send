
"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, serverTimestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Users, Mail, Building, Trash2, Search, Download, UserPlus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { addDocumentNonBlocking, deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import { doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  position: string;
  createdAt: any;
}

export default function ContactsPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [search, setSearch] = useState("");

  const contactsQuery = useMemoFirebase(() => {
    if (!user || !db) return null;
    return query(
      collection(db, `users/${user.uid}/contacts`),
      orderBy("createdAt", "desc")
    );
  }, [user, db]);

  const { data: contactsData, isLoading } = useCollection<Contact>(contactsQuery);
  const contacts = contactsData || [];

  const handleDelete = (id: string) => {
    if (!user || !db) return;
    deleteDocumentNonBlocking(doc(db, `users/${user.uid}/contacts`, id));
    toast({ title: "Contact Removed", description: "The contact has been deleted from your database." });
  };

  const filteredContacts = contacts.filter(c => 
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.firstName.toLowerCase().includes(search.toLowerCase()) ||
    c.lastName.toLowerCase().includes(search.toLowerCase()) ||
    c.company.toLowerCase().includes(search.toLowerCase())
  );

  if (isUserLoading) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-16 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-16">
          <div className="space-y-4">
            <h1 className="text-5xl font-bold font-headline">Contact Vault</h1>
            <p className="text-xl text-muted-foreground">Centralize your leads and verified prospects for outreach.</p>
          </div>
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-80">
              <Search className="absolute left-4 top-4 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search contacts..." 
                className="pl-12 h-14 rounded-2xl bg-card" 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>
            <Button size="lg" className="h-14 px-8 rounded-2xl font-bold shadow-lg shadow-primary/20">
              <UserPlus className="mr-2 h-5 w-5" />
              Add Lead
            </Button>
          </div>
        </div>

        <Card className="border-border/50 shadow-2xl rounded-[2.5rem] overflow-hidden bg-card/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-transparent">
                  <TableHead className="px-8 py-6 text-xs font-black uppercase tracking-widest">Name</TableHead>
                  <TableHead className="py-6 text-xs font-black uppercase tracking-widest">Email Address</TableHead>
                  <TableHead className="py-6 text-xs font-black uppercase tracking-widest">Company & Role</TableHead>
                  <TableHead className="py-6 text-xs font-black uppercase tracking-widest">Added</TableHead>
                  <TableHead className="text-right px-8 py-6 text-xs font-black uppercase tracking-widest">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <TableRow key={i}>
                      <TableCell colSpan={5} className="h-20"><div className="w-full h-8 bg-muted animate-pulse rounded-lg" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredContacts.length > 0 ? (
                  filteredContacts.map((contact) => (
                    <TableRow key={contact.id} className="hover:bg-primary/5 transition-colors">
                      <TableCell className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                            {contact.firstName[0]}{contact.lastName[0]}
                          </div>
                          <span className="font-bold text-lg">{contact.firstName} {contact.lastName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 font-medium text-muted-foreground">{contact.email}</TableCell>
                      <TableCell className="py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{contact.company}</span>
                          <span className="text-xs text-muted-foreground">{contact.position}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-6 text-sm text-muted-foreground">
                        {contact.createdAt ? format(contact.createdAt.toDate(), "MMM d, yyyy") : "..."}
                      </TableCell>
                      <TableCell className="text-right px-8 py-6">
                        <Button variant="ghost" size="icon" className="rounded-xl hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(contact.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-96 text-center">
                      <div className="flex flex-col items-center gap-6">
                        <Users className="h-20 w-20 text-muted-foreground/20" />
                        <div className="space-y-2">
                          <h3 className="text-2xl font-bold font-headline">Empty Vault</h3>
                          <p className="text-muted-foreground font-medium">No contacts found matching your criteria.</p>
                        </div>
                        <Button variant="outline" className="rounded-xl" onClick={() => setSearch("")}>Clear Search</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
