"use client";

import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap, History, LogOut, User as UserIcon, Sparkles, Send, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export function Navbar({ onAuthClick }: { onAuthClick?: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-[100] w-full glass">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Zap className="h-6 w-6 fill-primary-foreground" />
            </div>
            <span className="hidden sm:inline-block text-xl font-black tracking-tighter font-headline uppercase">Scoutier</span>
          </Link>

          {user && (
            <div className="flex items-center gap-1">
              <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild className="rounded-xl h-10 px-3 md:px-5 font-black uppercase tracking-widest text-[10px]">
                <Link href="/">
                  <Sparkles className="md:mr-2 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Parser</span>
                </Link>
              </Button>
              <Button variant={pathname === "/campaigns" ? "secondary" : "ghost"} asChild className="rounded-xl h-10 px-3 md:px-5 font-black uppercase tracking-widest text-[10px]">
                <Link href="/campaigns">
                  <Send className="md:mr-2 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Campaigns</span>
                </Link>
              </Button>
              <Button variant={pathname === "/contacts" ? "secondary" : "ghost"} asChild className="rounded-xl h-10 px-3 md:px-5 font-black uppercase tracking-widest text-[10px]">
                <Link href="/contacts">
                  <Users className="md:mr-2 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Contacts</span>
                </Link>
              </Button>
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} asChild className="rounded-xl h-10 px-3 md:px-5 font-black uppercase tracking-widest text-[10px]">
                <Link href="/dashboard">
                  <History className="md:mr-2 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">History</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl overflow-hidden border border-white/10 p-0 bg-secondary/20">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.email || ""} />
                    <AvatarFallback className="rounded-none bg-secondary/50"><UserIcon className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 rounded-2xl shadow-xl border-white/10 bg-popover/95 backdrop-blur-xl p-2" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest">Protocol User</p>
                    <p className="text-[10px] font-bold text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-xl font-bold px-3">
                  <Link href="/dashboard">
                    <History className="mr-3 h-4 w-4 text-primary" />
                    Extraction Logs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="h-10 cursor-pointer rounded-xl font-bold px-3">
                  <Link href="/campaigns">
                    <Send className="mr-3 h-4 w-4 text-primary" />
                    Active Outreach
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleSignOut} className="h-10 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-xl font-black uppercase tracking-widest text-[10px] px-3">
                  <LogOut className="mr-3 h-4 w-4" />
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" className="rounded-xl font-black uppercase tracking-widest text-[10px] hidden sm:flex h-10 px-4" onClick={onAuthClick}>Sign In</Button>
              <Button className="rounded-xl px-5 h-10 font-black uppercase tracking-widest text-[10px] shadow-lg" onClick={onAuthClick}>Portal</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
