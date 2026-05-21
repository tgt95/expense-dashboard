export default function Loading() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-4 py-16 sm:px-8 md:py-24 lg:px-12">
      <div className="space-y-10">
        <div className="space-y-3">
          <div className="animate-shimmer h-4 w-28" />
          <div className="animate-shimmer h-14 w-64" />
          <div className="animate-shimmer h-5 w-80" />
        </div>
        <div className="animate-shimmer h-20" />
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="animate-shimmer h-56" />
          <div className="flex flex-col gap-4">
            <div className="animate-shimmer flex-1" />
            <div className="animate-shimmer flex-1" />
          </div>
        </div>
        <div className="animate-shimmer h-32" />
        <div className="animate-shimmer h-96" />
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-8">
            <div className="animate-shimmer h-64" />
            <div className="animate-shimmer h-80" />
          </div>
          <div className="animate-shimmer h-[32rem]" />
        </div>
      </div>
    </main>
  );
}
