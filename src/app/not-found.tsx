import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page not found — Kori",
  description: "The requested Kori page could not be found.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="legacy-not-found">
      <main>
        <p className="eyebrow">404 / Outside the network</p>
        <h1>This path doesn&apos;t lead anywhere yet.</h1>
        <p>The page may have moved, or the connection has not been built.</p>
        <div>
          <a className="button" href="/">
            Return home
          </a>
          <a className="text-cta" href="/how-kori-works">
            Explore how Kori works →
          </a>
        </div>
      </main>
    </div>
  );
}
