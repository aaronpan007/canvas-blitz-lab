import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-example.jpg";
import HeroMinimal from "@/components/HeroMinimal";

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
}

export function GeneralPage({ onPromptSelect, images, onImageUpdate }: GeneralPageProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const latest = images[0];

  const handlePresetClick = (preset: typeof presetPrompts[0]) => {
    setSelectedPreset(preset.id);
    onPromptSelect(preset.prompt);
  };

  return (
    <div className="h-full">
      {/* Hero Section */}
      <HeroMinimal />

      {/* Hidden Preset Chips - can be enabled later if needed */}
      {false && (
        <div className="w-full max-w-3xl mx-auto px-6">
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



      {/* Generated Images Grid */}
      {images.length > 1 && (
        <div className="mt-10 w-full max-w-4xl mx-auto px-6">
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