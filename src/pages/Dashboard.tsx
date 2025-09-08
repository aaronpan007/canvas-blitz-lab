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
  
  // General页面的统一状态管理
  const [modelResponse, setModelResponse] = useState<string>("");

  // 添加消息到对话流的函数
  const addMessage = (message: ChatMessage) => {
    setThread(prev => [...prev, message]);
  };

  // 工具函数：标准化图片URL，处理各种格式
  function normalizeImageUrl(x: any): string {
    if (!x) return '';
    
    // 处理字符串类型
    if (typeof x === 'string') {
      const s = x.trim();
      if (!s) return '';
      
      // HTTP/HTTPS URL
      if (s.startsWith('http://') || s.startsWith('https://')) return s;
      
      // 已有data:image前缀的base64
      if (s.startsWith('data:image/')) return s;
      
      // 裸base64检测：长度>1000且符合base64字符集
      if (s.length > 1000 && /^[A-Za-z0-9+/]+={0,2}$/.test(s)) {
        return `data:image/png;base64,${s}`;
      }
      
      // 其他字符串直接返回（可能是相对路径等）
      return s;
    }
    
    // 处理数组类型：取第一个有效项
    if (Array.isArray(x) && x.length > 0) {
      return normalizeImageUrl(x[0]);
    }
    
    // 处理对象类型：尝试提取url或base64字段
    if (x && typeof x === 'object') {
      if (x.url) return normalizeImageUrl(x.url);
      if (x.base64) return `data:image/png;base64,${x.base64}`;
      if (x.image) return normalizeImageUrl(x.image);
    }
    
    return '';
  }

  // 响应适配器：处理/api/generate的各种返回格式
  function adaptGenerateResponse(data: any): string[] {
    // 开发模式下打印响应结构
    if (process.env.NODE_ENV === 'development') {
      console.log('[ResponseAdapter] Raw API response:', JSON.stringify(data, null, 2));
    }

    // 候选字段按优先级排序：images、image、output、result、data、裸响应
    const candidateFields = ['images', 'image', 'output', 'result', 'data'];
    let extractedItems: any[] = [];

    // 1. 尝试从候选字段中提取
    for (const field of candidateFields) {
      const value = data?.[field];
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          extractedItems = value;
          break;
        } else if (typeof value === 'string' && value.trim()) {
          extractedItems = [value];
          break;
        }
      }
    }

    // 2. 如果候选字段都没有，尝试裸响应
    if (extractedItems.length === 0) {
      if (Array.isArray(data)) {
        extractedItems = data;
      } else if (typeof data === 'string' && data.trim()) {
        extractedItems = [data];
      }
    }

    // 3. 标准化每个图片项
    const normalizedUrls = extractedItems
      .map(item => normalizeImageUrl(item))
      .filter(url => url && url.length > 0);

    if (process.env.NODE_ENV === 'development') {
      console.log(`[ResponseAdapter] Extracted ${normalizedUrls.length} valid image URLs:`, normalizedUrls);
    }

    return normalizedUrls;
  }
  
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

  // 统一生成入口（仅调用 /api/generate）
  async function handleGenerate({ prompt, imageBase64 }: {
    prompt: string;
    imageBase64?: string;
  }) {
    try {
      setIsGenerating(true);
      setModelResponse?.('Generating...');
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, ...(imageBase64 ? { imageBase64 } : {}) })
      });
      let data: any = null;
      try { data = await res.json(); } catch { data = null; }
      console.debug('[gen] res', res.status, data);

      if (!res.ok) {
        const msg = data?.error || data?.detail || `HTTP ${res.status}`;
        setModelResponse?.(`Generate failed: ${msg}`);
        showError?.(`Generate failed: ${msg}`);
        return;
      }

      const images = adaptGenerateResponse(data);
      if (!images.length) {
        setModelResponse?.('No images returned');
        return;
      }

      // 将图片逐条追加为对话消息
      images.forEach((url: string) => addMessage({
        id: crypto.randomUUID(),
        role: 'assistant',
        type: 'image',
        url,
        createdAt: new Date().toISOString(),
      }));

      // Model Response仅显示文字状态
      setModelResponse?.(`Generated ${images.length} image(s).`);
      toast.success('图片生成成功！');
    } catch (err: any) {
      console.error('[gen] err', err);
      setModelResponse?.(String(err?.message || err));
      showError?.(String(err?.message || err));
    } finally {
      setIsGenerating?.(false);
    }
  }
  
  // 错误显示函数
  const showError = (message: string) => {
    toast.error(message);
  };





  const renderActiveFeature = () => {
    switch (activeFeature) {
      case "general":
        return <GeneralPage 
          onPromptSelect={handlePromptSelect} 
          modelResponse={modelResponse}
        />;
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
        return (
          <div className="flex gap-6 h-full">
            <div className="flex-1">
              <GeneralPage 
                onPromptSelect={handlePromptSelect} 
                modelResponse={modelResponse}
              />
            </div>
            <div className="w-96 flex-shrink-0">
              <div className="h-full glass-morph rounded-xl p-4">
                <h3 className="text-lg font-semibold mb-4 text-foreground">Chat History</h3>
                <ChatThread 
                   items={thread} 
                 />
              </div>
            </div>
          </div>
        );
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
            className="container mx-auto px-4 max-w-screen-xl w-full"
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
          onGenerate={(prompt: string, imageBase64?: string) => handleGenerate({ prompt, imageBase64 })}
          lastImageUrl={lastImageUrl}
          onSubmit={pushUser}

        />
      )}
    </div>
  );
}