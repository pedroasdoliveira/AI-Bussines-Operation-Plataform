export { authenticate } from "@/modules/identity/application/authenticate";
export { authorize, PERMISSIONS, sessionUserSchema } from "@/modules/identity/domain/authorization";
export { GENERIC_LOGIN_ERROR, normalizeEmail } from "@/modules/identity/domain/login";
export type { SessionUser, Permission } from "@/modules/identity/domain/authorization";
export type { AuthenticatedUser, Role } from "@/modules/identity/domain/login";
