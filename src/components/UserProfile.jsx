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
        }, 150) // 150ms 延迟，既灵活又不失灵敏
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
            console.log('UserProfile Mounted. User:', user?.email, 'Credits:', credits)
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

    if (!user) {
        return (
            <>
                <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="
                        h-10 px-8 min-w-[100px]
                        bg-black hover:bg-[#222]
                        text-white text-[14px] font-bold tracking-[0.2em]
                        rounded-full
                        shadow-md hover:shadow-lg
                        hover:-translate-y-0.5 active:translate-y-0 active:scale-95
                        transition-all duration-300 ease-out
                        flex items-center justify-center
                    "
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
                fixed z-[999999] w-[260px] pt-2 transition-all duration-200 ease-out origin-top-right
                ${isHovering ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible'}
            `}
            style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right
            }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div className="bg-white rounded-xl shadow-[0_12px_40px_-10px_rgba(0,0,0,0.15)] ring-1 ring-black/5 overflow-hidden">
                {/* Header: User Info */}
                <div className="px-5 py-4 flex flex-col gap-1 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate font-mono" title={user.email}>{user.email}</p>
                    <p className="text-xs text-gray-500">个人免费版</p>
                </div>

                {/* List Menu */}
                <div className="py-2">
                    <div className="px-5 py-2 flex items-center justify-between group cursor-default">
                        <span className="text-sm text-gray-600 font-medium">可用积分</span>
                        <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-lg text-gray-900">{credits}</span>
                            <button
                                onClick={refreshProfile}
                                className="text-gray-400 hover:text-black transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={signOut}
                        className="w-full text-left px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50 transition-colors hover:text-red-600 flex items-center justify-between"
                    >
                        退出登录
                        <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    </button>
                </div>

                {/* Footer Big Button */}
                <div className="p-2 border-t border-gray-100">
                    <button
                        onClick={handlePurchase}
                        className="w-full py-2.5 bg-black text-white rounded-lg text-[13px] font-semibold hover:bg-[#222] transition-colors shadow-sm flex items-center justify-center gap-2"
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
                className={`
                    w-9 h-9 rounded-full flex items-center justify-center 
                    shadow-[0_2px_8px_rgba(0,0,0,0.08)] cursor-pointer 
                    border-[3px] border-white 
                    transform transition-all duration-300 ease-out
                    ${isHovering ? 'scale-110 ring-2 ring-indigo-500/20' : 'hover:scale-105'}
                    overflow-hidden bg-gray-100
                `}
            >
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
