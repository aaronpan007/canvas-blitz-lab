// Portrait风格模板定义
// 每个模板包含预设的稳定提示词，用于生成特定风格的头像

export interface PortraitTemplate {
  id: string;
  label: string;
  prompt: string;
}

export const PORTRAIT_TEMPLATES: PortraitTemplate[] = [
  {
    id: "mono",
    label: "Mono",
    prompt: "black-and-white artistic portrait with dramatic lighting, do not copy reference background, identity loosely preserved"
  },
  {
    id: "studio",
    label: "Studio",
    prompt: "clean studio portrait with professional lighting, neutral background, do not copy reference background"
  },
  {
    id: "faceless",
    label: "Faceless",
    prompt: "mysterious portrait with obscured or turned away face, rim light, cinematic vibe, do not copy reference background"
  },
  {
    id: "urban",
    label: "Urban",
    prompt: "candid street-style portrait in city environment, natural lighting, do not copy reference background"
  },
  {
    id: "vintage",
    label: "Vintage",
    prompt: "cinematic portrait with classic film aesthetic, film grain, warm tone, do not copy reference background"
  },
  {
    id: "indoor",
    label: "Indoor",
    prompt: "cozy intimate lifestyle portrait in personal space, soft natural lighting, do not copy reference background"
  },
  {
    id: "film",
    label: "Film",
    prompt: "full-color portrait with vintage film grain texture, organic warmth, do not copy reference background"
  },
  {
    id: "business",
    label: "Business",
    prompt: "professional corporate portrait with clean backdrop, controlled lighting, do not copy reference background"
  }
];