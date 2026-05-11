"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { updateTenant } from "@/app/actions";
import { editTenantSchema, type EditTenantFormData } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Loader2, Mail, Phone, Users, IndianRupee, Droplets } from "lucide-react";
import { toast } from "sonner";

interface EditTenantDialogProps {
  tenant: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    familySize: number;
    baseRent: string;
    waterCharge: string;
  };
}

export function EditTenantDialog({ tenant }: EditTenantDialogProps) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<EditTenantFormData>({
    resolver: zodResolver(editTenantSchema) as any,
    defaultValues: {
      name: tenant.name,
      email: tenant.email || "",
      phone: tenant.phone || "",
      familySize: tenant.familySize,
      baseRent: parseFloat(tenant.baseRent),
      waterCharge: parseFloat(tenant.waterCharge),
    },
  });

  async function onSubmit(data: EditTenantFormData) {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("familySize", data.familySize.toString());
      formData.append("baseRent", data.baseRent.toString());
      formData.append("waterCharge", data.waterCharge.toString());

      await updateTenant(tenant.id, formData);
      toast.success("Tenant updated successfully");
      router.refresh();
    } catch (error) {
      logger.error("Failed to update tenant", error);
      toast.error("Failed to update tenant. Please try again.");
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit Tenant"
        >
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Tenant</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="edit-name">Tenant Name</Label>
            <Input
              id="edit-name"
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
              <Label htmlFor="edit-email">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" /> Email
                </span>
              </Label>
              <Input
                id="edit-email"
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
            </div>
            <div>
              <Label htmlFor="edit-phone">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Phone
                </span>
              </Label>
              <Input
                id="edit-phone"
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
            </div>
          </div>

          <div>
            <Label htmlFor="edit-familySize">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" /> Family Members
              </span>
            </Label>
            <Input
              id="edit-familySize"
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
              <Label htmlFor="edit-baseRent">
                <span className="flex items-center gap-1">
                  <IndianRupee className="w-3.5 h-3.5" /> Base Rent (₹)
                </span>
              </Label>
              <Input
                id="edit-baseRent"
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
              <Label htmlFor="edit-waterCharge">
                <span className="flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5" /> Water (₹/mo)
                </span>
              </Label>
              <Input
                id="edit-waterCharge"
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

          <div className="flex gap-3 justify-end pt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
