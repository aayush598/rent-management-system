import Link from "next/link";
import { ArrowRight, Home, IndianRupee, FileText } from "lucide-react";
import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();
  const isSignedIn = !!userId;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="px-6 lg:px-14 h-20 flex items-center border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
          <Home className="w-6 h-6" />
          <span>RentMaster</span>
        </div>
        <div className="ml-auto flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link href="/dashboard" className="text-sm font-medium hover:text-indigo-400 transition-colors">
                Dashboard
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                  Log In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)]">
                  Get Started
                </button>
              </SignUpButton>
            </>
          )}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
        {/* Abstract Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
            Manage your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-emerald-400">
              Rental Properties
            </span>{" "}
            like a pro.
          </h1>
          <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mx-auto font-light">
            Track rent, manage electricity bills, handle partial payments, and generate beautiful receipts effortlessly.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Go to Dashboard <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ) : (
              <SignUpButton mode="modal">
                <button className="group relative inline-flex items-center justify-center gap-2 bg-white text-slate-950 px-8 py-4 rounded-full font-bold text-lg overflow-hidden transition-transform hover:scale-105 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.1)]">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Managing Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-emerald-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              </SignUpButton>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 pt-16 border-t border-white/5">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center mb-4 text-indigo-400">
                <IndianRupee className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Smart Billing</h3>
              <p className="text-slate-400">
                Calculate electricity based on unit difference automatically. Handle water charges easily.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4 text-emerald-400">
                <Home className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Partial Payments</h3>
              <p className="text-slate-400">
                Accept rent and bills flexibly. Tenant paying late or partially? We track it perfectly.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-2xl text-left hover:bg-white/10 transition-colors">
              <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 text-pink-400">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Instant Receipts</h3>
              <p className="text-slate-400">
                Generate and share comprehensive, crystal-clear payment receipts instantly.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
