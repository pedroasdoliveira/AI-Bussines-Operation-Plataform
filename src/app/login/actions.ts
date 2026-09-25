"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/infrastructure/auth";
import { GENERIC_LOGIN_ERROR } from "@/modules/identity/domain/login";
import { log } from "@/shared/logging";

export type LoginState = { error: string | null };

export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  try {
    await signIn("credentials", { email, password, redirectTo: "/dashboard" });
    return { error: null };
  } catch (error) {
    if (error instanceof AuthError) return { error: GENERIC_LOGIN_ERROR };
    if (isNextRedirect(error)) throw error;
    log({
      level: "error",
      message: "login failed unexpectedly",
      errorCode: "FAILED",
      module: "identity",
    });
    return { error: "Não foi possível entrar agora. Tente de novo." };
  }
}

function isNextRedirect(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}
