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
  const router = useRouter();

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
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }

  if (success) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border-4 border-black p-12 shadow-[12px_12px_0px_#6c72ff] text-center">
          <CheckCircle2 size={64} className="mx-auto text-brand mb-6" />
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Identity Registered</h2>
          <p className="mt-4 font-mono text-xs font-bold uppercase text-black/60">Redirecting to Login sequence...</p>
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
            <Label htmlFor="password">Security Code</Label>
            <Input id="password" name="password" type="password" placeholder="MINIMUM 8 CHARACTERS" required />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 text-red-500 font-mono text-xs font-bold uppercase flex items-center gap-2">
               <span className="bg-red-500 text-white size-5 flex items-center justify-center rounded-none font-black text-[10px]">!</span>
               {error}
            </div>
          )}

          <Button variant="neo" className="w-full h-14 text-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Authorize User"}
          </Button>
        </form>

        <p className="mt-10 text-center font-mono text-xs font-bold uppercase">
          Pre-authenticated? <Link href="/login" className="text-brand underline decoration-brand decoration-2 underline-offset-4 hover:text-black hover:decoration-black transition-colors">Access Login</Link>
        </p>

        {}
        <div className="absolute -top-2 -left-2 size-4 border-t-4 border-l-4 border-black"></div>
        <div className="absolute -bottom-2 -right-2 size-4 border-b-4 border-r-4 border-black"></div>
      </div>
    </div>
  )
}
