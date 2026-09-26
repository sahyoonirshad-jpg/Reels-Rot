import Link from "next/link";
import { signOut } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/server";

export async function TopBar() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
    username = data?.username ?? null;
  }

  return (
    <header className="fixed inset-x-0 top-0 z-10 flex items-center justify-between bg-gradient-to-b from-black/70 to-transparent px-4 py-3 text-white">
      <Link href="/" className="text-lg font-bold">
        Reels Rot
      </Link>

      {user ? (
        <form action={signOut} className="flex items-center gap-3 text-sm">
          <Link href="/new" className="rounded-full bg-white px-3 py-1 font-semibold text-black">
            + Post
          </Link>
          <span className="font-semibold">@{username ?? "you"}</span>
          <button className="rounded-full bg-white/15 px-3 py-1 hover:bg-white/25">Sign out</button>
        </form>
      ) : (
        <Link href="/login" className="rounded-full bg-white px-4 py-1 text-sm font-semibold text-black">
          Sign in
        </Link>
      )}
    </header>
  );
}
