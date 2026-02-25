
"use client";

import { useAuth, useUser } from "@/firebase";
import { signOut } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Zap, History, LogOut, Settings, User as UserIcon, LayoutDashboard, Sparkles, Send, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Navbar({ onAuthClick }: { onAuthClick?: () => void }) {
  const { user } = useUser();
  const auth = useAuth();
  const pathname = usePathname();

  const handleSignOut = () => signOut(auth);

  return (
    <nav className="sticky top-0 z-[50] w-full border-b glass">
      <div className="container mx-auto flex h-20 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25 group-hover:scale-110 transition-transform duration-300">
              <Zap className="h-6 w-6" />
            </div>
            <span className="hidden sm:inline-block text-2xl font-bold tracking-tight font-headline">Scoutier</span>
          </Link>

          {user && (
            <div className="flex items-center gap-1">
              <Button variant={pathname === "/" ? "secondary" : "ghost"} asChild className="rounded-full h-10 px-3 md:px-5">
                <Link href="/">
                  <Sparkles className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Parser</span>
                </Link>
              </Button>
              <Button variant={pathname === "/campaigns" ? "secondary" : "ghost"} asChild className="rounded-full h-10 px-3 md:px-5">
                <Link href="/campaigns">
                  <Send className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Campaigns</span>
                </Link>
              </Button>
              <Button variant={pathname === "/contacts" ? "secondary" : "ghost"} asChild className="rounded-full h-10 px-3 md:px-5">
                <Link href="/contacts">
                  <Users className="mr-0 md:mr-2 h-4 w-4" />
                  <span className="hidden md:inline">Contacts</span>
                </Link>
              </Button>
              <Button variant={pathname === "/dashboard" ? "secondary" : "ghost"} asChild className="rounded-full h-10 px-3 md:px-5">
                <Link href="/dashboard">
                  <History className="mr-0 md:mr-2 h-4 w-4" />
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
                <Button variant="ghost" className="relative h-11 w-11 rounded-2xl overflow-hidden border p-0 hover:bg-muted transition-all">
                  <Avatar className="h-full w-full rounded-none">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt={user.email || ""} />
                    <AvatarFallback className="rounded-none"><UserIcon className="w-5 h-5 text-muted-foreground" /></AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 mt-2 rounded-2xl shadow-2xl border-primary/10" align="end">
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <p className="text-sm font-semibold leading-none">Account</p>
                    <p className="text-xs font-medium leading-none text-muted-foreground truncate">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="h-11 cursor-pointer">
                  <Link href="/dashboard">
                    <History className="mr-3 h-4 w-4 text-muted-foreground" />
                    Past Extractions
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="h-11 cursor-pointer">
                  <Link href="/campaigns">
                    <Send className="mr-3 h-4 w-4 text-muted-foreground" />
                    Active Campaigns
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="h-11 text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer">
                  <LogOut className="mr-3 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="rounded-full hidden sm:flex" onClick={onAuthClick}>Sign In</Button>
              <Button className="rounded-full px-6 shadow-lg shadow-primary/20" onClick={onAuthClick}>Get Started</Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
