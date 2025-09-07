import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { 
  Sparkles, 
  User,
  Upload,
  Wand2
} from "lucide-react";

interface PortraitPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onGenerate: () => void;
  loading?: boolean;
}

export default function PortraitPromptInput({ 
  value, 
  onChange, 
  onGenerate, 
  loading = false 
}: PortraitPromptInputProps) {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setReferenceImage(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReferenceImage = () => {
    setReferenceImage(null);
  };

  const handlePolish = async () => {
    if (!value.trim()) return;
    
    try {
      const response = await fetch("/api/avatar/polish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: value })
      });
      
      const data = await response.json();
      if (data?.prompt) {
        onChange(data.prompt);
      }
    } catch (error) {
      console.error('Polish failed:', error);
    }
  };


  
  // 快速提示词已删除

  return (
    <div className="w-full space-y-4">
      {/* Reference Image Preview */}
      {referenceImage && (
        <div className="flex items-center gap-3 p-3 glass-morph rounded-xl">
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-neutral-800">
            <img 
              src={referenceImage} 
              alt="Reference" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground font-medium">参考图片</p>
            <p className="text-xs text-muted-foreground">AI将基于此图片生成头像</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={removeReferenceImage}
            className="text-destructive hover:text-destructive"
          >
            移除
          </Button>
        </div>
      )}

      {/* 快速提示词标签已删除 */}

      {/* Main Input Area */}
      <div className="glass-morph rounded-xl p-4 glow-blue">
        <div className="flex items-end gap-3">
          {/* Text Input */}
          <div className="flex-1">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="描述你想要的头像风格，例如：一个微笑的年轻女性，棕色长发，穿着白色衬衫，专业头像风格..."
              className="min-h-[80px] max-h-32 resize-none bg-input/50 border-glass-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  onGenerate();
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2">
            {/* Upload Reference Image */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
              />
              <Button
                variant="outline"
                size="icon"
                className={cn(
                  "w-10 h-10 rounded-lg glass-morph border-accent glow-blue hover:bg-glass-hover",
                  referenceImage && "border-primary text-primary"
                )}
                asChild
              >
                <div>
                  <Upload className="h-4 w-4" />
                </div>
              </Button>
            </label>

            {/* Polish Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handlePolish}
              disabled={!value.trim()}
              className="w-10 h-10 rounded-lg glass-morph border-accent glow-blue hover:bg-glass-hover disabled:opacity-50"
            >
              <Wand2 className="h-4 w-4" />
            </Button>

            {/* Generate Button */}
            <Button
              onClick={onGenerate}
              disabled={loading || !value.trim()}
              className={cn(
                "w-10 h-10 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90",
                "disabled:opacity-50 glow-yellow transition-all duration-300"
              )}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <User className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Helper Text */}
        <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>💡 提示：描述越详细，生成的头像越符合预期</span>
          <span>Ctrl/Cmd + Enter 快速生成</span>
        </div>
      </div>
    </div>
  );
}