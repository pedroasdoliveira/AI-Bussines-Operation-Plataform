export const GENERIC_LOGIN_ERROR = "E-mail ou senha inválidos.";
export const LOGIN_ERROR_CODE = "INVALID_CREDENTIALS";

export type Role = "OPERATOR" | "ADMIN";

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
};

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase().slice(0, 320);
}
