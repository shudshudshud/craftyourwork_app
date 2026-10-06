// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

"use client";

import { useState } from "react";
import { completeTask, deleteTask } from "./actions";
import { formatDate } from "@/lib/dates";

type Props = {
  id: string;
  title: string;
  due: string | null;
  today: string;
  projectName?: string;
};

export function TaskItem({ id, title, due, today, projectName }: Props) {
  const [finishing, setFinishing] = useState(false);
  const overdue = due !== null && due < today;
  const dueToday = due === today;

  return (
    <li className="group border-b border-line py-2.5 last:border-b-0">
      <div className="flex items-start gap-3">
        <button
          type="button"
          aria-label={`Mark "${title}" done`}
          onClick={() => setFinishing((f) => !f)}
          className={`mt-0.5 size-5 shrink-0 rounded-full border-2 transition-colors ${
            finishing ? "border-accent bg-accent-soft" : "border-line hover:border-accent"
          }`}
        />
        <div className="min-w-0 flex-1">
          <p className="break-words">{title}</p>
          {(projectName || due) && (
            <p className="mt-0.5 flex flex-wrap gap-x-3 text-xs text-muted">
              {projectName && <span>{projectName}</span>}
              {due && (
                <span className={overdue ? "font-medium text-danger" : dueToday ? "font-medium text-accent" : ""}>
                  {overdue ? "Overdue · " : dueToday ? "Today · " : "Due "}
                  {formatDate(due)}
                </span>
              )}
            </p>
          )}
        </div>
        <form action={deleteTask} className="opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
          <input type="hidden" name="id" value={id} />
          <button aria-label="Delete task" className="px-1 text-sm text-muted hover:text-danger">×</button>
        </form>
      </div>

      {finishing && (
        <form action={completeTask} className="mt-2 ml-8 flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="id" value={id} />
          <input
            name="outcome"
            autoFocus
            placeholder="What came out of it? (optional, one line)"
            className="min-w-0 flex-1 rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white hover:opacity-90">
            Done
          </button>
        </form>
      )}
    </li>
  );
}
