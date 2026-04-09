import { Button } from "@/components/ui/button";
import { FeatureScan } from "@/components/landing/feature-scan";
import { ComponentMarquee } from "@/components/landing/marquee";
import { BentoGallery } from "@/components/landing/bento-gallery";
import { TMEIntegration } from "@/components/landing/tme-integration";
import { Hero } from "@/components/landing/hero";

export default function Home() {
  return (
    <div className="selection:bg-brand selection:text-white">
      <main className="flex-1 overflow-x-hidden">
        <Hero />

        <ComponentMarquee />

        <FeatureScan />

        <BentoGallery />

        <TMEIntegration />

        {}
        <section className="py-32 bg-yellow-400 border-t-4 border-black flex flex-col items-center justify-center text-center">
          <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter max-w-4xl px-4">
            Stop hoarding. <br /> Start <span className="underline decoration-black decoration-8 underline-offset-8">Sparking</span>.
          </h2>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Button variant="neo" size="xl">
              Create Account
            </Button>
          </div>
          <p className="mt-8 font-mono font-bold uppercase text-sm">Join 22,000+ builders globally</p>
        </section>

      </main>

      <footer className="bg-black text-white py-12 border-t-4 border-black">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-heading text-2xl font-black uppercase italic">ProtoSpark</div>
          <div className="flex gap-8 font-mono text-xs font-bold uppercase">
            <a href="#" className="hover:text-brand">Privacy</a>
            <a href="#" className="hover:text-brand">Terms</a>
            <a href="#" className="hover:text-brand">Github</a>
            <a href="#" className="hover:text-brand">API</a>
          </div>
          <div className="text-xs font-mono font-bold text-white/40">©2026 ProtoSpark Hardware Engine</div>
        </div>
      </footer>
    </div>
  );
}
