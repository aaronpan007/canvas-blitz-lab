import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  Sparkles, 
  Plus, 
  Square, 
  Send,
  X,
  Image as ImageIcon 
} from "lucide-react";

interface BottomDockProps {
  onGenerate: (prompt: string) => void;
}

export function BottomDock({ onGenerate }: BottomDockProps) {
  const [prompt, setPrompt] = useState("");
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    try {
      await onGenerate(prompt);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePolish = () => {
    // Auto-polish the prompt
    const polishedPrompt = `Create a high-quality, professional ${prompt.toLowerCase()}, ultra detailed, beautiful lighting, trending on artstation`;
    setPrompt(polishedPrompt);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setAttachedImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Attached Images Preview */}
        {attachedImages.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
            {attachedImages.map((image, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="w-16 h-16 rounded-lg glass-morph overflow-hidden">
                  <img 
                    src={image} 
                    alt={`Reference ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:bg-destructive/80"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Main Dock */}
        <div className="glass-morph rounded-2xl p-4 glow-blue">
          <div className="flex items-end gap-3">
            {/* Text Input */}
            <div className="flex-1">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to create..."
                className="min-h-[52px] max-h-32 resize-none bg-input/50 border-glass-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault();
                    handleGenerate();
                  }
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              {/* Polish Button (Diamond) */}
              <Button
                variant="outline"
                size="icon"
                onClick={handlePolish}
                className="w-10 h-10 rounded-lg glass-morph border-accent glow-blue hover:bg-glass-hover transform rotate-45"
                disabled={!prompt.trim()}
              >
                <Sparkles className="w-4 h-4 transform -rotate-45" />
              </Button>

              {/* Image Upload Button */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="icon"
                  className="w-10 h-10 rounded-lg glass-morph glow-blue hover:bg-glass-hover"
                >
                  <Plus className="w-4 h-4" />
                </Button>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>

              {/* Canvas Button */}
              <Button
                variant="outline"
                size="icon"
                className="w-10 h-10 rounded-lg glass-morph glow-blue hover:bg-glass-hover"
              >
                <Square className="w-4 h-4" />
              </Button>

              {/* Generate Button */}
              <Button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className={cn(
                  "px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all",
                  "shadow-glow-yellow hover:shadow-glow-yellow",
                  isGenerating && "animate-pulse"
                )}
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                    GENERATING
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    GENERATE
                  </div>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcut Hint */}
        <div className="mt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 bg-muted rounded text-muted-foreground">Ctrl + Enter</kbd> to generate
          </p>
        </div>
      </div>
    </div>
  );
}