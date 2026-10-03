import { signInDemo } from "@/app/auth/actions";

// "Try the demo": signs the visitor into the shared demo account.
export function DemoButton({ className = "" }: { className?: string }) {
  return (
    <form action={signInDemo} className={className}>
      <button className="sticker w-full bg-lime px-4 py-1">Try the demo</button>
    </form>
  );
}
