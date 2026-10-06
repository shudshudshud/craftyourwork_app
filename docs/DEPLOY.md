# Deploying to app.craftyour.work

About 20 minutes, done once.

## 1. Supabase (database and sign-in)

1. Create a project at [supabase.com](https://supabase.com). Choose the **Singapore (ap-southeast-1)** region.
2. Open **SQL Editor**, paste in `supabase/migrations/0001_projects_tasks.sql`, and run it.
3. Go to **Authentication → Sign In / Providers** and make sure **Email** is enabled. Turn **off** "Allow new users to sign up" once you've signed in for the first time, so nobody else can create an account while it's just you.
4. Go to **Authentication → URL Configuration**:
   - **Site URL:** `https://app.craftyour.work`
   - **Redirect URLs:** add `https://app.craftyour.work/auth/callback` and `http://localhost:3000/auth/callback`
5. From **Project Settings → API**, copy the **Project URL** and the **anon public** key.

Supabase's built-in email sender is rate-limited to a few emails per hour. That's fine for one person. Before opening the app to others, connect a real SMTP provider (Resend, Postmark, etc.) under **Authentication → Emails → SMTP**.

## 2. Vercel (hosting)

1. At [vercel.com/new](https://vercel.com/new), import `shudshudshud/craftyourwork_app`. Vercel detects Next.js on its own.
2. Before deploying, add these environment variables:

   | Name | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
   | `APP_TIMEZONE` | `Asia/Singapore` |

3. Deploy. Every push to `main` redeploys automatically.

## 3. Domain

1. In Vercel: **Project → Settings → Domains → Add** `app.craftyour.work`.
2. At your DNS provider for `craftyour.work`, add the record Vercel shows. It's normally:

   | Type | Name | Value |
   |---|---|---|
   | CNAME | `app` | `cname.vercel-dns.com` |

   Use the exact value Vercel displays if it differs. If your DNS is on Cloudflare, set the record to **DNS only** (grey cloud) so Vercel can issue the HTTPS certificate.
3. Wait for Vercel to show the domain as valid (usually minutes), then sign in at https://app.craftyour.work.

## Notes

- The anon key is safe in the browser. Row-level security in the migration is what keeps each person's data private, so never turn RLS off on these tables.
- Never put the Supabase **service_role** key in this app or in Vercel's public environment variables.
