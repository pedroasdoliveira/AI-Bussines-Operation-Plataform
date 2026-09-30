import { PrismaClient } from "@prisma/client";
import { runSeed } from "../src/infrastructure/database/run-seed";

const prisma = new PrismaClient();

try {
  await runSeed(prisma, process.env);
} finally {
  await prisma.$disconnect();
}
