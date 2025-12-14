// app/fonts/font.ts
import { Lexend, Josefin_Sans } from "next/font/google";

export const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
});

export const josefin_sans = Josefin_Sans({
  subsets: ["latin"],
  variable: "--font-josefin-sans",
});
