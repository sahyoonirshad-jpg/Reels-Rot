// Shown instantly while a page is fetching, so the app never looks frozen.
export default function Loading() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4">
      <div className="flex gap-2">
        <span className="h-4 w-4 animate-bounce rounded-full border-2 border-ink bg-sky" />
        <span className="h-4 w-4 animate-bounce rounded-full border-2 border-ink bg-lavender [animation-delay:150ms]" />
        <span className="h-4 w-4 animate-bounce rounded-full border-2 border-ink bg-lime [animation-delay:300ms]" />
      </div>
      <p className="logo-text animate-pulse text-2xl">Reels Rot</p>
    </main>
  );
}
