import { db } from "@/db";
import { tenants, bills } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { IndianRupee } from "lucide-react";
import { format } from "date-fns";
import { PrintButton } from "./PrintButton";

export default async function ReceiptPage({ params }: { params: Promise<{ billId: string }> }) {
  const resolvedParams = await params;
  const billId = parseInt(resolvedParams.billId);
  if (isNaN(billId)) notFound();

  const [bill] = await db.select().from(bills).where(eq(bills.id, billId));
  if (!bill) notFound();

  const [tenant] = await db.select().from(tenants).where(eq(tenants.id, bill.tenantId));
  if (!tenant) notFound();

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl overflow-hidden print:shadow-none print:bg-transparent">
        <div className="bg-indigo-600 p-8 text-white flex justify-between items-center print:bg-slate-100 print:text-slate-900 print:border-b print:border-slate-300">
          <div>
            <h1 className="text-3xl font-bold mb-1">RENT RECEIPT</h1>
            <p className="text-indigo-200 print:text-slate-500">
              Bill #{bill.id} • {bill.month}
            </p>
          </div>
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md print:bg-slate-200">
            <IndianRupee className="w-8 h-8 text-white print:text-slate-900" />
          </div>
        </div>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <p className="text-slate-500 font-medium mb-1">Billed To</p>
              <p className="font-bold text-slate-900 text-lg">{tenant.name}</p>
              <p className="text-slate-600">Family Size: {tenant.familySize}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-500 font-medium mb-1">Generated On</p>
              <p className="font-bold text-slate-900">
                {bill.createdAt ? format(new Date(bill.createdAt), "PPP") : "N/A"}
              </p>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4 text-right">Due Amount</th>
                  <th className="px-6 py-4 text-right">Paid</th>
                  <th className="px-6 py-4 text-right">Pending</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {parseFloat(bill.rentAmount as string) > 0 && (
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">Rent Duration</p>
                      <p className="text-xs text-slate-500 mt-1">
                        {bill.dateStart ? format(new Date(bill.dateStart as string), "MMM d, yyyy") : "N/A"} to{" "}
                        {bill.dateEnd ? format(new Date(bill.dateEnd as string), "MMM d, yyyy") : "N/A"}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{bill.rentAmount}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">₹{bill.rentPaid}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                      ₹{(parseFloat(bill.rentAmount as string) - parseFloat(bill.rentPaid as string)).toFixed(2)}
                    </td>
                  </tr>
                )}
                {parseFloat(bill.waterAmount as string) > 0 && (
                  <tr>
                    <td className="px-6 py-4">Water Charges</td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{bill.waterAmount}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">₹{bill.waterPaid}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                      ₹{(parseFloat(bill.waterAmount as string) - parseFloat(bill.waterPaid as string)).toFixed(2)}
                    </td>
                  </tr>
                )}
                {parseFloat(bill.electricityAmount as string) > 0 && (
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">Electricity Charges</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Old: {bill.electricityPrevUnit} → New: {bill.electricityCurrUnit}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        ({bill.electricityCurrUnit - bill.electricityPrevUnit} units @ ₹10/unit)
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{bill.electricityAmount}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">₹{bill.electricityPaid}</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">
                      ₹
                      {(
                        parseFloat(bill.electricityAmount as string) - parseFloat(bill.electricityPaid as string)
                      ).toFixed(2)}
                    </td>
                  </tr>
                )}
                {parseFloat(bill.oldPendingAmount as string) > 0 && (
                  <tr>
                    <td className="px-6 py-4">
                      <p className="font-medium text-slate-900">Old Pending Amount</p>
                      <p className="text-xs text-slate-500 mt-1">Carried forward from previous bills</p>
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-slate-900">₹{bill.oldPendingAmount}</td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-600">₹0.00</td>
                    <td className="px-6 py-4 text-right font-medium text-amber-600">₹{bill.oldPendingAmount}</td>
                  </tr>
                )}
              </tbody>
              <tfoot className="bg-slate-50 font-bold text-lg border-t border-slate-200">
                <tr>
                  <td className="px-6 py-4 text-right">Total</td>
                  <td className="px-6 py-4 text-right text-indigo-600">₹{bill.totalAmount}</td>
                  <td className="px-6 py-4 text-right text-emerald-600">₹{bill.totalPaid}</td>
                  <td className="px-6 py-4 text-right text-amber-600">
                    ₹{(parseFloat(bill.totalAmount as string) - parseFloat(bill.totalPaid as string)).toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 flex items-center justify-between">
            <span className="font-medium text-indigo-900">Payment Status:</span>
            <span
              className={`font-bold px-3 py-1 rounded-full text-sm ${bill.isPaid ? "bg-emerald-100 text-emerald-700" : parseFloat(bill.totalPaid as string) > 0 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"}`}
            >
              {bill.isPaid ? "Fully Paid" : parseFloat(bill.totalPaid as string) > 0 ? "Partially Paid" : "Unpaid"}
            </span>
          </div>

          <div className="text-center text-sm text-slate-500 mt-8 pt-8 border-t border-slate-200">
            <p>Please keep this receipt for your records.</p>
            <p>If you have any questions, please contact your landlord.</p>
          </div>
        </div>

        {/* Print Button */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center print:hidden">
          <PrintButton />
        </div>
      </div>
    </div>
  );
}
