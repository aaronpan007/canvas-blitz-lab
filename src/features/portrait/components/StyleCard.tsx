// src/features/portrait/components/StyleCard.tsx
import React from "react";
import clsx from "clsx";

type Props = {
  id: string;           // styleId: "mono" | "studio" | ...
  label: string;        // 卡片主标题
  imageUrl: string;     // /inventory/xxx.jpeg
  selected?: boolean;
  onSelect?: (id: string) => void;
};

export default function StyleCard({ id, label, imageUrl, selected, onSelect }: Props) {
  // 兜底背景，避免图片加载失败时显示纯黑
  const FALLBACK_BG = "linear-gradient(180deg, rgba(50,50,50,.4), rgba(20,20,20,.7))";

  return (
    <div className="relative rounded-2xl overflow-hidden group ring-1 ring-white/8">
      {/* 背景图 */}
      <div
        className="absolute inset-0 bg-center bg-cover will-change-transform"
        style={{ backgroundImage: `url(${imageUrl}), ${FALLBACK_BG}` }}
        aria-hidden
      />

      {/* 玻璃层：轻模糊 + 更低遮罩 */}
      <div
        className="
          absolute inset-0
          backdrop-blur-[1.5px]
          bg-black/20
          transition-all duration-200
          group-hover:backdrop-blur-[1px] group-hover:bg-black/15
        "
      />

      {/* 暗角：更轻，保留层次但不遮底图 */}
      <div
        className="
          absolute inset-0
          bg-gradient-to-b from-black/10 via-black/15 to-black/25
          pointer-events-none
        "
      />

      {/* 文字胶囊：轻玻璃，增强可读性但不要太厚重 */}
      <button
        type="button"
        onClick={() => onSelect?.(id)}
        className="relative z-10 w-full aspect-[16/10] flex items-center justify-center cursor-pointer"
        aria-pressed={selected}
      >
        <span
          className="
            mt-28 mb-8 px-6 py-2
            rounded-2xl border border-white/20
            bg-black/25 backdrop-blur-[1px]
            text-white font-semibold tracking-wide
            shadow-[0_6px_24px_rgba(0,0,0,0.35)]
          "
        >
          {label}
        </span>
      </button>

      {/* 选中态：去模糊+提亮+描边 */}
      {selected && (
        <div
          className="
            absolute inset-0
            ring-2 ring-yellow-400/80
            shadow-[0_0_0_4px_rgba(255,214,0,0.15)_inset]
            backdrop-blur-[0.5px]
            bg-black/10
          "
        />
      )}
    </div>
  );
}