import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
    const { user, userProfile, signInWithEmail, signOut, refreshProfile } = useAuth()
    const [isHovering, setIsHovering] = useState(false)
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
    const triggerRef = useRef(null)

    // 计算 Portal 位置
    useEffect(() => {
        if (isHovering && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + 10,
                right: window.innerWidth - rect.right
            })
        }
    }, [isHovering])

    const credits = userProfile?.credits ?? '-'

    // 强制同步检查
    useEffect(() => {
        // 只有当有 user 时才执行
        if (user) {
            console.log('UserProfile Mounted. User:', user?.email, 'Credits:', credits)
            if (credits === '-') {
                refreshProfile()
            }
        }
    }, [user, credits])

    // 已登录：显示头像
    const avatarUrl = useMemo(() => {
        if (!user) return ''
        const seed = user.email || 'user'
        return `https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(seed)}&backgroundColor=transparent`
    }, [user?.email])

    if (!user) {
        return (
            <>
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="px-4 py-1.5 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition shadow-sm"
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
            className={`
                fixed z-[999999] w-64 pt-2 transition-all duration-200
                ${isHovering ? 'opacity-100 translate-y-0 visible' : 'opacity-0 -translate-y-2 invisible'}
            `}
            style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right - 10 // 微调对齐
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            <div className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-gray-100 overflow-hidden">
                {/* Header */}
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-100">
                    <p className="text-xs text-gray-500 font-medium">当前账号</p>
                    <p className="text-sm font-bold text-gray-800 truncate" title={user.email}>{user.email}</p>
                </div>

                {/* Credits */}
                <div className="px-4 py-4 text-center">
                    <p className="text-xs text-gray-500 mb-1">剩余润色次数</p>
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <span className="text-3xl font-black text-indigo-600 font-mono">{credits}</span>
                        <button
                            onClick={refreshProfile}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-indigo-500 transition"
                            title="刷新余额"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                        </button>
                    </div>

                    <button
                        onClick={handlePurchase}
                        className="w-full py-2 bg-black text-white rounded-lg text-sm font-bold hover:bg-gray-800 transition transform hover:scale-[1.02] active:scale-95"
                    >
                        购买次数
                    </button>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-100">
                    <button
                        onClick={signOut}
                        className="w-full text-left px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition flex items-center gap-2"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        退出登录
                    </button>
                </div>
            </div>
        </div>
    )

    return (
        <div
            className="flex flex-col items-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            ref={triggerRef}
        >
            {/* Avatar - Trigger */}
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg cursor-pointer border-2 border-white transform transition hover:scale-105 overflow-hidden active:scale-95">
                <img
                    src={avatarUrl}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
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
