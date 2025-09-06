export interface AvatarStyle {
  id: string;
  label: string;
  desc: string;
}

export const AVATAR_STYLES: AvatarStyle[] = [
  {
    id: "mono",
    label: "Mono",
    desc: "black-and-white artistic portrait with dramatic lighting"
  },
  {
    id: "studio",
    label: "Studio",
    desc: "clean studio portrait with professional lighting"
  },
  {
    id: "faceless",
    label: "Faceless",
    desc: "mysterious portrait with obscured or turned away face"
  },
  {
    id: "urban",
    label: "Urban",
    desc: "candid street-style portrait in city environment"
  },
  {
    id: "vintage",
    label: "Vintage",
    desc: "cinematic portrait with classic film aesthetic"
  },
  {
    id: "indoor",
    label: "Indoor",
    desc: "cozy intimate lifestyle portrait in personal space"
  },
  {
    id: "film",
    label: "Film",
    desc: "full-color portrait with vintage film grain texture"
  },
  {
    id: "business",
    label: "Business",
    desc: "professional corporate portrait with clean backdrop"
  }
];