import { signIn } from "@/app/auth/actions";
import { AuthForm } from "@/components/auth-form";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error, message } = await searchParams;

  return (
    <AuthForm
      mode="login"
      action={signIn}
      error={typeof error === "string" ? error : undefined}
      message={typeof message === "string" ? message : undefined}
    />
  );
}
