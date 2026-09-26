"use client";

import { useRef } from "react";
import { addComment } from "@/app/reels/actions";
import { EmojiRow, insertAtCursor } from "@/components/emoji-row";

export function CommentForm({ reelId }: { reelId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <form action={addComment.bind(null, reelId)} className="sticky bottom-4 mt-2 flex flex-col gap-2">
      <EmojiRow onPick={(emoji) => inputRef.current && insertAtCursor(inputRef.current, emoji)} />
      <div className="flex gap-2">
        <input
          ref={inputRef}
          name="body"
          placeholder="Add a comment…"
          required
          maxLength={500}
          autoComplete="off"
          className="flex-1 rounded-full bg-zinc-900 px-4 py-3 text-sm text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/40"
        />
        <button className="rounded-full bg-white px-5 text-sm font-semibold text-black hover:bg-zinc-200">
          Post
        </button>
      </div>
    </form>
  );
}
