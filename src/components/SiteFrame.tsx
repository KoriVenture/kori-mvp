import type { ReactNode } from "react";
import Script from "next/script";
import { SiteFooter } from "./SiteFooter";
import { SiteHeader } from "./SiteHeader";

type ActivePage =
  | "how-kori-works"
  | "investors"
  | "communities"
  | "founders"
  | "about"
  | "privacy"
  | "terms";

export function SiteFrame({
  children,
  active,
  ghost,
}: {
  children: ReactNode;
  active?: ActivePage;
  ghost?: boolean;
}) {
  return (
    <div className="kori-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>

      <canvas id="net" aria-hidden="true" />
      <div id="veil" aria-hidden="true" />
      {ghost ? (
        <img
          id="ghostc"
          data-src="/assets/landing-collage.webp"
          alt=""
          aria-hidden="true"
        />
      ) : null}
      <div id="cur" aria-hidden="true" />
      <div id="progress" aria-hidden="true" />

      <SiteHeader
        active={
          active === "privacy" || active === "terms" ? undefined : active
        }
      />

      <main id="main">{children}</main>

      <SiteFooter active={active} />
      <Script src="/kori.js" strategy="afterInteractive" />
    </div>
  );
}
