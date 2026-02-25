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
      <div className="container mx-auto flex h-24 items-center justify-between px-6">
        <div className="flex items-center gap-10 md:gap-14">
          <Link href="/" className="flex items-center gap-4 group">
            <div className="flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-primary text-primary-foreground shadow-2xl shadow-primary/40 group-hover:scale-110 transition-all duration-500">
              <Zap className="h-8 w-8 fill-primary-foreground" />
            </div>
            <span className="hidden sm:inline-block text-3xl font-black tracking-tighter font-headline uppercase">Scoutier</span>
          </Link>

          {user && (
            <div className="flex items-center gap-2">
              <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs">
                <Link href="/">
                  <Sparkles className="mr-3 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Parser</span>
                </Link>
              </Button>
              <Button variant={pathname === "/campaigns" ? "secondary" : "ghost"} asChild className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs">
                <Link href="/campaigns">
                  <Send className="mr-3 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Campaigns</span>
                </Link>
              </Button>
              <Button variant={pathname === "/contacts" ? "secondary" : "ghost"} asChild className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs">
                <Link href="/contacts">
                  <Users className="mr-3 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">Contacts</span>
                </Link>
              </Button>
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} asChild className="rounded-2xl h-12 px-6 font-black uppercase tracking-widest text-xs">
                <Link href="/dashboard">
                  <History className="mr-3 h-4 w-4 fill-current" />
                  <span className="hidden md:inline">History</span>
                </Link>
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-6">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-14 w-14 rounded-2xl overflow-hidden border border-white/10 p-0 hover:scale-105 transition-all bg-secondary/20">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.email || ""} />
                    <AvatarFallback className="rounded-none bg-secondary/50"><UserIcon className="w-6 h-6 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-72 mt-4 rounded-3xl shadow-2xl border-white/10 bg-popover/95 backdrop-blur-xl p-3" align="end">
                <DropdownMenuLabel className="font-normal p-5">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-black uppercase tracking-widest">Protocol User</p>
                    <p className="text-xs font-bold text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem asChild className="h-14 cursor-pointer rounded-2xl font-bold px-4 hover:bg-white/5">
                  <Link href="/dashboard">
                    <History className="mr-4 h-5 w-5 text-primary" />
                    Extraction Logs
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="h-14 cursor-pointer rounded-2xl font-bold px-4 hover:bg-white/5">
                  <Link href="/campaigns">
                    <Send className="mr-4 h-5 w-5 text-primary" />
                    Active Outreach
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/5" />
                <DropdownMenuItem onClick={handleSignOut} className="h-14 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-2xl font-black uppercase tracking-widest text-xs px-4">
                  <LogOut className="mr-4 h-5 w-5" />
                  Terminate Session
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" className="rounded-2xl font-black uppercase tracking-widest text-xs hidden sm:flex h-12 px-6" onClick={onAuthClick}>Sign In</Button>
              <Button className="rounded-2xl px-8 h-12 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/40 transition-all hover:scale-105" onClick={onAuthClick}>Access Portal</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}