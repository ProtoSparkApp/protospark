import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap } from "lucide-react";
import { auth } from "@/auth";
import { login, logout } from "@/lib/actions/auth";

import { MobileMenu } from "@/components/mobile-menu";

export async function Header() {
  const session = await auth();

  return (
    <header className="border-b-4 border-black bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <MobileMenu />
          <Link href="/" className="font-heading text-3xl font-black uppercase tracking-tighter italic">
            Proto<span className="text-brand">Spark</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8 font-heading font-bold uppercase text-sm">
          <Link href="/inventory" className="hover:text-brand transition-colors">Inventory</Link>
          <Link href="/projects" className="hover:text-brand transition-colors">Projects</Link>
          <Link href="/explore" className="hover:text-brand transition-colors">Explore</Link>
          <Link href="/blog" className="hover:text-brand transition-colors">Blog</Link>
        </nav>

        <div className="flex items-center gap-4">
          {session?.user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="font-heading font-black text-xs uppercase">{session.user.name}</span>
                <span className="font-mono text-[8px] text-black/40 uppercase font-bold">Authenticated</span>
              </div>
              {session.user.image && (
                <img src={session.user.image} alt="User" className="size-10 border-2 border-black rounded-none" />
              )}
              <form action={logout}>
                <Button variant="outline" size="sm" className="cursor-target">Logout</Button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <div className="hidden sm:flex items-center gap-4">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-heading font-black uppercase text-xs cursor-target">Sign In</Button>
                </Link>
                <Link href="/register">
                  <Button variant="neo" size="sm" className="cursor-target">Get Started</Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
