"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updatePayment } from "@/app/actions";
import { paymentSchema, type PaymentFormData } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Edit, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EditPaymentDialogProps {
  payment: { id: number; amount: string; description: string };
  tenantId: number;
}

export function EditPaymentDialog({ payment, tenantId }: EditPaymentDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema) as any,
    defaultValues: {
      tenantId,
      amount: parseFloat(payment.amount) || 0,
      description: payment.description || "",
    },
  });

  async function onSubmit(data: PaymentFormData) {
    try {
      const formData = new FormData();
      formData.append("tenantId", tenantId.toString());
      formData.append("amount", data.amount.toString());
      formData.append("description", data.description);

      await updatePayment(payment.id, formData);
      toast.success("Payment updated successfully");
      setOpen(false);
      router.refresh();
    } catch (error) {
      logger.error("Failed to update payment", error);
      toast.error("Failed to update payment");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          title="Edit Payment"
          aria-label="Edit payment"
        >
          <Edit className="w-4 h-4" />
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Payment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div>
            <Label htmlFor="amount">Amount (₹)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              aria-invalid={errors.amount ? "true" : "false"}
              {...register("amount")}
            />
            {errors.amount && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.amount.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Input id="description" aria-invalid={errors.description ? "true" : "false"} {...register("description")} />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1" role="alert">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="flex gap-3 pt-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="flex-1">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
