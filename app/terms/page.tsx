import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
  return (
    <main className="flex-1 bg-white">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto border-4 border-black p-8 md:p-12 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white">
          <h1 className="font-heading text-4xl md:text-6xl font-black uppercase italic mb-8 border-b-4 border-black pb-4">
            Terms of Service
          </h1>
          
          <div className="space-y-8 font-sans">
            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">1. Acceptance of Terms</h2>
              <p className="font-bold text-lg leading-relaxed">
                By accessing or using ProtoSpark, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">2. User Accounts</h2>
              <p className="font-bold text-lg leading-relaxed">
                You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">3. Intellectual Property</h2>
              <p className="font-bold text-lg leading-relaxed">
                The hardware designs and blueprints created using ProtoSpark are the property of the users who created them, subject to any public sharing settings chosen by the user.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-black uppercase mb-4 text-brand">4. Termination</h2>
              <p className="font-bold text-lg leading-relaxed">
                We reserve the right to terminate or suspend your account and access to our services at our sole discretion, without notice, for conduct that we believe violates these Terms.
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
