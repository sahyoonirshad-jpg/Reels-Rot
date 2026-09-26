// Shown instantly while a page is fetching, so the app never looks frozen.
export default function Loading() {
  return (
    <main className="flex flex-1 items-center justify-center bg-black">
      <p className="animate-pulse text-2xl font-bold text-white/70">Reels Rot</p>
    </main>
  );
}
