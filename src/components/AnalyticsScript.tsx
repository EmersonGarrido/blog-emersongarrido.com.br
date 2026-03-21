'use client'

import Script from 'next/script'

export function AnalyticsScript() {
  return (
    <>
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-9653ZSLQ7R"
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-9653ZSLQ7R');
        `}
      </Script>
    </>
  )
}
