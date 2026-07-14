# Email notifications for new leads

Get an email at **Qualscanradiology@gmail.com** whenever someone submits a
form on the Qualscan website. This uses a Supabase **Edge Function**
(`notify-lead`) triggered by a **Database Webhook** on the `leads` table, and
sends the email through **Resend**.

You only have to set this up once.

---

## Step 1 — Create a free Resend account & API key

1. Go to <https://resend.com> and sign up (free tier: 3,000 emails/month).
2. In the Resend dashboard, open **API Keys → Create API Key**.
3. Copy the key (it starts with `re_`). Keep it handy for Step 3.

> **Sender address:** For a quick start you can send *from*
> `onboarding@resend.dev` with no extra setup. To send from your own domain
> (e.g. `leads@qualscan.com`) add and verify the domain in Resend → **Domains**.

---

## Step 2 — Deploy the `notify-lead` Edge Function

**Option A — Supabase Dashboard (no tools to install):**
1. Supabase Dashboard → **Edge Functions** → **Create a function**.
2. Name it exactly `notify-lead`.
3. Paste the contents of `supabase/functions/notify-lead/index.ts` from this repo.
4. Turn **off** "Enforce JWT verification" (the database webhook calls it
   without a user token). Deploy.

**Option B — Supabase CLI (if you have it):**
```bash
supabase functions deploy notify-lead --no-verify-jwt
```

---

## Step 3 — Add the secrets (your keys)

Supabase Dashboard → **Edge Functions → notify-lead → Secrets** (or **Project
Settings → Edge Functions → Secrets**) and add:

| Name             | Value                                                        |
|------------------|--------------------------------------------------------------|
| `RESEND_API_KEY` | your Resend key from Step 1 (`re_...`)                        |
| `NOTIFY_TO`      | `Qualscanradiology@gmail.com`                                |
| `NOTIFY_FROM`    | `Qualscan Leads <onboarding@resend.dev>` (or your own domain) |

If using the CLI instead:
```bash
supabase secrets set RESEND_API_KEY=re_xxx \
  NOTIFY_TO=Qualscanradiology@gmail.com \
  "NOTIFY_FROM=Qualscan Leads <onboarding@resend.dev>"
```

---

## Step 4 — Create the Database Webhook

1. Supabase Dashboard → **Database → Webhooks** → **Create a new hook**.
2. **Name:** `on-new-lead`
3. **Table:** `leads`  ·  **Events:** check **Insert** only.
4. **Type:** **Supabase Edge Functions** → select **`notify-lead`**.
   (If only "HTTP Request" is offered, use `POST` to
   `https://<your-project-ref>.supabase.co/functions/v1/notify-lead` and add a
   header `Authorization: Bearer <your-anon-key>`.)
5. Save.

---

## Step 5 — Test it

Submit the form on your live site (or insert a test row in the Table Editor).
Within a few seconds an email should arrive at `NOTIFY_TO`.

If nothing arrives, check **Edge Functions → notify-lead → Logs** for errors
(usually a wrong `RESEND_API_KEY` or an unverified `NOTIFY_FROM` domain).
