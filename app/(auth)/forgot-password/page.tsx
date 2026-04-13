"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await forgotPassword(email);

      if (res.error) throw new Error(res.error);

      setSuccess(true);
      toast.success("If an account exists, an email with a reset link has been sent.");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] text-center">
          <h1 className="text-4xl font-black uppercase italic mb-4">Check Email</h1>
          <p className="font-mono text-sm mb-6">We sent a password reset link to the email address provided.</p>
          <Link href="/login">
            <Button variant="neo" className="w-full cursor-target">Back to login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] relative">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
            Reset Password
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              placeholder="ADMIN@PROTOSPARK.APP"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 text-red-500 font-mono text-xs font-bold uppercase flex items-center gap-2">
              <span className="bg-red-500 text-white size-5 flex items-center justify-center rounded-none font-black text-[10px]">!</span>
              {error}
            </div>
          )}

          <Button variant="neo" className="w-full h-14 text-lg cursor-target" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Send Link"}
          </Button>
        </form>

        <p className="mt-8 text-center font-mono text-xs font-bold uppercase">
          <Link href="/login" className="flex items-center justify-center gap-2 text-brand hover:text-black transition-colors">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </p>


        <div className="absolute -top-2 -left-2 size-4 border-t-4 border-l-4 border-black"></div>
        <div className="absolute -bottom-2 -right-2 size-4 border-b-4 border-r-4 border-black"></div>
      </div>
    </div>
  );
}
