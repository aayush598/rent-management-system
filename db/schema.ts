import { pgTable, serial, text, integer, timestamp, boolean, decimal } from "drizzle-orm/pg-core";

export const tenants = pgTable("tenants", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Clerk User ID (Landlord)
  tenantUserId: text("tenant_user_id"), // Clerk User ID (Tenant) for RBAC
  name: text("name").notNull(),
  familySize: integer("family_size").notNull(),
  baseRent: decimal("base_rent", { precision: 10, scale: 2 }).notNull().default("0"),
  waterCharge: decimal("water_charge", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bills = pgTable("bills", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id")
    .references(() => tenants.id)
    .notNull(),

  // Duration
  dateStart: text("date_start"),
  dateEnd: text("date_end"),
  month: text("month"), // keep for backwards compatibility or display

  // Due Amounts
  rentAmount: decimal("rent_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  waterAmount: decimal("water_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  oldPendingAmount: decimal("old_pending_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  electricityPrevUnit: integer("electricity_prev_unit").notNull().default(0),
  electricityCurrUnit: integer("electricity_curr_unit").notNull().default(0),
  electricityAmount: decimal("electricity_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),

  // Paid Amounts
  rentPaid: decimal("rent_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  waterPaid: decimal("water_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  electricityPaid: decimal("electricity_paid", { precision: 10, scale: 2 }).notNull().default("0"),
  totalPaid: decimal("total_paid", { precision: 10, scale: 2 }).notNull().default("0"),

  isPaid: boolean("is_paid").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// We can keep payments for historical backwards-compatibility or additional ad-hoc payments
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  tenantId: integer("tenant_id")
    .references(() => tenants.id)
    .notNull(),
  billId: integer("bill_id").references(() => bills.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentDate: timestamp("payment_date").defaultNow(),
  description: text("description"),
});
