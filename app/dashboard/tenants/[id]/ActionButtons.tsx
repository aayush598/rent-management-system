"use client";

import { Trash2 } from "lucide-react";
import { deleteBill, deletePayment } from "@/app/actions";
import { useRouter } from "next/navigation";

export function DeleteBillButton({ billId, tenantId }: { billId: number; tenantId: number }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        if (confirm("Are you sure you want to delete this bill? This action cannot be undone.")) {
          await deleteBill(billId, tenantId);
          router.refresh();
        }
      }}
      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Bill"
      aria-label="Delete bill"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function DeletePaymentButton({ paymentId, tenantId }: { paymentId: number; tenantId: number }) {
  const router = useRouter();

  return (
    <button
      onClick={async () => {
        if (confirm("Are you sure you want to delete this payment?")) {
          await deletePayment(paymentId, tenantId);
          router.refresh();
        }
      }}
      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Delete Payment"
      aria-label="Delete payment"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
