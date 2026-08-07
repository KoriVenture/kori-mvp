import { Fraunces, IBM_Plex_Mono, Manrope } from "next/font/google";

// Kori brand type system:
//   Fraunces      — editorial display voice (headlines, mega type, stats)
//   Manrope       — body and interface
//   IBM Plex Mono — eyebrows, data labels, section markers
export const editorialFont = Fraunces({
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
  variable: "--font-fraunces",
});

export const interfaceFont = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

export const bodyFont = interfaceFont;

export const monoFont = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const fontVariables = [
  editorialFont.variable,
  interfaceFont.variable,
  monoFont.variable,
].join(" ");
