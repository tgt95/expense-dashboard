"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center px-6 py-16">
      <div className="rounded-lg border border-red-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
          Dashboard failed to load
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-stone-950">
          {error.message || "Unexpected error"}
        </h1>
        <button
          className="mt-6 rounded-md bg-stone-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-stone-800"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </div>
    </main>
  );
}
