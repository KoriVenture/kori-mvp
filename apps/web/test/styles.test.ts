import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const sharedCssPath = resolve(
  process.cwd(),
  "../../packages/ui/src/styles/globals.css",
);
const appCssPath = resolve(process.cwd(), "app/globals.css");

describe("Kori shared styles", () => {
  it("keeps the audited palette available through centralized source tokens", async () => {
    const css = (await readFile(sharedCssPath, "utf8")).toLowerCase();

    for (const color of [
      "#0d0d0b",
      "#1a1916",
      "#222220",
      "#2a2824",
      "#3a3830",
      "#c9913a",
      "#e8b86a",
      "#5a3a0a",
      "#1d6e52",
      "#2da076",
      "#5dd4a4",
      "#0b3828",
      "#f5f2ec",
      "#c4c0b8",
      "#8a7a60",
      "#6a6058",
    ]) {
      expect(css).toContain(color);
    }
  });

  it("exposes the canonical runtime aliases and data-theme contract", async () => {
    const css = (await readFile(sharedCssPath, "utf8")).toLowerCase();

    for (const token of [
      "--kori-bg-primary:",
      "--kori-bg-secondary:",
      "--kori-bg-tertiary:",
      "--kori-bg-rim:",
      "--kori-bg-rim-strong:",
      "--kori-cowrie-gold:",
      "--kori-growth-teal:",
      "--kori-card-bg:",
      "--kori-section-alt:",
      "--kori-nav-bg:",
      "--font-display:",
      "--font-edit:",
      "--font-body:",
      "--font-mono:",
    ]) {
      expect(css).toContain(token);
    }

    expect(css).toContain('[data-theme="dark"]');
    expect(css).not.toContain("@custom-variant dark (&:is(.dark *));");
  });

  it("preserves the one-pixel hairline grid behavior", async () => {
    const css = await readFile(sharedCssPath, "utf8");

    expect(css).toMatch(/\.hairline-grid\s*\{[\s\S]*?gap:\s*1px/);
    expect(css).toMatch(
      /\.hairline-grid\s*>\s*\*\s*\{[\s\S]*?background:\s*var\(--kori-bg-primary\)/,
    );
  });

  it("preserves the app-to-package global CSS boundary", async () => {
    await expect(readFile(appCssPath, "utf8")).resolves.toContain(
      '@import "@kori/ui/globals.css";',
    );
  });

  it("provides accessible type, focus, motion and responsive foundations", async () => {
    const css = await readFile(sharedCssPath, "utf8");

    expect(css).toContain(":focus-visible");
    expect(css).toContain("prefers-reduced-motion");
    expect(css).toContain("--font-editorial");
    expect(css).toContain("--font-interface");
    expect(css).toContain("--font-body");
    expect(css).toContain("--font-data");
    expect(css).toContain(".text-kori-display");
    expect(css).toContain(".text-kori-financial");
    expect(css).toContain(".text-kori-technical");
    expect(css).toContain("64rem");
    expect(css).toContain("48rem");
    expect(css).toContain("24.375rem");
  });

  it("does not reference undefined shared CSS variables", async () => {
    const css = await readFile(sharedCssPath, "utf8");
    const declarations = new Set(
      [...css.matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((match) => match[1]),
    );
    const references = [...css.matchAll(/var\((--[a-z0-9-]+)/gi)].map(
      (match) => match[1],
    );
    const nextFontVariables = new Set([
      "--font-cormorant",
      "--font-jost",
      "--font-carlito",
    ]);

    expect(
      references.filter(
        (reference) =>
          !declarations.has(reference) && !nextFontVariables.has(reference),
      ),
    ).toEqual([]);
  });
});
