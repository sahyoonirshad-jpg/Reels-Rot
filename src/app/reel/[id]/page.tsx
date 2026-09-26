import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteComment } from "@/app/reels/actions";
import { CommentForm } from "@/components/comment-form";
import { createClient } from "@/lib/supabase/server";

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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: reel } = await supabase
    .from("reels")
    .select("id, video_url, caption, profiles!user_id(username)")
    .eq("id", id)
    .returns<Reel[]>()
    .maybeSingle();
  if (!reel) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, body, created_at, user_id, profiles!user_id(username)")
    .eq("reel_id", id)
    .order("created_at", { ascending: true })
    .returns<Comment[]>();

  return (
    <main className="flex flex-1 flex-col items-center bg-black px-4 py-6 text-white">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Back to reels
        </Link>

        <video
          src={reel.video_url}
          className="mx-auto max-h-[50dvh] rounded-2xl bg-zinc-900"
          controls
          loop
          playsInline
          preload="metadata"
        />
        <div>
          <p className="font-semibold">@{reel.profiles?.username ?? "unknown"}</p>
          {reel.caption && <p className="mt-1 text-sm text-zinc-300">{reel.caption}</p>}
        </div>

        <h2 className="mt-2 border-t border-zinc-800 pt-4 font-bold">
          Comments · {comments?.length ?? 0}
        </h2>

        {comments && comments.length > 0 ? (
          <ul className="flex flex-col gap-3">
            {comments.map((comment) => (
              <li key={comment.id} className="flex items-start justify-between gap-3">
                <p className="text-sm">
                  <span className="font-semibold">@{comment.profiles?.username ?? "unknown"}</span>{" "}
                  <span className="whitespace-pre-wrap break-words text-zinc-200">{comment.body}</span>
                  <span className="ml-2 text-xs text-zinc-500">{timeAgo(comment.created_at)}</span>
                </p>
                {comment.user_id === user?.id && (
                  <form action={deleteComment.bind(null, comment.id)}>
                    <button className="text-xs text-zinc-500 hover:text-red-400">Delete</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No comments yet. Be the first!</p>
        )}

        {user ? (
          <CommentForm reelId={reel.id} />
        ) : (
          <Link
            href={"/login?message=" + encodeURIComponent("Sign in to comment.")}
            className="mt-2 rounded-full bg-white py-3 text-center text-sm font-semibold text-black"
          >
            Sign in to comment
          </Link>
        )}
      </div>
    </main>
  );
}
