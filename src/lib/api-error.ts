// src/lib/api-error.ts
import { NextResponse } from "next/server";
import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    public readonly message: string,
    public readonly status: number = 500,
    public readonly code?: string
  ) {
    super(message);
    this.name = "ApiError";
  }

  static unauthorized(msg = "Unauthorized")    { return new ApiError(msg, 401, "UNAUTHORIZED"); }
  static forbidden(msg = "Forbidden")          { return new ApiError(msg, 403, "FORBIDDEN"); }
  static notFound(msg = "Not found")           { return new ApiError(msg, 404, "NOT_FOUND"); }
  static conflict(msg = "Conflict")            { return new ApiError(msg, 409, "CONFLICT"); }
  static badRequest(msg = "Bad request")       { return new ApiError(msg, 400, "BAD_REQUEST"); }
  static tooMany(msg = "Too many requests")    { return new ApiError(msg, 429, "TOO_MANY_REQUESTS"); }
  static internal(msg = "Internal server error") { return new ApiError(msg, 500, "INTERNAL"); }
}

/** Wrap an async route handler with consistent error formatting */
export function withErrorHandler(
  handler: (req: Request, ctx: any) => Promise<NextResponse>
) {
  return async (req: Request, ctx: any): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json(
          { error: err.message, code: err.code },
          { status: err.status }
        );
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: err.errors[0]?.message ?? "Validation error", code: "VALIDATION" },
          { status: 400 }
        );
      }
      console.error("[API]", err);
      return NextResponse.json(
        { error: "Internal server error", code: "INTERNAL" },
        { status: 500 }
      );
    }
  };
}
