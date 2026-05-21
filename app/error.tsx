"use client";

import { motion } from "motion/react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex min-h-[100dvh] max-w-3xl flex-col justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-8 text-center"
      >
        <p className="text-xs font-medium tracking-[0.15em] text-[var(--text-muted)] uppercase">
          Something went wrong
        </p>
        <h1 className="mt-3 font-serif text-3xl font-light tracking-tight leading-[1.1] text-[var(--text)]">
          {error.message || "Unexpected error"}
        </h1>
        <button
          className="mt-8 inline-flex items-center rounded-md bg-[var(--text)] px-6 py-2.5 text-sm font-medium text-[var(--bg)] transition-colors hover:bg-[var(--text-secondary)] active:scale-[0.98]"
          onClick={reset}
          type="button"
        >
          Retry
        </button>
      </motion.div>
    </main>
  );
}
