import React, { useRef, useState, lazy, Suspense, useLayoutEffect } from "react";
import "@tldraw/tldraw/tldraw.css";
const Tldraw = lazy(() => import("@tldraw/tldraw").then(m => ({ default: m.Tldraw })));
import type { Editor } from "@tldraw/tldraw";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAnchorRect } from "@/hooks/useAnchorRect";
import { 
  Sparkles, 
  Plus, 
  Square, 
  Send,
  X,
  Image as ImageIcon 
} from "lucide-react";

interface BottomDockProps {
  anchorRef?: React.MutableRefObject<HTMLDivElement | null>;
  value: string;
  onChange: (value: string) => void;
  onGenerate: (prompt: string) => void;
  onResult?: (url: string) => void;
  lastImageUrl?: string;                  // 父级传入：上一条模型图片
  onSubmit?: (text: string) => void;      // 父级：将用户消息推入对话
}

export function BottomDock({ anchorRef, value, onChange, onGenerate, onResult, lastImageUrl, onSubmit }: BottomDockProps) {
  const { left, width } = useAnchorRect(anchorRef?.current || null);
  const dockInnerRef = useRef<HTMLDivElement>(null);
  
  const [isPolishing, setIsPolishing] = useState(false);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);
  
  // New state variables
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [refFile, setRefFile] = useState<File | null>(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const [useCanvas, setUseCanvas] = useState(false);
  const [genLoading, setGenLoading] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  
  useLayoutEffect(() => {
    if (!dockInnerRef.current) return;
    const root = document.documentElement;
    const update = () => {
      const h = dockInnerRef.current?.offsetHeight || 0;
      root.style.setProperty("--dock-h", `${h}px`);
      root.style.setProperty("--dock-gap", "24px"); // 额外缓冲
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(dockInnerRef.current);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);

  // Polish function
  const handlePolish = async (prompt: string, setPrompt: (value: string) => void) => {
    if (!prompt.trim()) return;
    
    setIsPolishing(true);
    try {
      const response = await fetch('/api/polish', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });
      
      const data = await response.json();
      if (data?.prompt) {
        setPrompt(data.prompt);
      }
    } catch (error) {
      console.error('Polish failed:', error);
      // 出错时保持原文本不变
    } finally {
      setIsPolishing(false);
    }
  };

  // File upload functions
  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  const onFilePicked = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setRefFile(file);
      // 将文件转换为 base64 数据 URL，这样后端可以处理
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setAttachedImages(prev => [...prev, dataUrl]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Canvas functions
  const openCanvas = () => {
    setShowCanvas(true);
  };

  const closeCanvas = () => {
    setShowCanvas(false);
  };

  const exportCanvasAsFile = async (): Promise<string | null> => {
    if (!editorRef.current) {
      console.error('Editor not available for export');
      return null;
    }

    try {
      const editor = editorRef.current;
      const shapeIds = editor.getCurrentPageShapeIds();
      
      if (shapeIds.size === 0) {
        console.warn('No shapes to export');
        return null;
      }

      // 导出为 PNG 数据 URL
      const dataUrl = await editor.getSvgString(Array.from(shapeIds));
      
      // 创建一个临时的 canvas 来转换 SVG 为 PNG
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      return new Promise((resolve) => {
        img.onload = () => {
          canvas.width = img.width || 800;
          canvas.height = img.height || 600;
          ctx?.drawImage(img, 0, 0);
          const pngDataUrl = canvas.toDataURL('image/png');
          resolve(pngDataUrl);
        };
        img.onerror = () => resolve(null);
        img.src = 'data:image/svg+xml;base64,' + btoa(dataUrl.svg);
      });
    } catch (error) {
      console.error('Failed to export canvas:', error);
      return null;
    }
  };

  // Generate with context function
  const handleGenerateClick = async () => {
    const text = value.trim();
    if (!text) return;
    
    // 调用父级回调，将用户消息推入对话
    onSubmit?.(text);
    
    setGenLoading(true);
    try {
      const fd = new FormData();
      fd.append("prompt", text);
      
      // 添加历史图片作为上下文
      if (lastImageUrl) {
        fd.append("historyImage", lastImageUrl);
      }
      
      // 添加引用图片（保留原有逻辑）
      if (attachedImages.length > 0) {
        fd.append("attachedImages", JSON.stringify(attachedImages));
      }
      
      const resp = await fetch("/api/generate", { 
        method: "POST", 
        body: fd 
      });
      
      const data = await resp.json().catch(() => ({}));
      
      if (data?.image) {
        // 调用父级回调，将模型图片推入对话
        onResult?.(data.image);
      }
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setGenLoading(false);
      // 清空输入
      onChange("");
    }
  };

  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {/* 固定定位外层：宽度与左边界实时跟随主容器 */}
      <div 
        className="fixed bottom-6 z-50 pointer-events-none"
        style={{ left, width, maxWidth: "100vw" }}
      >
        <div ref={dockInnerRef} className="pointer-events-auto w-full">
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

            {/* Hidden file input */}
            <input 
              ref={fileInputRef} 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={onFilePicked} 
            />

            {/* Main Dock */}
            <div className="glass-morph rounded-2xl p-4 glow-blue">
              <div className="flex items-end gap-3">
                {/* Text Input */}
                <div className="flex-1">
                  <Textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="Describe what you want to create..."
                    className="min-h-[52px] max-h-32 resize-none bg-input/50 border-glass-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary rounded-xl"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                        e.preventDefault();
                        handleGenerateClick();
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
                    onClick={() => handlePolish(value, onChange)}
                    className={cn(
                      "w-10 h-10 rounded-lg glass-morph border-accent glow-blue hover:bg-glass-hover transform rotate-45",
                      isPolishing && "animate-pulse"
                    )}
                    disabled={!value.trim() || isPolishing}
                  >
                    {isPolishing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin transform -rotate-45" />
                    ) : (
                      <Sparkles className="w-4 h-4 transform -rotate-45" />
                    )}
                  </Button>

                  {/* Image Upload Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={triggerUpload}
                    className="w-10 h-10 rounded-lg glass-morph glow-blue hover:bg-glass-hover"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>

                  {/* Canvas Button */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={openCanvas}
                    className="w-10 h-10 rounded-lg glass-morph glow-blue hover:bg-glass-hover"
                  >
                    <Square className="w-4 h-4" />
                  </Button>

                  {/* Generate Button */}
                  <Button
                    onClick={handleGenerateClick}
                    disabled={genLoading}
                    className={cn(
                      "px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all",
                      "shadow-glow-yellow hover:shadow-glow-yellow",
                      genLoading && "animate-pulse"
                    )}
                  >
                    {genLoading ? (
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

      {/* TLdraw Canvas Modal */}
      {showCanvas && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="w-[90vw] h-[70vh] bg-neutral-900 rounded-2xl overflow-hidden relative">
            <Suspense fallback={<div className="p-6 text-neutral-400">Loading canvas…</div>}>
              <Tldraw onMount={(editor) => { editorRef.current = editor; }} />
            </Suspense>
            <div className="absolute right-24 bottom-3 flex gap-2">
              <button onClick={closeCanvas} className="px-3 py-2 rounded-lg bg-neutral-800">关闭</button>
              <button 
                onClick={async () => {
                  const canvasImageUrl = await exportCanvasAsFile();
                  if (canvasImageUrl) {
                    setAttachedImages(prev => [...prev, canvasImageUrl]);
                    setUseCanvas(true);
                    console.log('Canvas exported and added to references');
                  } else {
                    console.error('Failed to export canvas');
                  }
                  closeCanvas();
                }} 
                className="px-3 py-2 rounded-lg bg-yellow-400 text-black"
              >
                用作参考图
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onFilePicked}
        className="hidden"
      />
    </>
  );
}