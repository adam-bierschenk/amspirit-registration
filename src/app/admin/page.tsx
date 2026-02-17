import { parseCsv, readCsvText, getCsvPath } from "@/lib/csv";

function formatHeaderLabel(key: string): string {
  return key.replaceAll("_", " ");
}

export default async function AdminPage() {
  const text = await readCsvText();
  const records = parseCsv(text);
  const csvPath = getCsvPath();

  const latest = records.slice(-200).reverse();
  const columns = latest.length > 0 ? Object.keys(latest[0]) : [];

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-8">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Admin — Registrations
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            CSV file: <span className="font-mono">{csvPath}</span>
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
          {latest.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              No registrations yet.
            </div>
          ) : (
            <div className="overflow-auto rounded-2xl border border-slate-200">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-700">
                  <tr>
                    {columns.map((c) => (
                      <th
                        key={c}
                        className="whitespace-nowrap px-4 py-3 font-semibold"
                      >
                        {formatHeaderLabel(c)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {latest.map((r, idx) => (
                    <tr key={idx} className="bg-white">
                      {columns.map((c) => (
                        <td
                          key={c}
                          className="whitespace-nowrap px-4 py-3 text-slate-800"
                        >
                          {r[c] ?? ""}
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
