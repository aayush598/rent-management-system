import { db } from "@/db";
import { tenants, bills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { EditReceiptForm } from "./EditReceiptForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function EditBillPage({ params }: { params: Promise<{ billId: string }> }) {
  const { userId } = await auth();
  if (!userId) redirect("/");

  const resolvedParams = await params;
  const billId = parseInt(resolvedParams.billId);
  if (isNaN(billId)) notFound();

  const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
  if (!bill) notFound();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, bill.tenantId));
  if (!tenant || tenant.userId !== userId) notFound();

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link
          href={`/dashboard/tenants/${tenant.id}`}
          className="p-2 hover:bg-slate-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Bill</h1>
          <p className="text-slate-500">Tenant: {tenant.name}</p>
        </div>
      </div>

      <EditReceiptForm tenant={tenant} bill={bill} />
    </div>
  );
}
