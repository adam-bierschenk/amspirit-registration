import { NextResponse } from "next/server";
import { appendRegistrations } from "@/lib/registrations";

type Attendee = { firstName: string; lastName: string };

function isNonEmptyString(v: unknown): v is string {
  return typeof v === "string" && v.trim().length > 0;
}

function normalizeName(v: string): string {
  return v.trim().replace(/\s+/g, " ");
}

function normalizeEmail(v: string): string {
  return v.trim().toLowerCase();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (typeof body !== "object" || body === null) {
    return NextResponse.json(
      { ok: false, error: "Invalid request body." },
      { status: 400 }
    );
  }

  const { chapter, director, registrantEmail, attendees } = body as {
    chapter?: unknown;
    director?: unknown;
    registrantEmail?: unknown;
    attendees?: unknown;
  };

  if (!isNonEmptyString(chapter)) {
    return NextResponse.json(
      { ok: false, error: "Chapter is required." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(director)) {
    return NextResponse.json(
      { ok: false, error: "Director is required." },
      { status: 400 }
    );
  }

  if (!isNonEmptyString(registrantEmail)) {
    return NextResponse.json(
      { ok: false, error: "Registrant email is required." },
      { status: 400 }
    );
  }

  const email = normalizeEmail(registrantEmail);
  if (!isValidEmail(email)) {
    return NextResponse.json(
      { ok: false, error: "Registrant email is not valid." },
      { status: 400 }
    );
  }

  if (!Array.isArray(attendees) || attendees.length < 1) {
    return NextResponse.json(
      { ok: false, error: "At least one attendee is required." },
      { status: 400 }
    );
  }

  const parsedAttendees: Attendee[] = [];
  for (const item of attendees) {
    if (typeof item !== "object" || item === null) {
      return NextResponse.json(
        { ok: false, error: "Invalid attendee entry." },
        { status: 400 }
      );
    }
    const { firstName, lastName } = item as {
      firstName?: unknown;
      lastName?: unknown;
    };

    if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
      return NextResponse.json(
        { ok: false, error: "Each attendee needs first and last name." },
        { status: 400 }
      );
    }

    parsedAttendees.push({
      firstName: normalizeName(firstName),
      lastName: normalizeName(lastName)
    });
  }

  try {
    await appendRegistrations({
      timestampIso: new Date().toISOString(),
      chapter: normalizeName(chapter),
      director: normalizeName(director),
      registrantEmail: email,
      attendees: parsedAttendees
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to save registration. Check server logs." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
