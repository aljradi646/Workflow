import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { success, error, handleError } from "@/lib/api-response";

interface SubscriberRow {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  source: string;
  createdAt: string;
  updatedAt: string;
}

// PUT /api/newsletter/[id] — Update subscriber (name, isActive)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { name, isActive } = body;

    // Check subscriber exists
    const existing = await db.$queryRaw<SubscriberRow[]>`
      SELECT id, email, name, isActive, source, createdAt, updatedAt
      FROM newsletter_subscribers
      WHERE id = ${id}
    `;

    if (!existing || existing.length === 0) {
      return error("Subscriber not found", 404);
    }

    // Build update dynamically
    const updates: string[] = [];
    const values: unknown[] = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (isActive !== undefined) {
      updates.push("isActive = ?");
      values.push(isActive ? 1 : 0);
    }

    if (updates.length === 0) {
      return error("No fields to update");
    }

    updates.push("updatedAt = datetime('now')");

    await db.$executeRawUnsafe(
      `UPDATE newsletter_subscribers SET ${updates.join(", ")} WHERE id = ?`,
      ...values,
      id
    );

    // Fetch updated row
    const updated = await db.$queryRaw<SubscriberRow[]>`
      SELECT id, email, name, isActive, source, createdAt, updatedAt
      FROM newsletter_subscribers
      WHERE id = ${id}
    `;

    return success(updated[0]);
  } catch (err) {
    return handleError(err);
  }
}

// DELETE /api/newsletter/[id] — Delete subscriber by ID
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existing = await db.$queryRaw<SubscriberRow[]>`
      SELECT id FROM newsletter_subscribers WHERE id = ${id}
    `;

    if (!existing || existing.length === 0) {
      return error("Subscriber not found", 404);
    }

    await db.$executeRaw`
      DELETE FROM newsletter_subscribers WHERE id = ${id}
    `;

    return success({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
