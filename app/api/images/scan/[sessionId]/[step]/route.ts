import { auth } from "@/auth"
import { db } from "@/lib/db"
import { scanSessions } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import fs from "fs"
import path from "path"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ sessionId: string, step: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { sessionId, step } = await params

  const scanData = await db.query.scanSessions.findFirst({
    where: eq(scanSessions.id, sessionId)
  })

  if (!scanData || scanData.userId !== session.user.id) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  const imageUrl = step === '1' ? scanData.step1Image : scanData.step2Image

  if (!imageUrl) {
    return new NextResponse("Not Found", { status: 404 })
  }

  if (imageUrl.startsWith('http')) {
    return NextResponse.redirect(new URL(imageUrl))
  }

  // Fallback for any old local paths that might remain (though unlikely to work on Vercel)
  const filepath = path.join(process.cwd(), "uploads", "scans", path.basename(imageUrl))
  if (!fs.existsSync(filepath)) {
    return new NextResponse("Not Found", { status: 404 })
  }

  const fileBuffer = fs.readFileSync(filepath)
  return new NextResponse(fileBuffer, {
    headers: {
      "Content-Type": "image/jpeg",
      "Cache-Control": "private, max-age=3600"
    }
  })
}
