import bcrypt from "bcryptjs";

const ROUNDS = 12;
const DUMMY_HASH = bcrypt.hashSync("dummy-password-not-a-user", ROUNDS);

export const passwordHasher = {
  hash(password: string): Promise<string> {
    return bcrypt.hash(password, ROUNDS);
  },
  verify(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
  },
  dummyVerify(password: string): Promise<boolean> {
    return bcrypt.compare(password, DUMMY_HASH);
  },
};
