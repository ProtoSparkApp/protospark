"use server"

import { db } from "@/lib/db"
import { scanSessions } from "@/lib/db/schema"
import { auth } from "@/auth"
import { eq, lt } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { ollama } from "ai-sdk-ollama"
import { google } from "@ai-sdk/google"
import { generateObject } from "ai"
import { z } from "zod"
import fs from "fs"
import path from "path"
import { searchMouserProduct } from "@/lib/mouser"
import { categoryEnum, unitEnum } from "../validators"

const PROVIDER: "ollama" | "gemini" = "gemini";

const visionModel = PROVIDER === "gemini"
  ? google("gemini-2.5-flash-lite")
  : ollama("llava:v1.6");

export async function createScanSession() {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
  try {
    await db.delete(scanSessions).where(lt(scanSessions.createdAt, twoHoursAgo))
  } catch (e) {
    console.error("Cleanup error:", e)
  }

  const sessionId = crypto.randomUUID()

  try {
    await db.insert(scanSessions).values({
      id: sessionId,
      userId: session.user.id,
      status: "awaiting"
    })

    return { success: true, sessionId }
  } catch (error) {
    console.error("Failed to create scan session:", error)
    return { error: "Database error" }
  }
}

export async function getScanSession(id: string) {
  try {
    const data = await db.query.scanSessions.findFirst({
      where: eq(scanSessions.id, id)
    })

    if (!data) return { error: "Session not found" }

    return { success: true, data }
  } catch (error) {
    return { error: "Database error" }
  }
}

export async function updateScanSession(id: string, payload: any) {
  try {
    let step1Path = payload.step1Image
    let step2Path = payload.step2Image

    if (payload.step1Image && payload.step1Image.startsWith('data:image')) {
      const base64Data = payload.step1Image.replace(/^data:image\/\w+;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")
      const filename = `${id}_step1.jpg`
      const filepath = path.join(process.cwd(), "uploads", "scans", filename)
      fs.writeFileSync(filepath, buffer)
      step1Path = `/scans/${filename}`
    }

    if (payload.step2Image && payload.step2Image.startsWith('data:image')) {
      const base64Data = payload.step2Image.replace(/^data:image\/\w+;base64,/, "")
      const buffer = Buffer.from(base64Data, "base64")
      const filename = `${id}_step2.jpg`
      const filepath = path.join(process.cwd(), "uploads", "scans", filename)
      fs.writeFileSync(filepath, buffer)
      step2Path = `/scans/${filename}`
    }

    await db.update(scanSessions)
      .set({
        status: payload.status,
        ...(step1Path ? { step1Image: step1Path } : {}),
        ...(step2Path ? { step2Image: step2Path } : {}),
        updatedAt: new Date()
      })
      .where(eq(scanSessions.id, id))

    return { success: true }
  } catch (error) {
    console.error("Update Scan Session Error:", error)
    return { error: "Update failed" }
  }
}

export async function processScan(sessionId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Unauthorized" }

  try {
    const scanData = await db.query.scanSessions.findFirst({
      where: eq(scanSessions.id, sessionId)
    })

    if (!scanData || !scanData.step1Image) return { error: "Incomplete data" }

    const step1FilePath = path.join(process.cwd(), "uploads", "scans", path.basename(scanData.step1Image))
    const step1Buffer = fs.readFileSync(step1FilePath)
    const step1Base64 = step1Buffer.toString("base64")

    let step2Base64 = null
    if (scanData.step2Image) {
      const step2FilePath = path.join(process.cwd(), "uploads", "scans", path.basename(scanData.step2Image))
      if (fs.existsSync(step2FilePath)) {
        const step2Buffer = fs.readFileSync(step2FilePath)
        step2Base64 = step2Buffer.toString("base64")
      }
    }

    const { object: idResult } = await generateObject({
      model: visionModel as any,
      tools: {
        google_search: google.tools.googleSearch({}),
      },
      schema: z.object({
        name: z.string().describe("Exact technical name/part number found on the component"),
        category: z.string().describe(`Best fit category ${categoryEnum.toString()}`),
        value: z.string().describe("Numerical value (e.g. 10, 3.3, 100)"),
        unit: z.string().describe(`Unit ${unitEnum.toString()}`),
        description: z.string().describe("Short technical description or identified package type"),
        confidence: z.number().min(0).transform(v => v > 1 ? v / 100 : v),
      }),
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Identify the specific electronic component in this macro shot. Extract part number, category, value, and unit. Respond in JSON." },
            { type: "image", image: step1Base64, mimeType: "image/jpeg" }
          ]
        }
      ]
    })

    let quantityResult = { estimatedQuantity: 1, detections: [] }

    if (step2Base64) {
      try {
        const { object: countResult } = await generateObject({
          model: visionModel as any,
          tools: {
            google_search: google.tools.googleSearch({}),
          },
          schema: z.object({
            count: z.number().describe("Total count of items detected"),
            detections: z.array(z.object({
              x: z.number(), y: z.number(), w: z.number(), h: z.number(), label: z.string()
            }))
          }),
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: "Task: Counting items as a object detector. Find all electronic components in this image and mark them with bounding boxes (x, y center and w/h as 0-100%). Respond in English." },
                { type: "image", image: step2Base64, mimeType: "image/jpeg" }
              ]
            }
          ]
        })
        quantityResult = {
          estimatedQuantity: countResult.count,
          detections: countResult.detections as any
        }
      } catch (err) {
        console.error("Counting Model Error:", err)
      }
    }

    let mouserResults = null
    if (idResult.name) {
      mouserResults = await searchMouserProduct(idResult.name)
    }

    const finalAnalysis = {
      ...idResult,
      ...quantityResult,
      mouserData: mouserResults?.[0] || null,
      mouserAlternatives: mouserResults || []
    }

    await db.update(scanSessions)
      .set({
        status: "completed",
        result: finalAnalysis,
        updatedAt: new Date()
      })
      .where(eq(scanSessions.id, sessionId))

    return { success: true, analysis: finalAnalysis }
  } catch (error) {
    console.error("AI Analysis Error:", error)
    await db.update(scanSessions).set({ status: "failed" }).where(eq(scanSessions.id, sessionId))
    return { error: "AI Processing failed" }
  }
}

export async function deleteScanSession(id: string) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { error: "Unauthorized" }

    const scanData = await db.query.scanSessions.findFirst({
      where: eq(scanSessions.id, id)
    })

    if (scanData) {
      if (scanData.step1Image && scanData.step1Image.startsWith('/scans/')) {
        const filepath = path.join(process.cwd(), "uploads", "scans", path.basename(scanData.step1Image))
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
      }
      if (scanData.step2Image && scanData.step2Image.startsWith('/scans/')) {
        const filepath = path.join(process.cwd(), "uploads", "scans", path.basename(scanData.step2Image))
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath)
      }
    }

    await db.delete(scanSessions).where(eq(scanSessions.id, id))
    return { success: true }
  } catch (error) {
    console.error("Failed to delete session:", error)
    return { error: "Delete failed" }
  }
}