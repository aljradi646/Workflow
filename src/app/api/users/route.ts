import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { hashPassword } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const users = await db.user.findMany({
      select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    });

    return success(users);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const body = await req.json();
    const { email, name, password, role, avatar, isActive } = body;

    if (!email || !name || !password) {
      return error("Email, name, and password are required");
    }

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return error("User with this email already exists", 409);

    const hashedPassword = await hashPassword(password);

    const user = await db.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role || "viewer",
        avatar,
        isActive: isActive ?? true,
      },
    });

    const { password: _password, ...userWithoutPassword } = user;
    return success(userWithoutPassword, 201);
  } catch (err) {
    return handleError(err);
  }
}
