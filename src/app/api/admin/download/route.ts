import { NextResponse } from "next/server";
import { listAllRegistrations, registrationsToCsv } from "@/lib/registrations";

export async function GET() {
  try {
    const registrations = await listAllRegistrations();
    const csvText = registrationsToCsv(registrations);

    return new NextResponse(csvText, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="registrations.csv"'
      }
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: "Failed to generate CSV from Supabase data." },
      { status: 500 }
    );
  }
}
