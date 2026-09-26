import Link from "next/link";
import { redirect } from "next/navigation";
import { NewReelForm } from "@/components/new-reel-form";
import { createClient, getUserId } from "@/lib/supabase/server";

export default async function NewReelPage() {
  const userId = await getUserId(await createClient());

  // Only signed-in people can post.
  if (!userId) redirect("/login?message=" + encodeURIComponent("Sign in to post a reel."));

  return (
    <main className="flex flex-1 flex-col items-center px-4 py-6">
      <div className="card flex w-full max-w-sm flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <Link href="/" className="sticker bg-white px-3 py-1 text-sm">
            ← Back
          </Link>
          <h1 className="font-display text-xl font-bold">New reel</h1>
          <span className="w-16" />
        </div>
        <NewReelForm userId={userId} />
      </div>
    </main>
  );
}
