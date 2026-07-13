// ============================================================
// QUALSCAN — "notify-lead" Supabase Edge Function
// ------------------------------------------------------------
// Sends an email notification whenever a new row is inserted
// into the `leads` table. It is triggered by a Supabase
// Database Webhook (Database -> Webhooks) on INSERT.
//
// Email is delivered via Resend (https://resend.com).
//
// Required secrets (set with `supabase secrets set ...` or in
// Dashboard -> Edge Functions -> notify-lead -> Secrets):
//   RESEND_API_KEY   your Resend API key (starts with "re_")
//   NOTIFY_TO        recipient address (e.g. Qualscanradiology@gmail.com)
//   NOTIFY_FROM      verified sender, e.g. "Qualscan <leads@yourdomain.com>"
//                    (for quick testing you can use "onboarding@resend.dev")
// ============================================================

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
const NOTIFY_TO = Deno.env.get("NOTIFY_TO") ?? "Qualscanradiology@gmail.com";
const NOTIFY_FROM = Deno.env.get("NOTIFY_FROM") ?? "Qualscan Leads <onboarding@resend.dev>";

function esc(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function row(label: string, value: unknown): string {
  return `<tr>
    <td style="padding:6px 14px;color:#6b7280;font-size:13px;white-space:nowrap;vertical-align:top;">${label}</td>
    <td style="padding:6px 14px;color:#111827;font-size:14px;font-weight:500;">${esc(value)}</td>
  </tr>`;
}

Deno.serve(async (req) => {
  try {
    const payload = await req.json();
    // Database webhooks send { type, table, record, ... }
    const lead = payload?.record ?? payload ?? {};

    const name =
      lead.full_name ||
      [lead.first_name, lead.last_name].filter(Boolean).join(" ") ||
      "New enquiry";

    const subject = `New Qualscan enquiry — ${name}` +
      (lead.source ? ` (${lead.source})` : "");

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;">
        <div style="background:#004e59;padding:18px 22px;border-radius:12px 12px 0 0;">
          <h2 style="margin:0;color:#fff;font-size:18px;">New Website Enquiry</h2>
          <p style="margin:4px 0 0;color:#b9dde1;font-size:13px;">
            Submitted via the ${esc(lead.source || "website")} form
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse;background:#fff;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 12px 12px;">
          ${row("Name", name)}
          ${row("Email", lead.email)}
          ${row("Phone", lead.phone)}
          ${row("Organization", lead.organization)}
          ${row("Region", lead.region)}
          ${row("Role", lead.role)}
          ${row("Interested in", lead.interest)}
          ${row("Message", lead.message)}
          ${row("Received", lead.created_at || new Date().toISOString())}
        </table>
        <p style="color:#9ca3af;font-size:12px;margin:14px 2px 0;">
          Reply directly to ${esc(lead.email)} to follow up with this lead.
        </p>
      </div>`;

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: NOTIFY_FROM,
        to: [NOTIFY_TO],
        subject,
        html,
        reply_to: lead.email || undefined,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend error:", resendRes.status, errText);
      return new Response(
        JSON.stringify({ ok: false, status: resendRes.status, error: errText }),
        { status: 502, headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("notify-lead error:", err);
    return new Response(
      JSON.stringify({ ok: false, error: String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
});
