"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components, projects } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";
import { logger } from "@/lib/logger";


export type ProjectIdea = {
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  requiredComponents: {
    name: string;
    value: string;
    quantity: number;
    status: "In Stock" | "Need to Buy";
  }[];
  partsCountInStock: number;
  partsCountMissing: number;
};

export type GenerateIdeasResponse =
  | { success: true; ideas: ProjectIdea[]; canBuildAnything: boolean; emptyStockMessage?: string; error?: never }
  | { error: string; success?: never; ideas?: never; canBuildAnything?: never; emptyStockMessage?: never };

export async function generateProjectIdeas(limit: number = 5): Promise<GenerateIdeasResponse> {
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
      canBuildAnything: false,
      emptyStockMessage: "Your inventory is empty. Add some components first!"
    };
  }

  const inventoryDescription = userComponents.map((c: any) =>
    `${c.genericName} (${c.value}${c.unit !== 'None' ? ` ${c.unit}` : ''}) x${c.quantity} [Category: ${c.category}]`
  ).join(",\n");

  logger.req("generateProjectIdeas", { inventoryDescription });

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

    logger.res("generateProjectIdeas", object);
    return { success: true, ...object } as GenerateIdeasResponse;
  } catch (error) {
    logger.error("generateProjectIdeas", "AI Generation Error", error);
    return { error: "Failed to generate ideas. Please check if Google API Key is set." };
  }

}

export type ProjectGuide = {
  instructions: {
    step: number;
    title: string;
    content: string;
  }[];
  mermaidiagram: string;
  safetyWarnings: string[];
};

export type GuideActionResponse =
  | { success: true; data: ProjectGuide; error?: never }
  | { error: string; success?: never; data?: never };

export async function getProjectFullGuide(projectSummary: any): Promise<GuideActionResponse> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  logger.req("getProjectFullGuide", projectSummary);

  try {

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      temperature: 0,
      schema: z.object({
        instructions: z.array(z.object({
          step: z.number(),
          title: z.string(),
          content: z.string(),
        })),
        mermaidiagram: z.string().describe("Valid Mermaid.js diagram (graph TD). Example: A[\"Arduino\"] -->|5V| B[\"LED\"]"),
        safetyWarnings: z.array(z.string()),
      }),
      prompt: `Generate a detailed step-by-step guide for building: ${projectSummary.title}.
      Description: ${projectSummary.description}
      Components provided: ${JSON.stringify(projectSummary.requiredComponents)}
      
      Deliverables:
      1. Chronological instructions.
      2. A connection diagram in Mermaid.js format. 
         Guidelines for the diagram:
         - Use 'graph TD'.
         - CRITICAL: Every node MUST have an ID and a label in double quotes and square brackets. 
           Format: NodeID["Label"]
           Example: Arduino["Arduino Uno"], LED1["Red LED"]
         - NEVER use brackets [] without double quotes inside them for labels.
         - Every connection MUST be on its own line.
           Format: NodeA["Label A"] -->|Signal| NodeB["Label B"]
         - Use '-->' for all connections.
         - DO NOT use the '--|>' syntax.
         - DO NOT leave any brackets or quotes unclosed.
         - Specify the PIN names in the connection label, e.g. -->|Pin 13|
         - The diagram must be 100% valid Mermaid syntax.
      3. Safety precautions.`,
    });

    logger.res("getProjectFullGuide", object);
    return { success: true, data: object as ProjectGuide };
  } catch (error) {
    logger.error("getProjectFullGuide", "AI Generation Error", error);
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

    logger.info("saveProject", "Attempting to save project", projectData);

    const existing = await db.query.projects.findFirst({
      where: and(
        eq(projects.userId, session.user.id),
        eq(projects.title, projectData.title.trim())
      )
    });

    if (existing) {
      return { error: "Project with this title already exists in your library." };
    }

    const [inserted] = await db.insert(projects).values({
      userId: session.user.id,
      title: projectData.title.trim(),
      description: projectData.description.trim(),
      difficulty: projectData.difficulty || "Beginner",
      requiredComponents: projectData.requiredComponents || [],
      instructions: projectData.instructions || [],
      mermaidDiagram: projectData.mermaidiagram || null,
      safetyWarnings: projectData.safetyWarnings || [],
    }).returning();

    revalidatePath("/projects");
    revalidatePath("/library");
    logger.info("saveProject", "Project saved successfully", inserted);
    return { success: true, project: inserted };
  } catch (error: any) {
    logger.error("saveProject", "DB Save Error", error);
    return { error: `Failed to save project: ${error.message || "Unknown error"}` };
  }

}

export async function toggleProjectVisibility(projectId: string, isPublic: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await db.update(projects)
    .set({ isPublic: isPublic })
    .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

  revalidatePath("/projects");
  revalidatePath("/library");
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  try {
    await db.delete(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

    revalidatePath("/projects");
    revalidatePath("/library");
    return { success: true };
  } catch (error) {
    console.error("Delete Error:", error);
    return { error: "Failed to delete project" };
  }
}

export async function fixMermaidDiagram(brokenDiagram: string, errorMessage?: string): Promise<{ success: boolean; diagram?: string; error?: string }> {
  logger.req("fixMermaidDiagram", { brokenDiagram, errorMessage });
  try {

    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      temperature: 0,
      schema: z.object({
        fixedDiagram: z.string().describe("The corrected Mermaid.js diagram (graph TD)."),
      }),
      prompt: `The following Mermaid.js diagram has invalid syntax and failed to render. 
      Please fix the syntax errors so it renders correctly, but DO NOT change its meaning, logical structure, or the components involved.
      
      Broken Diagram:
      ${brokenDiagram}

      ${errorMessage ? `Error Message from Renderer:\n      ${errorMessage}\n` : ""}
      
      Guidelines:
      - Use 'graph TD'.
      - CRITICAL: Every node MUST have an ID and a label in double quotes and square brackets. 
        Format: NodeID["Label"]
        Example: Arduino["Arduino Uno"]
      - NEVER use brackets [] without double quotes inside them for labels.
      - Every connection MUST be on its own line.
        Format: NodeA["Label A"] -->|Signal| NodeB["Label B"]
      - Use '-->' for all connections.
      - DO NOT leave any brackets or quotes unclosed.
      - The diagram must be 100% valid Mermaid syntax.`,
    });

    logger.res("fixMermaidDiagram", { fixedDiagram: object.fixedDiagram });
    return { success: true, diagram: object.fixedDiagram };
  } catch (error) {
    logger.error("fixMermaidDiagram", "AI Diagram Fix Error", error);
    return { success: false, error: "Failed to fix diagram." };
  }

}

