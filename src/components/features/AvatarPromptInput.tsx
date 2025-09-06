import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Sparkles, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarPromptInputProps {
  onGenerate: (prompt: string, referenceImages: string[]) => void;
  isGenerating: boolean;
}

const quickPrompts = [
  "professional headshot",
  "artistic portrait",
  "fantasy character",
  "cyberpunk style",
  "vintage photo",
  "cartoon avatar"
];

const AvatarPromptInput: React.FC<AvatarPromptInputProps> = ({ onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState("");
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setReferenceImages(prev => [...prev, result]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
  };

  const handlePolish = async () => {
    if (!prompt.trim()) return;
    
    try {
      const response = await fetch('/api/avatar/polish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim() })
      });
      
      if (response.ok) {
        const data = await response.json();
        setPrompt(data.polishedPrompt || prompt);
      }
    } catch (error) {
      console.error('Polish failed:', error);
    }
  };

  const addQuickPrompt = (quickPrompt: string) => {
    setPrompt(prev => prev ? `${prev}, ${quickPrompt}` : quickPrompt);
  };

  const handleGenerate = () => {
    if (prompt.trim()) {
      onGenerate(prompt.trim(), referenceImages);
    }
  };

  return (
    <div className="space-y-4">
      {/* Reference Images */}
      {referenceImages.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">参考图片</label>
          <div className="flex flex-wrap gap-2">
            {referenceImages.map((image, index) => (
              <div key={index} className="relative group">
                <img 
                  src={image} 
                  alt={`Reference ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Prompts */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">快捷提示</label>
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((quickPrompt) => (
            <Badge 
              key={quickPrompt}
              variant="secondary" 
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => addQuickPrompt(quickPrompt)}
            >
              <Plus className="w-3 h-3 mr-1" />
              {quickPrompt}
            </Badge>
          ))}
        </div>
      </div>

      {/* Main Input Area */}
      <div className="space-y-3">
        <div className="relative">
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="描述你想要的头像风格，例如：专业商务头像，温暖的笑容，现代办公室背景..."
            className="min-h-[100px] resize-none pr-12 glass-morph border-border/50 focus:border-accent"
          />
          <Button
            size="sm"
            variant="ghost"
            onClick={handlePolish}
            className="absolute top-2 right-2 h-8 w-8 p-0 hover:bg-accent/20"
            disabled={!prompt.trim() || isGenerating}
          >
            <Sparkles className="w-4 h-4" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isGenerating}
            className="glass-morph border-border/50 hover:border-accent"
          >
            <Upload className="w-4 h-4 mr-2" />
            上传参考图
          </Button>
          
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className={cn(
              "flex-1 glass-morph border border-accent/50",
              "bg-gradient-to-r from-accent/20 to-accent/10",
              "hover:from-accent/30 hover:to-accent/20",
              "text-accent-foreground font-medium",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
                生成中...
              </>
            ) : (
              "生成头像"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AvatarPromptInput;