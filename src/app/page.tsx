// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, isoDate } from "@/lib/dates";
import { todayIn } from "@/lib/quick-add";
import { addProject, addTask, setProjectStatus, signOut } from "./actions";
import { TaskItem } from "./task-item";
import { LogItem } from "./log-item";

type Project = { id: string; name: string; status: "active" | "paused" | "done" };
type Task = {
  id: string;
  title: string;
  project_id: string | null;
  due_date: string | null;
  outcome: string | null;
  done_at: string | null;
};

export default async function Home({ searchParams }: PageProps<"/">) {
  const params = await searchParams;
  const filter = typeof params.project === "string" ? params.project : null;
  const today = isoDate(todayIn());

  const supabase = await createClient();

  let openQuery = supabase
    .from("tasks")
    .select("id, title, project_id, due_date, outcome, done_at")
    .eq("status", "todo")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: true });
  let logQuery = supabase
    .from("tasks")
    .select("id, title, project_id, due_date, outcome, done_at")
    .eq("status", "done")
    .order("done_at", { ascending: false })
    .limit(30);

  if (filter === "inbox") {
    openQuery = openQuery.is("project_id", null);
    logQuery = logQuery.is("project_id", null);
  } else if (filter) {
    openQuery = openQuery.eq("project_id", filter);
    logQuery = logQuery.eq("project_id", filter);
  }

  const [{ data: projectRows }, { data: openRows }, { data: logRows }, { count: openTotal }] = await Promise.all([
    supabase.from("projects").select("id, name, status").order("name"),
    openQuery,
    logQuery,
    supabase.from("tasks").select("project_id", { count: "exact", head: true }).eq("status", "todo"),
  ]);

  const projects = (projectRows ?? []) as Project[];
  const open = (openRows ?? []) as Task[];
  const log = (logRows ?? []) as Task[];
  const nameOf = new Map(projects.map((p) => [p.id, p.name]));
  const active = projects.filter((p) => p.status === "active");
  const parked = projects.filter((p) => p.status !== "active");
  const current = filter === "inbox" ? null : projects.find((p) => p.id === filter);
  const heading = filter === "inbox" ? "Inbox" : current?.name ?? "Everything";
  const missingOutcomes = log.filter((t) => !t.outcome).length;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24">
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="font-semibold tracking-tight">Craft Your Work</Link>
        <form action={signOut}>
          <button className="text-sm text-muted hover:text-ink">Sign out</button>
        </form>
      </header>

      <form action={addTask} className="flex flex-col gap-2 sm:flex-row">
        <input
          name="title"
          required
          autoFocus
          autoComplete="off"
          placeholder="Add a task…  #project  ^tomorrow"
          className="min-w-0 flex-1 rounded-lg border border-line bg-panel px-3.5 py-3 outline-none focus:border-accent"
        />
        {current && <input type="hidden" name="project_id" value={current.id} />}
        <button className="rounded-lg bg-accent px-5 py-3 font-medium text-white hover:opacity-90">Add</button>
      </form>
      <p className="mt-1.5 text-xs text-muted">
        <code>#name</code> files it under a project (new names create one). <code>^today</code>, <code>^tomorrow</code>,{" "}
        <code>^+3</code> or <code>^2026-10-20</code> set a due date.
      </p>

      <div className="mt-8 grid gap-8 md:grid-cols-[13rem_1fr]">
        <nav aria-label="Projects" className="space-y-6">
          <ul className="space-y-0.5 text-sm">
            <NavLink href="/" active={!filter} label="Everything" count={openTotal ?? undefined} />
            <NavLink href="/?project=inbox" active={filter === "inbox"} label="Inbox" />
          </ul>

          <div>
            <h2 className="mb-1.5 text-xs font-medium tracking-wide text-muted uppercase">Projects</h2>
            <ul className="space-y-0.5 text-sm">
              {active.map((p) => (
                <NavLink key={p.id} href={`/?project=${p.id}`} active={filter === p.id} label={p.name} />
              ))}
            </ul>
            <form action={addProject} className="mt-2">
              <input
                name="name"
                placeholder="+ New project"
                autoComplete="off"
                className="w-full rounded-md border border-transparent bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted focus:border-line focus:bg-panel"
              />
            </form>
          </div>

          {parked.length > 0 && (
            <details>
              <summary className="cursor-pointer text-xs font-medium tracking-wide text-muted uppercase">
                Paused & finished ({parked.length})
              </summary>
              <ul className="mt-1.5 space-y-0.5 text-sm">
                {parked.map((p) => (
                  <NavLink key={p.id} href={`/?project=${p.id}`} active={filter === p.id} label={`${p.name}${p.status === "done" ? " ✓" : ""}`} />
                ))}
              </ul>
            </details>
          )}
        </nav>

        <main className="min-w-0 space-y-10">
          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h1 className="text-2xl font-semibold tracking-tight">{heading}</h1>
              {current && (
                <form action={setProjectStatus} className="flex gap-3 text-xs text-muted">
                  <input type="hidden" name="id" value={current.id} />
                  {current.status !== "active" && <button name="status" value="active" className="hover:text-ink">Make active</button>}
                  {current.status !== "paused" && <button name="status" value="paused" className="hover:text-ink">Pause</button>}
                  {current.status !== "done" && <button name="status" value="done" className="hover:text-ink">Mark finished</button>}
                </form>
              )}
            </div>
            {open.length === 0 ? (
              <p className="mt-4 text-muted">Nothing open here.</p>
            ) : (
              <ul className="mt-3 rounded-lg border border-line bg-panel px-4">
                {open.map((t) => (
                  <TaskItem
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    due={t.due_date}
                    today={today}
                    projectName={filter ? undefined : t.project_id ? nameOf.get(t.project_id) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <div className="flex items-baseline justify-between gap-3">
              <h2 className="text-lg font-semibold tracking-tight">Work log</h2>
              {missingOutcomes > 0 && (
                <span className="text-xs text-muted">{missingOutcomes} without an outcome yet</span>
              )}
            </div>
            <p className="mt-1 text-sm text-muted">
              What you finished and what came out of it. This is the record your resumes will draw on later.
            </p>
            {log.length === 0 ? (
              <p className="mt-4 text-muted">Finish a task to start your log.</p>
            ) : (
              <ul className="mt-3 rounded-lg border border-line bg-panel px-4">
                {log.map((t) => (
                  <LogItem
                    key={t.id}
                    id={t.id}
                    title={t.title}
                    outcome={t.outcome}
                    doneLabel={t.done_at ? formatDate(new Date(t.done_at).toLocaleDateString("en-CA", { timeZone: process.env.APP_TIMEZONE || "Asia/Singapore" })) : ""}
                    projectName={filter ? undefined : t.project_id ? nameOf.get(t.project_id) : undefined}
                  />
                ))}
              </ul>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}

function NavLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <li>
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={`flex justify-between rounded-md px-2 py-1 ${active ? "bg-accent-soft font-medium text-ink" : "text-muted hover:text-ink"}`}
      >
        <span className="truncate">{label}</span>
        {count !== undefined && <span className="text-xs">{count}</span>}
      </Link>
    </li>
  );
}
