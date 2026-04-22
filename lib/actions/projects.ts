"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { components, projects } from "@/lib/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { google } from "@ai-sdk/google";
import { generateObject } from "ai";
import { z } from "zod";

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

    return { success: true, ...object } as GenerateIdeasResponse;
  } catch (error) {
    console.error("AI Generation Error:", error);
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

  try {
    const { object } = await generateObject({
      model: google("gemini-2.5-flash-lite"),
      schema: z.object({
        instructions: z.array(z.object({
          step: z.number(),
          title: z.string(),
          content: z.string(),
        })),
        mermaidiagram: z.string().describe("A Mermaid.js diagram representing the circuit connections. Use 'graph TD' or similar. Use descriptive labels for pins. Keep it valid and finish all connections."),
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
         - Represent components as descriptive blocks with IDs and quoted labels. Format: NodeID["Label with (Parentheses)"]
         - CRITICAL: Always wrap node labels in double quotes and square brackets NodeID["Label"] to avoid errors with special characters like () or [].
         - Node IDs should be alphanumeric and single-word if possible (e.g., 'Switch1', 'LED_Red').
         - Every connection must be complete. Format: NodeA["Label A"] -->|Signal| NodeB["Label B"]
         - Use '---' for simple connections or '-->' for directional ones.
         - STRICTLY FORBIDDEN: Do NOT use the '--|>' syntax. For labeled connections, always use '-->|Label|'.
         - Do NOT leave trailing dashes at the end of a line.
         - Do NOT use spaces inside labels of links (use '|Signal|' instead of '| Signal |').
         - Specify the PIN names on each end of the connection.
         - The diagram must be valid Mermaid syntax. Double-check all brackets.
         STRICT RULES:
         - NEVER chain connections like A --> B --> C
         - ALWAYS split into separate lines
         - EVERY connection must be exactly: A -->|Label| B
         - NEVER end a line with --> or --
         - NEVER connect to plain text, only nodes
      3. Safety precautions.`,
    });

    return { success: true, data: object as ProjectGuide };
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
      safetyWarnings: projectData.safetyWarnings || [],
    }).returning();

    revalidatePath("/projects");
    return { success: true, project: inserted };
  } catch (error: any) {
    console.error("DB Save Error:", error);
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
