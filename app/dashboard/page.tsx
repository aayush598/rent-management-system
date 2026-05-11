import { db } from "@/db";
import { tenants, bills } from "@/db/schema";
import { eq, inArray } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Users, IndianRupee, TrendingUp, CheckCircle, Clock } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "./Charts";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userTenants = await db.select().from(tenants).where(eq(tenants.userId, userId));
  const tenantIds = userTenants.map((t) => t.id);

  const allBills =
    tenantIds.length > 0
      ? await db.select().from(bills).where(inArray(bills.tenantId, tenantIds)).orderBy(bills.createdAt)
      : [];

  const totalTenants = userTenants.length;
  const totalRevenue = allBills.reduce((sum, b) => sum + parseFloat(b.totalAmount as string), 0);
  const totalCollected = allBills.reduce((sum, b) => sum + parseFloat(b.totalPaid as string), 0);
  const pendingBills = allBills.filter((b) => !b.isPaid).length;
  const collectionRate = totalRevenue > 0 ? ((totalCollected / totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Tenants</p>
            <p className="text-xl font-bold text-slate-900">{totalTenants}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <IndianRupee className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Revenue</p>
            <p className="text-xl font-bold text-slate-900">₹{totalRevenue.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Collected</p>
            <p className="text-xl font-bold text-slate-900">₹{totalCollected.toFixed(2)}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Bills</p>
            <p className="text-xl font-bold text-slate-900">{pendingBills}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Collection Rate</p>
            <p className="text-xl font-bold text-slate-900">{collectionRate}%</p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <DashboardCharts bills={allBills} _tenantCount={totalTenants} />

      {/* Tenants List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Your Tenants</h2>
          <Link href="/dashboard/tenants" className="text-sm font-medium text-amber-600 hover:text-amber-700">
            View All
          </Link>
        </div>
        <div className="divide-y divide-slate-100">
          {userTenants.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              No tenants found. Add your first tenant to get started.
            </div>
          ) : (
            userTenants.map((tenant) => (
              <div
                key={tenant.id}
                className="p-4 md:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
              >
                <div>
                  <h3 className="font-semibold text-slate-900">{tenant.name}</h3>
                  <p className="text-sm text-slate-500">Family of {tenant.familySize}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Base Rent</p>
                    <p className="font-semibold text-slate-900">₹{tenant.baseRent}</p>
                  </div>
                  <Link
                    href={`/dashboard/tenants/${tenant.id}`}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg text-sm transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
