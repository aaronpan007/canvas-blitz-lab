import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, X, Download, ZoomIn } from "lucide-react";

import { AVATAR_TEMPLATES } from "../../data/avatarTemplates";

// 转换模板数据为风格选项
const AVATAR_STYLES = AVATAR_TEMPLATES.map(template => ({
  id: template.id,
  label: template.label,
  desc: template.prompt.split(',')[0] // 使用prompt的第一部分作为描述
}));

interface AvatarPageProps {
  onPromptSelect: (prompt: string) => void;
  images: string[];
  onImageUpdate: (url: string) => void;
}



export const AvatarPage: React.FC<AvatarPageProps> = ({ onPromptSelect, images, onImageUpdate }) => {
  const [reference, setReference] = useState<File | null>(null);
  const [styleId, setStyleId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [results, setResults] = useState<Array<{id: string, url: string, styleId: string, ts: number}>>([]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReference(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeReference = () => {
    setReference(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canGenerate = reference && styleId && !pending;

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setReference(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    try {
      // 校验：已选风格
      if (!styleId) {
        alert('请选择一个风格');
        return;
      }
      
      setPending(true);
      
      // 准备imageUrl - 如果有上传图片则转为base64，否则为空字符串
      let referenceImageUrl = "";
      if (reference) {
        const reader = new FileReader();
        referenceImageUrl = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(reference);
        });
      }
      
      console.log("[AVATAR] generate click", { selectedStyle: styleId, imageUrl: referenceImageUrl ? "[BASE64_DATA]" : "" });
      
      const res = await fetch("/api/avatar/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          styleId: styleId,
          imageUrl: referenceImageUrl,
          promptAddon: "" // 暂不启用补充
        }),
      });
      
      const contentType = res.headers.get('content-type') || '';
      let data: any = null;
      
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error('[AVATAR] Non-JSON response:', text.slice(0, 500));
        throw new Error(`API returned non-JSON (${res.status}). Maybe proxy/route misconfigured.`);
      }
      
      console.log("[AVATAR] api resp:", data);
      
      if (!res.ok) {
        throw new Error(data?.error || `HTTP ${res.status}`);
      }
      
      if (!data?.image) {
        console.error('[AVATAR] invalid payload:', data);
        throw new Error('No image url in response');
      }
      
      const newResult = {
        id: Date.now().toString(),
        url: data.image,
        styleId: styleId,
        ts: Date.now()
      };
      setResults(prev => [newResult, ...prev]);
      
      // 更新父组件状态
      onImageUpdate(data.image);
      onPromptSelect(data.prompt || '');
    } catch (e: any) {
      console.error("[AVATAR] generate error:", e);
      alert(e?.message || "生成失败");
    } finally {
      setPending(false);
    }
  };

  const downloadImage = async (imageUrl: string) => {
    try {
      // 获取图片数据
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // 创建下载链接
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `avatar-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      
      // 清理
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // 降级方案：直接打开图片
      window.open(imageUrl, '_blank');
    }
  };

  return (
    <div className="mx-auto max-w-[1120px] px-6 pt-12 pb-16">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-white">Avatar Generator</h1>
        <p className="text-white/60 text-sm mt-2">Create stunning AI-generated avatars with custom styles</p>
      </header>

      {/* 1. Upload Section - Full Width */}
      <section className="mb-8">
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <label
            onClick={() => fileInputRef.current?.click()}
            className="group relative block w-full rounded-2xl border border-white/10 
                       bg-white/5 backdrop-blur-md hover:bg-white/10 transition 
                       h-[240px] md:h-[280px] flex items-center justify-center 
                       shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            {reference ? (
              <>
                <img
                  src={URL.createObjectURL(reference)}
                  alt="Reference"
                  className="w-full h-full object-cover rounded-2xl"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeReference();
                  }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm 
                             flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Upload className="w-12 h-12 mb-4 group-hover:text-white/80 transition-colors" />
                <p className="text-lg font-medium group-hover:text-white/80 transition-colors">
                  Upload Reference Image
                </p>
                <p className="text-sm mt-2 text-white/40">
                  Click to select or drag & drop
                </p>
              </div>
            )}
          </label>
        </div>
      </section>

      {/* 2. Style Selection - 4x2 Grid */}
      <section className="mb-8">
        <h2 className="text-sm text-white/70 mb-3">Choose Style</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {AVATAR_STYLES.map((style) => (
            <button
              key={style.id}
              className={cn(
                "text-left rounded-2xl p-4 h-[110px] border bg-white/5 backdrop-blur-md transition",
                "hover:bg-white/10 active:scale-[0.99]",
                styleId === style.id
                  ? "border-yellow-400/70 shadow-[0_0_0_3px_rgba(250,204,21,0.25)]"
                  : "border-white/10"
              )}
              onClick={() => setStyleId(style.id)}
            >
              <div className="text-base font-semibold mb-1 text-white">{style.label}</div>
              <div className="text-xs text-white/60 line-clamp-2">{style.desc}</div>
            </button>
          ))}
        </div>
      </section>

      {/* 3. Generate Button - Centered */}
      <section className="mb-10">
        <div className="flex justify-center">
          <button
             disabled={!canGenerate}
             onClick={handleGenerate}
            className={cn(
              "px-6 h-11 rounded-xl font-semibold shadow-lg transition",
              "px-6 h-11 rounded-xl bg-yellow-400 text-black font-semibold shadow-lg ",
              "hover:brightness-105 disabled:opacity-50 transition"
            )}
          >
            {pending ? "Generating…" : "GENERATE"}
          </button>
        </div>
      </section>

      {/* 4. 结果网格（可滚动，别撑高首屏） */}
      {results.length > 0 && (
        <section className="">
          <h3 className="text-lg font-semibold text-white mb-4">Generated Results</h3>
          <div className="grid grid-cols-3 gap-6">
            {results.map((result) => (
              <div
                key={result.id}
                className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md 
                           overflow-hidden hover:bg-white/10 transition-all duration-300
                           shadow-[0_8px_32px_-12px_rgba(0,0,0,0.4)]"
              >
                <div className="aspect-square relative">
                  <img
                    src={result.url}
                    alt={`Avatar ${result.styleId}`}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => setSelectedResult(result.url)}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        downloadImage(result.url);
                      }}
                      className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm 
                                 flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      <Download className="w-4 h-4 text-white" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <div className="text-sm font-medium text-white">
                    {AVATAR_STYLES.find(s => s.id === result.styleId)?.label || result.styleId}
                  </div>
                  <div className="text-xs text-white/60 mt-1">
                    {new Date(result.ts).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Image Preview Modal */}
      {selectedResult && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedResult(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh]">
            <img 
              src={selectedResult} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-xl"
            />
            <button
              onClick={() => setSelectedResult(null)}
              className="absolute -top-4 -right-4 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <Button
              onClick={() => downloadImage(selectedResult)}
              className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarPage;