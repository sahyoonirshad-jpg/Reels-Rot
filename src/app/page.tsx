import { connection } from "next/server";
import { supabase } from "@/lib/supabase";

type Reel = {
  id: string;
  video_url: string;
  caption: string | null;
  profiles: { username: string } | null;
};

export default async function Home() {
  // Load fresh reels on every visit instead of freezing them at build time.
  await connection();

  const { data: reels, error } = await supabase
    .from("reels")
    .select("id, video_url, caption, profiles!user_id(username)")
    .order("created_at", { ascending: false })
    .returns<Reel[]>();

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-black p-6 text-red-400">
        Could not load reels: {error.message}
      </main>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 bg-black text-white">
        <h1 className="text-4xl font-bold">Reels Rot</h1>
        <p className="text-zinc-400">No reels yet.</p>
      </main>
    );
  }

  return (
    <main className="h-dvh snap-y snap-mandatory overflow-y-scroll bg-black">
      {reels.map((reel) => (
        <section
          key={reel.id}
          className="flex h-dvh snap-start items-center justify-center"
        >
          <div className="relative aspect-[9/16] h-full max-w-full bg-zinc-900">
            <video
              src={reel.video_url}
              className="h-full w-full object-cover"
              controls
              loop
              playsInline
              preload="metadata"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-16 p-4 text-white">
              <p className="font-semibold">@{reel.profiles?.username ?? "unknown"}</p>
              {reel.caption && <p className="mt-1 text-sm">{reel.caption}</p>}
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
