import { db } from "@/db";
import { tenants, bills } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { FileText, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { DeleteBillButton } from "../tenants/[id]/ActionButtons";

export default async function BillsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userTenants = await db.select().from(tenants).where(eq(tenants.userId, userId));
  const tenantIds = userTenants.map((t) => t.id);

  let allBills: any[] = [];
  if (tenantIds.length > 0) {
    allBills = await db.select().from(bills).where(inArray(bills.tenantId, tenantIds)).orderBy(desc(bills.createdAt));
  }

  const tenantMap = new Map(userTenants.map((t) => [t.id, t.name]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Bills & Receipts</h1>
        <p className="text-slate-500">View and manage all generated bills across your properties.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="relative w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search bills..."
              className="w-full pl-10 pr-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 font-medium text-sm">
              <tr>
                <th className="px-6 py-4">Bill ID</th>
                <th className="px-6 py-4">Tenant</th>
                <th className="px-6 py-4">Month</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {allBills.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No bills generated yet. Go to a tenant&apos;s page to generate one.
                  </td>
                </tr>
              ) : (
                allBills.map((bill) => (
                  <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-slate-600 font-medium">#{bill.id}</td>
                    <td className="px-6 py-4 font-semibold text-slate-900">{tenantMap.get(bill.tenantId)}</td>
                    <td className="px-6 py-4 text-slate-600">{bill.month}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {bill.createdAt ? format(new Date(bill.createdAt), "MMM d, yyyy") : "N/A"}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-900">₹{bill.totalAmount}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/receipt/${bill.id}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                        >
                          <FileText className="w-4 h-4" /> Receipt
                        </Link>
                        <Link
                          href={`/dashboard/bills/${bill.id}/edit`}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Edit Bill"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                          </svg>
                        </Link>
                        <DeleteBillButton billId={bill.id} tenantId={bill.tenantId} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
