import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const REGISTRATIONS_TABLE = process.env.SUPABASE_REGISTRATIONS_TABLE ?? "registrations";
const REGISTRATION_SELECT_COLUMNS =
  "id,submitted_at,chapter,director,registrant_email,attendee_first_name,attendee_last_name";
const CSV_HEADER =
  "timestamp,chapter,director,registrant_email,attendee_first_name,attendee_last_name\n";
const PAGE_SIZE = 1000;

type RegistrationDbRow = {
  id: number;
  submitted_at: string;
  chapter: string;
  director: string;
  registrant_email: string;
  attendee_first_name: string;
  attendee_last_name: string;
};

export type RegistrationRecord = {
  timestamp: string;
  chapter: string;
  director: string;
  registrant_email: string;
  attendee_first_name: string;
  attendee_last_name: string;
};

let adminClient: SupabaseClient | null = null;

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getSupabaseAdminClient(): SupabaseClient {
  if (adminClient) return adminClient;

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    requiredEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  return adminClient;
}

function csvEscape(value: string): string {
  const v = value ?? "";
  const mustQuote = /[,"\n\r]/.test(v);
  const escaped = v.replace(/"/g, '""');
  return mustQuote ? `"${escaped}"` : escaped;
}

function toRegistrationRecord(row: RegistrationDbRow): RegistrationRecord {
  return {
    timestamp: row.submitted_at,
    chapter: row.chapter,
    director: row.director,
    registrant_email: row.registrant_email,
    attendee_first_name: row.attendee_first_name,
    attendee_last_name: row.attendee_last_name
  };
}

export async function appendRegistrations(params: {
  timestampIso: string;
  chapter: string;
  director: string;
  registrantEmail: string;
  attendees: Array<{ firstName: string; lastName: string }>;
}): Promise<void> {
  const { timestampIso, chapter, director, registrantEmail, attendees } = params;
  const client = getSupabaseAdminClient();

  const rows = attendees.map((a) => ({
    submitted_at: timestampIso,
    chapter,
    director,
    registrant_email: registrantEmail,
    attendee_first_name: a.firstName,
    attendee_last_name: a.lastName
  }));

  const { error } = await client.from(REGISTRATIONS_TABLE).insert(rows);
  if (error) {
    throw new Error(`Failed to insert registration rows: ${error.message}`);
  }
}

export async function listRecentRegistrations(limit: number): Promise<RegistrationRecord[]> {
  const client = getSupabaseAdminClient();

  const { data, error } = await client
    .from(REGISTRATIONS_TABLE)
    .select(REGISTRATION_SELECT_COLUMNS)
    .order("submitted_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to read recent registrations: ${error.message}`);
  }

  return (data ?? []).map((row) => toRegistrationRecord(row as RegistrationDbRow));
}

export async function listAllRegistrations(): Promise<RegistrationRecord[]> {
  const client = getSupabaseAdminClient();
  const allRows: RegistrationDbRow[] = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await client
      .from(REGISTRATIONS_TABLE)
      .select(REGISTRATION_SELECT_COLUMNS)
      .order("submitted_at", { ascending: true })
      .order("id", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Failed to read registrations for export: ${error.message}`);
    }

    const rows = (data ?? []) as RegistrationDbRow[];
    allRows.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }

  return allRows.map(toRegistrationRecord);
}

export function registrationsToCsv(records: RegistrationRecord[]): string {
  const lines = records
    .map((r) =>
      [
        csvEscape(r.timestamp),
        csvEscape(r.chapter),
        csvEscape(r.director),
        csvEscape(r.registrant_email),
        csvEscape(r.attendee_first_name),
        csvEscape(r.attendee_last_name)
      ].join(",")
    )
    .join("\n");

  if (!lines) return CSV_HEADER;
  return `${CSV_HEADER}${lines}\n`;
}
