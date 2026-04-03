"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { getConsent } from "@/lib/consent";

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

/**
 * Loads Google Analytics and Vercel Analytics only when consent is "granted".
 * Rendered once in the root layout — the cookie banner triggers a reload on accept.
 */
export function Analytics() {
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    setConsented(getConsent() === "granted");
  }, []);

  return (
    <>
      {/* Vercel Analytics — respects consent */}
      {consented && <VercelAnalytics />}

      {/* Google Analytics 4 — consent-gated */}
      {consented && GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('consent', 'default', { analytics_storage: 'granted' });
              gtag('config', '${GA_ID}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}
    </>
  );
}
