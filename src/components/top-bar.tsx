import Link from "next/link";
import { signOut } from "@/app/auth/actions";

// signedIn and username come from the page, so we don't ask the database twice.
export function TopBar({ signedIn, username }: { signedIn: boolean; username: string | null }) {
  return (
    <header className="fixed inset-x-3 top-3 z-10 flex items-center justify-between rounded-full border-[2.5px] border-ink bg-white/75 px-4 py-2 shadow-[3px_3px_0_var(--color-ink)] backdrop-blur-md">
      <Link href="/" className="logo-text text-xl">
        Reels Rot
      </Link>

      {signedIn ? (
        <form action={signOut} className="flex items-center gap-2 text-sm">
          <Link href="/new" className="sticker bg-lime px-3 py-1">
            + Post
          </Link>
          <span className="hidden font-display font-semibold sm:inline">@{username ?? "you"}</span>
          <button className="sticker bg-white px-3 py-1">Sign out</button>
        </form>
      ) : (
        <Link href="/login" className="sticker bg-sky px-4 py-1 text-sm">
          Sign in
        </Link>
      )}
    </header>
  );
}
