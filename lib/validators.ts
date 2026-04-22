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
  mpn: z.string().max(255).optional().nullable(),
  manufacturer: z.string().max(255).optional().nullable(),
  category: z.enum(categoryEnum, "Please select a valid category"),
  value: z.string().min(1, "Value is required").max(255),
  unit: z.enum(unitEnum).default("None"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  metadata: z.any().optional().default({}),
  description: z.string().max(1000, "Description must be at most 1000 characters").nullable().optional(),
});

export type ComponentInput = z.infer<typeof componentSchema>;

export const passwordSchema = z.string()
  .min(8, "Password must be at least 8 characters")
  .max(255, "Password must be at most 255 characters")
  .refine(
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
  name: z.string().min(2, "Name must be at least 2 characters").max(255),
  email: z.string().email("Invalid email address").max(255),
  password: passwordSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").max(255),
  password: z.string().min(1, "Password is required").max(255),
});

