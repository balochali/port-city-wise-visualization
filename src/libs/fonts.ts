// app/fonts/font.ts
import { Lexend, Josefin_Sans, Amiri } from "next/font/google";

export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const josefin_sans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin-sans",
});

export const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
});
