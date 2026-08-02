import { Carlito, Cormorant_Garamond, Jost } from "next/font/google";

export const editorialFont = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-cormorant",
});

export const interfaceFont = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400", "500"],
  display: "swap",
  variable: "--font-jost",
});

export const bodyFont = Carlito({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--font-carlito",
});

export const fontVariables = [
  editorialFont.variable,
  interfaceFont.variable,
  bodyFont.variable,
].join(" ");
