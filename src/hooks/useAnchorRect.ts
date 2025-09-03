import { useLayoutEffect, useState } from "react";

export function useAnchorRect(el: HTMLElement | null) {
  const [rect, setRect] = useState({ left: 0, width: 0 });
  useLayoutEffect(() => {
    // 优先用传入的 el；否则自动找 data-dock-anchor
    const anchor = el ?? (document.querySelector("[data-dock-anchor]") as HTMLElement | null);
    if (!anchor) return;
    const update = () => {
      const r = anchor.getBoundingClientRect();
      let left = r.left;
      let width = r.width;
      // 兜底：如果宽度过小（通常取到的是侧栏或空容器），使用"居中容器"策略
      if (width <= 640) {
        const MAX = 1024;      // 你页面中心容器的最大宽度（可与 max-w-5xl 对齐）
        const PAD = 48;        // 与页面左右 padding 对齐（px-6 = 24px，两侧共 48）
        width = Math.min(MAX, window.innerWidth - PAD);
        left = Math.max(0, Math.round((window.innerWidth - width) / 2));
      }
      setRect({ left, width });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(anchor);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [el]);
  return rect;
}