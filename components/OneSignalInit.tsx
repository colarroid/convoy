'use client'

import Script from 'next/script'

const APP_ID = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID

/**
 * Loads and initialises the OneSignal Web SDK (v16).
 * The service worker lives at /public/OneSignalSDKWorker.js (served from the
 * site root). App ID is public and read from NEXT_PUBLIC_ONESIGNAL_APP_ID.
 */
export default function OneSignalInit() {
  if (!APP_ID) return null

  return (
    <>
      <Script
        src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
        strategy="afterInteractive"
        defer
      />
      <Script id="onesignal-init" strategy="afterInteractive">
        {`
          window.OneSignalDeferred = window.OneSignalDeferred || [];
          OneSignalDeferred.push(async function (OneSignal) {
            await OneSignal.init({
              appId: "${APP_ID}",
              allowLocalhostAsSecureOrigin: true,
            });
          });
        `}
      </Script>
    </>
  )
}
