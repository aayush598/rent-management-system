"use server";

import { db } from "@/db";
import { tenants, bills, payments } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, or } from "drizzle-orm";

export async function createTenant(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const familySize = parseInt(formData.get("familySize") as string);
  const baseRent = formData.get("baseRent") as string;
  const waterCharge = formData.get("waterCharge") as string;

  await db.insert(tenants).values({
    userId,
    name,
    familySize,
    baseRent,
    waterCharge,
  });

  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
}

export async function generateReceipt(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;

  // Check for overlapping bills for this tenant
  const existingBills = await db
    .select()
    .from(bills)
    .where(
      and(
        eq(bills.tenantId, tenantId),
        or(
          and(gte(bills.dateStart, dateStart), lte(bills.dateStart, dateEnd)),
          and(gte(bills.dateEnd, dateStart), lte(bills.dateEnd, dateEnd)),
        ),
      ),
    );

  if (existingBills.length > 0) {
    throw new Error("A bill already exists for this period or overlaps with it.");
  }

  const includeRent = formData.get("includeRent") === "true";
  const includeWater = formData.get("includeWater") === "true";
  const includeElectricity = formData.get("includeElectricity") === "true";

  const rentAmount = includeRent ? parseFloat(formData.get("rentAmount") as string) : 0;
  const waterAmount = includeWater ? parseFloat(formData.get("waterAmount") as string) : 0;
  const oldPendingAmount = parseFloat((formData.get("oldPendingAmount") as string) || "0");

  const electricityPrevUnit = includeElectricity ? parseInt(formData.get("electricityPrevUnit") as string) : 0;
  const electricityCurrUnit = includeElectricity ? parseInt(formData.get("electricityCurrUnit") as string) : 0;
  const electricityAmount = includeElectricity ? (electricityCurrUnit - electricityPrevUnit) * 10 : 0;

  const totalAmount = rentAmount + waterAmount + electricityAmount + oldPendingAmount;

  const rentPaid = parseFloat((formData.get("rentPaid") as string) || "0");
  const waterPaid = parseFloat((formData.get("waterPaid") as string) || "0");
  const electricityPaid = parseFloat((formData.get("electricityPaid") as string) || "0");
  const totalPaid = rentPaid + waterPaid + electricityPaid;

  const isPaid = totalPaid >= totalAmount;

  const [newBill] = await db
    .insert(bills)
    .values({
      tenantId,
      dateStart,
      dateEnd,
      month: `${dateStart} to ${dateEnd}`,
      rentAmount: rentAmount.toFixed(2),
      waterAmount: waterAmount.toFixed(2),
      oldPendingAmount: oldPendingAmount.toFixed(2),
      electricityPrevUnit,
      electricityCurrUnit,
      electricityAmount: electricityAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      rentPaid: rentPaid.toFixed(2),
      waterPaid: waterPaid.toFixed(2),
      electricityPaid: electricityPaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      isPaid,
    })
    .returning({ id: bills.id });

  // Optional: create a generic payment record too
  if (totalPaid > 0) {
    await db.insert(payments).values({
      tenantId,
      billId: newBill.id,
      amount: totalPaid.toFixed(2),
      description: `Payment for ${dateStart} to ${dateEnd}`,
    });
  }

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  return newBill.id;
}

export async function deleteBill(billId: number, tenantId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  // Verify ownership
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  await db.delete(payments).where(eq(payments.billId, billId));
  await db.delete(bills).where(eq(bills.id, billId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  revalidatePath(`/dashboard/bills`);
}

export async function deletePayment(paymentId: number, tenantId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  await db.delete(payments).where(eq(payments.id, paymentId));
  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function updateBill(billId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;

  const includeRent = formData.get("includeRent") === "true";
  const includeWater = formData.get("includeWater") === "true";
  const includeElectricity = formData.get("includeElectricity") === "true";

  const rentAmount = includeRent ? parseFloat(formData.get("rentAmount") as string) : 0;
  const waterAmount = includeWater ? parseFloat(formData.get("waterAmount") as string) : 0;
  const oldPendingAmount = parseFloat((formData.get("oldPendingAmount") as string) || "0");

  const electricityPrevUnit = includeElectricity ? parseInt(formData.get("electricityPrevUnit") as string) : 0;
  const electricityCurrUnit = includeElectricity ? parseInt(formData.get("electricityCurrUnit") as string) : 0;
  const electricityAmount = includeElectricity ? (electricityCurrUnit - electricityPrevUnit) * 10 : 0;

  const totalAmount = rentAmount + waterAmount + electricityAmount + oldPendingAmount;

  const rentPaid = parseFloat((formData.get("rentPaid") as string) || "0");
  const waterPaid = parseFloat((formData.get("waterPaid") as string) || "0");
  const electricityPaid = parseFloat((formData.get("electricityPaid") as string) || "0");
  const totalPaid = rentPaid + waterPaid + electricityPaid;

  const isPaid = totalPaid >= totalAmount;

  await db
    .update(bills)
    .set({
      dateStart,
      dateEnd,
      month: `${dateStart} to ${dateEnd}`,
      rentAmount: rentAmount.toFixed(2),
      waterAmount: waterAmount.toFixed(2),
      oldPendingAmount: oldPendingAmount.toFixed(2),
      electricityPrevUnit,
      electricityCurrUnit,
      electricityAmount: electricityAmount.toFixed(2),
      totalAmount: totalAmount.toFixed(2),
      rentPaid: rentPaid.toFixed(2),
      waterPaid: waterPaid.toFixed(2),
      electricityPaid: electricityPaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      isPaid,
    })
    .where(eq(bills.id, billId));

  // Sync the associated payment record if it exists
  if (totalPaid > 0) {
    const [existingPayment] = await db.select().from(payments).where(eq(payments.billId, billId));
    if (existingPayment) {
      await db
        .update(payments)
        .set({
          amount: totalPaid.toFixed(2),
          description: `Payment for ${dateStart} to ${dateEnd}`,
        })
        .where(eq(payments.id, existingPayment.id));
    } else {
      await db.insert(payments).values({
        tenantId,
        billId,
        amount: totalPaid.toFixed(2),
        description: `Payment for ${dateStart} to ${dateEnd}`,
      });
    }
  } else {
    await db.delete(payments).where(eq(payments.billId, billId));
  }

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  revalidatePath(`/dashboard/bills`);
}

export async function updatePayment(paymentId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  const amount = formData.get("amount") as string;
  const description = formData.get("description") as string;

  await db
    .update(payments)
    .set({
      amount,
      description,
    })
    .where(eq(payments.id, paymentId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}
