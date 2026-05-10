"use client";

import { useState } from "react";
import { Trash2, Edit } from "lucide-react";
import { deleteBill, deletePayment, updatePayment } from "@/app/actions";
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
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

export function EditPaymentButton({ payment, tenantId }: { payment: any; tenantId: number }) {
  const [isEditing, setIsEditing] = useState(false);
  const [amount, setAmount] = useState(payment.amount);
  const [description, setDescription] = useState(payment.description || "");
  const router = useRouter();

  if (isEditing) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Edit Payment</h2>
          <form
            action={async (formData) => {
              await updatePayment(payment.id, formData);
              setIsEditing(false);
              router.refresh();
            }}
            className="space-y-4"
          >
            <input type="hidden" name="tenantId" value={tenantId} />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Amount (₹)</label>
              <input
                required
                type="number"
                step="0.01"
                name="amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                required
                type="text"
                name="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
      title="Edit Payment"
    >
      <Edit className="w-4 h-4" />
    </button>
  );
}
