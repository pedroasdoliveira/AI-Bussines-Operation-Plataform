import { redirect } from "next/navigation";
import { auth } from "@/infrastructure/auth";
import { LoginForm } from "@/app/login/login-form";
import { GENERIC_LOGIN_ERROR } from "@/modules/identity/domain/login";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  const params = await searchParams;

  return (
    <main>
      <h1>Entrar</h1>
      {params.error ? <p role="alert">{GENERIC_LOGIN_ERROR}</p> : null}
      <LoginForm />
    </main>
  );
}
