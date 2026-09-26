"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createClient, getUserId } from "@/lib/supabase/server";

async function signedInClient(message: string) {
  const supabase = await createClient();
  const userId = await getUserId(supabase);
  if (!userId) redirect("/login?message=" + encodeURIComponent(message));
  return { supabase, userId };
}

export async function toggleLike(reelId: string, currentlyLiked: boolean) {
  const { supabase, userId } = await signedInClient("Sign in to like reels.");

  if (currentlyLiked) {
    await supabase.from("likes").delete().eq("reel_id", reelId).eq("user_id", userId);
  } else {
    // A second like from the same person is ignored (one like per person per reel).
    await supabase
      .from("likes")
      .upsert({ reel_id: reelId, user_id: userId }, { ignoreDuplicates: true });
  }

  refresh();
}

export async function addComment(reelId: string, formData: FormData) {
  const body = String(formData.get("body") ?? "").trim();
  if (!body || body.length > 500) return;

  const { supabase, userId } = await signedInClient("Sign in to comment.");
  await supabase.from("comments").insert({ reel_id: reelId, user_id: userId, body });

  refresh();
}

export async function deleteComment(commentId: string) {
  const { supabase, userId } = await signedInClient("Sign in to delete comments.");
  // The security rules also stop anyone deleting someone else's comment.
  await supabase.from("comments").delete().eq("id", commentId).eq("user_id", userId);

  refresh();
}
