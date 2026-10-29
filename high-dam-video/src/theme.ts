import { loadFont } from "@remotion/fonts";
import { Easing, staticFile } from "remotion";

// Cairo variable font (Google Fonts, OFL), bundled locally so renders work offline.
export const fontFamily = "Cairo";

loadFont({
  family: fontFamily,
  url: staticFile("fonts/Cairo-arabic.woff2"),
  weight: "200 1000",
  unicodeRange:
    "U+0600-06FF, U+0750-077F, U+0870-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FEFC",
});
loadFont({
  family: fontFamily,
  url: staticFile("fonts/Cairo-latin.woff2"),
  weight: "200 1000",
  unicodeRange:
    "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
});

export const colors = {
  night: "#06121f",
  deep: "#0b2236",
  water: "#1e88e5",
  waterLight: "#4fc3f7",
  concrete: "#9aa5b1",
  concreteDark: "#616e7c",
  sand: "#d9b47a",
  energy: "#ffd54f",
  energyHot: "#ffb300",
  copper: "#e08a4f",
  text: "#f5f7fa",
  muted: "#b8c4d0",
};

export const clamp = {
  extrapolateLeft: "clamp",
  extrapolateRight: "clamp",
} as const;

export const smooth = Easing.bezier(0.16, 1, 0.3, 1);
export const pop = Easing.spring({ damping: 14 });
