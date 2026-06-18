import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth-guard";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { eventType, page, referrer, userAgent, ipAddress, country, city, browser, os, device, sessionId, duration, metadata } = body;

    if (!eventType) {
      return error("Event type is required");
    }

    const event = await db.analyticsEvent.create({
      data: {
        eventType,
        page,
        referrer,
        userAgent,
        ipAddress,
        country,
        city,
        browser,
        os,
        device,
        sessionId,
        duration,
        metadata: metadata ? (typeof metadata === "string" ? metadata : JSON.stringify(metadata)) : undefined,
      },
    });

    return success(event, 201);
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return error("Unauthorized", 401);

    const url = new URL(req.url);
    const eventType = url.searchParams.get("eventType");
    const startDate = url.searchParams.get("startDate");
    const endDate = url.searchParams.get("endDate");
    const page = parseInt(url.searchParams.get("page") || "1");
    const limit = parseInt(url.searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (eventType) where.eventType = eventType;
    if (startDate || endDate) {
      where.createdAt = {
        ...(startDate ? { gte: new Date(startDate) } : {}),
        ...(endDate ? { lte: new Date(endDate) } : {}),
      };
    }

    const [events, total] = await Promise.all([
      db.analyticsEvent.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.analyticsEvent.count({ where }),
    ]);

    return success({ events, total, page, limit });
  } catch (err) {
    return handleError(err);
  }
}
