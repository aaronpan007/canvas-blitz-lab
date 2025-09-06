import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import AvatarPromptInput from "./AvatarPromptInput";

const avatarStyles = [
  { id: "realistic", name: "写实风格", description: "真实感强的头像" },
  { id: "anime", name: "动漫风格", description: "日系动漫头像" },
  { id: "artistic", name: "艺术风格", description: "艺术化处理" },
  { id: "professional", name: "商务风格", description: "职业正装头像" },
  { id: "casual", name: "休闲风格", description: "轻松自然头像" },
  { id: "fantasy", name: "奇幻风格", description: "魔幻主题头像" }
];

interface AvatarPageProps {
  onPromptSelect: (prompt: string) => void;
  images: string[];
  onImageUpdate: (url: string) => void;
}

export const AvatarPage: React.FC<AvatarPageProps> = ({ onPromptSelect, images, onImageUpdate }) => {
  const [selectedStyle, setSelectedStyle] = useState("realistic");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (prompt: string, referenceImages: string[]) => {
    setIsGenerating(true);
    
    try {
      // 使用第一个参考图片作为imageUrl，如果没有则为空字符串
      const imageUrl = referenceImages.length > 0 ? referenceImages[0] : "";
      
      const response = await fetch('/api/avatar/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          styleId: selectedStyle,
          imageUrl: imageUrl,
          promptAddon: prompt
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.image) {
          onImageUpdate(data.image);
          onPromptSelect(prompt);
        }
      } else {
        console.error('Generation failed:', response.statusText);
      }
    } catch (error) {
      console.error('Generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b border-border/50">
        <h1 className="text-2xl font-bold text-foreground mb-2">AI 头像生成</h1>
        <p className="text-muted-foreground">选择风格，上传参考图片，生成个性化头像</p>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Controls */}
        <div className="w-96 flex-shrink-0 p-6 border-r border-border/50 overflow-y-auto">
          {/* Style Selection */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-foreground">选择风格</h3>
            <div className="grid grid-cols-2 gap-2">
              {avatarStyles.map((style) => (
                <Button
                  key={style.id}
                  variant={selectedStyle === style.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedStyle(style.id)}
                  className={cn(
                    "h-auto p-3 flex flex-col items-start text-left",
                    selectedStyle === style.id 
                      ? "bg-accent text-accent-foreground border-accent" 
                      : "glass-morph border-border/50 hover:border-accent"
                  )}
                >
                  <div className="font-medium">{style.name}</div>
                  <div className="text-xs opacity-70">{style.description}</div>
                </Button>
              ))}
            </div>
          </div>

          {/* Input Component */}
          <AvatarPromptInput 
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>

        {/* Right Panel - Results */}
        <div className="flex-1 p-6 overflow-y-auto">
          {images.length > 0 ? (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">生成结果</h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="group relative">
                    <img 
                      src={image} 
                      alt={`Generated avatar ${index + 1}`}
                      className="w-full aspect-square object-cover rounded-lg border border-border/50 hover:border-accent transition-colors"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => window.open(image, '_blank')}
                      >
                        查看大图
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center glass-morph p-8 rounded-xl">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent/20 flex items-center justify-center">
                  <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">开始创建你的头像</h3>
                <p className="text-muted-foreground">选择风格，输入描述，生成个性化AI头像</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarPage;