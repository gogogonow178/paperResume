import { useState, useContext } from 'react'
import { DragHandleContext } from '../Layout/EditorPanel'
import useResumeStore from '../../store/useResumeStore'

/**
 * CollapsibleSection - 可折叠的模块容器
 * @param {string} title - 模块标题
 * @param {string} sectionId - 模块标识（用于隐藏/显示）
 * @param {number} count - 项目数量
 * @param {boolean} defaultExpanded - 默认是否展开
 * @param {ReactNode} children - 子内容
 */
function CollapsibleSection({ title, sectionId, count, defaultExpanded = true, children }) {
    const [isExpanded, setIsExpanded] = useState(defaultExpanded)
    const dragHandle = useContext(DragHandleContext)

    // 从 Store 获取隐藏状态和切换方法
    const hiddenSections = useResumeStore((state) => state.hiddenSections)
    const toggleSectionVisibility = useResumeStore((state) => state.toggleSectionVisibility)
    const isHidden = sectionId && hiddenSections.includes(sectionId)

    // 如果模块被隐藏，显示简化的恢复卡片
    if (isHidden) {
        return (
            <section>
                <div
                    onClick={() => toggleSectionVisibility(sectionId)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '16px 20px',
                        marginTop: '8px',
                        marginBottom: '24px',
                        background: 'rgba(0,0,0,0.02)',
                        borderRadius: '12px',
                        border: '1px dashed #E5E5EA',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,113,227,0.04)'
                        e.currentTarget.style.borderColor = '#0071E3'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.02)'
                        e.currentTarget.style.borderColor = '#E5E5EA'
                    }}
                >
                    <span style={{ color: '#86868B', fontSize: '14px' }}>
                        <span style={{ opacity: 0.6, marginRight: '8px' }}>👁️‍🗨️</span>
                        {title}（已隐藏）
                    </span>
                    <span style={{ color: '#0071E3', fontSize: '13px', fontWeight: 500 }}>
                        点击恢复
                    </span>
                </div>
            </section>
        )
    }

    return (
        <section>
            {/* 可点击的标题栏 */}
            <header
                className="flex items-center justify-between px-1 cursor-pointer group"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: '#1d1d1f' }}>
                    <span className="section-indicator"></span>
                    {title}
                </h2>
                <div className="flex items-center gap-1">
                    {count !== undefined && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                            {count} 项
                        </span>
                    )}

                    {/* 隐藏按钮 - 眼睛图标 */}
                    {sectionId && (
                        <button
                            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                            onClick={(e) => {
                                e.stopPropagation()
                                toggleSectionVisibility(sectionId)
                            }}
                            title="隐藏此模块"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                        </button>
                    )}

                    {/* 拖拽手柄 - 通过 Context 获取 */}
                    {dragHandle}

                    {/* 折叠图标 */}
                    <button
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
                        onClick={(e) => {
                            e.stopPropagation()
                            setIsExpanded(!isExpanded)
                        }}
                    >
                        <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-0' : '-rotate-90'}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
            </header>

            {/* 可折叠内容区 */}
            <div
                className={`overflow-hidden transition-all duration-300 ease-out ${isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0'
                    }`}
            >
                {children}
            </div>
        </section>
    )
}

export default CollapsibleSection

