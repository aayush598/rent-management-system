import { db } from "@/db";
import { tenants, bills, payments } from "@/db/schema";
import { eq, sum } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Users, FileText, IndianRupee, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userTenants = await db.select().from(tenants).where(eq(tenants.userId, userId));

  // Quick stats
  const totalTenants = userTenants.length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500">Welcome back. Here's an overview of your properties.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Cards */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Tenants</p>
            <p className="text-2xl font-bold text-slate-900">{totalTenants}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
            <IndianRupee className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Recent Revenue</p>
            <p className="text-2xl font-bold text-slate-900">₹0</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Pending Bills</p>
            <p className="text-2xl font-bold text-slate-900">0</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Your Tenants</h2>
            <Link href="/dashboard/tenants" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
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
    </div>
  );
}
