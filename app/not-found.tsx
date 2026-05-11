import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-slate-200 mb-4">404</h1>
        <h2 className="text-2xl font-bold text-slate-900 mb-3">Page not found</h2>
        <p className="text-slate-500 mb-8">The page you&apos;re looking for doesn&apos;t exist or has been moved.</p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
