import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FeatureScan } from "@/components/landing/feature-scan";
import { ComponentMarquee } from "@/components/landing/marquee";
import { BentoGallery } from "@/components/landing/bento-gallery";
import { MouserIntegration } from "@/components/landing/mouser-integration";
import { Hero } from "@/components/landing/hero";
import TargetCursor from "@/components/TargetCursor";
import FaultyTerminal from "@/components/FaultyTerminal";

import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  const isAuthenticated = !!session;
  return (
    <div className="selection:bg-brand selection:text-white">
      <TargetCursor />
      <main className="flex-1 overflow-x-hidden">
        <Hero isAuthenticated={isAuthenticated} />

        <ComponentMarquee />

        <FeatureScan isAuthenticated={isAuthenticated} />

        <BentoGallery />

        <MouserIntegration />

        { }
        <section className="py-32 bg-zinc-950 border-t-4 border-black flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-full pointer-events-none opacity-40">
            <FaultyTerminal tint="#fbbf24" scale={0.4} gridMul={[4, 2]} />
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-zinc-950" />
          </div>

          <div className="relative z-10">
            <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter max-w-4xl px-4 text-white">
              Stop hoarding. <br /> Start <span className="underline decoration-brand decoration-[6px] underline-offset-8">Sparking</span>.
            </h2>
            <div className="mt-10 flex flex-wrap justify-center gap-6">
              <Link href={isAuthenticated ? "/inventory" : "/register"}>
                <Button variant="neo" size="lg" className="h-14 px-8 text-lg cursor-target">
                  {isAuthenticated ? "Go to Inventory" : "Create Account"}
                </Button>
              </Link>
            </div>
            <p className="mt-6 font-mono font-bold uppercase text-xs text-white/60">Join 22,000+ builders globally</p>
          </div>
        </section>

      </main>

      <footer className="bg-black text-white py-12 border-t-4 border-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-heading text-2xl font-black uppercase italic">ProtoSpark</div>
          <div className="flex gap-8 font-mono text-xs font-bold uppercase">
            <Link href="/privacy" className="hover:text-brand">Privacy</Link>
            <Link href="/terms" className="hover:text-brand">Terms</Link>
            <a href="https://github.com/ProtoSparkApp/protospark" target="_blank" rel="noopener noreferrer" className="hover:text-brand">Github</a>
            <a href="https://api.mouser.com/" target="_blank" rel="noopener noreferrer" className="hover:text-brand">API</a>
          </div>
          <div className="text-xs font-mono font-bold text-white/40">©2026 ProtoSpark Hardware Engine</div>
        </div>
      </footer>
    </div>
  );
}
