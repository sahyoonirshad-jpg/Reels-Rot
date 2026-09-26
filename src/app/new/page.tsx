import Link from "next/link";
import { redirect } from "next/navigation";
import { NewReelForm } from "@/components/new-reel-form";
import { createClient } from "@/lib/supabase/server";

export default async function NewReelPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only signed-in people can post.
  if (!user) redirect("/login?message=" + encodeURIComponent("Sign in to post a reel."));

  return (
    <main className="flex flex-1 flex-col items-center bg-black px-4 py-6 text-white">
      <div className="mb-4 flex w-full max-w-sm items-center justify-between">
        <Link href="/" className="text-sm text-zinc-400 hover:text-white">
          ← Back
        </Link>
        <h1 className="text-lg font-bold">New reel</h1>
        <span className="w-10" />
      </div>
      <NewReelForm userId={user.id} />
    </main>
  );
}
