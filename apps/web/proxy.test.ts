// @vitest-environment node

import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import proxy, { config } from "./proxy";

describe("locale proxy", () => {
  it("redirects the root using a supported browser preference", () => {
    const response = proxy(
      new NextRequest("http://localhost/", {
        headers: { "accept-language": "fr-CA,fr;q=0.9,en;q=0.8" },
      }),
    );

    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("http://localhost/fr");
  });

  it("excludes APIs, internals and file assets", () => {
    const matcher = JSON.stringify(config.matcher);

    expect(matcher).toContain("api");
    expect(matcher).toContain("_next");
    expect(matcher).toContain(".*\\\\..*");
  });

  it("redirects historical pages using the selected locale cookie", () => {
    const response = proxy(
      new NextRequest("http://localhost/success-stories.html", {
        headers: { cookie: "NEXT_LOCALE=fr" },
      }),
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("location")).toBe(
      "http://localhost/fr/stories",
    );
  });

  it("redirects historical pages using browser negotiation and English fallback", () => {
    const spanishResponse = proxy(
      new NextRequest("http://localhost/capital-map.html", {
        headers: { "accept-language": "es-MX,es;q=0.9,en;q=0.7" },
      }),
    );
    const fallbackResponse = proxy(
      new NextRequest("http://localhost/fund-manager-dashboard.html", {
        headers: { "accept-language": "de-DE,de;q=0.9" },
      }),
    );

    expect(spanishResponse.headers.get("location")).toBe(
      "http://localhost/es/capital-map",
    );
    expect(fallbackResponse.headers.get("location")).toBe(
      "http://localhost/en/dashboard/fund-manager",
    );
  });
});
