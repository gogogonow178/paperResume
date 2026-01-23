/**
 * MobileBlock - 移动端拦截页
 * 当屏幕宽度 < 768px 时显示，引导用户使用电脑访问
 */
function MobileBlock() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>

            {/* 背景装饰浮动元素 */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full opacity-20 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', animationDelay: '0s' }}></div>
                <div className="absolute top-1/3 -right-16 w-48 h-48 rounded-full opacity-15 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)', animationDelay: '1s' }}></div>
                <div className="absolute -bottom-16 left-1/4 w-40 h-40 rounded-full opacity-10 animate-float"
                    style={{ background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)', animationDelay: '2s' }}></div>
            </div>

            {/* 图标 */}
            <div className="w-24 h-24 mb-8 rounded-3xl bg-white/20 backdrop-blur-lg flex items-center justify-center shadow-lg animate-fade-in"
                style={{ animationDelay: '0.1s' }}>
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
            </div>

            {/* 提示文字 */}
            <h1 className="text-3xl font-bold text-white mb-4 animate-fade-in"
                style={{ animationDelay: '0.2s' }}>
                请使用电脑访问
            </h1>
            <p className="text-white/80 max-w-xs leading-relaxed text-lg animate-fade-in"
                style={{ animationDelay: '0.3s' }}>
                为了获得最佳的编辑体验，请使用 PC 或 Mac 电脑浏览器访问本网站
            </p>

            {/* 装饰元素 */}
            <div className="mt-16 flex gap-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <span className="w-2.5 h-2.5 rounded-full bg-white/30"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/50"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-white/30"></span>
            </div>
        </div>
    )
}

export default MobileBlock
