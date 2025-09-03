import React from "react";

export default function HeroMinimal() {
  return (
    // 大量向下移动，底部收紧
    <section className="page-container pt-32 sm:pt-40 pb-6">
      <div
        className="
          relative mx-auto w-full max-w-5xl
          aspect-[16/7]                       /* 更大更扁，整体更饱满 */
          rounded-[28px] overflow-hidden
          shadow-[0_30px_80px_-20px_rgba(0,0,0,0.55)]
        "
        aria-label="Hero banner"
      >
        {/* 背景 - 微信图片 */}
        <div 
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
          style={{
            backgroundImage: 'url(/wechat-image.png)'
          }}
        />
        
        {/* 玻璃拟态模糊层 */}
        <div 
          className="absolute inset-0 w-full h-full z-10"
          style={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(255, 255, 255, 0.1)'
          }}
        />

        {/* 移除所有遮罩层，让图片清晰显示 */}

        {/* 文案：无背景，仅白字+轻阴影 */}
        <div className="absolute inset-0 grid place-items-center px-4 sm:px-6 md:px-8 z-20">
          <div className="flex flex-col items-center gap-2 sm:gap-3 text-center">
            <h1 className="text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]
                            font-extrabold tracking-tight
                            text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl
                            leading-tight whitespace-nowrap">
              Everything Starts <span className="text-yellow-400">Here</span>
            </h1>
            <p className="text-neutral-200/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                          text-base sm:text-lg md:text-xl lg:text-2xl">
              Enter a prompt and create your first masterpiece
            </p>
          </div>
        </div>
      </div>

      {/* 底部留白更小，由 Dock 接管 */}
      <div className="h-4 sm:h-6" />
    </section>
  );
}