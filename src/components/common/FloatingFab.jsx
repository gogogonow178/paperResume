import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

/**
 * FloatingFab - 萌系浮动挂件
 * 整合：简历技巧、联系作者、GitHub 入口
 * 特点：灵动动画、极简视觉、由于其重要性故固定在右下角
 */
export default function FloatingFab() {
    const [isOpen, setIsOpen] = useState(false)
    const [showTips, setShowTips] = useState(false)
    const [showCopied, setShowCopied] = useState(false)
    const fabRef = useRef(null)
    const AUTHOR_EMAIL = 'binghan_liu@163.com'

    // 处理外部点击关闭
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (fabRef.current && !fabRef.current.contains(e.target)) {
                setIsOpen(false)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    // 复制邮箱逻辑 + 拉起邮件
    const handleContact = async (e) => {
        e.preventDefault()
        // 复制
        try {
            await navigator.clipboard.writeText(AUTHOR_EMAIL)
            setShowCopied(true)
        } catch (err) {
            console.error('Copy failed', err)
        }

        // 拉起邮件客户端
        setTimeout(() => {
            window.location.href = `mailto:${AUTHOR_EMAIL}`
        }, 300)

        // 关闭
        setIsOpen(false)
        setTimeout(() => setShowCopied(false), 2000)
    }

    return (
        <>
            {/* 顶置 Toast Portal */}
            {showCopied && createPortal(
                <div style={{
                    position: 'fixed',
                    top: '40px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    padding: '12px 24px',
                    borderRadius: '100px',
                    fontSize: '14px',
                    fontWeight: 600,
                    zIndex: 20000,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)',
                    color: '#fff',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    animation: 'fab-toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                }} role="alert">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    邮箱已复制，正在启动邮件...
                </div>,
                document.body
            )}

            {/* 正在建设中弹窗 Portal */}
            {showTips && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setShowTips(false)} />
                    <div style={{ position: 'relative', width: '360px', backgroundColor: '#fff', borderRadius: '32px', padding: '48px 32px 32px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center', animation: 'fab-modal-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                        <div style={{ fontSize: '48px', marginBottom: '20px' }}>🚧</div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#000' }}>正在建设中</h3>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '32px', lineHeight: '1.4' }}>简历撰写技巧功能正在深度研发中，<br />敬请期待下一版本。</p>
                        <button onClick={() => setShowTips(false)} style={{ width: '100%', padding: '16px', fontSize: '16px', fontWeight: 700, color: '#fff', background: '#000', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>知道了</button>
                    </div>
                </div>,
                document.body
            )}

            {/* 浮动挂件主体 */}
            {/* 浮动挂件主体 */}
            <div
                ref={fabRef}
                onMouseLeave={() => setIsOpen(false)}
                style={{
                    position: 'fixed',
                    bottom: '24px',
                    right: '20px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: '12px'
                }}
            >
                {/* 展开菜单项 */}
                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column-reverse',
                        gap: '12px',
                        marginBottom: '8px',
                        alignItems: 'flex-end',
                        pointerEvents: isOpen ? 'auto' : 'none',
                    }}
                >
                    {/* 联系作者 - 这里的贝塞尔曲线使用了类似 iOS 的弹簧效果 (0.175, 0.885, 0.32, 1.1) */}
                    <div className="fab-item-wrapper group" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.6)',
                        opacity: isOpen ? 1 : 0,
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                        transitionDelay: isOpen ? '0.1s' : '0s' // 展开时延迟 0.1s，收起时不延迟 (立即消失)
                    }}>
                        <div className="fab-tooltip">联系作者：{AUTHOR_EMAIL}</div>
                        <div onClick={handleContact} className="fab-item">
                            <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        </div>
                    </div>

                    {/* 简历技巧 */}
                    <div className="fab-item-wrapper group" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.6)',
                        opacity: isOpen ? 1 : 0,
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                        transitionDelay: isOpen ? '0.05s' : '0.05s' // 展开时延迟 0.05s，收起时也顺延一点，形成倒序感
                    }}>
                        <div className="fab-tooltip">简历技巧</div>
                        <div onClick={() => { setShowTips(true); setIsOpen(false); }} className="fab-item" style={{ fontSize: '20px' }}>
                            💡
                        </div>
                    </div>

                    {/* GitHub */}
                    <div className="fab-item-wrapper group" style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(15px) scale(0.6)',
                        opacity: isOpen ? 1 : 0,
                        transition: 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.1)',
                        transitionDelay: isOpen ? '0s' : '0.1s' // 展开时不延迟 (最先出)，收起时延迟 0.1s (最后走)
                    }}>
                        <div className="fab-tooltip">GitHub</div>
                        <a href="https://github.com/gogogonow178/paperResume" target="_blank" rel="noopener noreferrer" className="fab-item">
                            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" /></svg>
                        </a>
                    </div>
                </div>

                {/* 挂件入口 - 锦鲤图标 */}
                <button
                    className="fab-main-btn"
                    onClick={() => setIsOpen(!isOpen)}
                    onMouseEnter={() => setIsOpen(true)}
                    style={{
                        width: '64px',
                        height: '64px',
                        borderRadius: '24px',
                        backgroundColor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        cursor: 'pointer',
                        transition: 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                        position: 'relative',
                        overflow: 'visible',
                        zIndex: 2
                    }}
                >
                    {/* SVG 容器 */}
                    <div style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transform: 'rotate(-45deg)' // 基础角度
                    }} className="koi-icon">
                        {/* 锦鲤 SVG */}
                        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" fill="#FFF1F1" fillOpacity="0.5" stroke="none" />
                            <path d="M15.5 10C15.5 13 13.5 17 12 19C10.5 17 8.5 13 8.5 10C8.5 7 10 4.5 12 4.5C14 4.5 15.5 7 15.5 10Z"
                                stroke="#FF5E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="#fff" />
                            <path d="M12 19L10 22M12 19L14 22" stroke="#FF5E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M8.5 11L5.5 12.5M15.5 11L18.5 12.5" stroke="#FF5E5E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="10.5" cy="9" r="0.8" fill="#FF5E5E" />
                            <circle cx="13.5" cy="9" r="0.8" fill="#FF5E5E" />
                        </svg>
                    </div>
                </button>
            </div>

            {/* 全局动画定义 */}
            <style>{`
                /* 锦鲤轻微摆动动画 (悬浮呼吸感) */
                @keyframes koi-float {
                    0% { transform: rotate(-45deg) translateY(0); }
                    50% { transform: rotate(-40deg) translateY(-3px) scale(1.05); } 
                    100% { transform: rotate(-45deg) translateY(0); }
                }
                
                /* 按钮 Hover 时触发 */
                .fab-main-btn:hover .koi-icon {
                    animation: koi-float 2s ease-in-out infinite;
                }
                
                /* 弹出的子菜单项样式 */
                .fab-item {
                    width: 48px;
                    height: 48px;
                    border-radius: 16px;
                    background-color: #fff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 16px rgba(0,0,0,0.06);
                    color: #555;
                    transition: all 0.2s;
                    cursor: pointer;
                    border: 1px solid rgba(0,0,0,0.02);
                }
                .fab-item:hover {
                    color: #000;
                    transform: scale(1.08); /* 轻微放大 */
                    box-shadow: 0 8px 24px rgba(0,0,0,0.12);
                }

                .fab-tooltip {
                    background-color: rgba(0,0,0,0.8);
                    backdrop-filter: blur(4px);
                    color: #fff;
                    padding: 6px 12px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 500;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
                    pointer-events: none;
                    white-space: nowrap;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                }
                .fab-item-wrapper:hover .fab-tooltip {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>
        </>
    )
}
