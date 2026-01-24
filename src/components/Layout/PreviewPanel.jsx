import { useState, useEffect, useRef } from 'react'
import ResumePage from '../Preview/ResumePage'
import ExportButtons from '../Toolbar/ExportButtons'
import UserProfile from '../UserProfile'
import { useAuth } from '../../context/AuthContext' // 修正路径：回退两级

/**
 * PreviewPanel - 右侧预览区
 * 
 * 布局优化 v2：
 * - 删除"实时预览"状态提示（默认行为无需说明）
 * - 工具栏仅保留核心功能：导出 + 帮助 + 用户
 * - 增加注册优惠提示条（未登录时显示在最左侧）
 */
function PreviewPanel() {
    const { user } = useAuth() // 获取登录状态

    // 注册优惠提示组件（内部定义，保持独立）
    const PromotionTag = () => (
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '16px' }}>
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
        </div>
    )

    return (
        <main className="flex-1 h-screen flex flex-col" style={{ background: 'linear-gradient(180deg, #E8E8ED 0%, #D8D8DD 100%)', overflow: 'visible' }}>
            {/* 极简顶部工具栏 - 统一高度为 64px 且垂直居中 */}
            <header className="z-50 flex-shrink-0 bg-white border-b border-gray-100" style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px', overflow: 'visible' }}>
                <div className="flex items-center justify-end w-full" style={{ maxWidth: '210mm', margin: '0 auto' }}>

                    {/* 未登录时显示优惠提示 */}
                    {!user && <PromotionTag />}

                    {/* 导出按钮 */}
                    <ExportButtons />

                    {/* 分隔 */}
                    <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E5E5', margin: '0 6px' }} />

                    {/* 用户 */}
                    <UserProfile />
                </div>
            </header>

            {/* A4 预览区 */}
            <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
                <ResumePage />
            </div>
        </main>
    )
}

export default PreviewPanel
