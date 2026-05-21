export default function Loading() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
      <div className="space-y-10">
        <div className="space-y-3">
          <div className="animate-shimmer h-4 w-28 rounded-md" />
          <div className="animate-shimmer h-14 w-64 rounded-md" />
          <div className="animate-shimmer h-5 w-80 rounded-md" />
        </div>
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="animate-shimmer h-56 rounded-xl" />
          <div className="flex flex-col gap-4">
            <div className="animate-shimmer flex-1 rounded-xl" />
            <div className="animate-shimmer flex-1 rounded-xl" />
          </div>
        </div>
        <div className="animate-shimmer h-96 rounded-xl" />
      </div>
    </main>
  );
}
