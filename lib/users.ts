import bcrypt from "bcryptjs";
import { getDb, COLLECTIONS } from "./mongodb";

export interface AppUser {
  email: string;
  passwordHash: string;
  name: string;
  role: "customer" | "admin";
  createdAt: Date;
}

export async function findUserByEmail(email: string): Promise<AppUser | null> {
  const db = await getDb();
  return db
    .collection<AppUser>(COLLECTIONS.users)
    .findOne({ email: email.toLowerCase().trim() });
}

export async function createUser(
  email: string,
  password: string,
  name: string,
): Promise<AppUser> {
  const normalized = email.toLowerCase().trim();
  const existing = await findUserByEmail(normalized);
  if (existing) {
    throw new Error("An account with this email already exists");
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user: AppUser = {
    email: normalized,
    passwordHash,
    name: name.trim(),
    role: "customer",
    createdAt: new Date(),
  };
  const db = await getDb();
  await db.collection<AppUser>(COLLECTIONS.users).insertOne(user);
  return user;
}

export async function verifyUser(
  email: string,
  password: string,
): Promise<AppUser | null> {
  const user = await findUserByEmail(email);
  if (!user) return null;
  const ok = await bcrypt.compare(password, user.passwordHash);
  return ok ? user : null;
}
