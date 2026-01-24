import { useState, useEffect, useMemo, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'
import PricingModal from './PricingModal'
import AuthModal from './AuthModal'
export default function UserProfile() {
    const { user, userProfile, signInWithEmail, signOut, refreshProfile } = useAuth()
    const [isHovering, setIsHovering] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const [isRefreshing, setIsRefreshing] = useState(false)

    // 头像种子状态 (支持从 LocalStorage 读取，实现轻量级持久化)
    const [avatarSeed, setAvatarSeed] = useState(() => {
        if (!user) return ''
        try {
            return localStorage.getItem(`avatar_seed_${user?.id}`) || user?.email || user?.id
        } catch (e) {
            return ''
        }
    })

    const triggerRef = useRef(null)
    const timeoutRef = useRef(null)

    // Hover 延迟处理
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        // 立即计算位置，防止出现 (0,0) 的闪烁或飞入动画
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + 6,
                right: window.innerWidth - rect.right
            })
        }

        setIsHovering(true)
    }

    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovering(false)
        }, 150)
    }

    // 强制同步检查
    const credits = userProfile?.credits ?? '-'
    useEffect(() => {
        if (user && credits === '-') {
            refreshProfile()
        }
    }, [user, credits, refreshProfile])

    // 监听用户变化，重置种子
    useEffect(() => {
        if (user) {
            try {
                const savedSeed = localStorage.getItem(`avatar_seed_${user.id}`)
                setAvatarSeed(savedSeed || user.email || user.id)
            } catch (e) {
                console.warn('LocalStorage access failed', e)
            }
        }
    }, [user])

    // 处理刷新逻辑
    const handleRefresh = async () => {
        if (isRefreshing) return
        setIsRefreshing(true)
        // 给人一种正在刷新的感觉，至少转个0.5秒
        const minTime = new Promise(resolve => setTimeout(resolve, 800))
        await Promise.all([refreshProfile(), minTime])
        setIsRefreshing(false)
    }

    // 切换头像
    const handleChangeAvatar = () => {
        const newSeed = Math.random().toString(36).substring(7)
        setAvatarSeed(newSeed)
        if (user) {
            localStorage.setItem(`avatar_seed_${user.id}`, newSeed)
        }
    }

    // 已登录：显示头像
    const avatarUrl = useMemo(() => {
        if (!user) return ''
        // 使用 state 中的 seed
        return `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(avatarSeed)}&backgroundColor=e5e7eb`
    }, [user, avatarSeed])

    // 计算显示名称 (优先显示昵称，其次是邮箱，最后是 ID 的后4位)
    const displayName = useMemo(() => {
        if (!user) return ''
        const meta = user.user_metadata
        if (meta?.full_name) return meta.full_name
        if (meta?.name) return meta.name
        if (meta?.user_name) return meta.user_name
        if (user.email) return user.email
        return `用户 ${user.id.slice(0, 4)}`
    }, [user])

    // 绑定邮箱的伪逻辑 (占位)
    const handleBindEmail = () => {
        const email = prompt('请输入要绑定的邮箱：')
        if (email) {
            alert(`正在为 ${email} 发送验证邮件... (功能开发中)`)
        }
    }

    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)

    const handlePurchase = () => {
        setIsPricingModalOpen(true)
    }

    // 核心样式常量 - 强制覆盖 Tailwind
    const styles = {
        loginBtn: {
            height: '44px',
            padding: '0 40px',
            minWidth: '120px',
            backgroundColor: '#000000',
            color: '#FFFFFF',
            fontSize: '15px',
            fontWeight: '700',
            letterSpacing: '0.1em',
            borderRadius: '9999px',
            border: 'none',
            outline: 'none',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transition: 'all 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: 'translateY(0)'
        },
        dropdown: {
            position: 'fixed',
            zIndex: 999999,
            width: '280px',
            paddingTop: '8px',
            transition: 'opacity 0.2s ease-out, transform 0.2s ease-out, visibility 0.2s ease-out',
            transformOrigin: 'top right',
            opacity: isHovering ? 1 : 0,
            transform: isHovering ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.96)',
            visibility: isHovering ? 'visible' : 'hidden',
            pointerEvents: isHovering ? 'auto' : 'none',
            top: dropdownPosition.top,
            right: dropdownPosition.right
        },
        card: {
            backgroundColor: '#FFFFFF',
            borderRadius: '24px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        header: {
            padding: '20px 24px',
            borderBottom: '1px solid #f2f2f2',
            backgroundColor: '#fafafa'
        },
        email: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#111',
            marginBottom: '4px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
        },
        badge: {
            fontSize: '12px',
            color: '#666',
            fontWeight: '500'
        },
        menuItem: {
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '14px',
            color: '#444',
            cursor: 'default'
        },
        logoutBtn: {
            width: '100%',
            textAlign: 'left',
            padding: '16px 24px',
            fontSize: '14px',
            color: '#666',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            transition: 'color 0.2s'
        },
        actionArea: {
            padding: '8px 8px',
            borderTop: '1px solid #f2f2f2',
            backgroundColor: '#fff'
        },
        actionBtn: {
            width: '100%',
            padding: '12px 0',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '14px',
            fontWeight: '600',
            borderRadius: '14px',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.1s',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px'
        }
    }

    if (!user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <style>{`
                    @keyframes subtle-bounce {
                        0%, 5%, 15%, 25%, 100% { transform: translateY(0); }
                        10% { transform: translateY(-3px); }
                        20% { transform: translateY(-1.5px); }
                    }
                `}</style>
                <div style={{
                    color: '#BE123C',
                    fontSize: '13px',
                    fontWeight: '600',
                    padding: '6px 14px',
                    backgroundColor: '#FFF1F2',
                    borderRadius: '100px',
                    border: '1px solid #FFE4E6',
                    whiteSpace: 'nowrap',
                    animation: 'subtle-bounce 5s infinite ease-in-out',
                    cursor: 'default',
                    boxShadow: '0 2px 6px rgba(190, 18, 60, 0.05)'
                }}>
                    🎁 注册即送 5 次 AI 深度润色
                </div>
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    style={styles.loginBtn}
                    onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)'
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'translateY(0) scale(0.98)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translateY(-2px) scale(1)'}
                >
                    登录
                </button>
                {/* 动态加载 AuthModal 以避免循环依赖或未加载问题 */}
                {isAuthModalOpen && <AuthModalWrapper isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
            </div>
        )
    }

    const DropdownContent = (
        <div
            style={styles.dropdown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={{
                ...styles.card,
                boxShadow: '0 16px 60px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.05)' // 加深阴影，提升层次感防止“融为一体”
            }}>
                {/* Header: User Info & Avatar Switcher */}
                <div style={{ ...styles.header, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    {/* 可点击切换的头像 */}
                    <div
                        onClick={handleChangeAvatar}
                        title="点击随机更换头像"
                        style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            border: '2px solid #fff',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            flexShrink: 0,
                            cursor: 'pointer',
                            position: 'relative',
                            backgroundColor: '#f3f4f6'
                        }}
                        onMouseEnter={e => {
                            e.currentTarget.style.transform = 'rotate(15deg) scale(1.05)'
                            e.currentTarget.querySelector('.refresh-icon').style.opacity = '1'
                        }}
                        onMouseLeave={e => {
                            e.currentTarget.style.transform = 'rotate(0) scale(1)'
                            e.currentTarget.querySelector('.refresh-icon').style.opacity = '0'
                        }}
                    >
                        <img src={avatarUrl} alt="用户头像" width="48" height="48" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />

                        {/* Hover Overlay Icon */}
                        <div className="refresh-icon" style={{
                            position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            opacity: 0, transition: 'opacity 0.2s', color: '#fff'
                        }}>
                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={styles.email} title={displayName}>{displayName}</p>

                        {!user.email ? (
                            <button
                                onClick={handleBindEmail}
                                style={{
                                    fontSize: '12px',
                                    color: '#2563eb',
                                    border: 'none',
                                    background: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    fontWeight: '500'
                                }}
                            >
                                + 绑定邮箱
                            </button>
                        ) : (
                            <p style={{ fontSize: '12px', color: '#888' }}>{user.email}</p>
                        )}
                    </div>
                </div>

                {/* List Menu */}
                <div style={{ padding: '8px 0' }}>
                    <div style={styles.menuItem}>
                        <span style={{ fontWeight: 500 }}>可用积分</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>{credits}</span>
                            <button
                                onClick={handleRefresh}
                                aria-label="刷新积分"
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: isRefreshing ? '#000' : '#999',
                                    padding: '4px',
                                    display: 'flex',
                                    transition: 'transform 0.5s ease',
                                    transform: isRefreshing ? 'rotate(360deg)' : 'rotate(0deg)'
                                }}
                                onMouseEnter={e => !isRefreshing && (e.currentTarget.style.color = '#000')}
                                onMouseLeave={e => !isRefreshing && (e.currentTarget.style.color = '#999')}
                                disabled={isRefreshing}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        style={styles.logoutBtn}
                        onMouseEnter={e => { e.currentTarget.style.background = '#f9f9f9'; e.currentTarget.style.color = '#e11d48'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#666'; }}
                    >
                        退出登录
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>

                {/* Footer Big Button */}
                <div style={styles.actionArea}>
                    <button
                        onClick={handlePurchase}
                        style={styles.actionBtn}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#222'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = '#000'}
                    >
                        获取更多积分
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <div
                className="flex flex-col items-center relative z-50"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                ref={triggerRef}
            >
                {/* Avatar - Trigger */}
                <div
                    style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        border: '3px solid #fff',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                        overflow: 'hidden',
                        backgroundColor: '#f3f4f6',
                        transform: isHovering ? 'scale(1.1)' : 'scale(1)',
                        transition: 'transform 0.3s ease'
                    }}
                >
                    <img
                        src={avatarUrl}
                        alt="用户头像"
                        width="36"
                        height="36"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>

                {/* Portal Dropdown */}
                {createPortal(DropdownContent, document.body)}
            </div>

            {/* Pricing Modal */}
            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={() => setIsPricingModalOpen(false)}
            />
        </>
    )
}

// 简单的 Wrapper 避免 import 循环，或者直接 import AuthModal (如果 AuthModal 是 default export)
function AuthModalWrapper({ isOpen, onClose }) {
    return <AuthModal isOpen={isOpen} onClose={onClose} />
}
