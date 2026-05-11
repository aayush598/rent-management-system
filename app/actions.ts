"use server";

import { db } from "@/db";
import { tenants, bills, payments } from "@/db/schema";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { eq, and, gte, lte, ne, isNull } from "drizzle-orm";

export async function createTenant(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const familySize = parseInt(formData.get("familySize") as string);
  const baseRent = formData.get("baseRent") as string;
  const waterCharge = formData.get("waterCharge") as string;
  let customCharges: { name: string; amount: number }[] = [];

  try {
    const raw = formData.get("customCharges") as string;
    if (raw) customCharges = JSON.parse(raw);
  } catch {}

  await db.insert(tenants).values({
    userId,
    name,
    email: email || null,
    phone: phone || null,
    familySize,
    baseRent,
    waterCharge,
    customCharges,
    isLandlordConfirmed: true,
    isTenantConfirmed: false,
  });

  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
}

export async function updateTenant(tenantId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string | null;
  const phone = formData.get("phone") as string | null;
  const familySize = parseInt(formData.get("familySize") as string);
  const baseRent = formData.get("baseRent") as string;
  const waterCharge = formData.get("waterCharge") as string;

  await db
    .update(tenants)
    .set({
      name,
      email: email || null,
      phone: phone || null,
      familySize,
      baseRent,
      waterCharge,
    })
    .where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
}

