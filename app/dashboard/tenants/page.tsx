import { db } from "@/db";
import { tenants } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import { Users, IndianRupee, CheckCircle, Clock, Link as LinkIcon, Receipt } from "lucide-react";
import Link from "next/link";
import { AddTenantForm } from "@/components/AddTenantForm";

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
            userTenants.map((tenant) => {
              const isFullyLinked = tenant.tenantUserId && tenant.isLandlordConfirmed && tenant.isTenantConfirmed;
              const isTenantPending = tenant.tenantUserId && !tenant.isLandlordConfirmed;
              const customCharges = (tenant.customCharges || []) as { name: string; amount: number }[];
              return (
                <Link
                  key={tenant.id}
                  href={`/dashboard/tenants/${tenant.id}`}
                  className="block bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all group"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                          {tenant.name}
                        </h2>
                        {isFullyLinked ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                            <CheckCircle className="w-3 h-3" /> Connected
                          </span>
                        ) : isTenantPending ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                            <Clock className="w-3 h-3" /> Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">
                            <LinkIcon className="w-3 h-3" /> Invited
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 mt-1">Family of {tenant.familySize}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-slate-500">Monthly Rent</p>
                      <p className="text-lg font-semibold text-slate-900">₹{tenant.baseRent}</p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-sm text-slate-500">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" /> Water: ₹{tenant.waterCharge}
                    </span>
                    {customCharges.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Receipt className="w-4 h-4 text-purple-500" /> {customCharges.length} custom charge(s)
                      </span>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <AddTenantForm />
          </div>
        </div>
      </div>
    </div>
  );
}
