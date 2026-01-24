/**
 * MobileBlock - 移动端拦截页
 * 当屏幕宽度 < 768px 时显示，引导用户使用电脑访问
 * 
 * 设计风格：Apple 风格、简洁优雅、全屏适配
 */
function MobileBlock() {
    const AUTHOR_EMAIL = 'binghan_liu@163.com'

    // 复制邮箱
    const handleCopyEmail = async () => {
        try {
            await navigator.clipboard.writeText(AUTHOR_EMAIL)
            alert('邮箱已复制：' + AUTHOR_EMAIL)
        } catch (err) {
            const textarea = document.createElement('textarea')
            textarea.value = AUTHOR_EMAIL
            document.body.appendChild(textarea)
            textarea.select()
            document.execCommand('copy')
            document.body.removeChild(textarea)
            alert('邮箱已复制：' + AUTHOR_EMAIL)
        }
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 24px',
                textAlign: 'center',
                // 优雅的浅色渐变背景 - 符合 Apple 风格
                background: 'linear-gradient(180deg, #FFFFFF 0%, #F5F5F7 50%, #E8E8ED 100%)',
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
                overflow: 'hidden'
            }}
        >
            {/* 背景装饰 - 微妙的圆形光斑 */}
            <div
                style={{
                    position: 'absolute',
                    top: '-20%',
                    right: '-20%',
                    width: '60vw',
                    height: '60vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0, 0, 0, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />
            <div
                style={{
                    position: 'absolute',
                    bottom: '-10%',
                    left: '-10%',
                    width: '50vw',
                    height: '50vw',
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(118, 75, 162, 0.05) 0%, transparent 70%)',
                    pointerEvents: 'none'
                }}
            />

            {/* 主内容区 - 玻璃态卡片 */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '360px',
                    width: '100%',
                    padding: '40px 28px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    borderRadius: '28px',
                    boxShadow: '0 8px 40px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)',
                    animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                {/* 图标 */}
                <div
                    style={{
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 24px',
                        borderRadius: '22px',
                        background: 'linear-gradient(135deg, #1D1D1F 0%, #3A3A3C 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)'
                    }}
                >
                    <svg
                        width="40"
                        height="40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                </div>

                {/* 标题 */}
                <h1
                    style={{
                        fontSize: '26px',
                        fontWeight: 700,
                        color: '#1D1D1F',
                        marginBottom: '12px',
                        letterSpacing: '-0.02em'
                    }}
                >
                    请使用电脑访问
                </h1>

                {/* 副标题 */}
                <p
                    style={{
                        fontSize: '15px',
                        lineHeight: 1.6,
                        color: '#86868B',
                        marginBottom: '32px'
                    }}
                >
                    为了获得最佳的简历编辑体验，<br />
                    请使用 PC 或 Mac 电脑浏览器访问
                </p>

                {/* 网址提示 */}
                <div
                    style={{
                        padding: '14px 20px',
                        backgroundColor: '#F5F5F7',
                        borderRadius: '12px',
                        marginBottom: '24px'
                    }}
                >
                    <p
                        style={{
                            fontSize: '13px',
                            color: '#86868B',
                            marginBottom: '4px'
                        }}
                    >
                        在电脑浏览器中访问
                    </p>
                    <p
                        style={{
                            fontSize: '16px',
                            fontWeight: 600,
                            color: '#000000',
                            fontFamily: 'SF Mono, Menlo, monospace'
                        }}
                    >
                        minicv.xyz
                    </p>
                </div>

                {/* 装饰点 */}
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '8px'
                    }}
                >
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#D2D2D7'
                        }}
                    />
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#000000'
                        }}
                    />
                    <span
                        style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: '#D2D2D7'
                        }}
                    />
                </div>
            </div>

            {/* 底部联系信息 */}
            <div
                style={{
                    position: 'relative',
                    zIndex: 1,
                    marginTop: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'fadeInUp 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s both'
                }}
            >
                <p
                    style={{
                        fontSize: '13px',
                        color: '#86868B'
                    }}
                >
                    有问题？联系开发者
                </p>
                <button
                    onClick={handleCopyEmail}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 18px',
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#1D1D1F',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                        transition: 'all 0.2s'
                    }}
                >
                    <svg
                        width="16"
                        height="16"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                    </svg>
                    {AUTHOR_EMAIL}
                    <svg
                        width="14"
                        height="14"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="#86868B"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                    </svg>
                </button>
            </div>

            {/* 品牌标识 */}
            <p
                style={{
                    position: 'absolute',
                    bottom: '24px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#D2D2D7',
                    letterSpacing: '0.05em'
                }}
            >
                极简简历 · MiniCV
            </p>

            {/* 动画样式 */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    )
}

export default MobileBlock
