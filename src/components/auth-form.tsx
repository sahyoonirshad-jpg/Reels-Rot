import Link from "next/link";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  error?: string;
  message?: string;
};

const inputClass =
  "w-full rounded-lg bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none focus:ring-2 focus:ring-white/40";

export function AuthForm({ mode, action, error, message }: Props) {
  const isSignup = mode === "signup";

  return (
    <main className="flex flex-1 items-center justify-center bg-black px-4 text-white">
      <form action={action} className="flex w-full max-w-sm flex-col gap-3">
        <Link href="/" className="mb-4 text-center text-4xl font-bold">
          Reels Rot
        </Link>

        {error && <p className="rounded-lg bg-red-500/15 p-3 text-sm text-red-300">{error}</p>}
        {message && <p className="rounded-lg bg-white/10 p-3 text-sm text-zinc-200">{message}</p>}

        {isSignup && (
          <input name="username" placeholder="Username" required minLength={3} maxLength={20} className={inputClass} />
        )}
        <input name="email" type="email" placeholder="Email" required className={inputClass} />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className={inputClass}
        />

        <button className="mt-2 rounded-lg bg-white py-3 font-semibold text-black hover:bg-zinc-200">
          {isSignup ? "Sign up" : "Sign in"}
        </button>

        <p className="mt-2 text-center text-sm text-zinc-400">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-semibold text-white">
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </main>
  );
}
