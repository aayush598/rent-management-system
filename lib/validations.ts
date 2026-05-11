import { z } from "zod";

export const customChargeSchema = z.object({
  name: z.string().min(1, "Charge name is required").max(50),
  amount: z.coerce.number().min(0, "Amount cannot be negative").max(999999, "Amount seems too high"),
});

export const tenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required").max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number")
    .or(z.literal(""))
    .optional(),
  familySize: z.coerce
    .number()
    .int("Family size must be a whole number")
    .min(1, "At least 1 family member required")
    .max(50, "Family size seems too large"),
  baseRent: z.coerce.number().min(0, "Rent cannot be negative").max(9999999, "Rent seems too high"),
  waterCharge: z.coerce.number().min(0, "Water charge cannot be negative").max(999999, "Water charge seems too high"),
  customCharges: z.array(customChargeSchema).optional().default([]),
});

export type TenantFormData = z.infer<typeof tenantSchema>;

export const editTenantSchema = z.object({
  name: z.string().min(1, "Tenant name is required").max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email address").or(z.literal("")).optional(),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,15}$/, "Invalid phone number")
    .or(z.literal(""))
    .optional(),
  familySize: z.coerce
    .number()
    .int("Family size must be a whole number")
    .min(1, "At least 1 family member required")
    .max(50, "Family size seems too large"),
  baseRent: z.coerce.number().min(0, "Rent cannot be negative").max(9999999, "Rent seems too high"),
  waterCharge: z.coerce.number().min(0, "Water charge cannot be negative").max(999999, "Water charge seems too high"),
});

export type EditTenantFormData = z.infer<typeof editTenantSchema>;

export const receiptSchema = z
  .object({
    tenantId: z.coerce.number(),
    dateStart: z.string().min(1, "Start date is required"),
    dateEnd: z.string().min(1, "End date is required"),
    includeRent: z.boolean().default(true),
    includeWater: z.boolean().default(true),
    includeElectricity: z.boolean().default(true),
    prevUnit: z.coerce.number().int().min(0).default(0),
    currUnit: z.coerce.number().int().min(0).default(0),
    oldPendingAmount: z.coerce.number().min(0).default(0),
    rentPaid: z.coerce.number().min(0).default(0),
    waterPaid: z.coerce.number().min(0).default(0),
    electricityPaid: z.coerce.number().min(0).default(0),
    customCharges: z
      .array(
        z.object({
          name: z.string(),
          amount: z.coerce.number().min(0),
          paid: z.coerce.number().min(0),
          include: z.boolean().default(true),
        }),
      )
      .optional()
      .default([]),
  })
  .refine(
    (data) => {
      if (!data.dateStart || !data.dateEnd) return true;
      return new Date(data.dateEnd) >= new Date(data.dateStart);
    },
    { message: "End date must be on or after start date", path: ["dateEnd"] },
  )
  .refine(
    (data) => {
      if (!data.includeElectricity) return true;
      return data.currUnit >= data.prevUnit;
    },
    { message: "Current reading must be >= previous reading", path: ["currUnit"] },
  );

export type ReceiptFormData = z.infer<typeof receiptSchema>;

export const linkTenantSchema = z.object({
  name: z.string().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().email("Please enter a valid email address"),
  phone: z
    .string()
    .regex(/^\+?[\d\s-]{7,15}$/, "Please enter a valid phone number")
    .or(z.literal(""))
    .optional(),
});

export type LinkTenantFormData = z.infer<typeof linkTenantSchema>;

export const paymentSchema = z.object({
  tenantId: z.coerce.number(),
  amount: z.coerce.number().min(0.01, "Amount must be greater than 0").max(9999999, "Amount seems too high"),
  description: z.string().min(1, "Description is required").max(200, "Description too long"),
});

export type PaymentFormData = z.infer<typeof paymentSchema>;

export const roleSchema = z.enum(["landlord", "tenant"]);
export type RoleFormData = z.infer<typeof roleSchema>;
