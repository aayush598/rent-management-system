"use client";

import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { generateReceipt } from "@/app/actions";
import { receiptSchema, type ReceiptFormData } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { FileText, Calculator, Loader2 } from "lucide-react";
import { addMonths, format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface GenerateReceiptFormProps {
  tenant: { id: number; baseRent: string; waterCharge: string; customCharges: { name: string; amount: number }[] };
  nextPrevUnit: number;
  lastEndDate: string | null;
  lastPending: number;
}

export function GenerateReceiptForm({ tenant, nextPrevUnit, lastEndDate, lastPending }: GenerateReceiptFormProps) {
  const router = useRouter();

  const defaultCustomCharges = (tenant.customCharges || []).map((c) => ({
    name: c.name,
    amount: c.amount,
    paid: 0,
    include: true,
  }));

  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ReceiptFormData>({
    resolver: zodResolver(receiptSchema) as any,
    defaultValues: {
      tenantId: tenant.id,
      dateStart: "",
      dateEnd: "",
      includeRent: true,
      includeWater: true,
      includeElectricity: true,
      prevUnit: nextPrevUnit,
      currUnit: nextPrevUnit,
      oldPendingAmount: lastPending,
      rentPaid: 0,
      waterPaid: 0,
      electricityPaid: 0,
      customCharges: defaultCustomCharges,
    },
  });

  const includeRent = useWatch({ control, name: "includeRent" });
  const includeWater = useWatch({ control, name: "includeWater" });
  const includeElectricity = useWatch({ control, name: "includeElectricity" });
  const prevUnit = useWatch({ control, name: "prevUnit" });
  const currUnit = useWatch({ control, name: "currUnit" });
  const oldPendingAmount = useWatch({ control, name: "oldPendingAmount" });
  const rentPaid = useWatch({ control, name: "rentPaid" });
  const waterPaid = useWatch({ control, name: "waterPaid" });
  const electricityPaid = useWatch({ control, name: "electricityPaid" });
  const customCharges = useWatch({ control, name: "customCharges" });

  useEffect(() => {
    if (lastEndDate) {
      setValue("dateStart", lastEndDate);
      const nextMonth = addMonths(new Date(lastEndDate), 1);
      setValue("dateEnd", format(nextMonth, "yyyy-MM-dd"));
    } else {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setValue("dateStart", format(firstDay, "yyyy-MM-dd"));
      setValue("dateEnd", format(lastDay, "yyyy-MM-dd"));
    }
  }, [lastEndDate, setValue]);

  useEffect(() => {
    setValue("prevUnit", nextPrevUnit);
    setValue("currUnit", nextPrevUnit);
  }, [nextPrevUnit, setValue]);

  useEffect(() => {
    setValue("oldPendingAmount", lastPending);
  }, [lastPending, setValue]);

  const rentAmountDue = includeRent ? parseFloat(tenant.baseRent) : 0;
  const waterAmountDue = includeWater ? parseFloat(tenant.waterCharge) : 0;
  const electricityAmountDue = includeElectricity ? (currUnit - prevUnit) * 10 : 0;
  const customChargesSum = (customCharges || []).filter((c) => c.include).reduce((s, c) => s + c.amount, 0);
  const totalDue = rentAmountDue + waterAmountDue + electricityAmountDue + oldPendingAmount + customChargesSum;
  const customChargesPaid = (customCharges || []).filter((c) => c.include).reduce((s, c) => s + (c.paid || 0), 0);
  const totalPaid = rentPaid + waterPaid + electricityPaid + customChargesPaid;

  async function onSubmit(data: ReceiptFormData) {
    try {
      const formData = new FormData();
      formData.append("tenantId", tenant.id.toString());
      formData.append("dateStart", data.dateStart);
      formData.append("dateEnd", data.dateEnd);
      formData.append("includeRent", data.includeRent.toString());
      formData.append("includeWater", data.includeWater.toString());
      formData.append("includeElectricity", data.includeElectricity.toString());
      formData.append("rentAmount", tenant.baseRent);
      formData.append("waterAmount", tenant.waterCharge);
      formData.append("electricityPrevUnit", data.prevUnit.toString());
      formData.append("electricityCurrUnit", data.currUnit.toString());
      formData.append("oldPendingAmount", data.oldPendingAmount.toString());
      formData.append("rentPaid", data.rentPaid.toString());
      formData.append("waterPaid", data.waterPaid.toString());
      formData.append("electricityPaid", data.electricityPaid.toString());

      const includedCharges = (data.customCharges || [])
        .filter((c) => c.include)
        .map((c) => ({ name: c.name, amount: c.amount, paid: c.paid || 0 }));
      formData.append("customCharges", JSON.stringify(includedCharges));

      const billId = await generateReceipt(formData);
      if (billId) {
        window.open(`/receipt/${billId}`, "_blank");
        toast.success("Receipt generated successfully");
        setValue("rentPaid", 0);
        setValue("waterPaid", 0);
        setValue("electricityPaid", 0);
        if (defaultCustomCharges.length > 0) {
          setValue(
            "customCharges",
            defaultCustomCharges.map((c) => ({ ...c, paid: 0 })),
          );
        }
        router.refresh();
      }
    } catch (error) {
      logger.error("Failed to generate receipt", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate receipt");
    }
  }

  function autoFillFullPayment() {
    setValue("rentPaid", rentAmountDue);
    setValue("waterPaid", waterAmountDue);
    setValue("electricityPaid", electricityAmountDue);
    const currentCharges = getValues("customCharges") || [];
    setValue(
      "customCharges",
      currentCharges.map((c) => (c.include ? { ...c, paid: c.amount } : c)),
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <FileText className="w-5 h-5" />
            </div>
            <CardTitle>Generate Receipt</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dateStart">Start Date</Label>
                <Input
                  id="dateStart"
                  type="date"
                  aria-invalid={errors.dateStart ? "true" : "false"}
                  {...register("dateStart")}
                />
                {errors.dateStart && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.dateStart.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="dateEnd">End Date</Label>
                <Input
                  id="dateEnd"
                  type="date"
                  aria-invalid={errors.dateEnd ? "true" : "false"}
                  {...register("dateEnd")}
                />
                {errors.dateEnd && (
                  <p className="text-sm text-red-600 mt-1" role="alert">
                    {errors.dateEnd.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-700">Include in Bill</h3>
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  defaultChecked
                  {...register("includeRent")}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Rent (₹{tenant.baseRent})
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-900">
                <input
                  type="checkbox"
                  defaultChecked
                  {...register("includeWater")}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                Water (₹{tenant.waterCharge})
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm text-slate-900">
                  <input
                    type="checkbox"
                    defaultChecked
                    {...register("includeElectricity")}
                    className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  Electricity (₹10/unit)
                </label>
                {includeElectricity && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-2 ml-6"
                  >
                    <div>
                      <Label htmlFor="prevUnit" className="text-xs text-slate-500">
                        Prev Unit
                      </Label>
                      <Input
                        id="prevUnit"
                        type="number"
                        aria-invalid={errors.prevUnit ? "true" : "false"}
                        {...register("prevUnit")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="currUnit" className="text-xs text-slate-500">
                        Curr Unit
                      </Label>
                      <Input
                        id="currUnit"
                        type="number"
                        aria-invalid={errors.currUnit ? "true" : "false"}
                        {...register("currUnit")}
                      />
                      {errors.currUnit && (
                        <p className="text-sm text-red-600 mt-1" role="alert">
                          {errors.currUnit.message}
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </div>
              {(customCharges || []).length > 0 && (
                <div className="border-t border-slate-200 pt-3 mt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Custom Charges</p>
                  {(customCharges || []).map((charge, idx) => (
                    <div key={idx} className="flex items-center gap-2 ml-2 mb-2">
                      <input
                        type="checkbox"
                        checked={charge.include}
                        onChange={(e) => {
                          const updated = [...(getValues("customCharges") || [])];
                          updated[idx] = { ...updated[idx], include: e.target.checked };
                          setValue("customCharges", updated);
                        }}
                        className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-sm text-slate-900 flex-1">{charge.name}</span>
                      <span className="text-sm font-medium text-slate-700">₹{charge.amount}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="oldPendingAmount">Old Pending Amount (₹)</Label>
              <Input
                id="oldPendingAmount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("oldPendingAmount")}
              />
              <p className="text-xs text-slate-500 mt-1">Carry forward unpaid amount from previous bills</p>
            </div>

            <div className="flex justify-between items-center p-4 bg-indigo-50 text-indigo-900 rounded-xl font-bold">
              <span className="flex items-center gap-2">
                <Calculator className="w-5 h-5" /> Total Due:
              </span>
              <span className="text-xl">₹{totalDue.toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-700">Payment Received</h3>
                <button
                  type="button"
                  onClick={autoFillFullPayment}
                  className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                >
                  Autofill Full Amount
                </button>
              </div>

              {includeRent && (
                <div>
                  <Label htmlFor="rentPaid">Rent Paid (₹)</Label>
                  <Input
                    id="rentPaid"
                    type="number"
                    step="0.01"
                    placeholder={`Out of ₹${rentAmountDue}`}
                    {...register("rentPaid")}
                  />
                </div>
              )}
              {includeWater && (
                <div>
                  <Label htmlFor="waterPaid">Water Paid (₹)</Label>
                  <Input
                    id="waterPaid"
                    type="number"
                    step="0.01"
                    placeholder={`Out of ₹${waterAmountDue}`}
                    {...register("waterPaid")}
                  />
                </div>
              )}
              {includeElectricity && (
                <div>
                  <Label htmlFor="electricityPaid">Electricity Paid (₹)</Label>
                  <Input
                    id="electricityPaid"
                    type="number"
                    step="0.01"
                    placeholder={`Out of ₹${electricityAmountDue}`}
                    {...register("electricityPaid")}
                  />
                </div>
              )}

              {(customCharges || []).filter((c) => c.include).length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                  <p className="text-xs font-semibold text-slate-600 mb-2">Custom Charges Paid</p>
                  {(customCharges || [])
                    .filter((c) => c.include)
                    .map((charge, idx) => (
                      <div key={idx} className="mb-2">
                        <Label className="text-xs text-slate-500">
                          {charge.name} (₹{charge.amount})
                        </Label>
                        <Input
                          type="number"
                          step="0.01"
                          value={charge.paid || 0}
                          onChange={(e) => {
                            const updated = [...(getValues("customCharges") || [])];
                            const realIdx = (customCharges || []).findIndex(
                              (c) => c.name === charge.name && c.amount === charge.amount,
                            );
                            if (realIdx !== -1) {
                              updated[realIdx] = { ...updated[realIdx], paid: parseFloat(e.target.value) || 0 };
                              setValue("customCharges", updated);
                            }
                          }}
                          placeholder={`Out of ₹${charge.amount}`}
                        />
                      </div>
                    ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-2 text-slate-700 font-bold">
                <span>Total Paid:</span>
                <span className="text-emerald-600 text-lg">₹{totalPaid.toFixed(2)}</span>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full" size="lg">
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Confirm & Generate Receipt"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
