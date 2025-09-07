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
  const [isGenerating, setIsGenerating] = useState(false);
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

  const handleGenerate = async (prompt: string, imageBase64?: string) => {
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    
    // 添加用户消息
    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      text: prompt,
      createdAt: new Date().toISOString(),
    };
    setThread(prev => [...prev, userMessage]);
    
    try {
      const payload = { prompt, ...(imageBase64 ? { imageBase64 } : {}) };
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[gen] req', payload);
      }
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      const data = await res.json().catch(() => ({}));
      
      if (process.env.NODE_ENV !== 'production') {
        console.debug('[gen] res', res.status, data);
      }
      
      if (!res.ok) {
        const msg = data?.error || `HTTP ${res.status}`;
        showError(`Generate failed: ${msg}`);
        return;
      }
      
      // 统一解析：后端应该返回 { images: string[] }，但做容错
      let images = [];
      if (Array.isArray(data?.images)) {
        images = data.images.flat().filter(Boolean);
      } else if (typeof data === 'string') {
        images = [data];
      } else if (Array.isArray(data)) {
        images = data.flat().filter(Boolean);
      }
      
      if (!images.length) {
        showError('No images returned');
        return;
      }
      
      // 将图片插入到对话流
      images.forEach((url) => {
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          type: 'image',
          url,
          createdAt: new Date().toISOString(),
        };
        setThread(prev => [...prev, assistantMessage]);
      });
      
      toast.success('图片生成成功！');
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('[gen] err', err);
      }
      showError(String(err?.message || err));
    } finally {
      setIsGenerating(false);
    }
  };
  
  // 错误显示函数
  const showError = (message: string) => {
    toast.error(message);
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

        />
      )}
    </div>
  );
}