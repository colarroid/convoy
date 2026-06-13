// Supabase Edge Function — sends a OneSignal push whenever a row is inserted
// into `notifications`. Triggered by a Database Webhook (notifications INSERT).
//
// Deploy:   supabase functions deploy push-on-notification --no-verify-jwt
// Secrets:  supabase secrets set ONESIGNAL_APP_ID=... ONESIGNAL_REST_API_KEY=...
// Webhook:  Database → Webhooks → create on table `notifications`, event INSERT,
//           type "Supabase Edge Function" → push-on-notification.
//
// Because the row is created server-side by the trip RPCs, the recipient and
// content are trustworthy — the client never decides who gets notified.

// deno-lint-ignore-file no-explicit-any
Deno.serve(async (req: Request) => {
  try {
    const APP_ID = Deno.env.get('ONESIGNAL_APP_ID')
    const REST_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')
    if (!APP_ID || !REST_KEY) {
      return new Response('OneSignal env not set', { status: 500 })
    }

    const payload = await req.json()
    const record = payload?.record
    if (!record?.user_id || !record?.title) {
      return new Response('ignored', { status: 200 })
    }

    const res = await fetch('https://api.onesignal.com/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Key ${REST_KEY}`,
      },
      body: JSON.stringify({
        app_id: APP_ID,
        target_channel: 'push',
        include_aliases: { external_id: [record.user_id] },
        headings: { en: record.title },
        contents: { en: record.body ?? '' },
        ...(record.url ? { url: record.url } : {}),
      }),
    })

    const text = await res.text()
    return new Response(text, { status: res.ok ? 200 : 502 })
  } catch (e) {
    return new Response(`error: ${(e as any)?.message ?? e}`, { status: 500 })
  }
})
