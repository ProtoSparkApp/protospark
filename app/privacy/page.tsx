import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
          <h1 className="font-heading text-4xl md:text-6xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">
            Privacy Policy
          </h1>

          <div className="space-y-8 font-sans">
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">1. Information We Collect</h2>
              <p className="font-bold text-lg leading-relaxed">
                We collect information you provide directly to us when you create an account, scan components, or create projects. This includes your name, email address, and any hardware data you upload.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">2. How We Use Information</h2>
              <p className="font-bold text-lg leading-relaxed">
                We use the information we collect to provide, maintain, and improve our services, to develop new features, and to protect ProtoSpark and our users.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">3. Data Storage</h2>
              <p className="font-bold text-lg leading-relaxed">
                Your data is stored securely on our servers. We use industry-standard encryption to protect your hardware blueprints and inventory data.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">4. Contact Us</h2>
              <p className="font-bold text-lg leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at protosparkproject@gmail.com
              </p>
            </section>
          </div>

          <div className="mt-12 pt-8 border-t-4 border-black flex justify-between items-center">
            <p className="font-mono text-xs font-bold uppercase text-black/60">Last Updated: April 23, 2026</p>
            <Link href="/">
              <Button variant="neo">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
