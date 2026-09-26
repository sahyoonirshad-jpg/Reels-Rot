import Link from "next/link";
import { ChatIcon } from "@/components/icons";
import { LikeButton } from "@/components/like-button";
import { ReelVideo } from "@/components/reel-video";
import { TopBar } from "@/components/top-bar";
import { createClient, getUserId } from "@/lib/supabase/server";

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
  const userId = await getUserId(supabase);

  // Ask for reels, my likes and my username at the same time, not one after another.
  const [{ data: reels, error }, { data: myLikes }, { data: me }] = await Promise.all([
    supabase
      .from("reels")
      .select("id, video_url, caption, profiles!user_id(username), likes(count), comments(count)")
      .order("created_at", { ascending: false })
      .returns<Reel[]>(),
    userId
      ? supabase.from("likes").select("reel_id").eq("user_id", userId)
      : Promise.resolve({ data: null }),
    userId
      ? supabase.from("profiles").select("username").eq("id", userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  // Which reels has the signed-in person already liked?
  const likedByMe = new Set(myLikes?.map((like) => like.reel_id));
  const topBar = <TopBar signedIn={!!userId} username={me?.username ?? null} />;

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="card p-6">Could not load reels: {error.message}</p>
      </main>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <main className="flex flex-1 items-center justify-center p-6">
        {topBar}
        <div className="card flex flex-col items-center gap-3 p-8 text-center">
          <h1 className="font-display text-2xl font-bold">No reels yet</h1>
          <p className="text-sm">Be the first to post something rotten.</p>
          <Link href="/new" className="sticker mt-2 bg-lime px-5 py-2">
            + Post a reel
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="h-dvh snap-y snap-mandatory overflow-y-scroll">
      {topBar}
      {reels.map((reel) => (
        <section
          key={reel.id}
          className="flex h-dvh snap-start items-center justify-center sm:pb-4 sm:pt-20"
        >
          {/* Full screen on phones; a rounded sticker frame on bigger screens.
              isolate + translateZ(0) gives the frame its own drawing layer, which stops a
              Chrome-on-Windows bug where a video in a rounded clipped box goes black. */}
          <div className="relative isolate aspect-[9/16] h-full max-w-full overflow-hidden bg-ink [transform:translateZ(0)] sm:rounded-[2rem] sm:border-[3px] sm:border-ink sm:shadow-[6px_6px_0_var(--color-ink)]">
            <ReelVideo src={reel.video_url} reelId={reel.id} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-4 pb-16 pr-20 text-white">
              <p className="font-display text-lg font-semibold drop-shadow">@{reel.profiles?.username ?? "unknown"}</p>
              {reel.caption && <p className="mt-1 text-sm drop-shadow">{reel.caption}</p>}
            </div>
            <div className="absolute bottom-24 right-3 flex flex-col items-center gap-4">
              <LikeButton
                reelId={reel.id}
                liked={likedByMe.has(reel.id)}
                count={reel.likes[0]?.count ?? 0}
                signedIn={!!userId}
              />
              <Link href={`/reel/${reel.id}`} className="flex flex-col items-center gap-1" aria-label="Comments">
                <span className="bubble">
                  <ChatIcon />
                </span>
                <span className="rounded-full border-2 border-ink bg-white px-2 font-display text-xs font-semibold">
                  {reel.comments[0]?.count ?? 0}
                </span>
              </Link>
            </div>
          </div>
        </section>
      ))}
    </main>
  );
}
