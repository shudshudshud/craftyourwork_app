// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

"use client";

import { useState } from "react";
import { reopenTask, updateOutcome } from "./actions";

type Props = {
  id: string;
  title: string;
  outcome: string | null;
  doneLabel: string;
  projectName?: string;
};

export function LogItem({ id, title, outcome, doneLabel, projectName }: Props) {
  const [editing, setEditing] = useState(false);

  return (
    <li className="group border-b border-line py-2.5 last:border-b-0">
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 text-sm text-muted">
          <span className="line-through decoration-line">{title}</span>
          {projectName && <span> · {projectName}</span>}
        </p>
        <span className="shrink-0 text-xs text-muted">{doneLabel}</span>
      </div>

      {editing ? (
        <form action={updateOutcome} onSubmit={() => setEditing(false)} className="mt-1.5 flex gap-2">
          <input type="hidden" name="id" value={id} />
          <input
            name="outcome"
            autoFocus
            defaultValue={outcome ?? ""}
            placeholder="What came out of it?"
            className="min-w-0 flex-1 rounded-md border border-line bg-panel px-2.5 py-1.5 text-sm outline-none focus:border-accent"
          />
          <button className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-white">Save</button>
        </form>
      ) : outcome ? (
        <button type="button" onClick={() => setEditing(true)} className="mt-0.5 block text-left">
          {outcome}
        </button>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="mt-0.5 text-sm text-accent hover:underline"
        >
          + Add what came out of it
        </button>
      )}

      <form action={reopenTask} className="mt-1 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
        <input type="hidden" name="id" value={id} />
        <button className="text-xs text-muted hover:text-ink">Reopen</button>
      </form>
    </li>
  );
}
