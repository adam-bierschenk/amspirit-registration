import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import { getCsvPath, ensureCsvExists } from "@/lib/csv";

export async function GET() {
  await ensureCsvExists();
  const csvPath = getCsvPath();

  let data: Buffer;
  try {
    data = await fs.readFile(csvPath);
  } catch {
    return NextResponse.json(
      { ok: false, error: "CSV not found." },
      { status: 404 }
    );
  }

  return new NextResponse(data, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registrations.csv"'
    }
  });
}
