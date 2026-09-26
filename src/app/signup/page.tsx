import { signUp } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default async function SignupPage({ searchParams }: PageProps<"/signup">) {
  const { error } = await searchParams;

  return (
    <AuthForm mode="signup" action={signUp} error={typeof error === "string" ? error : undefined} />
  );
}
