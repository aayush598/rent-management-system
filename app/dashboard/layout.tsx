import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { Home, Users, FileText, Settings, IndianRupee } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Home className="w-6 h-6" />
            <span>RentMaster</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
            <Home className="w-5 h-5" />
            <span className="font-medium">Overview</span>
          </Link>
          <Link href="/dashboard/tenants" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
            <Users className="w-5 h-5" />
            <span className="font-medium">Tenants</span>
          </Link>
          <Link href="/dashboard/bills" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-700 hover:bg-slate-100 hover:text-indigo-600 transition-colors">
            <FileText className="w-5 h-5" />
            <span className="font-medium">Bills & Receipts</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center gap-3 px-3 py-2">
            <UserButton afterSignOutUrl="/" />
            <span className="text-sm font-medium text-slate-700">Account</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 bg-white border-b border-slate-200 md:hidden flex items-center justify-between px-4">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg text-indigo-600">
            <Home className="w-5 h-5" />
            <span>RentMaster</span>
          </Link>
          <UserButton afterSignOutUrl="/" />
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
