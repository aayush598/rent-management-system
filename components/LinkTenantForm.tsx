"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { linkTenantByName } from "@/app/actions";
import { linkTenantSchema, type LinkTenantFormData } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Loader2, ArrowLeft, Mail, Phone } from "lucide-react";
import { toast } from "sonner";

export function LinkTenantForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LinkTenantFormData>({
    resolver: zodResolver(linkTenantSchema) as any,
    defaultValues: { name: "", email: "", phone: "" },
  });

  async function onSubmit(data: LinkTenantFormData) {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email);
      if (data.phone) formData.append("phone", data.phone);

      await linkTenantByName(formData);
      toast.success("Account linked successfully!");
      router.push("/my");
    } catch (error) {
      logger.error("Failed to link tenant", error);
      toast.error(error instanceof Error ? error.message : "Failed to link account");
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
          <h1 className="text-2xl font-bold text-slate-900 text-center mb-2">Link Your Account</h1>
          <p className="text-sm text-slate-500 text-center mb-6">
            Enter your details as registered by your landlord to verify and link your account.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                aria-invalid={errors.name ? "true" : "false"}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email Address
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">Must match the email your landlord has on file</p>
            </div>

            <div>
              <Label htmlFor="phone">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone (Optional)
                </span>
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 98765 43210"
                aria-invalid={errors.phone ? "true" : "false"}
                {...register("phone")}
              />
              {errors.phone && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.phone.message}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">Secondary verification</p>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Link Account"
              )}
            </Button>
          </form>

          <p className="text-xs text-slate-400 text-center mt-6">
            Your email/phone is used only for verification. Contact your landlord if you have issues linking.
          </p>
        </div>
      </div>
    </div>
  );
}
