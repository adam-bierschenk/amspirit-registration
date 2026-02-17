"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { CHAPTERS, DIRECTORS } from "@/data/options";

type Attendee = { firstName: string; lastName: string };

function normalizeInput(v: string): string {
  return v.replace(/\s+/g, " ").trimStart();
}

function normalizeEmailInput(v: string): string {
  return v.trimStart();
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export default function Page() {
  const [chapter, setChapter] = useState("");
  const [director, setDirector] = useState("");
  const [registrantEmail, setRegistrantEmail] = useState("");

  const [attendees, setAttendees] = useState<Attendee[]>([
    { firstName: "", lastName: "" }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const canRemove = attendees.length > 1;

  const formValid = useMemo(() => {
    if (!chapter || !director) return false;
    if (!registrantEmail.trim() || !isValidEmail(registrantEmail)) return false;
    if (attendees.length < 1) return false;
    return attendees.every(
      (a) => a.firstName.trim().length > 0 && a.lastName.trim().length > 0
    );
  }, [chapter, director, registrantEmail, attendees]);

  function addAttendee() {
    setAttendees((prev) => [...prev, { firstName: "", lastName: "" }]);
  }

  function removeAttendee(index: number) {
    setAttendees((prev) => prev.filter((_, i) => i !== index));
  }

  function updateAttendee(index: number, key: keyof Attendee, value: string) {
    setAttendees((prev) =>
      prev.map((a, i) =>
        i === index ? { ...a, [key]: normalizeInput(value) } : a
      )
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (attendees.length < 1) {
      setError("Please add at least one attendee.");
      return;
    }
    if (!formValid) {
      setError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chapter,
          director,
          registrantEmail: registrantEmail.trim(),
          attendees: attendees.map((a) => ({
            firstName: a.firstName.trim(),
            lastName: a.lastName.trim()
          }))
        })
      });

      const data = (await res.json()) as { ok: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? "Submission failed.");
        return;
      }

      setSuccess("Registration saved!");
      setChapter("");
      setDirector("");
      setRegistrantEmail("");
      setAttendees([{ firstName: "", lastName: "" }]);
    } catch {
      setError("Network error submitting form.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-3xl p-4 sm:p-8">
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-slate-200">
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-56 sm:h-16 sm:w-64">
              <Image
                src="/logo.png"
                alt="AmSpirit logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>

          <h1 className="mt-6 text-2xl sm:text-3xl font-semibold tracking-tight">
            AmSpirit Leadership Conference
          </h1>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Register attendees for your chapter.
          </p>
        </div>

        <form onSubmit={onSubmit} className="p-6 sm:p-10 space-y-8">
          <section className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Name of Your Chapter <span className="text-rose-600">*</span>
                </label>
                <select
                  value={chapter}
                  onChange={(e) => setChapter(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="" disabled>
                    Select a chapter
                  </option>
                  {CHAPTERS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Director Name <span className="text-rose-600">*</span>
                </label>
                <select
                  value={director}
                  onChange={(e) => setDirector(e.target.value)}
                  className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                  required
                >
                  <option value="" disabled>
                    Select a director
                  </option>
                  {DIRECTORS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Your Email <span className="text-rose-600">*</span>
              </label>
              <input
                type="email"
                value={registrantEmail}
                onChange={(e) =>
                  setRegistrantEmail(normalizeEmailInput(e.target.value))
                }
                className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="you@company.com"
                required
              />
              {registrantEmail.trim().length > 0 &&
                !isValidEmail(registrantEmail) && (
                  <p className="mt-2 text-xs text-rose-600">
                    Please enter a valid email.
                  </p>
                )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Attendees</h2>
              <button
                type="button"
                onClick={addAttendee}
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                Add attendee
              </button>
            </div>

            <div className="space-y-3">
              {attendees.map((a, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-slate-700">
                      Attendee {idx + 1}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeAttendee(idx)}
                      disabled={!canRemove}
                      className="text-sm font-medium text-rose-600 disabled:text-slate-400"
                      title={
                        canRemove
                          ? "Remove this attendee"
                          : "At least one attendee is required"
                      }
                    >
                      Remove
                    </button>
                  </div>

                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        First Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        value={a.firstName}
                        onChange={(e) =>
                          updateAttendee(idx, "firstName", e.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700">
                        Last Name <span className="text-rose-600">*</span>
                      </label>
                      <input
                        value={a.lastName}
                        onChange={(e) =>
                          updateAttendee(idx, "lastName", e.target.value)
                        }
                        className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-slate-500">Minimum 1 attendee required.</p>
          </section>

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
              {success}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="submit"
              disabled={submitting || !formValid}
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              {submitting ? "Submitting..." : "Submit registration"}
            </button>
          </div>

          {/* <div className="text-xs text-slate-500">
            CSV output location: <span className="font-mono">/data/registrations.csv</span>
          </div> */}
        </form>
      </div>
    </main>
  );
}
