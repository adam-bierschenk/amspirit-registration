import { listRecentRegistrations, type RegistrationRecord } from "@/lib/registrations";

export const dynamic = "force-dynamic";

const COLUMNS: Array<{ key: keyof RegistrationRecord; label: string }> = [
  { key: "timestamp", label: "timestamp" },
  { key: "chapter", label: "chapter" },
  { key: "director", label: "director" },
  { key: "registrant_email", label: "registrant email" },
  { key: "attendee_first_name", label: "attendee first name" },
  { key: "attendee_last_name", label: "attendee last name" }
];

export default async function AdminPage() {
  let latest: RegistrationRecord[] = [];
  let loadError: string | null = null;

  try {
    latest = await listRecentRegistrations(200);
  } catch {
    loadError = "Failed to load registrations from Supabase. Check server logs.";
  }

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Admin — Registrations
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Data source: <span className="font-mono">Supabase ({process.env.SUPABASE_REGISTRATIONS_TABLE ?? "registrations"})</span>
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <a
              href="/api/admin/download"
              className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Download CSV
            </a>
            <span className="text-xs text-slate-500">
              Showing up to 200 most recent rows.
            </span>
          </div>
        </div>

        <div className="p-6 sm:p-10">
          {loadError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {loadError}
            </div>
          ) : latest.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              No registrations yet.
            </div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    {COLUMNS.map((column) => (
                      <th
                        key={column.key}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {column.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {latest.map((r, idx) => (
                    <tr key={idx} className="bg-white">
                      {COLUMNS.map((column) => (
                        <td
                          key={column.key}
                          className="whitespace-nowrap px-4 py-3 text-slate-800"
                        >
                          {r[column.key] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
