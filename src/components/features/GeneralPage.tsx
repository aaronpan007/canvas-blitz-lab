import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import heroImage from "@/assets/hero-example.jpg";

const presetPrompts = [
  { id: "poster", label: "Product Poster", prompt: "Modern product poster with clean typography and professional lighting" },
  { id: "wallpaper", label: "Wallpaper", prompt: "Beautiful abstract wallpaper with vibrant colors and smooth gradients" },
  { id: "icon", label: "3D Icon", prompt: "Sleek 3D icon design with modern aesthetics and subtle shadows" },
  { id: "logo", label: "Logo Design", prompt: "Minimalist logo design with professional branding elements" },
  { id: "artwork", label: "Digital Art", prompt: "Stunning digital artwork with rich details and artistic composition" },
];

interface GeneralPageProps {
  onPromptSelect: (prompt: string) => void;
}

export function GeneralPage({ onPromptSelect }: GeneralPageProps) {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const handlePresetClick = (preset: typeof presetPrompts[0]) => {
    setSelectedPreset(preset.id);
    onPromptSelect(preset.prompt);
  };

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6">
      {/* Hero Section */}
      <div className="text-center mb-12">
        {/* Hero Image with Glass Overlay */}
        <div className="relative mb-8 group cursor-pointer">
          <div className="w-80 h-48 mx-auto rounded-2xl overflow-hidden glass-morph">
            <img 
              src={heroImage}
              alt="AI Generated Example"
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Glass overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            <div className="absolute inset-0 glass-morph opacity-20" />
          </div>
          
          {/* Floating label */}
          <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2">
            <div className="px-4 py-2 glass-morph rounded-full border border-primary/30">
              <span className="text-sm font-medium text-primary">AI Generated</span>
            </div>
          </div>
        </div>

        {/* Hero Text */}
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          Everything Starts{" "}
          <span className="bg-gradient-accent bg-clip-text text-transparent">
            Here
          </span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Enter a prompt and create your first masterpiece with our advanced AI generation engine
        </p>
      </div>

      {/* Preset Chips */}
      <div className="w-full max-w-3xl">
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

        {/* Instructions */}
        <div className="mt-12 text-center">
          <div className="glass-morph rounded-xl p-6 max-w-md mx-auto">
            <h3 className="font-semibold text-foreground mb-2">Get Started</h3>
            <p className="text-sm text-muted-foreground">
              Click a preset above to auto-fill the prompt, or type your own creative description in the input below.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}