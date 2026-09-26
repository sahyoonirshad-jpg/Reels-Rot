"use client";

const QUICK_EMOJIS = ["❤️", "😂", "🔥", "😍", "😭", "👏", "🙌", "😮", "💀", "🧠"];

// Puts an emoji where the cursor is in a text box, then keeps typing there.
export function insertAtCursor(field: HTMLInputElement | HTMLTextAreaElement, text: string) {
  const start = field.selectionStart ?? field.value.length;
  const end = field.selectionEnd ?? field.value.length;
  field.setRangeText(text, start, end, "end");
  field.focus();
}

export function EmojiRow({ onPick, disabled }: { onPick: (emoji: string) => void; disabled?: boolean }) {
  return (
    <div className="flex justify-between rounded-full border-2 border-ink bg-white/80 px-2 py-1">
      {QUICK_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onPick(emoji)}
          disabled={disabled}
          className="rounded-full p-1 text-xl transition-transform hover:scale-125 disabled:opacity-40"
          aria-label={`Add ${emoji}`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
