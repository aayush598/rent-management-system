"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { linkTenantByName } from "@/app/actions";
import { Search, Loader2, ArrowLeft } from "lucide-react";

export default function LinkTenantPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", name);
      await linkTenantByName(formData);
      router.push("/my");
    } catch (err: any) {
      setError(err.message || "Failed to link account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md">
        <button
          onClick={() => router.push("/onboarding/role")}
          className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 mx-auto mb-4">
            <Search className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Find Your Account</h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Enter your full name as registered by your landlord to link your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Your Full Name</label>
              <input
                required
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-4 py-2.5 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !name}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Linking...
                </>
              ) : (
                "Link My Account"
              )}
            </button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Can&apos;t find your account? Contact your landlord to ensure your name is registered correctly.
          </p>
        </div>
      </div>
    </div>
  );
}
