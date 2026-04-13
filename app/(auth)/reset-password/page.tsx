"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { Suspense } from "react";
import { resetPassword as resetPasswordAction } from "@/lib/actions/auth";

function ResetPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const router = useRouter();

  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { label: "", color: "", barColor: "", width: "w-0" };
    if (pass.length < 8) return { label: "TOO SHORT", color: "text-red-500", barColor: "bg-red-500", width: "w-1/4" };

    let score = 0;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z\d]/.test(pass)) score++;

    if (score < 3) return { label: "WEAK", color: "text-orange-500", barColor: "bg-orange-500", width: "w-2/4" };
    if (score === 3) return { label: "GOOD", color: "text-blue-500", barColor: "bg-blue-500", width: "w-3/4" };
    return { label: "STRONG", color: "text-emerald-500", barColor: "bg-emerald-500", width: "w-full" };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("No token. Use the link in the email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await resetPasswordAction(token, password);

      if (res.error) throw new Error(res.error);

      toast.success("Password changed successfully.");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] text-center">
        <h1 className="text-4xl font-black uppercase italic mb-4 text-red-500">No Token</h1>
        <p className="font-mono text-xs font-bold uppercase mb-6">Reset link is incomplete.</p>
        <Link href="/forgot-password">
          <Button variant="neo" className="w-full cursor-target">Request new link</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] relative">
      <div className="mb-10 text-center">
        <h1 className="text-5xl font-black uppercase tracking-tighter italic leading-none">
          New Password
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="password">New Password</Label>
          <Input
            id="password"
            type="password"
            placeholder="MINIMUM 8 CHARACTERS"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {password.length > 0 && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-mono text-[10px] font-bold uppercase text-black/60">
                  Security Level:
                </span>
                <span className={`font-mono text-xs font-black uppercase ${strength.color}`}>
                  {strength.label}
                </span>
              </div>
              <div className="h-2 w-full bg-black/5 border border-black/20">
                <div className={`h-full transition-all duration-300 ${strength.barColor} ${strength.width}`}></div>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 p-3 text-red-500 font-mono text-xs font-bold uppercase flex items-center gap-2">
            <span className="bg-red-500 text-white size-5 flex items-center justify-center rounded-none font-black text-[10px]">!</span>
            {error}
          </div>
        )}

        <Button variant="neo" className="w-full h-14 text-lg cursor-target" disabled={loading || !password || strength.label === "TOO SHORT" || strength.label === "WEAK"}>
          {loading ? <Loader2 className="animate-spin" /> : "Change Password"}
        </Button>
      </form>


      <div className="absolute -top-2 -left-2 size-4 border-t-4 border-l-4 border-black"></div>
      <div className="absolute -bottom-2 -right-2 size-4 border-b-4 border-r-4 border-black"></div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
      <Suspense fallback={<div className="font-mono font-bold">Loading protocol...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
