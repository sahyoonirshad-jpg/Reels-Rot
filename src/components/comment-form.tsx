"use client";

import { useRef } from "react";
import { addComment } from "@/app/reels/actions";

const QUICK_EMOJIS = ["❤️", "😂", "🔥", "😍", "😭", "👏", "🙌", "😮", "💀", "🧠"];

export function CommentForm({ reelId }: { reelId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Put the emoji where the cursor is, then keep typing.
  function addEmoji(emoji: string) {
    const input = inputRef.current;
    if (!input) return;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    input.setRangeText(emoji, start, end, "end");
    input.focus();
  }

  return (
    <form action={addComment.bind(null, reelId)} className="sticky bottom-4 mt-2 flex flex-col gap-2">
      <div className="flex justify-between rounded-full bg-zinc-900/90 px-3 py-1">
        {QUICK_EMOJIS.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => addEmoji(emoji)}
            className="rounded-full p-1 text-xl transition-transform hover:scale-125"
            aria-label={`Add ${emoji}`}
          >
            {emoji}
          </button>
        ))}
      </div>
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
