import Link from "next/link";
import { LikeButton } from "@/components/like-button";
import { ReelVideo } from "@/components/reel-video";
import { TopBar } from "@/components/top-bar";
import { createClient } from "@/lib/supabase/server";

type Reel = {
  id: string;
  video_url: string;
  caption: string | null;
  profiles: { username: string } | null;
  likes: { count: number }[];
  comments: { count: number }[];
};

export default async function Home() {
  // Reading cookies here also makes Next.js load fresh reels on every visit.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reels, error } = await supabase
    .from("reels")
    .select("id, video_url, caption, profiles!user_id(username), likes(count), comments(count)")
    .order("created_at", { ascending: false })
    .returns<Reel[]>();

  // Which reels has the signed-in person already liked?
  const likedByMe = new Set<string>();
  if (user) {
    const { data: myLikes } = await supabase.from("likes").select("reel_id").eq("user_id", user.id);
    myLikes?.forEach((like) => likedByMe.add(like.reel_id));
  }

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
            <div className="pointer-events-none absolute inset-x-0 bottom-16 p-4 pr-16 text-white">
              <p className="font-semibold">@{reel.profiles?.username ?? "unknown"}</p>
              {reel.caption && <p className="mt-1 text-sm">{reel.caption}</p>}
            </div>
            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-5 text-white">
              <LikeButton
                reelId={reel.id}
                liked={likedByMe.has(reel.id)}
                count={reel.likes[0]?.count ?? 0}
                signedIn={!!user}
              />
              <Link href={`/reel/${reel.id}`} className="flex flex-col items-center" aria-label="Comments">
                <span className="text-3xl drop-shadow">💬</span>
                <span className="text-xs font-semibold">{reel.comments[0]?.count ?? 0}</span>
              </Link>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
