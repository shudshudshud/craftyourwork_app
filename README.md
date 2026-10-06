# Craft Your Work

A to-do list that remembers what you did.

Craft Your Work tracks tasks across many projects. When you finish a task you add a one-line note on what came out of it, and that builds a running work log. Later, the log feeds a personal development plan and tailored resumes and cover letters for specific jobs.

Live at **app.craftyour.work**.

## Status

Early. The first milestone is the to-do layer only: projects, fast task capture, and completion notes. The career features come after the log has real content in it.

## Stack

- [Next.js](https://nextjs.org) (App Router, TypeScript, Tailwind)
- [Supabase](https://supabase.com) for Postgres and auth (magic-link email), with row-level security on every table
- Hosted on [Vercel](https://vercel.com)

## Running locally

1. Create a Supabase project (full steps in [docs/DEPLOY.md](docs/DEPLOY.md)).
2. In the Supabase SQL editor, run the migrations in `supabase/migrations/` in order.
3. Copy `.env.example` to `.env.local` and fill in your Supabase URL and anon key.
4. In Supabase → Authentication → URL Configuration, add `http://localhost:3000/auth/callback` to the redirect URLs.
5. Run:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and sign in with your email.

## Your data stays out of this repo

This repository is public. All personal data (tasks, logs, resumes) lives in your Supabase database, never in the code. Do not commit exports, `.env` files or anything under `private/`; `.gitignore` already excludes them.

## License

Copyright (C) 2026 Irsyad Ramthan

This project is licensed under the GNU Affero General Public License v3.0 or later. See [LICENSE](LICENSE). If you run a modified version as a network service, you must offer its source code to that service's users.

## Contributing

This is a personal project and is not accepting outside contributions. See [CONTRIBUTING.md](CONTRIBUTING.md).
