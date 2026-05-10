"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-lg font-medium transition-colors"
    >
      <Printer className="w-5 h-5" /> Print Receipt
    </button>
  );
}
