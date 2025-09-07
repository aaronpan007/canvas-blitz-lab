import React, { useState, lazy, Suspense, useRef } from "react";
import "@tldraw/tldraw/tldraw.css";
const Tldraw = lazy(() => import("@tldraw/tldraw").then(m => ({ default: m.Tldraw })));
import type { Editor } from "@tldraw/tldraw";

export default function PromptDock({ onResult }: { onResult: (url: string) => void }) {
  const [prompt, setPrompt] = useState(""); const [ratio, setRatio] = useState("1:1");
  const [file, setFile] = useState<File|null>(null);
  const [showCanvas, setShowCanvas] = useState(false); const [useCanvas, setUseCanvas] = useState(false);
  const [loading, setLoading] = useState(false);
  const editorRef = useRef<Editor | null>(null);
  const [attachedImages, setAttachedImages] = useState<string[]>([]);



  async function handlePolish() {
    const r = await fetch("/api/polish",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt})}).then(r=>r.json());
    if (r?.prompt) setPrompt(r.prompt);
  }
  async function exportCanvasAsFile(): Promise<string | null> {
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
  }
  async function handleGenerate() {
    if (!prompt.trim()) return; setLoading(true);
    
    // 处理附加图片 - 如果有base64图片，只取第一个
    let imageBase64 = null;
    if (attachedImages.length > 0 && attachedImages[0].startsWith('data:')) {
      imageBase64 = attachedImages[0];
    }
    
    const data = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, imageBase64 })
    }).then(r=>r.json()).catch(()=>({}));
    
    if (data?.images && data.images.length > 0) {
      onResult(data.images[0]);
    }
    setLoading(false);
  }
  const removeImage = (index: number) => {
    setAttachedImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full">
      {/* Attached Images Preview */}
      {attachedImages.length > 0 && (
        <div className="mb-3 flex gap-2 overflow-x-auto pb-2">
          {attachedImages.map((image, index) => (
            <div key={index} className="relative flex-shrink-0">
              <div className="w-16 h-16 rounded-lg bg-neutral-800 overflow-hidden">
                <img 
                  src={image} 
                  alt={`Reference ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={() => removeImage(index)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="w-full p-3 flex items-center gap-2 bg-black/30 rounded-xl border border-yellow-400/20">
      <label className="px-2 py-1 rounded-lg bg-neutral-800 cursor-pointer text-sm">上传参考图
        <input type="file" accept="image/*" className="hidden" onChange={e => {
          const file = e.target.files?.[0];
          if (file) {
            setFile(file);
            // 将文件转换为 base64 数据 URL，这样后端可以处理
            const reader = new FileReader();
            reader.onload = (event) => {
              const dataUrl = event.target?.result as string;
              setAttachedImages(prev => [...prev, dataUrl]);
            };
            reader.readAsDataURL(file);
          }
        }} />
      </label>
      <select value={ratio} onChange={e=>setRatio(e.target.value)} className="px-3 py-2 rounded-lg bg-neutral-800 text-sm">
        <option>1:1</option><option>3:4</option><option>4:3</option><option>16:9</option><option>9:16</option>
      </select>
      <button onClick={handlePolish} className="px-3 py-2 rounded-lg bg-neutral-800 text-sm">润色</button>
      <button onClick={()=>{ setShowCanvas(v=>!v); setUseCanvas(true); }} className="px-3 py-2 rounded-lg bg-neutral-800 text-sm">画板</button>
      <input value={prompt} onChange={e=>setPrompt(e.target.value)} placeholder="输入你的 Prompt…" className="flex-1 px-3 py-2 rounded-lg bg-neutral-900 outline-none"/>
      <button disabled={loading} onClick={handleGenerate} className="px-4 py-2 rounded-lg bg-yellow-400 text-black font-medium disabled:opacity-60">
        {loading ? "Generating…" : "Generate"}
      </button>
      {showCanvas && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-6 z-50">
          <div className="w-[90vw] h-[70vh] bg-neutral-900 rounded-2xl overflow-hidden relative">
            <Suspense fallback={<div className="p-6 text-neutral-400">Loading canvas…</div>}><Tldraw onMount={(editor) => { editorRef.current = editor; }} /></Suspense>
            <div className="absolute right-3 bottom-3 flex gap-2">
              <button onClick={()=>setShowCanvas(false)} className="px-3 py-2 rounded-lg bg-neutral-800">关闭</button>
              <button onClick={async ()=>{ 
                const imageUrl = await exportCanvasAsFile();
                if (imageUrl) {
                  setAttachedImages(prev => [...prev, imageUrl]);
                }
                setUseCanvas(true); 
                setShowCanvas(false); 
              }} className="px-3 py-2 rounded-lg bg-yellow-400 text-black">用作参考图</button>
            </div>
          </div>
         </div>
       )}
      </div>
    </div>
  );
}