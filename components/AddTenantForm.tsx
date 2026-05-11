"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { createTenant } from "@/app/actions";
import { tenantSchema, type TenantFormData } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Loader2, Mail, Phone, Users, IndianRupee, Droplets } from "lucide-react";
import { toast } from "sonner";

export function AddTenantForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<TenantFormData>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      familySize: 1,
      baseRent: 0,
      waterCharge: 0,
    },
  });

  async function onSubmit(data: TenantFormData) {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("familySize", data.familySize.toString());
      formData.append("baseRent", data.baseRent.toString());
      formData.append("waterCharge", data.waterCharge.toString());

      await createTenant(formData);
      toast.success("Tenant added successfully");
      reset();
      router.refresh();
    } catch (error) {
      logger.error("Failed to create tenant", error);
      toast.error("Failed to add tenant. Please try again.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Plus className="w-5 h-5" />
          </div>
          <CardTitle>Add New Tenant</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="name">Tenant Name</Label>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="tenant@email.com"
                aria-invalid={errors.email ? "true" : "false"}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.email.message}
                </p>
              )}
              <p className="text-xs text-slate-400 mt-0.5">For tenant portal verification</p>
            </div>
            <div>
              <Label htmlFor="phone">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
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
              <p className="text-xs text-slate-400 mt-0.5">For tenant portal verification</p>
            </div>
          </div>

          <div>
            <Label htmlFor="familySize">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Family Members
              </span>
            </Label>
            <Input
              id="familySize"
              type="number"
              min="1"
              aria-invalid={errors.familySize ? "true" : "false"}
              {...register("familySize")}
            />
            {errors.familySize && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.familySize.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="baseRent">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Base Rent (₹)
                </span>
              </Label>
              <Input
                id="baseRent"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 15000"
                aria-invalid={errors.baseRent ? "true" : "false"}
                {...register("baseRent")}
              />
              {errors.baseRent && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.baseRent.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="waterCharge">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Water (₹/mo)
                </span>
              </Label>
              <Input
                id="waterCharge"
                type="number"
                step="0.01"
                min="0"
                placeholder="e.g. 500"
                aria-invalid={errors.waterCharge ? "true" : "false"}
                {...register("waterCharge")}
              />
              {errors.waterCharge && (
                <p className="text-sm text-red-600 mt-1" role="alert">
                  {errors.waterCharge.message}
                </p>
              )}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Tenant"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
