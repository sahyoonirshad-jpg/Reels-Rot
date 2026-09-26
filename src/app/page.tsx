import { ReelVideo } from "@/components/reel-video";
import { TopBar } from "@/components/top-bar";
import { createClient } from "@/lib/supabase/server";

type Reel = {
  id: string;
  video_url: string;
  caption: string | null;
  profiles: { username: string } | null;
};

export default async function Home() {
  // Reading cookies here also makes Next.js load fresh reels on every visit.
  const supabase = await createClient();

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
        <TopBar />
        <h1 className="text-4xl font-bold">Reels Rot</h1>
        <p className="text-zinc-400">No reels yet.</p>
      </main>
    );
  }

  return (
    <main className="h-dvh snap-y snap-mandatory overflow-y-scroll bg-black">
      <TopBar />
      {reels.map((reel) => (
        <section
          key={reel.id}
          className="flex h-dvh snap-start items-center justify-center"
        >
          <div className="relative aspect-[9/16] h-full max-w-full bg-zinc-900">
            <ReelVideo src={reel.video_url} />
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
