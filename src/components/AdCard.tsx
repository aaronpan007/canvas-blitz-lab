// src/components/AdCard.tsx
export default function AdCard() {
  return (
    <section className="w-full flex justify-center px-4 sm:px-6 lg:px-8">
      <div 
        className="
          w-full max-w-6xl
          bg-white/5 backdrop-blur-md rounded-3xl
          shadow-[0_20px_60px_rgba(0,0,0,.35)]
          p-5 sm:p-6 md:p-8
        "
      >
        {/* 响应式网格布局：移动端上下堆叠，平板/桌面左右 */}
        <div className="
          grid grid-cols-1 md:grid-cols-2
          gap-6 md:gap-8 items-center
        ">
          {/* 二维码区域 */}
          <div className="flex justify-center">
            <img
              src="/inventory/qrcode.png"
              alt="农特学院二维码"
              className="
                w-full max-w-[78vw] md:max-w-[440px] aspect-square
                object-contain mx-auto rounded-2xl
                ring-1 ring-white/10
              "
            />
          </div>

          {/* 文案区域 */}
          <div className="flex flex-col justify-center text-center md:text-left">
            <h2 className="text-white font-semibold
                           text-2xl sm:text-3xl md:text-4xl">
              农特学院正在招募
            </h2>

            <p className="mt-4 text-yellow-400 font-semibold
                          text-lg sm:text-xl md:text-2xl">
              《0基础AI编程应用出海训练营》
            </p>

            <ul className="mt-6 space-y-3 text-white/90
                          text-base sm:text-lg md:text-xl
                          leading-7 sm:leading-8">
              <li>1、三个月周期，零基础可参与；</li>
              <li>2、学习AI编程打造应用；</li>
              <li>
                3、上线接入支付进行运营变现
                <span className="ml-1">💰</span>；
              </li>
              <li>4、技术卡点答疑；</li>
              <li>5、8年+欧美团队全流程陪跑。</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}