"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateCustomCharges } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Plus, Trash2, Loader2, Receipt } from "lucide-react";
import { toast } from "sonner";

interface CustomChargesManagerProps {
  tenantId: number;
  initialCharges: { name: string; amount: number }[];
}

export function CustomChargesManager({ tenantId, initialCharges }: CustomChargesManagerProps) {
  const router = useRouter();
  const [charges, setCharges] = useState<{ name: string; amount: number }[]>(initialCharges);
  const [saving, setSaving] = useState(false);

  function addCharge() {
    setCharges([...charges, { name: "", amount: 0 }]);
  }

  function removeCharge(index: number) {
    setCharges(charges.filter((_, i) => i !== index));
  }

  function updateCharge(index: number, field: "name" | "amount", value: string | number) {
    const updated = [...charges];
    updated[index] = { ...updated[index], [field]: value };
    setCharges(updated);
  }

  async function save() {
    const valid = charges.every((c) => c.name.trim().length > 0 && c.amount >= 0);
    if (!valid) {
      toast.error("Please fill in all charge names and amounts");
      return;
    }
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("customCharges", JSON.stringify(charges));
      await updateCustomCharges(tenantId, formData);
      toast.success("Custom charges updated");
      router.refresh();
    } catch {
      toast.error("Failed to save custom charges");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Receipt className="w-5 h-5" />
            </div>
            <CardTitle>Custom Charges</CardTitle>
          </div>
          <button
            type="button"
            onClick={addCharge}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title="Add custom charge"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {charges.length === 0 && (
          <p className="text-sm text-slate-500 text-center py-4">
            No custom charges. Add charges like parking, maintenance, etc.
          </p>
        )}
        {charges.map((charge, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="flex-1">
              <Label className="text-xs text-slate-500">Name</Label>
              <Input
                value={charge.name}
                onChange={(e) => updateCharge(index, "name", e.target.value)}
                placeholder="e.g. Parking"
                className="text-sm"
              />
            </div>
            <div className="w-28">
              <Label className="text-xs text-slate-500">Amount (₹)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={charge.amount || ""}
                onChange={(e) => updateCharge(index, "amount", parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => removeCharge(index)}
              className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {charges.length > 0 && (
          <Button type="button" onClick={save} disabled={saving} className="w-full mt-2" variant="outline">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save Custom Charges"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
