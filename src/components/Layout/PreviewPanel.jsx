import ResumePage from '../Preview/ResumePage'
import ExportButtons from '../Toolbar/ExportButtons'
import UserProfile from '../UserProfile'

/**
 * PreviewPanel - 右侧预览区容器
 * 自适应宽度，深灰背景，居中显示 A4 简历预览
 */
function PreviewPanel() {
    return (
        <main className="flex-1 h-screen overflow-y-auto hide-scrollbar"
            style={{
                background: 'linear-gradient(180deg, #E8E8ED 0%, #D8D8DD 100%)'
            }}>
            {/* 顶部导出工具栏 - 玻璃态增强 */}
            <header className="sticky top-0 z-10 header-glass"
                style={{
                    padding: '14px 24px'
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

            {/* A4 简历预览 */}
            <div className="py-6">
                <ResumePage />
            </div>
        </main >
    )
}

export default PreviewPanel
