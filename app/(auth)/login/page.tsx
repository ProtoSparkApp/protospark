"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login, loginWithProvider } from "@/lib/actions/auth"
import { GithubIcon, GoogleIcon } from "@/components/icons/auth-icons"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const res = await login({ email, password });
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#f9fafb] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white border-4 border-black p-8 shadow-[12px_12px_0px_#000] relative">
        <div className="mb-10 text-center">
          <h1 className="text-6xl font-black uppercase tracking-tighter italic leading-none">
            Access <span className="text-brand">Engine</span>
          </h1>
          <p className="font-mono text-[10px] font-bold uppercase text-black/40 mt-2">Authentication Protocol v1.4</p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" name="email" type="email" placeholder="ADMIN@PROTOSPARK.APP" required />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="font-mono text-[10px] font-bold uppercase hover:text-brand transition-colors underline cursor-target">Forgot Access?</Link>
            </div>
            <Input id="password" name="password" type="password" required />
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-500 p-3 text-red-500 font-mono text-xs font-bold uppercase flex items-center gap-2">
              <span className="bg-red-500 text-white size-5 flex items-center justify-center rounded-none font-black text-[10px]">!</span>
              {error}
            </div>
          )}

          <Button variant="neo" className="w-full h-14 text-lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Initiate Login"}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <div className="h-[2px] bg-black/10 flex-1"></div>
          <span className="font-mono text-[10px] font-black uppercase text-black/20">Third-Party Handshake</span>
          <div className="h-[2px] bg-black/10 flex-1"></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="h-12 border-2 border-black border-b-4 hover:bg-black hover:text-white transition-all active:translate-y-[2px] active:border-b-2" onClick={() => loginWithProvider("google")}>
            <GoogleIcon className="mr-2" /> Google
          </Button>
          <Button variant="outline" className="h-12 border-2 border-black border-b-4 hover:bg-black hover:text-white transition-all active:translate-y-[2px] active:border-b-2" onClick={() => loginWithProvider("github")}>
            <GithubIcon className="mr-2" /> GitHub
          </Button>
        </div>

        <p className="mt-10 text-center font-mono text-xs font-bold uppercase">
          New Builder? <Link href="/register" className="text-brand underline decoration-brand decoration-2 underline-offset-4 hover:text-black hover:decoration-black transition-colors">Register Identity</Link>
        </p>

        { }
        <div className="absolute -top-2 -left-2 size-4 border-t-4 border-l-4 border-black"></div>
        <div className="absolute -bottom-2 -right-2 size-4 border-b-4 border-r-4 border-black"></div>
      </div>
    </div>
  )
}
