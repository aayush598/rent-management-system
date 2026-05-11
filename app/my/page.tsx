import { db } from "@/db";
import { tenants, bills, payments } from "@/db/schema";
import { eq, inArray, desc } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { FileText, Home, Zap, Droplets, IndianRupee, CheckCircle, Clock } from "lucide-react";

export default async function MyPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userTenants = await db.select().from(tenants).where(eq(tenants.tenantUserId, userId));

  if (userTenants.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">My Bills</h1>
          <p className="text-slate-500">View your bills and payment history.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Home className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-700 mb-2">No Tenancy Linked</h2>
          <p className="text-slate-500 max-w-md mx-auto">
            Your account isn&apos;t linked to any property yet. Please contact your landlord to set up your account.
          </p>
        </div>
      </div>
    );
  }

  const tenantIds = userTenants.map((t) => t.id);

  const allBills =
    tenantIds.length > 0
      ? await db.select().from(bills).where(inArray(bills.tenantId, tenantIds)).orderBy(desc(bills.createdAt))
      : [];

  const allPayments =
    tenantIds.length > 0
      ? await db
          .select()
          .from(payments)
          .where(inArray(payments.tenantId, tenantIds))
          .orderBy(desc(payments.paymentDate))
      : [];

  const tenantMap = Object.fromEntries(userTenants.map((t) => [t.id, t]));

  const totalPending = allBills
    .filter((b) => !b.isPaid)
    .reduce((sum, b) => sum + (parseFloat(b.totalAmount as string) - parseFloat(b.totalPaid as string)), 0);

  const paidBills = allBills.filter((b) => b.isPaid).length;
  const pendingBills = allBills.filter((b) => !b.isPaid).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">My Bills</h1>
        <p className="text-slate-500">View your bills and payment history.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Paid Bills</p>
            <p className="text-2xl font-bold text-slate-900">{paidBills}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Bills</p>
            <p className="text-2xl font-bold text-slate-900">{pendingBills}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Pending</p>
            <p className="text-2xl font-bold text-slate-900">₹{totalPending.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Bills */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">All Bills</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {allBills.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No bills found.</div>
          ) : (
            allBills.map((bill) => {
              const tenant = tenantMap[bill.tenantId];
              const pending = parseFloat(bill.totalAmount as string) - parseFloat(bill.totalPaid as string);
              return (
                <div key={bill.id} className="p-6 flex flex-col sm:flex-row justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg text-slate-900">{bill.month}</h3>
                      {bill.isPaid ? (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-sm font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Paid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-sm font-medium bg-amber-100 text-amber-700">
                          <Clock className="w-3.5 h-3.5" /> Pending
                        </span>
                      )}
                    </div>
                    {tenant && <p className="text-sm text-slate-500 mt-1">Property: {tenant.name}</p>}
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
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
                          </span>
                          Old Pending: ₹{bill.oldPendingAmount}
                        </p>
                      )}
                      <p
                        className="flex items-center gap-2"
                        title={`Prev: ${bill.electricityPrevUnit}, Curr: ${bill.electricityCurrUnit}`}
                      >
                        <Zap className="w-4 h-4 text-amber-500" />
                        Electricity: ₹{bill.electricityAmount} ({bill.electricityCurrUnit} - {bill.electricityPrevUnit}{" "}
                        units)
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col justify-between sm:items-end">
                    <div>
                      <p className="text-sm font-medium text-slate-500">Total Due: ₹{bill.totalAmount}</p>
                      {bill.isPaid ? (
                        <p className="text-sm font-medium text-emerald-600">Paid: ₹{bill.totalPaid}</p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-emerald-600">Paid: ₹{bill.totalPaid}</p>
                          <p className="text-lg font-bold text-slate-900 mt-1">Pending: ₹{pending.toFixed(2)}</p>
                        </>
                      )}
                    </div>
                    <a
                      href={`/receipt/${bill.id}`}
                      target="_blank"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1 mt-4"
                    >
                      <FileText className="w-4 h-4" /> View Receipt
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Payment History</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {allPayments.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No payments recorded yet.</div>
          ) : (
            allPayments.map((payment) => {
              const tenant = tenantMap[payment.tenantId];
              return (
                <div key={payment.id} className="p-4 px-6 flex justify-between items-center hover:bg-slate-50">
                  <div>
                    <p className="font-semibold text-slate-900">₹{payment.amount}</p>
                    <p className="text-sm text-slate-500">
                      {payment.description}
                      {tenant && <span> — {tenant.name}</span>}
                    </p>
                  </div>
                  <p className="text-sm text-slate-400">{payment.paymentDate?.toLocaleDateString()}</p>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