export async function updateCustomCharges(tenantId: number, formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  let customCharges: { name: string; amount: number }[] = [];
  try {
    const raw = formData.get("customCharges") as string;
    if (raw) customCharges = JSON.parse(raw);
  } catch {}

  await db.update(tenants).set({ customCharges }).where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function confirmTenantLink(tenantId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");
  if (!tenant.tenantUserId) throw new Error("Tenant has not linked their account yet");

  await db.update(tenants).set({ isLandlordConfirmed: true }).where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function rejectTenantLink(tenantId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  await db.update(tenants).set({ tenantUserId: null, isTenantConfirmed: false }).where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function generateReceipt(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const dateStart = formData.get("dateStart") as string;
  const dateEnd = formData.get("dateEnd") as string;

  const existingBills = await db
    .select()
    .from(bills)
    .where(and(eq(bills.tenantId, tenantId), and(lte(bills.dateStart, dateEnd), gte(bills.dateEnd, dateStart))));

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

  let customCharges: { name: string; amount: number; paid: number }[] = [];
  try {
    const raw = formData.get("customCharges") as string;
    if (raw) customCharges = JSON.parse(raw);
  } catch {}

  const customChargesSum = customCharges.reduce((s, c) => s + c.amount, 0);
  const totalAmount = rentAmount + waterAmount + electricityAmount + oldPendingAmount + customChargesSum;

  const rentPaid = parseFloat((formData.get("rentPaid") as string) || "0");
  const waterPaid = parseFloat((formData.get("waterPaid") as string) || "0");
  const electricityPaid = parseFloat((formData.get("electricityPaid") as string) || "0");
  const customChargesPaid = customCharges.reduce((s, c) => s + c.paid, 0);
  const totalPaid = rentPaid + waterPaid + electricityPaid + customChargesPaid;

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
      customCharges: customCharges.length > 0 ? customCharges : [],
      totalAmount: totalAmount.toFixed(2),
      rentPaid: rentPaid.toFixed(2),
      waterPaid: waterPaid.toFixed(2),
      electricityPaid: electricityPaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      isPaid,
    })
    .returning({ id: bills.id });

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

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  await db.delete(payments).where(eq(payments.billId, billId));
  await db.delete(bills).where(eq(bills.id, billId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  revalidatePath("/dashboard/bills");
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

  const existingBills = await db
    .select()
    .from(bills)
    .where(
      and(
        eq(bills.tenantId, tenantId),
        ne(bills.id, billId),
        and(lte(bills.dateStart, dateEnd), gte(bills.dateEnd, dateStart)),
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

  let customCharges: { name: string; amount: number; paid: number }[] = [];
  try {
    const raw = formData.get("customCharges") as string;
    if (raw) customCharges = JSON.parse(raw);
  } catch {}

  const customChargesSum = customCharges.reduce((s, c) => s + c.amount, 0);
  const totalAmount = rentAmount + waterAmount + electricityAmount + oldPendingAmount + customChargesSum;

  const rentPaid = parseFloat((formData.get("rentPaid") as string) || "0");
  const waterPaid = parseFloat((formData.get("waterPaid") as string) || "0");
  const electricityPaid = parseFloat((formData.get("electricityPaid") as string) || "0");
  const customChargesPaid = customCharges.reduce((s, c) => s + c.paid, 0);
  const totalPaid = rentPaid + waterPaid + electricityPaid + customChargesPaid;

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
      customCharges: customCharges.length > 0 ? customCharges : [],
      totalAmount: totalAmount.toFixed(2),
      rentPaid: rentPaid.toFixed(2),
      waterPaid: waterPaid.toFixed(2),
      electricityPaid: electricityPaid.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      isPaid,
    })
    .where(eq(bills.id, billId));

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
  revalidatePath("/dashboard/bills");
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

  const [payment] = await db.select().from(payments).where(eq(payments.id, paymentId));
  if (payment?.billId) {
    const allPayments = await db.select().from(payments).where(eq(payments.billId, payment.billId));
    const totalPaid = allPayments.reduce((sum, p) => sum + parseFloat(p.amount as string), 0);

    const [bill] = await db.select().from(bills).where(eq(bills.id, payment.billId));
    if (bill) {
      const isPaid = totalPaid >= parseFloat(bill.totalAmount as string);
      await db
        .update(bills)
        .set({
          totalPaid: totalPaid.toFixed(2),
          isPaid,
        })
        .where(eq(bills.id, payment.billId));
    }
  }

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}

export async function setUserRole(role: "landlord" | "tenant") {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const client = await clerkClient();
  await client.users.updateUser(userId, {
    publicMetadata: { role },
  });

  revalidatePath("/onboarding/role");
}

export async function linkTenantAccount(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const tenantId = parseInt(formData.get("tenantId") as string);
  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant) throw new Error("Tenant not found");
  if (tenant.tenantUserId) throw new Error("Tenant is already linked to another user");

  await db.update(tenants).set({ tenantUserId: userId, isTenantConfirmed: true }).where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
  revalidatePath("/my");
}

export async function linkTenantByName(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string | null;

  if (!name) throw new Error("Please enter your name");
  if (!email) throw new Error("Please enter your email address");

  let matches = await db
    .select()
    .from(tenants)
    .where(and(isNull(tenants.tenantUserId), eq(tenants.name, name), eq(tenants.email, email)))
    .limit(5);

  if (matches.length === 0) {
    if (phone) {
      matches = await db
        .select()
        .from(tenants)
        .where(and(isNull(tenants.tenantUserId), eq(tenants.name, name), eq(tenants.phone, phone)))
        .limit(5);
    }
  }

  if (matches.length === 0) {
    throw new Error(
      "No unlinked tenant found matching your details. Please contact your landlord to verify your email/phone is correctly registered.",
    );
  }

  if (matches.length > 1) {
    throw new Error("Multiple matching records found. Please contact your landlord for a direct link.");
  }

  await db.update(tenants).set({ tenantUserId: userId, isTenantConfirmed: true }).where(eq(tenants.id, matches[0].id));

  revalidatePath("/onboarding/link-tenant");
  revalidatePath("/my");
}

export async function unlinkTenantAccount(tenantId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) throw new Error("Unauthorized");

  await db.update(tenants).set({ tenantUserId: null, isTenantConfirmed: false }).where(eq(tenants.id, tenantId));

  revalidatePath(`/dashboard/tenants/${tenantId}`);
}
