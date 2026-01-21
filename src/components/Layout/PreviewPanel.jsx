import ResumePage from '../Preview/ResumePage'
import ExportButtons from '../Toolbar/ExportButtons'
import UserProfile from '../UserProfile'

/**
 * PreviewPanel - 右侧预览区容器
 * 结构优化：Header 移除滚动区域，防止 Dropdown 被截断
 */
function PreviewPanel() {
    return (
        <main className="flex-1 h-screen flex flex-col"
            style={{
                background: 'linear-gradient(180deg, #E8E8ED 0%, #D8D8DD 100%)',
                overflow: 'visible'
            }}>
            {/* 顶部导出工具栏 - 移出滚动区域，防止 Dropdown 被截断 */}
            <header className="z-50 flex-shrink-0 bg-white border-b border-gray-100"
                style={{
                    padding: '14px 24px',
                    overflow: 'visible' // 强制显示溢出内容
                }}>
                <div className="flex items-center justify-between" style={{ maxWidth: '210mm', margin: '0 auto' }}>
                    <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--color-text-secondary)' }}>
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        实时预览
                    </span>
                    <div className="flex items-center gap-3">
                        <ExportButtons />
                        <div className="w-px h-5 bg-gray-300 mx-1"></div>
                        <UserProfile />
                    </div>
                </div>
            </header>

            {/* A4 简历预览 - 独立的滚动区域 */}
            <div className="flex-1 overflow-y-auto hide-scrollbar py-6">
                <ResumePage />
            </div>
        </main>
    )
}

export default PreviewPanel
