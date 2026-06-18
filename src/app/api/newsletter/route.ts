import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, error, handleError } from "@/lib/api-response";

// NewsletterSubscriber model uses raw queries because the PrismaClient
// singleton may be cached from before the model was added.

interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// GET /api/newsletter?email=... — Check subscription status
// GET /api/newsletter?count=true — Get subscriber count
// GET /api/newsletter?list=true — List all subscribers (admin, with pagination/search/filter)
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");
    const countParam = url.searchParams.get("count");
    const listParam = url.searchParams.get("list");

    // List subscribers for admin
    if (listParam === "true") {
      const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
      const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "20", 10)));
      const search = url.searchParams.get("search") || "";
      const statusFilter = url.searchParams.get("status") || "all"; // all, active, inactive
      const sourceFilter = url.searchParams.get("source") || "all";
      const offset = (page - 1) * limit;

      // Build WHERE clause
      const conditions: string[] = [];
      const values: unknown[] = [];

      if (search) {
        conditions.push("(email LIKE ? OR name LIKE ?)");
        values.push(`%${search}%`, `%${search}%`);
      }

      if (statusFilter === "active") {
        conditions.push("isActive = 1");
      } else if (statusFilter === "inactive") {
        conditions.push("isActive = 0");
      }

      if (sourceFilter !== "all") {
        conditions.push("source = ?");
        values.push(sourceFilter);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Get total count
      const countResult = await db.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count FROM newsletter_subscribers ${whereClause}`,
        ...values
      );
      const total = Number(countResult[0]?.count ?? 0);

      // Get paginated results
      const subscribers = await db.$queryRawUnsafe<SubscriberRow[]>(
        `SELECT id, email, name, isActive, source, createdAt, updatedAt FROM newsletter_subscribers ${whereClause} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
        ...values,
        limit,
        offset
      );

      // Get stats
      const totalResult = await db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM newsletter_subscribers
      `;
      const activeResult = await db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM newsletter_subscribers WHERE isActive = 1
      `;

      const now = new Date();
      const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const newThisMonthResult = await db.$queryRawUnsafe<Array<{ count: bigint }>>(
        `SELECT COUNT(*) as count FROM newsletter_subscribers WHERE createdAt >= ?`,
        firstOfMonth
      );

      // Get unique sources
      const sourcesResult = await db.$queryRawUnsafe<Array<{ source: string }>>(
        `SELECT DISTINCT source FROM newsletter_subscribers`
      );

      return success({
        subscribers,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
        stats: {
          total: Number(totalResult[0]?.count ?? 0),
          active: Number(activeResult[0]?.count ?? 0),
          inactive: Number(totalResult[0]?.count ?? 0) - Number(activeResult[0]?.count ?? 0),
          newThisMonth: Number(newThisMonthResult[0]?.count ?? 0),
        },
        sources: sourcesResult.map((s) => s.source),
      });
    }

    // Return subscriber count
    if (countParam === "true") {
      const result = await db.$queryRaw<Array<{ count: bigint }>>`
        SELECT COUNT(*) as count FROM newsletter_subscribers WHERE isActive = 1
      `;
      const subscriberCount = Number(result[0]?.count ?? 0);
      return success({ count: subscriberCount });
    }

    if (!email) {
      return error("Email parameter is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const subscribers = await db.$queryRaw<SubscriberRow[]>`
      SELECT id, email, name, isActive, source, createdAt, updatedAt
      FROM newsletter_subscribers
      WHERE email = ${normalizedEmail}
    `;

    if (!subscribers || subscribers.length === 0) {
      return success({ subscribed: false });
    }

    const sub = subscribers[0];
    return success({ subscribed: true, isActive: sub.isActive === true || sub.isActive === 1 });
  } catch (err) {
    return handleError(err);
  }
}

// POST /api/newsletter — Subscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, name, source } = body;

    if (!email) {
      return error("Email is required");
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return error("Invalid email address");
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing subscriber
    const existing = await db.$queryRaw<SubscriberRow[]>`
      SELECT id, email, name, isActive, source, createdAt, updatedAt
      FROM newsletter_subscribers
      WHERE email = ${normalizedEmail}
    `;

    if (existing && existing.length > 0) {
      const isActive = existing[0].isActive === true || existing[0].isActive === 1;
      if (isActive) {
        return error("This email is already subscribed", 409);
      }
      // Reactivate previously unsubscribed user
      await db.$executeRaw`
        UPDATE newsletter_subscribers
        SET isActive = 1, name = ${name || existing[0].name}, source = ${source || existing[0].source}, updatedAt = datetime('now')
        WHERE email = ${normalizedEmail}
      `;
      return success({ reactivated: true }, 201);
    }

    // Create new subscriber
    await db.$executeRaw`
      INSERT INTO newsletter_subscribers (id, email, name, isActive, source, createdAt, updatedAt)
      VALUES (${crypto.randomUUID()}, ${normalizedEmail}, ${name || null}, 1, ${source || "website"}, datetime('now'), datetime('now'))
    `;

    return success({ subscribed: true }, 201);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/newsletter — Unsubscribe (by email)
export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return error("Email is required");
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db.$queryRaw<SubscriberRow[]>`
      SELECT id, email, name, isActive, source, createdAt, updatedAt
      FROM newsletter_subscribers
      WHERE email = ${normalizedEmail}
    `;

    if (!existing || existing.length === 0) {
      return error("Email not found in subscribers list", 404);
    }

    const isActive = existing[0].isActive === true || existing[0].isActive === 1;
    if (!isActive) {
      return error("Email is already unsubscribed", 400);
    }

    await db.$executeRaw`
      UPDATE newsletter_subscribers
      SET isActive = 0, updatedAt = datetime('now')
      WHERE email = ${normalizedEmail}
    `;

    return success({ unsubscribed: true });
  } catch (err) {
    return handleError(err);
  }
}
