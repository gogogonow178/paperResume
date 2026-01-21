import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

export default function UserProfile() {
    const { user, userProfile, signInWithEmail, signOut, refreshProfile } = useAuth()
    const [isHovering, setIsHovering] = useState(false)

    // 如果未登录，不显示（或者显示登录按钮，视需求而定，这里假设首页已有AuthModal触发逻辑，
    // 但为了闭环，这里应该提供一个登录入口或者只在登录后显示）
    // 既然要求闭环，如果没登录，应该显示 "登录"

    // 我们需要一个状态来控制 AuthModal 的显示，但 AuthModal 目前是在 RichTextEditor 里控制的。
    // 这说明我们需要把 AuthModal 提升到 App 级别，或者在这里再放一个 AuthModal。
    // 为了简单，我们先只处理“已登录”状态。未登录状态通常由主要的 "开始使用" 按钮触发。
    // 不过，为了完整性，如果未登录，我们可以显示一个简洁的 "登录" 按钮。

    // 等等，AuthModal 目前是局部组件。如果在这里触发登录，需要引入 AuthModal。
    // 让我先引入 AuthModal。

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

    // 导入 AuthModal (需要绝对路径或相对路径)
    // 假设同在 components 目录下，但 UserProfile 在 components 根目录，AuthModal 也在

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

    // 已登录：显示头像
    const initial = user.email ? user.email[0].toUpperCase() : 'U'
    const credits = userProfile?.credits ?? '-'

    const handlePurchase = () => {
        alert('【模拟充值】\n\n请扫描屏幕上的二维码进行支付...\n(支付成功后积分将增加)')
        // 模拟充值成功
        setTimeout(() => {
            if (confirm('模拟：支付成功了吗？')) {
                refreshProfile() // 实际应该由后端 webhook 触发，这里手动刷新演示
            }
        }, 1000)
    }

    return (
        <div
            className="relative z-50 flex flex-col items-center"
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/*Avatar*/}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg cursor-pointer border-2 border-white transform transition hover:scale-105">
                {initial}
            </div>

            {/* Dropdown Container - 紧贴头像，防止鼠标划过间隙时消失 */}
            <div
                className={`
                    absolute top-9 right-0 pt-4 w-64 origin-top-right transition-all duration-200
                    ${isHovering ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}
                `}
            >
                {/* 实际的卡片内容 - 在这里应用背景和阴影 */}
                <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden">
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
        </div>
    )
}

// 简单的 Wrapper 避免 import 循环，或者直接 import AuthModal (如果 AuthModal 是 default export)
import AuthModal from './AuthModal'
function AuthModalWrapper({ isOpen, onClose }) {
    return <AuthModal isOpen={isOpen} onClose={onClose} onSuccess={() => window.location.reload()} />
    // onSuccess 刷新页面以确保状态更新，或者 AuthContext 会自动处理
}
