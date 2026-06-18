import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

export function success(data: unknown, status = 200): NextResponse {
  return NextResponse.json({ success: true, data }, { status });
}

export function error(message: string, status = 400): NextResponse {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function validateBody<T>(body: unknown, schema: ZodSchema<T>): T {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    throw new ValidationError(errors);
  }
  return result.data;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export function handleError(err: unknown): NextResponse {
  if (err instanceof ValidationError) {
    return error(err.message, 422);
  }
  if (err instanceof Error && err.message.includes("Unique constraint")) {
    return error("A record with this data already exists", 409);
  }
  console.error("API Error:", err);
  return error("Internal server error", 500);
}
