"use client";

import { useState, useEffect } from "react";
import { generateReceipt } from "@/app/actions";
import { FileText, Calculator, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { addMonths, format } from "date-fns";

export function GenerateReceiptForm({
  tenant,
  nextPrevUnit,
  lastEndDate,
  lastPending,
}: {
  tenant: any;
  nextPrevUnit: number;
  lastEndDate: string | null;
  lastPending: number;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");

  const [includeRent, setIncludeRent] = useState(true);
  const [includeWater, setIncludeWater] = useState(true);
  const [includeElectricity, setIncludeElectricity] = useState(true);

  const [prevUnit, setPrevUnit] = useState(nextPrevUnit);
  const [currUnit, setCurrUnit] = useState(nextPrevUnit);

  const [oldPendingAmount, setOldPendingAmount] = useState(lastPending > 0 ? lastPending.toString() : "");

  // Set default dates
  useEffect(() => {
    if (lastEndDate) {
      setDateStart(lastEndDate);
      const nextMonth = addMonths(new Date(lastEndDate), 1);
      setDateEnd(format(nextMonth, "yyyy-MM-dd"));
    } else {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setDateStart(format(firstDay, "yyyy-MM-dd"));
      setDateEnd(format(lastDay, "yyyy-MM-dd"));
    }
  }, [lastEndDate]);

  useEffect(() => {
    setPrevUnit(nextPrevUnit);
    setCurrUnit(nextPrevUnit);
  }, [nextPrevUnit]);

  useEffect(() => {
    setOldPendingAmount(lastPending > 0 ? lastPending.toString() : "");
  }, [lastPending]);

  const oldPending = parseFloat(oldPendingAmount) || 0;
  const rentAmountDue = includeRent ? parseFloat(tenant.baseRent) : 0;
  const waterAmountDue = includeWater ? parseFloat(tenant.waterCharge) : 0;
  const electricityAmountDue = includeElectricity ? (currUnit - prevUnit) * 10 : 0;
  const totalDue = rentAmountDue + waterAmountDue + electricityAmountDue + oldPending;

  const [rentPaid, setRentPaid] = useState("");
  const [waterPaid, setWaterPaid] = useState("");
  const [electricityPaid, setElectricityPaid] = useState("");

  const totalPaid = (parseFloat(rentPaid) || 0) + (parseFloat(waterPaid) || 0) + (parseFloat(electricityPaid) || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("tenantId", tenant.id.toString());
      formData.append("dateStart", dateStart);
      formData.append("dateEnd", dateEnd);
      formData.append("includeRent", includeRent.toString());
      formData.append("includeWater", includeWater.toString());
      formData.append("includeElectricity", includeElectricity.toString());
      formData.append("rentAmount", tenant.baseRent);
      formData.append("waterAmount", tenant.waterCharge);
      formData.append("electricityPrevUnit", prevUnit.toString());
      formData.append("electricityCurrUnit", currUnit.toString());
      formData.append("oldPendingAmount", oldPendingAmount);
      formData.append("rentPaid", rentPaid);
      formData.append("waterPaid", waterPaid);
      formData.append("electricityPaid", electricityPaid);

      const billId = await generateReceipt(formData);
      if (billId) {
        window.open(`/receipt/${billId}`, "_blank");
        router.refresh();
        // Clear fields for next one if needed, but router.refresh might handle it
        setRentPaid("");
        setWaterPaid("");
        setElectricityPaid("");
      }
    } catch (error) {
      console.error(error);
      alert("Failed to generate receipt. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const autoFillFullPayment = () => {
    setRentPaid(rentAmountDue.toString());
    setWaterPaid(waterAmountDue.toString());
    setElectricityPaid(electricityAmountDue.toString());
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm col-span-1">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
          <FileText className="w-5 h-5" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Generate Receipt</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input
              required
              type="date"
              value={dateStart}
              min={lastEndDate || undefined}
              onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input
              required
              type="date"
              value={dateEnd}
              min={dateStart || undefined}
              onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Toggles ... same as before ... */}
        <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-700">Include in Bill</h3>
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={includeRent}
              onChange={(e) => setIncludeRent(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Rent (₹{tenant.baseRent})
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-900">
            <input
              type="checkbox"
              checked={includeWater}
              onChange={(e) => setIncludeWater(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            Water (₹{tenant.waterCharge})
          </label>
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-slate-900">
              <input
                type="checkbox"
                checked={includeElectricity}
                onChange={(e) => setIncludeElectricity(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              />
              Electricity (₹10/unit)
            </label>
            {includeElectricity && (
              <div className="grid grid-cols-2 gap-2 ml-6">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Prev Unit</label>
                  <input
                    type="number"
                    value={prevUnit}
                    onChange={(e) => setPrevUnit(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Curr Unit</label>
                  <input
                    type="number"
                    value={currUnit}
                    onChange={(e) => setCurrUnit(parseInt(e.target.value) || 0)}
                    className="w-full px-2 py-1 text-sm text-slate-900 bg-white border border-slate-200 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Old Pending Amount */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Old Pending Amount (₹)</label>
          <input
            type="number"
            step="0.01"
            value={oldPendingAmount}
            onChange={(e) => setOldPendingAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <p className="text-xs text-slate-500 mt-1">Carry forward unpaid amount from previous bills</p>
        </div>

        {/* Calculated Total Due */}
        <div className="flex justify-between items-center p-4 bg-indigo-50 text-indigo-900 rounded-xl font-bold">
          <span className="flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Total Due:
          </span>
          <span className="text-xl">₹{totalDue.toFixed(2)}</span>
        </div>

        {/* Payment Input */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-700">Payment Received</h3>
            <button
              type="button"
              onClick={autoFillFullPayment}
              className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100"
            >
              Autofill Full Amount
            </button>
          </div>

          {includeRent && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Rent Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                value={rentPaid}
                onChange={(e) => setRentPaid(e.target.value)}
                placeholder={`Out of ₹${rentAmountDue}`}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          {includeWater && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Water Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                value={waterPaid}
                onChange={(e) => setWaterPaid(e.target.value)}
                placeholder={`Out of ₹${waterAmountDue}`}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}
          {includeElectricity && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Electricity Paid (₹)</label>
              <input
                type="number"
                step="0.01"
                value={electricityPaid}
                onChange={(e) => setElectricityPaid(e.target.value)}
                placeholder={`Out of ₹${electricityAmountDue}`}
                className="w-full px-3 py-2 text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          )}

          <div className="flex justify-between items-center pt-2 text-slate-700 font-bold">
            <span>Total Paid:</span>
            <span className="text-emerald-600 text-lg">₹{totalPaid.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Confirming...
            </>
          ) : (
            "Confirm & Generate Receipt"
          )}
        </button>
      </form>
    </div>
  );
}
