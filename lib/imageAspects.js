// Width ÷ height of each photo frame on the public site. The admin crop step
// uses the same numbers, so a cropped photo fills its frame exactly.
// Keep in sync with the matching aspect-ratio rules in app/globals.css.
export const ASPECT = {
  gallery: 4 / 3, // .gtile img
  product: 1 / 0.82, // .swatch-art
  portrait: 1, // leader and cabinet photos (shown as circles)
  vignette: 300 / 140, // Voices & Work picture (.strip-vignette img)
  hero: 3, // wide strip under the home-page headline (.ridge)
  story: 4 / 3, // large photo in the story collage (.collage-ridge)
};
