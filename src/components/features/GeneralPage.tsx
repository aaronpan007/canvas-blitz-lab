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
  modelResponse: string;
}

export function GeneralPage({ onPromptSelect, modelResponse }: GeneralPageProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

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


    </div>
  );
}