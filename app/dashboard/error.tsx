"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function DashboardError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Dashboard error:", { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-2xl font-bold">!</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Dashboard error</h2>
        <p className="text-slate-500 mb-6">Something went wrong loading the dashboard.</p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
