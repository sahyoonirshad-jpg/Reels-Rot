"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function withMessage(path: string, key: "error" | "message", text: string) {
  return `${path}?${key}=${encodeURIComponent(text)}`;
}

export async function signUp(formData: FormData) {
  const username = String(formData.get("username") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    redirect(withMessage("/signup", "error", "Username must be 3–20 letters, numbers or _"));
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    // The profile trigger in supabase/schema.sql reads this username.
    options: { data: { username } },
  });

  if (error) redirect(withMessage("/signup", "error", error.message));

  // Only happens if "Confirm email" is switched on in Supabase.
  if (!data.session) {
    redirect(withMessage("/login", "message", "Check your email to confirm your account, then sign in."));
  }

  redirect("/");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(formData.get("email") ?? "").trim(),
    password: String(formData.get("password") ?? ""),
  });

  if (error) redirect(withMessage("/login", "error", error.message));

  redirect("/");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
