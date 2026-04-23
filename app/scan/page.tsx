import { createScanSession } from "@/lib/actions/scan";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export default async function ScanPage() {
  const session = await auth();

  if (!session) {
    redirect("/login?callbackUrl=/scan");
  }

  const result = await createScanSession();

  if (result.success && result.sessionId) {
    redirect(`/scan/${result.sessionId}`);
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-white">
      <div className="max-w-md w-full border-4 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-red-50">
        <h1 className="text-3xl font-black uppercase mb-4">Scanner Error</h1>
        <p className="font-bold text-red-600 mb-6">
          {result.error || "Failed to initialize scan session. Please try again."}
        </p>
        <a href="/">
          <button className="w-full border-4 border-black bg-black text-white py-3 font-black uppercase hover:bg-zinc-800 transition-colors">
            Back to Home
          </button>
        </a>
      </div>
    </div>
  );
}
