import type { PrismaClient, Role } from "@prisma/client";
import type { UserRepository } from "@/modules/identity/ports";

export function createUserRepository(db: PrismaClient): UserRepository {
  return {
    async findByEmail(email) {
      const user = await db.user.findUnique({ where: { email } });
      if (!user) return null;
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role,
        active: user.active,
        passwordHash: user.passwordHash,
      };
    },
  };
}
