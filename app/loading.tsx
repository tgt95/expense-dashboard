export default function Loading() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-6xl px-6 py-12 sm:px-8 lg:px-12">
      <div className="space-y-10">
        <div className="space-y-3">
          <div className="animate-shimmer h-4 w-28 rounded-md" />
          <div className="animate-shimmer h-14 w-64 rounded-md" />
          <div className="animate-shimmer h-5 w-80 rounded-md" />
        </div>
        <div className="animate-shimmer h-20 rounded-xl" />
        <div className="grid gap-4 md:grid-cols-[1.5fr_1fr]">
          <div className="animate-shimmer h-56 rounded-xl" />
          <div className="flex flex-col gap-4">
            <div className="animate-shimmer flex-1 rounded-xl" />
            <div className="animate-shimmer flex-1 rounded-xl" />
          </div>
        </div>
        <div className="animate-shimmer h-32 rounded-xl" />
        <div className="animate-shimmer h-96 rounded-xl" />
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-6">
            <div className="animate-shimmer h-64 rounded-xl" />
            <div className="animate-shimmer h-80 rounded-xl" />
          </div>
          <div className="animate-shimmer h-[32rem] rounded-xl" />
        </div>
      </div>
    </main>
  );
}
