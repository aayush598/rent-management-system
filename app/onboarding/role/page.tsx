"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Building2, User } from "lucide-react";
import { setUserRole } from "@/app/actions";
import { useEffect } from "react";

export default function OnboardingRolePage() {
  const { isLoaded, user } = useUser();
  const clerk = useClerk();
  const router = useRouter();

  useEffect(() => {
    if (isLoaded && user) {
      const role = user.publicMetadata.role as string | undefined;
      if (role === "landlord") router.replace("/dashboard");
      else if (role === "tenant") router.replace("/onboarding/link-tenant");
    }
  }, [isLoaded, user, router]);

  async function handleRoleSelect(role: "landlord" | "tenant") {
    try {
      await setUserRole(role);
      await user?.reload();
      await clerk.session?.reload();
      router.push(role === "landlord" ? "/dashboard" : "/onboarding/link-tenant");
    } catch {
      // handled by the action
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-slate-900 mb-3">Welcome to RentMaster</h1>
          <p className="text-lg text-slate-500">Tell us about yourself to get started.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => handleRoleSelect("landlord")}
            className="group bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors mb-4">
              <Building2 className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              I am a Landlord
            </h2>
            <p className="text-sm text-slate-500 mt-2">Manage properties, tenants, and bills</p>
          </button>

          <button
            onClick={() => handleRoleSelect("tenant")}
            className="group bg-white rounded-2xl border-2 border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all p-8 text-center"
          >
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors mb-4">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors">
              I am a Tenant
            </h2>
            <p className="text-sm text-slate-500 mt-2">View your bills and payment history</p>
          </button>
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">You can change this later in your account settings.</p>
      </div>
    </div>
  );
}
