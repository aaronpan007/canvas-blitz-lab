import { useState, useRef } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomDock } from "@/components/layout/BottomDock";
import { GeneralPage } from "@/components/features/GeneralPage";
import { PortraitPage } from "@/features/portrait/PortraitPage";

import ChatThread, { ChatMessage } from "@/components/ChatThread";
import { toast } from "sonner";

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState("general");
  const [prompt, setPrompt] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);
  const mainRef = useRef<HTMLDivElement | null>(null);
  
  // 对话状态管理
  const [thread, setThread] = useState<ChatMessage[]>([]);
  const lastAssistant = [...thread].reverse().find(m => m.role === "assistant") as any;
  const lastImageUrl = lastAssistant?.imageUrl as string | undefined;
  
  // Portrait功能的独立状态管理
  const [portraitImages, setPortraitImages] = useState<string[]>([]);
  
  function pushUser(text: string) {
    setThread(prev => [...prev, { id: crypto.randomUUID(), role: "user", text }]);
  }
  
  function pushAssistant(url: string) {
    setThread(prev => [...prev, { id: crypto.randomUUID(), role: "assistant", imageUrl: url }]);
  }

  const handleFeatureChange = (featureId: string) => {
    setActiveFeature(featureId);
  };

  const handlePromptSelect = (promptText: string) => {
    setPrompt(promptText);
  };

  const handleGenerate = async (prompt: string) => {
    try {
      toast.success("Generation started!");
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      const result = await response.json();
      if (result.images && result.images.length > 0) {
        setImages(p => [result.images[0], ...p].slice(0, 6));
        toast.success("Image generated successfully!");
      } else {
        toast.error("Failed to generate image");
      }
    } catch (error) {
      console.error('Generation failed:', error);
      toast.error("Generation failed");
    }
  };

  // 新增：处理LLM对话功能
  const handleChat = async (prompt: string) => {
    try {
      toast.success("Processing conversation...");
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }
      
      const result = await response.json();
      if (result.output) {
        // 将LLM回复添加到对话线程中（作为文本消息）
        setThread(prev => [...prev, { 
          id: crypto.randomUUID(), 
          role: "assistant", 
          imageUrl: "", // 对话消息没有图片
          text: result.output 
        }]);
        toast.success("Response received!");
      } else {
        toast.error("No response from AI");
      }
    } catch (error) {
      console.error('Chat failed:', error);
      toast.error(`Chat failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleResult = (imageUrl: string) => {
    setImages(p => [imageUrl, ...p].slice(0, 6));
    toast.success("Image generated successfully!");
  };

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case "general":
        // 对话模式：无消息时显示 Hero，有消息时显示对话
        if (thread.length === 0) {
          return <GeneralPage 
            onPromptSelect={handlePromptSelect} 
            images={images}
            onImageUpdate={(url) => setImages(p => [url, ...p.filter(u => u !== url)].slice(0, 6))}
          />;
        } else {
          return (
            <div className="w-full space-y-8">
              <ChatThread items={thread} />
              {/* 尾部 Spacer 占位元素 */}
              <div style={{ height: "calc(var(--dock-h, 180px) + var(--dock-gap, 24px))" }} />
            </div>
          );
        }
      case "portrait":
        return (
          <PortraitPage
            onPromptSelect={setPrompt}
            images={portraitImages}
            onImageUpdate={(url) => setPortraitImages(p => [url, ...p.filter(u => u !== url)].slice(0, 12))}
          />
        );
      case "try-on":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Clothing Try-on</h2>
              <p className="text-muted-foreground">Coming soon! Try on different outfits virtually with AI.</p>
            </div>
          </div>
        );
      case "vector":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Vector Graphics</h2>
              <p className="text-muted-foreground">Coming soon! Generate scalable vector graphics and icons.</p>
            </div>
          </div>
        );
      case "more":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">More Features</h2>
              <p className="text-muted-foreground">Exciting new features are coming! Stay tuned for updates.</p>
            </div>
          </div>
        );
      default:
        return <GeneralPage 
          onPromptSelect={handlePromptSelect} 
          images={images}
          onImageUpdate={(url) => setImages(p => [url, ...p.filter(u => u !== url)].slice(0, 6))}
        />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main particles">
      {/* Header */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="p-4 pr-2">
          <Sidebar 
            activeItem={activeFeature} 
            onItemChange={handleFeatureChange} 
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 py-4 pb-24 overflow-auto">
          <div 
            data-dock-anchor
            ref={mainRef} 
            className="mx-auto max-w-5xl w-full px-6"
            style={{ paddingBottom: "calc(var(--dock-h, 180px) + var(--dock-gap, 24px))" }}
          >
            {renderActiveFeature()}
          </div>
        </main>
      </div>

      {/* Bottom Dock - 仅在非Portrait页面显示 */}
        {activeFeature !== "portrait" && (
        <BottomDock 
          anchorRef={mainRef}
          value={prompt}
          onChange={setPrompt}
          onGenerate={handleGenerate}
          onResult={(url) => {
            handleResult(url);
            pushAssistant(url);
          }}
          lastImageUrl={lastImageUrl}
          onSubmit={pushUser}
          onChat={handleChat}
        />
      )}
    </div>
  );
}