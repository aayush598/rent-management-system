"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    logger.error("Global error boundary caught:", {
      message: error.message,
      digest: error.digest,
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
          <span className="text-red-600 text-3xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-3">Something went wrong</h1>
        <p className="text-slate-500 mb-8">An unexpected error occurred. Please try again.</p>
        <button
          onClick={reset}
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
