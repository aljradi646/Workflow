import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";
import { logAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const url = new URL(req.url);
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const isRead = url.searchParams.get("isRead");

    const where = {
      isRead: isRead === "true" ? true : isRead === "false" ? false : undefined,
    };

    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.contactMessage.count({ where }),
    ]);

    return success({ messages, total, page, limit });
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, subject, message, phone } = body;

    if (!name || !email || !message) {
      return error("Name, email, and message are required");
    }

    const contactMsg = await db.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        phone,
      },
    });

    return success(contactMsg, 201);
  } catch (err) {
    return handleError(err);
  }
}
