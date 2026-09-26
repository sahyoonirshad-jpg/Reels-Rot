"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { EmojiRow, insertAtCursor } from "@/components/emoji-row";
import { createClient } from "@/lib/supabase/client";

const MAX_BYTES = 50 * 1024 * 1024; // matches the 50 MB limit on the storage bucket
const ALLOWED_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

export function NewReelForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const captionRef = useRef<HTMLTextAreaElement>(null);

  function addEmoji(emoji: string) {
    const field = captionRef.current;
    if (!field || field.value.length + emoji.length > 300) return;
    insertAtCursor(field, emoji);
    setCaption(field.value);
  }

  // Free the preview's memory when leaving the page.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function pickFile(picked: File | undefined) {
    setError(null);
    if (!picked) return;
    if (!ALLOWED_TYPES.includes(picked.type)) {
      setError("Please pick an .mp4, .webm or .mov video.");
      return;
    }
    if (picked.size > MAX_BYTES) {
      setError(`That video is ${(picked.size / 1024 / 1024).toFixed(0)} MB. The limit is 50 MB.`);
      return;
    }
    setFile(picked);
    setPreviewUrl(URL.createObjectURL(picked));
  }

  async function share(event: React.FormEvent) {
    event.preventDefault();
    if (!file) return;
    setPosting(true);
    setError(null);

    const supabase = createClient();
    const extension = file.name.split(".").pop()?.toLowerCase() || "mp4";
    // Each person uploads into a folder named after their own id (see schema.sql).
    const path = `${userId}/${crypto.randomUUID()}.${extension}`;

    const upload = await supabase.storage
      .from("reels")
      // Each file name is unique and never changes, so phones may keep it for a year.
      .upload(path, file, { contentType: file.type, cacheControl: "31536000" });
    if (upload.error) {
      setError(`Upload failed: ${upload.error.message}`);
      setPosting(false);
      return;
    }

    const videoUrl = supabase.storage.from("reels").getPublicUrl(path).data.publicUrl;
    const insert = await supabase
      .from("reels")
      .insert({ user_id: userId, video_url: videoUrl, caption: caption.trim() || null });
    if (insert.error) {
      // Don't leave an orphaned video behind if the reel row couldn't be saved.
      await supabase.storage.from("reels").remove([path]);
      setError(`Could not save the reel: ${insert.error.message}`);
      setPosting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={share} className="flex w-full max-w-sm flex-col gap-4">
      <label className="relative flex aspect-[9/16] w-full cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500">
        {previewUrl ? (
          <video src={previewUrl} className="h-full w-full object-cover" autoPlay muted loop playsInline />
        ) : (
          <span className="px-6 text-center">
            Tap to choose a vertical video
            <br />
            <span className="text-xs">.mp4, .webm or .mov · up to 50 MB</span>
          </span>
        )}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          className="sr-only"
          onChange={(e) => pickFile(e.target.files?.[0])}
          disabled={posting}
        />
      </label>

      <EmojiRow onPick={addEmoji} disabled={posting} />
      <textarea
        ref={captionRef}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        placeholder="Write a caption…"
        maxLength={300}
        rows={2}
        disabled={posting}
        className="w-full resize-none rounded-lg bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/40"
      />

      {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}

      <button
        disabled={!file || posting}
        className="rounded-lg bg-white py-3 font-semibold text-black hover:bg-zinc-200 disabled:opacity-40"
      >
        {posting ? "Uploading… keep this page open" : "Share"}
      </button>
    </form>
  );
}
