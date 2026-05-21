export default function Loading() {
  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="animate-pulse rounded-lg border border-stone-200 bg-white p-6 shadow-sm">
        <div className="h-8 w-64 rounded bg-stone-200" />
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="h-28 rounded bg-stone-100" />
          <div className="h-28 rounded bg-stone-100" />
          <div className="h-28 rounded bg-stone-100" />
        </div>
        <div className="mt-6 h-96 rounded bg-stone-100" />
      </div>
    </main>
  );
}
