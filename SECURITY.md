# Case access

Reporting does not require an email account. The form creates a Supabase anonymous Auth session when a visitor submits. Each new grievance receives the authenticated session's user ID in `owner_id`.

The database denies unauthenticated reads and writes. Reporters can access only their own rows, and cannot transfer ownership to another user. Clearing the browser's saved session removes that browser's access to its old reports. Existing rows have no reporter owner and remain accessible to authorized operators and the Supabase project administrator.

The case dashboard requires a permanent Supabase Auth account with the boolean `grievance_admin: true` in server-controlled `app_metadata`. Client-editable `user_metadata` cannot grant access. An anonymous account cannot become an operator even if it has the admin claim.

## Operator setup

Create the operator account in Supabase Dashboard → Authentication → Users. Enter its password yourself. Once created, use the project administrator's SQL Editor to grant the role to the specific account UUID:

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('grievance_admin', true)
where id = '<verified-operator-user-uuid>'::uuid
  and is_anonymous = false;
```

Do not authorize every registered account, use client-editable metadata, or paste passwords into SQL. Sign in again after changing the role so the JWT receives the updated claim. Operator sign-in uses the permanent account's email and password.

## Configuration and checks

Enable anonymous sign-ins in Supabase Authentication → Sign In / Providers. Keep email confirmation enabled for permanent accounts. Anonymous sessions remain subject to Supabase Auth rate limits and the ownership policies.

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the project's URL and publishable key. Never use a service-role key in a Vite environment variable. The browser helper uses its local session only to initialize reporting; database authorization is enforced by RLS with the verified JWT.

Apply `supabase/migrations/20261013225002_legacy_grievance_access.sql` after earlier migrations. It replaces the older permissive grievance policies. The migration was applied to project `mgjtmqivjcagapkmsjox` through its SQL Editor on October 14, 2026. It was not inserted into the remote CLI migration-history table.

Run `supabase/tests/grievance_access.sql` in the SQL Editor to test private reporting, cross-account isolation, ownership spoofing, and operator access. It rolls back its temporary Auth users and cases. Also run `npm run typecheck` and `npm run build`, then test form submission and the dashboard sign-in screen in a browser.

The previous permissive prototype source under `gemini-grievance-poc/grievance-submissions` does not match this database's column names and its recorded Vercel deployment failed. It must be updated before it can be used with this protected table. The preserved matching app is this `community-voice` repository.
