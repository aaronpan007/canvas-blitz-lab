export interface PortraitStyle {
  id: string;
  label: string;
  description: string;
}

export const PORTRAIT_STYLES: PortraitStyle[] = [
  {
    id: "mono",
    label: "Mono",
    description: "black-and-white artistic portrait with dramatic lighting"
  },
  {
    id: "studio",
    label: "Studio",
    description: "clean studio portrait with professional lighting"
  },
  {
    id: "faceless",
    label: "Faceless",
    description: "mysterious portrait with obscured or turned away face"
  },
  {
    id: "urban",
    label: "Urban",
    description: "candid street-style portrait in city environment"
  },
  {
    id: "vintage",
    label: "Vintage",
    description: "cinematic portrait with classic film aesthetic"
  },
  {
    id: "indoor",
    label: "Indoor",
    description: "cozy intimate lifestyle portrait in personal space"
  },
  {
    id: "film",
    label: "Film",
    description: "full-color portrait with vintage film grain texture"
  },
  {
    id: "business",
    label: "Business",
    description: "professional corporate portrait with clean backdrop"
  }
];