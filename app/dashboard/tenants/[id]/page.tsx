import { db } from "@/db";
import { tenants, bills, payments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft, Plus, FileText, Zap, Droplets, Home, IndianRupee, Edit } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GenerateReceiptForm } from "./GenerateReceiptForm";
import { DeleteBillButton, DeletePaymentButton, EditPaymentButton } from "./ActionButtons";

export default async function TenantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  if (!userId) return null;

  const resolvedParams = await params;
  const tenantId = parseInt(resolvedParams.id);
  if (isNaN(tenantId)) notFound();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
  if (!tenant || tenant.userId !== userId) notFound();

  const tenantBills = await db.select().from(bills).where(eq(bills.tenantId, tenantId)).orderBy(desc(bills.createdAt));
  const tenantPayments = await db
    .select()
    .from(payments)
    .where(eq(payments.tenantId, tenantId))
    .orderBy(desc(payments.paymentDate));

  // Get last bill for electricity unit, dates, and pending amount
  const lastBill = tenantBills[0];
  const nextPrevUnit = lastBill ? lastBill.electricityCurrUnit : 0;
  const lastEndDate = lastBill ? lastBill.dateEnd : null;
  const lastPending = lastBill
    ? parseFloat(lastBill.totalAmount as string) - parseFloat(lastBill.totalPaid as string)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/tenants" className="p-2 hover:bg-slate-200 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{tenant.name}</h1>
          <p className="text-slate-500">
            Family of {tenant.familySize} • Base Rent: ₹{tenant.baseRent}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
        <div className="xl:col-span-2 space-y-6">
          {/* Bills Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-900">Bills</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {tenantBills.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No bills generated yet.</div>
              ) : (
                tenantBills.map((bill) => (
                  <div key={bill.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg text-slate-900">{bill.month}</h3>
                        <div className="flex items-center ml-2">
                          <Link
                            href={`/dashboard/bills/${bill.id}/edit`}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Edit Bill"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteBillButton billId={bill.id} tenantId={tenant.id} />
                        </div>
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-slate-600">
                        <p className="flex items-center gap-2">
                          <Home className="w-4 h-4 text-indigo-500" /> Rent: ₹{bill.rentAmount}
                        </p>
                        <p className="flex items-center gap-2">
                          <Droplets className="w-4 h-4 text-emerald-500" /> Water: ₹{bill.waterAmount}
                        </p>
                        {parseFloat(bill.oldPendingAmount as string) > 0 && (
                          <p className="flex items-center gap-2">
                            <span className="w-4 h-4 flex items-center justify-center text-amber-500 font-bold text-xs">
                              ⟳
                            </span>{" "}
                            Old Pending: ₹{bill.oldPendingAmount}
                          </p>
                        )}
                        <p
                          className="flex items-center gap-2"
                          title={`Prev: ${bill.electricityPrevUnit}, Curr: ${bill.electricityCurrUnit}`}
                        >
                          <Zap className="w-4 h-4 text-amber-500" />
                          Electricity: ₹{bill.electricityAmount} ({bill.electricityCurrUnit} -{" "}
                          {bill.electricityPrevUnit} units)
                        </p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-500">Total Due: ₹{bill.totalAmount}</p>
                        <p className="text-sm font-medium text-emerald-600">Paid: ₹{bill.totalPaid}</p>
                        <p className="text-lg font-bold text-slate-900 mt-1">
                          Pending: ₹
                          {(parseFloat(bill.totalAmount as string) - parseFloat(bill.totalPaid as string)).toFixed(2)}
                        </p>
                      </div>
                      <Link
                        href={`/receipt/${bill.id}`}
                        target="_blank"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center justify-end gap-1 mt-4"
                      >
                        <FileText className="w-4 h-4" /> View Receipt
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payments Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
            </div>
            <div className="divide-y divide-slate-100">
              {tenantPayments.length === 0 ? (
                <div className="p-8 text-center text-slate-500">No payments recorded yet.</div>
              ) : (
                tenantPayments.map((payment) => (
                  <div key={payment.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50">
                    <div>
                      <p className="font-semibold text-slate-900">₹{payment.amount}</p>
                      <p className="text-sm text-slate-500">{payment.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-slate-400">{payment.paymentDate?.toLocaleDateString()}</p>
                      <div className="flex items-center">
                        <EditPaymentButton payment={payment} tenantId={tenant.id} />
                        <DeletePaymentButton paymentId={payment.id} tenantId={tenant.id} />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6 xl:sticky xl:top-24">
          <GenerateReceiptForm
            tenant={tenant}
            nextPrevUnit={nextPrevUnit}
            lastEndDate={lastEndDate}
            lastPending={lastPending}
          />
        </div>
      </div>
    </div>
  );
}
