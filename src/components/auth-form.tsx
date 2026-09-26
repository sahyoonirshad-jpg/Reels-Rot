import Link from "next/link";

type Props = {
  mode: "login" | "signup";
  action: (formData: FormData) => Promise<void>;
  error?: string;
  message?: string;
};

export function AuthForm({ mode, action, error, message }: Props) {
  const isSignup = mode === "signup";

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-10">
      <form action={action} className="card flex w-full max-w-sm flex-col gap-3 p-6">
        <Link href="/" className="logo-text text-center text-4xl">
          Reels Rot
        </Link>
        <p className="mb-2 text-center text-sm">
          {isSignup ? "make an account, start the rot" : "welcome back"}
        </p>

        {error && <p className="rounded-2xl border-2 border-ink bg-alert p-3 text-sm">{error}</p>}
        {message && <p className="rounded-2xl border-2 border-ink bg-mint p-3 text-sm">{message}</p>}

        {isSignup && (
          <input name="username" placeholder="Username" required minLength={3} maxLength={20} className="field" />
        )}
        <input name="email" type="email" placeholder="Email" required className="field" />
        <input
          name="password"
          type="password"
          placeholder="Password"
          required
          minLength={6}
          autoComplete={isSignup ? "new-password" : "current-password"}
          className="field"
        />

        <button className="sticker mt-2 bg-sky py-3 text-lg">
          {isSignup ? "Sign up" : "Sign in"}
        </button>

        <p className="mt-2 text-center text-sm">
          {isSignup ? "Already have an account? " : "New here? "}
          <Link href={isSignup ? "/login" : "/signup"} className="font-display font-semibold underline decoration-lavender decoration-4 underline-offset-2">
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </p>
      </form>
    </main>
  );
}
