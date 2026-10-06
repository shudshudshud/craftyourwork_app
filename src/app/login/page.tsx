// SPDX-License-Identifier: AGPL-3.0-or-later
// Copyright (C) 2026 Irsyad Ramthan

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function sendLink(formData: FormData) {
  "use server";
  const email = String(formData.get("email") ?? "").trim();
  if (!email) redirect("/login?error=email");

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  redirect(error ? "/login?error=send" : "/login?sent=1");
}

const ERRORS: Record<string, string> = {
  email: "Enter your email address.",
  send: "Couldn't send the link. Try again in a minute.",
  link: "That link has expired or was already used. Request a new one.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const sent = params.sent === "1";
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <p className="text-sm font-medium tracking-wide text-muted uppercase">Craft Your Work</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Sign in</h1>

      {sent ? (
        <p className="mt-6 rounded-lg border border-line bg-panel p-4 text-sm">
          Check your email for a sign-in link. You can close this tab.
        </p>
      ) : (
        <form action={sendLink} className="mt-6 space-y-3">
          <label className="block text-sm" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full rounded-lg border border-line bg-panel px-3 py-2.5 outline-none focus:border-accent"
          />
          <button className="w-full rounded-lg bg-accent px-3 py-2.5 font-medium text-white hover:opacity-90">
            Email me a link
          </button>
          {error && <p className="text-sm text-danger">{error}</p>}
        </form>
      )}
    </main>
  );
}
