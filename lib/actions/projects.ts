"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components, projects } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

export async function generateProjectIdeas(limit: number = 5) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  const userId = session.user.id;

  const userComponents = await db.query.components.findMany({
    where: eq(components.userId, userId),
  });

  if (userComponents.length === 0) {
    return {
      success: true,
      ideas: [],
      message: "Your inventory is empty. Add some components first!"
    };
  }

  const inventoryDescription = userComponents.map(c =>
    `${c.genericName} (${c.value}${c.unit !== 'None' ? ` ${c.unit}` : ''}) x${c.quantity} [Category: ${c.category}]`
  ).join(",\n");

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        ideas: z.array(z.object({
          title: z.string(),
          description: z.string(),
          difficulty: z.enum(["Beginner", "Intermediate", "Advanced"]),
          requiredComponents: z.array(z.object({
            name: z.string(),
            value: z.string(),
            quantity: z.number(),
            status: z.enum(["In Stock", "Need to Buy"]),
          })),
          partsCountInStock: z.number(),
          partsCountMissing: z.number(),
        })),
        canBuildAnything: z.boolean(),
        emptyStockMessage: z.string().optional(),
      }),
      prompt: `Based on the following electronic components inventory, suggest ${limit} creative DIY projects. 
      Inventory:
      ${inventoryDescription}
      
      For each project:
      1. Provide a title and a short description.
      2. Set a difficulty level.
      3. List individual components needed and mark if they are "In Stock" (based on inventory) or "Need to Buy". For "In Stock" components, make sure to use their exact names and specifications from the inventory list above.If a watering system is suggested, strictly check if a "Water Pump" or "DC Motor" is in the Inventory. If not, it MUST be listed in "Need to Buy".
      4. If nothing can be built with these components, set canBuildAnything to false and suggest what basic starter kit or specific parts would be most useful to buy.
      
      Try to be as realistic as possible given the specific components.`,
    });

    //Do not suggest "Need to Buy" components if there are suitable alternatives already "In Stock"

    return { success: true, ...object };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { error: "Failed to generate ideas. Please check if Google API Key is set." };
  }
}

export async function getProjectFullGuide(projectSummary: any) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        instructions: z.array(z.object({
          step: z.number(),
          title: z.string(),
          content: z.string(),
        })),
        mermaidiagram: z.string().describe("A Mermaid.js diagram representing the circuit connections. Use 'graph TD' or similar. Use descriptive labels for pins."),
        safetyWarnings: z.array(z.string()),
      }),
      prompt: `Generate a detailed step-by-step guide for building: ${projectSummary.title}.
      Description: ${projectSummary.description}
      Components provided: ${JSON.stringify(projectSummary.requiredComponents)}
      
      Deliverables:
      1. Chronological instructions.
      2. A connection diagram in Mermaid.js format. 
         Guidelines for the diagram:
         - Use 'graph LR' or 'graph TD'.
         - Represent components as descriptive blocks.
         - CRITICAL: Do not just connect box to box. Specify the PIN names on each end of the connection (e.g., "NodeMCU[D2 Pin] --- Resistor1[10k Ohm] --- LED[Anode]").
         - Use labels for power rails (VCC/GND).
         - If possible, group related parts into subgraphs.
         - The diagram should be readable by someone without a formal schematic.
      3. Safety precautions.`,
    });

    return { success: true, data: object };
  } catch (error) {
    console.error("AI Generation Error:", error);
    return { error: "Failed to generate project guide." };
  }
}

export async function saveProject(projectData: any) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: "Unauthorized. Please log in again." };
    }

    if (!projectData.title || !projectData.description) {
      return { error: "Missing project metadata." };
    }

    const [inserted] = await db.insert(projects).values({
      userId: session.user.id,
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      difficulty: projectData.difficulty || "Beginner",
      requiredComponents: projectData.requiredComponents || [],
      instructions: projectData.instructions || [],
      mermaidDiagram: projectData.mermaidiagram || null,
    }).returning();

    revalidatePath("/projects");
    return { success: true, project: inserted };
  } catch (error: any) {
    console.error("DB Save Error:", error);
    return { error: `Failed to save project: ${error.message || "Unknown error"}` };
  }
}
