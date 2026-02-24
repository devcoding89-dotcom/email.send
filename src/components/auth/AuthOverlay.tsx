
"use client";

import { useState } from "react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, UserPlus, LogIn, X, AlertCircle } from "lucide-react";

export function AuthOverlay({ onSuccess, onClose }: { onSuccess: () => void, onClose: () => void }) {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast({ variant: "destructive", title: "Weak Password", description: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      onSuccess();
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sign Up Failed", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) {
      toast({ variant: "destructive", title: "Email Required", description: "Please enter your email to receive reset instructions." });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({ title: "Email Sent", description: "Password reset instructions sent to your email." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message });
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <Card className="w-full max-w-md shadow-2xl border-primary/10 relative overflow-hidden">
        <Button variant="ghost" size="icon" className="absolute right-4 top-4 z-10 text-muted-foreground hover:text-foreground" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
        
        <Tabs defaultValue="login" className="w-full">
          <CardHeader className="text-center pt-10 pb-6">
            <div className="mx-auto bg-primary/10 p-4 rounded-3xl w-fit mb-6">
              <LogIn className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold font-headline">Welcome back</CardTitle>
            <CardDescription className="text-base mt-2">Sign in to sync your data across devices</CardDescription>
            <TabsList className="grid w-full grid-cols-2 mt-8 bg-muted/50 p-1 h-12 rounded-xl">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="signup" className="rounded-lg data-[state=active]:shadow-sm">Sign Up</TabsTrigger>
            </TabsList>
          </CardHeader>

          <TabsContent value="login" className="mt-0">
            <form onSubmit={handleSignIn}>
              <CardContent className="space-y-5 px-8">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="name@company.com" className="pl-11 h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="login-password" type="password" className="pl-11 h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </div>
                <Button variant="link" size="sm" type="button" onClick={handleResetPassword} className="px-0 font-medium text-muted-foreground hover:text-primary h-auto">
                  Forgot your password?
                </Button>
              </CardContent>
              <CardFooter className="px-8 pb-10">
                <Button className="w-full h-12 rounded-xl text-base shadow-lg shadow-primary/20" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Sign In to Scoutier"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="mt-0">
            <form onSubmit={handleSignUp}>
              <CardContent className="space-y-5 px-8">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="name@company.com" className="pl-11 h-12 rounded-xl" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Create Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="signup-password" type="password" className="pl-11 h-12 rounded-xl" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Minimum 6 characters
                  </p>
                </div>
              </CardContent>
              <CardFooter className="px-8 pb-10">
                <Button className="w-full h-12 rounded-xl text-base bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20" type="submit" disabled={loading}>
                  <UserPlus className="w-5 h-5 mr-2" />
                  {loading ? "Creating Account..." : "Join Scoutier"}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
}
