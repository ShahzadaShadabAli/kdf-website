export const SiteSettingsShape = {
  _id: "singleton",
  heroHeadline: "string",
  heroSubtext: "string",
  logo: "{url,alt,width,height} | null", // header logo + favicon
  heroImage: "{url,alt,width,height} | null",
  storyImage: "{url,alt,width,height} | null",
  whatsappNumber: "string",
  contactEmail: "string",
  address: "string",
  mapLat: "number | null", // exact map pin, takes priority over address search
  mapLng: "number | null",
  bankName: "string",
  accountTitle: "string",
  accountNumber: "string",
  iban: "string",
  branchName: "string",
  facebookUrl: "string",
  instagramUrl: "string",
  whatsappUrl: "string",
  linkedinUrl: "string",
  updatedAt: "Date",
  updatedBy: "string",
};

export const SITE_SETTINGS_ID = "singleton";
