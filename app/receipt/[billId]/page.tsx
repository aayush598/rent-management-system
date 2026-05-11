import { db } from "@/db";
import { tenants, bills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ReceiptActions } from "@/components/ReceiptActions";

const COLORS = {
  primary: "#4f46e5",
  primaryLight: "#eef2ff",
  success: "#059669",
  warning: "#d97706",
  danger: "#dc2626",
  muted: "#64748b",
  border: "#e2e8f0",
};

export default async function ReceiptPage({ params }: { params: Promise<{ billId: string }> }) {
  const resolvedParams = await params;
  const billId = parseInt(resolvedParams.billId);
  if (isNaN(billId)) notFound();

  const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
  if (!bill) notFound();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, bill.tenantId));
  if (!tenant) notFound();

  const pending = (parseFloat(bill.totalAmount as string) - parseFloat(bill.totalPaid as string)).toFixed(2);
  const isPaid = bill.isPaid;
  const isPartial = !isPaid && parseFloat(bill.totalPaid as string) > 0;
  const billCustomCharges = (bill.customCharges || []) as { name: string; amount: number; paid: number }[];

  const formatDate = (d: string | null) => {
    if (!d) return "N/A";
    try {
      return format(new Date(d), "MMM d, yyyy");
    } catch {
      return d;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-slate-50 flex items-center justify-center p-4">
      <div
        id="receipt-content"
        className="max-w-[210mm] w-full bg-white rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] overflow-hidden print:shadow-none print:rounded-none print:max-w-full"
      >
        {/* Watermark */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] select-none">
            <span className="text-[200px] font-black text-indigo-600 transform -rotate-30">RENT</span>
          </div>

          {/* Header */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 p-8 text-white print:bg-white print:text-slate-900 print:border-b-2 print:border-indigo-600">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-indigo-200 text-xs font-medium tracking-widest uppercase print:text-indigo-600">
                  Official Payment Receipt
                </p>
                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">RENT RECEIPT</h1>
                <p className="text-indigo-200 text-sm print:text-slate-500">
                  Receipt #{bill.id} &bull; Period: {formatDate(bill.dateStart)} - {formatDate(bill.dateEnd)}
                </p>
              </div>
              <div className="text-right">
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 print:bg-indigo-100 print:border-indigo-200">
                  <span className="text-2xl font-extrabold text-white print:text-indigo-600">₹</span>
                </div>
                <p className="text-xs text-indigo-200 mt-2 print:text-slate-400">
                  {bill.createdAt ? format(new Date(bill.createdAt), "dd MMM yyyy") : ""}
                </p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="p-8 space-y-8">
            {/* Parties */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Billed To</p>
                <h2 className="text-xl font-bold text-slate-900">{tenant.name}</h2>
                <p className="text-sm text-slate-500 mt-1">Family Size: {tenant.familySize}</p>
                {tenant.email && <p className="text-sm text-slate-500">{tenant.email}</p>}
              </div>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-2">Property Details</p>
                <h2 className="text-xl font-bold text-slate-900">RentMaster Properties</h2>
                <p className="text-sm text-slate-500 mt-1">Rental Period</p>
                <p className="text-sm font-medium text-slate-700">
                  {formatDate(bill.dateStart)} - {formatDate(bill.dateEnd)}
                </p>
              </div>
            </div>

            {/* Amount Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-b border-slate-200">
                    <th className="px-5 py-3.5 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Due (₹)
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Paid (₹)
                    </th>
                    <th className="px-5 py-3.5 text-right text-xs font-bold text-indigo-700 uppercase tracking-wider">
                      Pending (₹)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parseFloat(bill.rentAmount as string) > 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">Rent Charges</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(bill.dateStart)} - {formatDate(bill.dateEnd)}
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {(+bill.rentAmount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-600">
                        {(+bill.rentPaid).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-amber-600">
                        {(+bill.rentAmount - +bill.rentPaid).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {parseFloat(bill.waterAmount as string) > 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">Water Charges</p>
                        <p className="text-xs text-slate-400 mt-0.5">Monthly charge</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {(+bill.waterAmount).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-600">
                        {(+bill.waterPaid).toFixed(2)}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-amber-600">
                        {(+bill.waterAmount - +bill.waterPaid).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {parseFloat(bill.electricityAmount as string) > 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">Electricity Charges</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {bill.electricityCurrUnit - bill.electricityPrevUnit} units @ ₹10/unit
                        </p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">{bill.electricityAmount}</td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-600">{bill.electricityPaid}</td>
                      <td className="px-5 py-4 text-right font-medium text-amber-600">
                        {(+bill.electricityAmount - +bill.electricityPaid).toFixed(2)}
                      </td>
                    </tr>
                  )}
                  {billCustomCharges.map((cc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">{cc.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">Custom charge</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">{cc.amount.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-600">{cc.paid.toFixed(2)}</td>
                      <td className="px-5 py-4 text-right font-medium text-amber-600">
                        {(cc.amount - cc.paid).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                  {parseFloat(bill.oldPendingAmount as string) > 0 && (
                    <tr className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">Old Pending</p>
                        <p className="text-xs text-slate-400 mt-0.5">Carried forward</p>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">{bill.oldPendingAmount}</td>
                      <td className="px-5 py-4 text-right font-medium text-emerald-600">0.00</td>
                      <td className="px-5 py-4 text-right font-medium text-amber-600">{bill.oldPendingAmount}</td>
                    </tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="bg-gradient-to-r from-indigo-50 to-indigo-50/50 border-t-2 border-indigo-200">
                    <td className="px-5 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Total</td>
                    <td className="px-5 py-4 text-right font-bold text-lg text-indigo-700">
                      ₹{(+bill.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-lg text-emerald-600">
                      ₹{(+bill.totalPaid).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-lg text-amber-600">₹{pending}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Status + Amount in Words */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className={`rounded-xl border-2 p-5 ${
                  isPaid
                    ? "bg-emerald-50 border-emerald-300"
                    : isPartial
                      ? "bg-amber-50 border-amber-300"
                      : "bg-red-50 border-red-300"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">Payment Status</p>
                <div className="flex items-center gap-3">
                  <span
                    className={`w-4 h-4 rounded-full ${
                      isPaid ? "bg-emerald-500" : isPartial ? "bg-amber-500" : "bg-red-500"
                    }`}
                  />
                  <span
                    className={`text-xl font-extrabold ${
                      isPaid ? "text-emerald-700" : isPartial ? "text-amber-700" : "text-red-700"
                    }`}
                  >
                    {isPaid ? "FULLY PAID" : isPartial ? "PARTIALLY PAID" : "UNPAID"}
                  </span>
                </div>
              </div>
              <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
                <p className="text-xs font-semibold uppercase tracking-wider mb-1 text-slate-500">Amount in Words</p>
                <p className="text-sm font-medium text-slate-700 italic">
                  Rupees {numberToWords(+bill.totalAmount)} only
                </p>
              </div>
            </div>

            {/* Digital Signature & Footer */}
            <div className="border-t border-slate-200 pt-6 flex flex-col md:flex-row items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Digital Signature</p>
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-20 h-10 bg-indigo-100 rounded flex items-center justify-center text-indigo-400 text-lg font-bold italic font-serif">
                    RM
                  </div>
                  <div className="text-xs text-slate-400">
                    <p>Authorized Signatory</p>
                    <p>RentMaster Systems</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="w-24 h-24 bg-indigo-50 rounded-xl border border-indigo-100 flex items-center justify-center">
                  <div className="text-center">
                    <span className="text-3xl font-extrabold text-indigo-300">₹</span>
                    <p className="text-[8px] text-indigo-300 mt-0.5 font-medium">Verified</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 pt-4 border-t border-slate-100">
              <p className="font-medium text-slate-500">Thank you for your timely payment!</p>
              <p className="mt-1">
                This is a computer-generated receipt and does not require a physical signature. &bull; Generated by
                RentMaster
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-200 p-3 flex justify-center z-50 print:hidden">
        <div className="max-w-[210mm] w-full">
          <ReceiptActions shareText={`Here's my rent receipt from RentMaster - Bill #${bill.id}`} />
        </div>
      </div>

      {/* Spacer for fixed bottom bar */}
      <div className="h-20 print:hidden" />
    </div>
  );
}

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
  const teens = [
    "Ten",
    "Eleven",
    "Twelve",
    "Thirteen",
    "Fourteen",
    "Fifteen",
    "Sixteen",
    "Seventeen",
    "Eighteen",
    "Nineteen",
  ];

  const convert = (num: number): string => {
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? " " + ones[num % 10] : "");
    if (num < 1000) return ones[Math.floor(num / 100)] + " Hundred" + (num % 100 ? " " + convert(num % 100) : "");
    if (num < 100000)
      return convert(Math.floor(num / 1000)) + " Thousand" + (num % 1000 ? " " + convert(num % 1000) : "");
    if (num < 10000000)
      return convert(Math.floor(num / 100000)) + " Lakh" + (num % 100000 ? " " + convert(num % 100000) : "");
    return convert(Math.floor(num / 10000000)) + " Crore" + (num % 10000000 ? " " + convert(num % 10000000) : "");
  };

  const rupees = Math.floor(n);
  const paise = Math.round((n - rupees) * 100);
  let result = convert(rupees);
  if (paise > 0) result += " and " + convert(paise) + " Paise";
  return result;
}
