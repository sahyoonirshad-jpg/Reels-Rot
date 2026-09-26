"use client";

import Link from "next/link";
import { startTransition, useOptimistic } from "react";
import { toggleLike } from "@/app/reels/actions";
import { HeartIcon } from "@/components/icons";

type Props = { reelId: string; liked: boolean; count: number; signedIn: boolean };

export function LikeButton({ reelId, liked, count, signedIn }: Props) {
  // Show the new heart instantly, before the database has answered.
  const [shown, setShown] = useOptimistic({ liked, count });

  const content = (
    <>
      <span className="bubble">
        <HeartIcon filled={shown.liked} />
      </span>
      <span className="rounded-full border-2 border-ink bg-white px-2 font-display text-xs font-semibold">
        {shown.count}
      </span>
    </>
  );

  if (!signedIn) {
    return (
      <Link
        href={"/login?message=" + encodeURIComponent("Sign in to like reels.")}
        className="flex flex-col items-center gap-1"
        aria-label="Sign in to like"
      >
        {content}
      </Link>
    );
  }

  function click() {
    startTransition(async () => {
      setShown({ liked: !shown.liked, count: shown.count + (shown.liked ? -1 : 1) });
      await toggleLike(reelId, shown.liked);
    });
  }

  return (
    <button onClick={click} className="flex flex-col items-center gap-1" aria-label={shown.liked ? "Unlike" : "Like"}>
      {content}
    </button>
  );
}
