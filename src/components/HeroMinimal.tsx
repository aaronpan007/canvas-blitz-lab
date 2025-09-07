import React from "react";

export default function HeroMinimal() {
  return (
    // 向上移动，为下方广告区块留出空间
    <section className="page-container pt-16 sm:pt-20 pb-4">
      <div
        className="
          relative mx-auto w-full max-w-5xl
          h-56 sm:h-64 md:h-72 lg:h-80      /* 响应式高度断点 */
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
                            text-3xl sm:text-4xl md:text-5xl lg:text-6xl
                            leading-tight whitespace-nowrap">
              Everything Starts <span className="text-yellow-400">Here</span>
            </h1>
            <p className="text-neutral-200/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]
                          text-sm sm:text-base md:text-lg lg:text-xl">
              Enter a prompt and create your first masterpiece
            </p>
          </div>
        </div>
      </div>

      {/* 底部留白进一步缩小 */}
      <div className="h-2 sm:h-3" />
    </section>
  );
}