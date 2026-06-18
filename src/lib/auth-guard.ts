import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import bcrypt from "bcryptjs";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (!session) {
    return null;
  }
  const role = (session.user as { role?: string }).role;
  if (role !== "admin") {
    return null;
  }
  return session;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(12);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
