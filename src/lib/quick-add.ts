// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

// The server runs in UTC; "today" should mean today where the user is.
export function todayIn(timeZone = process.env.APP_TIMEZONE || "Asia/Singapore") {
  const [y, m, d] = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" })
    .format(new Date())
    .split("-")
    .map(Number);
  return new Date(y, m - 1, d);
}

export function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, "");
}

// "Draft booth plan #sustig ^2026-10-20" → { title, tag: "sustig", due: "2026-10-20" }
// Also accepts ^today, ^tomorrow and ^+N (days from today).
export function parseQuickAdd(raw: string, today = new Date()) {
  let text = raw.trim();
  let tag: string | null = null;
  let due: string | null = null;

  const tagMatch = text.match(/(?:^|\s)#(\p{L}[\p{L}\p{N}_-]*)/u);
  if (tagMatch) {
    tag = tagMatch[1];
    text = text.replace(tagMatch[0], " ");
  }

  const dueMatch = text.match(/(?:^|\s)\^(\d{4}-\d{2}-\d{2}|today|tomorrow|\+\d{1,3})(?=\s|$)/i);
  if (dueMatch) {
    const v = dueMatch[1].toLowerCase();
    if (/^\d{4}-\d{2}-\d{2}$/.test(v)) {
      due = v;
    } else {
      const offset = v === "today" ? 0 : v === "tomorrow" ? 1 : Number(v.slice(1));
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      due = [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
    }
    text = text.replace(dueMatch[0], " ");
  }

  return { title: text.replace(/\s+/g, " ").trim(), tag, due };
}
