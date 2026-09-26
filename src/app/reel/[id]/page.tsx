import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteComment } from "@/app/reels/actions";
import { CommentForm } from "@/components/comment-form";
import { createClient, getUserId } from "@/lib/supabase/server";

type Reel = {
  id: string;
  video_url: string;
  caption: string | null;
  profiles: { username: string } | null;
};

type Comment = {
  id: string;
  body: string;
  created_at: string;
  user_id: string;
  profiles: { username: string } | null;
};

function timeAgo(iso: string) {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}

export default async function ReelPage({ params }: PageProps<"/reel/[id]">) {
  const { id } = await params;
  const supabase = await createClient();
  const userId = await getUserId(supabase);

  // Load the reel and its comments at the same time.
  const [{ data: reel }, { data: comments }] = await Promise.all([
    supabase
      .from("reels")
      .select("id, video_url, caption, profiles!user_id(username)")
      .eq("id", id)
      .returns<Reel[]>()
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id, body, created_at, user_id, profiles!user_id(username)")
      .eq("reel_id", id)
      .order("created_at", { ascending: true })
      .returns<Comment[]>(),
  ]);
  if (!reel) notFound();

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link href="/" className="sticker self-start bg-white px-4 py-1 text-sm">
          ← Back to reels
        </Link>

        <div className="card flex flex-col gap-3 p-4">
          <video
            src={reel.video_url}
            className="mx-auto max-h-[50dvh] rounded-2xl border-2 border-ink bg-ink"
            controls
            loop
            playsInline
            preload="metadata"
          />
          <div>
            <p className="font-display text-lg font-semibold">@{reel.profiles?.username ?? "unknown"}</p>
            {reel.caption && <p className="mt-1 text-sm">{reel.caption}</p>}
          </div>
        </div>

        <div className="card flex flex-col gap-3 p-4">
          <h2 className="font-display text-lg font-bold">Comments · {comments?.length ?? 0}</h2>

          {comments && comments.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {comments.map((comment, i) => (
                <li
                  key={comment.id}
                  className={`flex items-start justify-between gap-3 rounded-2xl border-2 border-ink px-3 py-2 ${
                    ["bg-sky/40", "bg-lavender/50", "bg-mint/40", "bg-lime/50"][i % 4]
                  }`}
                >
                  <p className="text-sm">
                    <span className="font-display font-semibold">@{comment.profiles?.username ?? "unknown"}</span>{" "}
                    <span className="whitespace-pre-wrap break-words">{comment.body}</span>
                    <span className="ml-2 text-xs opacity-60">{timeAgo(comment.created_at)}</span>
                  </p>
                  {comment.user_id === userId && (
                    <form action={deleteComment.bind(null, comment.id)}>
                      <button className="text-xs underline opacity-60 hover:opacity-100">Delete</button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm opacity-70">No comments yet. Be the first!</p>
          )}
        </div>

        {userId ? (
          <CommentForm reelId={reel.id} />
        ) : (
          <Link
            href={"/login?message=" + encodeURIComponent("Sign in to comment.")}
            className="sticker bg-sky py-3 text-center"
          >
            Sign in to comment
          </Link>
        )}
      </div>
    </main>
  );
}
