import googlefonts from "./google-fonts-latest.min";

export function findwithFontname(fontname: {
  family: string;
  style?: string | null | undefined;
}) {
  return googlefonts.find((f) => {
    const _matches_fam = f.family === fontname.family;
    if (_matches_fam) {
    }
    return f;
  });
  //
}

googlefonts.map((d) => {
  d.family;
});
