import { z } from "zod";

export const categoryEnum = [
  "Microcontroller",
  "Resistor",
  "Capacitor",
  "Transistor",
  "Diode",
  "Integrated Circuit",
  "Sensor",
  "Actuator",
  "Power Supply",
  "Connector",
  "Other"
] as const;

export const unitEnum = [
  "Ohm",
  "uF",
  "nF",
  "pF",
  "V",
  "A",
  "mA",
  "Hz",
  "MHz",
  "None"
] as const;

export const componentSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  category: z.enum(categoryEnum, "Please select a valid category"),
  value: z.string().min(1, "Value is required"),
  unit: z.enum(unitEnum).default("None"),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1"),
  description: z.string().max(200).nullable().optional(),
});

export type ComponentInput = z.infer<typeof componentSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});
