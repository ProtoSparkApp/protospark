"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { register } from "@/lib/actions/auth"
import { Loader2, CheckCircle2 } from "lucide-react"

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [password, setPassword] = useState("");
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

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await register({ name, email, password });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      setSuccess(true);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[12px_12px_0px_#6c72ff] text-center">
          <CheckCircle2 size={64} className="mx-auto text-brand mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Identity Registered</h2>
          <p className="mt-4 font-mono text-xs font-bold uppercase text-black/60 mb-6">Check your inbox to verify your email address before logging in.</p>
          <Link href="/login">
            <Button variant="neo" className="w-full cursor-target">Proceed to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] relative">
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            New <span className="text-brand">Identity</span>
          </h1>
          <p className="font-mono text-[10px] font-bold uppercase text-black/40 mt-2">Registration Protocol v1.4</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Display Name</Label>
            <Input id="name" name="name" placeholder="E.G. TOMEK" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="ADMIN@PROTOSPARK.APP" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
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
            {loading ? <Loader2 className="animate-spin" /> : "Authorize User"}
          </Button>
        </form>

        <p className="mt-10 text-center font-mono text-xs font-bold uppercase">
          Pre-authenticated? <Link href="/login" className="text-brand underline decoration-brand decoration-2 underline-offset-4 hover:text-black hover:decoration-black transition-colors">Access Login</Link>
        </p>

        { }
        <div className="absolute -top-2 -left-2 size-4 border-t-4 border-l-4 border-black"></div>
        <div className="absolute -bottom-2 -right-2 size-4 border-b-4 border-r-4 border-black"></div>
      </div>
    </div>
  )
}
