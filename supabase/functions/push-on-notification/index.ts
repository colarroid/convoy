// Supabase Edge Function — fans a notification out to TWO channels whenever a
// row is inserted into `notifications`: a OneSignal push AND a Resend email.
// Triggered by a Database Webhook (notifications INSERT).
//
// Each channel respects the recipient's preference (user_settings):
//   push_notifications → the OneSignal push
//   email_updates      → the Resend email
// Both fail-open and are independent — one failing never blocks the other.
//
// Deploy:   supabase functions deploy push-on-notification --no-verify-jwt
// Secrets:  supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=... RESEND_API_KEY=re_...
// Webhook:  Database → Webhooks → on table `notifications`, event INSERT → this function.
//
// The row is created server-side by the trip RPCs, so the recipient + content
// are trustworthy — the client never decides who gets notified.

// deno-lint-ignore-file no-explicit-any

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function emailHtml(title: string, body: string, link: string): string {
  return `
  <div style="background:#f4f4f5;padding:24px;font-family:Arial,Helvetica,sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <div style="background:#000000;padding:20px;text-align:center;">
        <span style="color:#ffffff;font-weight:bold;letter-spacing:3px;font-size:18px;">VEESAA</span>
      </div>
      <div style="padding:28px 24px;">
        <h1 style="font-size:18px;color:#111111;margin:0 0 8px;">${esc(title)}</h1>
        ${body ? `<p style="font-size:14px;color:#555555;line-height:1.5;margin:0 0 20px;">${esc(body)}</p>` : ''}
        <a href="${link}" style="display:inline-block;background:#000000;color:#ffffff;text-decoration:none;font-size:14px;font-weight:600;padding:12px 20px;border-radius:8px;">View in Veesaa</a>
        <p style="font-size:12px;color:#999999;margin:24px 0 0;line-height:1.5;">You're receiving this because email updates are on. Turn them off any time in your Veesaa profile settings.</p>
      </div>
    </div>
  </div>`
}

Deno.serve(async (req: Request) => {
  try {
    const record = (await req.json())?.record
    if (!record?.user_id || !record?.title) {
      return new Response('ignored', { status: 200 })
    }

    const SB_URL = Deno.env.get('SUPABASE_URL')
    const SB_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    // Recipient preferences (both channels). Fail-open: default on.
    let pushOn = true
    let emailOn = true
    if (SB_URL && SB_KEY) {
      try {
        const r = await fetch(
          `${SB_URL}/rest/v1/user_settings?user_id=eq.${record.user_id}&select=push_notifications,email_updates`,
          { headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` } },
        )
        const rows = await r.json()
        if (Array.isArray(rows) && rows[0]) {
          pushOn = rows[0].push_notifications !== false
          emailOn = rows[0].email_updates !== false
        }
      } catch { /* fail-open */ }
    }

    // ── Channel 1: OneSignal push ──
    const APP_ID = Deno.env.get('ONESIGNAL_APP_ID')
    const REST_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')
    if (pushOn && APP_ID && REST_KEY) {
      try {
        await fetch('https://api.onesignal.com/notifications', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Key ${REST_KEY}` },
          body: JSON.stringify({
            app_id: APP_ID,
            target_channel: 'push',
            include_aliases: { external_id: [record.user_id] },
            headings: { en: record.title },
            contents: { en: record.body ?? '' },
            ...(record.url ? { url: record.url } : {}),
          }),
        })
      } catch { /* push failure shouldn't block email */ }
    }

    // ── Channel 2: Resend email ──
    const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
    if (emailOn && RESEND_KEY && SB_URL && SB_KEY) {
      try {
        // Recipient email lives in auth.users → fetch via the admin API.
        const ur = await fetch(`${SB_URL}/auth/v1/admin/users/${record.user_id}`, {
          headers: { apikey: SB_KEY, Authorization: `Bearer ${SB_KEY}` },
        })
        const email = (await ur.json())?.email
        if (email) {
          const link = record.url ? `https://veesaa.co${record.url}` : 'https://veesaa.co'
          await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: { Authorization: `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              from: 'Veesaa <noreply@veesaa.co>',
              to: [email],
              subject: record.title,
              html: emailHtml(record.title, record.body ?? '', link),
            }),
          })
        }
      } catch { /* email failure shouldn't 500 the webhook */ }
    }

    return new Response('ok', { status: 200 })
  } catch (e) {
    return new Response(`error: ${(e as any)?.message ?? e}`, { status: 500 })
  }
})
