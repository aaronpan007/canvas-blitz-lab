import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-example.jpg";
import HeroMinimal from "@/components/HeroMinimal";
import AdCard from "@/components/AdCard";

const presetPrompts = [
  { id: "poster", label: "Product Poster", prompt: "Modern product poster with clean typography and professional lighting" },
  { id: "wallpaper", label: "Wallpaper", prompt: "Beautiful abstract wallpaper with vibrant colors and smooth gradients" },
  { id: "icon", label: "3D Icon", prompt: "Sleek 3D icon design with modern aesthetics and subtle shadows" },
  { id: "logo", label: "Logo Design", prompt: "Minimalist logo design with professional branding elements" },
  { id: "artwork", label: "Digital Art", prompt: "Stunning digital artwork with rich details and artistic composition" },
];

interface GeneralPageProps {
  onPromptSelect: (prompt: string) => void;
  images: string[];
  onImageUpdate: (url: string) => void;
  modelResponse: string;
  generalImages: string[];
}

export function GeneralPage({ onPromptSelect, images, onImageUpdate, modelResponse, generalImages }: GeneralPageProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const latest = images[0];

  const handlePresetClick = (preset: typeof presetPrompts[0]) => {
    setSelectedPreset(preset.id);
    onPromptSelect(preset.prompt);
  };

  return (
    <div className="h-full pb-[calc(env(safe-area-inset-bottom)+88px)] md:pb-24">
      {/* Hero Section */}
      <HeroMinimal />

      {/* 广告区块 */}
      <div className="py-8">
        <AdCard />
      </div>

      {/* Hidden Preset Chips - can be enabled later if needed */}
      {false && (
        <div className="container mx-auto px-4 max-w-screen-lg md:max-w-screen-xl">
          <h2 className="text-lg font-semibold text-foreground mb-6 text-center">
            Quick Start Presets
          </h2>
          
          <div className="flex flex-wrap gap-3 justify-center">
            {presetPrompts.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "glass-morph border-glass-border hover:bg-glass-hover transition-all duration-300",
                  "px-6 py-3 rounded-full text-sm font-medium",
                  selectedPreset === preset.id 
                    ? "border-primary text-primary glow-yellow" 
                    : "text-muted-foreground hover:text-foreground glow-blue"
                )}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>
      )}



      {/* Model Response */}
      {modelResponse && (
        <div className="mt-8 container mx-auto px-4 max-w-screen-lg md:max-w-screen-xl">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Model Response</h3>
          <div className="glass-morph p-4 rounded-xl text-center text-muted-foreground">
            {modelResponse}
          </div>
        </div>
      )}

      {/* Generated Images Grid */}
      {generalImages && generalImages.length > 0 && (
        <div className="mt-4 container mx-auto px-4 max-w-screen-lg md:max-w-screen-xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {generalImages.map((url, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden bg-neutral-900">
                <img src={url} alt={`result-${i}`} loading="lazy" className="w-full h-auto object-cover" />
                <a href={url} download={`result-${i}.png`} 
                   className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition 
                              text-xs px-2 py-1 rounded bg-black/60">Download</a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Generations */}
      {images.length > 1 && (
        <div className="mt-10 container mx-auto px-4 max-w-screen-lg md:max-w-screen-xl pb-8">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">Recent Generations</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {images.slice(1).map((url, i) => (
              <img 
                key={i} 
                src={url} 
                alt={`Generated ${i + 1}`}
                className="w-full h-40 object-cover rounded-xl glass-morph cursor-pointer hover:scale-105 transition-transform duration-300"
                onClick={() => onImageUpdate(url)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}