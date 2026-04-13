"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyEmail } from "@/lib/actions/auth";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("No verification token found.");
      setLoading(false);
      return;
    }

    verifyEmail(token).then((res) => {
      if (res.error) {
        setError(res.error);
      } else {
        setSuccess(true);
      }
      setLoading(false);
    });
  }, [token]);

  if (loading) {
    return (
      <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[12px_12px_0px_#6c72ff] text-center">
        <Loader2 size={64} className="mx-auto text-brand mb-6 animate-spin" />
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Verifying...</h2>
        <p className="mt-4 font-mono text-xs font-bold uppercase text-black/60">Validating the security token</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[12px_12px_0px_#6c72ff] text-center">
        <XCircle size={64} className="mx-auto text-red-500 mb-6" />
        <h2 className="text-3xl font-black uppercase tracking-tighter italic">Verification Failed</h2>
        <p className="mt-4 font-mono text-xs font-bold uppercase text-red-500 mb-8">{error}</p>
        <Link href="/register">
          <Button variant="neo" className="w-full cursor-target">Back to Register</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[12px_12px_0px_#6c72ff] text-center">
      <CheckCircle2 size={64} className="mx-auto text-emerald-500 mb-6" />
      <h2 className="text-3xl font-black uppercase tracking-tighter italic">Identity Verified</h2>
      <p className="mt-4 font-mono text-xs font-bold uppercase text-black/60 mb-8">Your account is now fully active.</p>
      <Link href="/login">
        <Button variant="neo" className="w-full cursor-target">Proceed to Login</Button>
      </Link>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
      <Suspense fallback={<div className="font-mono font-bold">Loading Verification Sequence...</div>}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
