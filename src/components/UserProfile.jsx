import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
    const { user, userProfile, signInWithEmail, signOut, refreshProfile } = useAuth()
    const [isHovering, setIsHovering] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const triggerRef = useRef(null)

    // Hover 延迟处理
    const timeoutRef = useRef(null)
    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        setIsHovering(true)
    }
    const handleMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setIsHovering(false)
        }, 150)
    }

    // 计算 Portal 位置
    useEffect(() => {
        if (isHovering && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + 12,
                right: window.innerWidth - rect.right
            })
        }
    }, [isHovering])

    const credits = userProfile?.credits ?? '-'

    // 强制同步检查
    useEffect(() => {
        if (user) {
            if (credits === '-') {
                refreshProfile()
            }
        }
    }, [user, credits])

    // 已登录：显示头像
    const avatarUrl = useMemo(() => {
        if (!user) return ''
        const seed = user.id
        return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`
    }, [user?.id])

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
            transition: 'all 0.2s ease-out',
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
            borderRadius: '16px',
            boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
            overflow: 'hidden',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
            borderRadius: '10px',
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
            <>
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
            </>
        )
    }

    const handlePurchase = () => {
        alert('【模拟充值】\n\n请扫描屏幕上的二维码进行支付...\n(支付成功后积分将增加)')
        setTimeout(() => {
            if (confirm('模拟：支付成功了吗？')) {
                refreshProfile()
            }
        }, 1000)
    }

    const DropdownContent = (
        <div
            style={styles.dropdown}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div style={styles.card}>
                {/* Header: User Info */}
                <div style={styles.header}>
                    <p style={styles.email} title={user.email}>{user.email}</p>
                    <p style={styles.badge}>个人免费版</p>
                </div>

                {/* List Menu */}
                <div style={{ padding: '8px 0' }}>
                    <div style={styles.menuItem}>
                        <span style={{ fontWeight: 500 }}>可用积分</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '18px', color: '#000' }}>{credits}</span>
                            <button
                                onClick={refreshProfile}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '4px', display: 'flex' }}
                                onMouseEnter={e => e.currentTarget.style.color = '#000'}
                                onMouseLeave={e => e.currentTarget.style.color = '#999'}
                            >
                                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
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
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
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
                    alt="User Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
            </div>

            {/* Portal Dropdown */}
            {createPortal(DropdownContent, document.body)}
        </div>
    )
}

// 简单的 Wrapper 避免 import 循环，或者直接 import AuthModal (如果 AuthModal 是 default export)
import AuthModal from './AuthModal'
function AuthModalWrapper({ isOpen, onClose }) {
    return <AuthModal isOpen={isOpen} onClose={onClose} />
}
