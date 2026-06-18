import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { page, referrer, userAgent, ipAddress, country, city, browser, os, device, sessionId } = body;

    const event = await db.analyticsEvent.create({
      data: {
        eventType: "page_view",
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
      },
    });

    return success({ tracked: true, id: event.id }, 201);
  } catch (err) {
    return handleError(err);
  }
}
