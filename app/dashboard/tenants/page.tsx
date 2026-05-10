import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Users, Plus, IndianRupee } from "lucide-react";
import Link from "next/link";
import { createTenant } from "@/app/actions";

export default async function TenantsPage() {
  const { userId } = await auth();
  if (!userId) return null;

  const userTenants = await db.select().from(tenants).where(eq(tenants.userId, userId));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tenants</h1>
          <p className="text-slate-500">Manage your rental properties and families.</p>
        </div>
        {/* We'll use a simple modal pattern with HTML dialog or just link to a create page. For simplicity, we'll render the form inline or use details/summary for an accordion. */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {userTenants.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900">No tenants yet</h3>
              <p className="text-slate-500 mt-1">Add your first tenant using the form to get started.</p>
            </div>
          ) : (
            userTenants.map((tenant) => (
              <Link
                key={tenant.id}
                href={`/dashboard/tenants/${tenant.id}`}
                className="block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {tenant.name}
                    </h2>
                    <p className="text-slate-500 mt-1">Family of {tenant.familySize}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-slate-500">Monthly Rent</p>
                    <p className="text-lg font-semibold text-slate-900">₹{tenant.baseRent}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-100 flex gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-4 h-4" /> Water: ₹{tenant.waterCharge}
                  </span>
                </div>
              </Link>
            ))
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-6">
            <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                <Plus className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Add New Tenant</h2>
            </div>

            <form action={createTenant} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
                  Tenant Name
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  name="name"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div>
                <label htmlFor="familySize" className="block text-sm font-medium text-slate-700 mb-1">
                  Family Members
                </label>
                <input
                  required
                  type="number"
                  min="1"
                  id="familySize"
                  name="familySize"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. 4"
                />
              </div>
              <div>
                <label htmlFor="baseRent" className="block text-sm font-medium text-slate-700 mb-1">
                  Base Rent (₹)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  id="baseRent"
                  name="baseRent"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. 15000"
                />
              </div>
              <div>
                <label htmlFor="waterCharge" className="block text-sm font-medium text-slate-700 mb-1">
                  Fixed Water Charge (₹)
                </label>
                <input
                  required
                  type="number"
                  min="0"
                  step="0.01"
                  id="waterCharge"
                  name="waterCharge"
                  className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  placeholder="e.g. 500"
                  defaultValue="0"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg transition-colors mt-2"
              >
                Save Tenant
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
