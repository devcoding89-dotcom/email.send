
"use client";

import { useState } from "react";
import { useUser, useFirestore } from "@/firebase";
import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, Mail, Building, Briefcase, Loader2 } from "lucide-react";
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export function AddLeadDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    position: ""
  });

  const handleAdd = async () => {
    if (!user || !db) return;
    if (!formData.email) {
      toast({ variant: "destructive", title: "Email Required", description: "Please provide at least an email address." });
      return;
    }

    setLoading(true);
    const colRef = collection(db, `users/${user.uid}/contacts`);
    
    addDoc(colRef, {
      ...formData,
      userId: user.uid,
      createdAt: serverTimestamp()
    })
    .then(() => {
      toast({ title: "Lead Added", description: `${formData.email} has been saved to your vault.` });
      setFormData({ firstName: "", lastName: "", email: "", company: "", position: "" });
      onOpenChange(false);
    })
    .catch(async (error) => {
      const permissionError = new FirestorePermissionError({
        path: colRef.path,
        operation: 'create',
        requestResourceData: formData,
      });
      errorEmitter.emit('permission-error', permissionError);
    })
    .finally(() => {
      setLoading(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] border-none shadow-2xl">
        <DialogHeader className="p-4">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <UserPlus className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black font-headline">Add New Lead</DialogTitle>
              <DialogDescription>Manually register a contact in your vault.</DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">First Name</Label>
              <Input 
                placeholder="Jane" 
                className="rounded-xl h-12" 
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Last Name</Label>
              <Input 
                placeholder="Doe" 
                className="rounded-xl h-12" 
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="email"
                placeholder="jane@example.com" 
                className="rounded-xl h-12 pl-12" 
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Company</Label>
            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Acme Corp" 
                className="rounded-xl h-12 pl-12" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Position</Label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Product Designer" 
                className="rounded-xl h-12 pl-12" 
                value={formData.position}
                onChange={e => setFormData({...formData, position: e.target.value})}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-muted/30 border-t rounded-b-[2.5rem]">
          <Button variant="ghost" className="rounded-xl font-bold" onClick={() => onOpenChange(false)} disabled={loading}>Cancel</Button>
          <Button className="rounded-xl font-bold h-12 px-8 shadow-lg shadow-primary/20" onClick={handleAdd} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save to Vault"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
