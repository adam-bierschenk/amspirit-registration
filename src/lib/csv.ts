import { promises as fs } from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");
const CSV_PATH = path.join(DATA_DIR, "registrations.csv");

const HEADER =
  "timestamp,chapter,director,registrant_email,attendee_first_name,attendee_last_name\n";

export function getCsvPath(): string {
  return CSV_PATH;
}

function csvEscape(value: string): string {
  const v = value ?? "";
  const mustQuote = /[,"\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

export async function ensureCsvExists(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    await fs.access(CSV_PATH);
  } catch {
    await fs.writeFile(CSV_PATH, HEADER, "utf8");
  }
}

export async function appendRegistrations(params: {
  timestampIso: string;
  chapter: string;
  director: string;
  registrantEmail: string;
  attendees: Array<{ firstName: string; lastName: string }>;
}): Promise<void> {
  await ensureCsvExists();

  const { timestampIso, chapter, director, registrantEmail, attendees } = params;

  const lines = attendees
    .map((a) => {
      const cols = [
        csvEscape(timestampIso),
        csvEscape(chapter),
        csvEscape(director),
        csvEscape(registrantEmail),
        csvEscape(a.firstName),
        csvEscape(a.lastName)
      ];
      return `${cols.join(",")}\n`;
    })
    .join("");

  await fs.appendFile(CSV_PATH, lines, "utf8");
}

export async function readCsvText(): Promise<string> {
  await ensureCsvExists();
  return fs.readFile(CSV_PATH, "utf8");
}

export function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  const pushCell = () => {
    row.push(cell);
    cell = "";
  };

  const pushRow = () => {
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        const next = text[i + 1];
        if (next === '"') {
          cell += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
      continue;
    }

    if (ch === ",") {
      pushCell();
      continue;
    }

    if (ch === "\n") {
      pushCell();
      pushRow();
      continue;
    }

    if (ch === "\r") continue;

    cell += ch;
  }

  if (cell.length > 0 || row.length > 0) {
    pushCell();
    pushRow();
  }

  if (rows.length === 0) return [];

  const header = rows[0];
  const out: Array<Record<string, string>> = [];
  for (let r = 1; r < rows.length; r++) {
    const record: Record<string, string> = {};
    for (let c = 0; c < header.length; c++) {
      record[header[c] ?? `col_${c}`] = rows[r]?.[c] ?? "";
    }
    const isEmpty = Object.values(record).every((v) => v.trim() === "");
    if (!isEmpty) out.push(record);
  }
  return out;
}
