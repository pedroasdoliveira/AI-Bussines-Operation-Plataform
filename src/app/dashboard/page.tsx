import { redirect } from "next/navigation";
import { auth, signOut } from "@/infrastructure/auth";
import { authorize, PERMISSIONS } from "@/modules/identity";
import { AuthorizationError } from "@/shared/errors";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email || !session.user.role) redirect("/login");

  try {
    authorize(
      { id: session.user.id, email: session.user.email, role: session.user.role },
      PERMISSIONS.operationRead,
    );
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return (
        <main>
          <h1>Acesso negado</h1>
        </main>
      );
    }
    throw error;
  }

  return (
    <main>
      <h1>Dashboard</h1>
      <p>
        Olá, {session.user.name}. Você está autenticado como {session.user.email} (
        {session.user.role}).
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
      >
        <button type="submit">Sair</button>
      </form>
    </main>
  );
}
