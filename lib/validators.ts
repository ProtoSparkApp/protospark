import { z } from "zod";

export const categoryEnum = [
  "Resistor",
  "Capacitor",
  "Inductor",
  "Integrated Circuit",
  "Microcontroller",
  "Sensor",
  "Actuator",
  "Connector",
  "Other"
] as const;

export const unitEnum = [
  "Ohm",
  "kOhm",
  "MOhm",
  "uF",
  "nF",
  "pF",
  "V",
  "A",
  "mA",
  "None"
] as const;

export const componentSchema = z.object({
  genericName: z.string().min(2, "Name must be at least 2 characters").max(50),
  mpn: z.string().optional().nullable(),
  manufacturer: z.string().optional().nullable(),
  category: z.enum(categoryEnum, "Please select a valid category"),
  value: z.string().min(1, "Value is required"),
  unit: z.enum(unitEnum).default("None"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  metadata: z.any().optional().default({}),
  description: z.string().max(200).nullable().optional(),
});

export type ComponentInput = z.infer<typeof componentSchema>;

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters").refine(
  (pass) => {
    let score = 0;
    if (/[a-z]/.test(pass)) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^a-zA-Z\d]/.test(pass)) score++;
    return score >= 3;
  },
  "Password is too weak. Must contain at least 3 of: lowercase, uppercase, numbers, symbols."
);

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
