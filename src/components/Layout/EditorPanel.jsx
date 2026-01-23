import { useState, useContext, createContext } from 'react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import useResumeStore from '../../store/useResumeStore'
import BasicInfo from '../Editor/BasicInfo'
import Education from '../Editor/Education'
import WorkExperience from '../Editor/WorkExperience'
import Project from '../Editor/Project'
import Skills from '../Editor/Skills'
import Summary from '../Editor/Summary'
import CustomSection from '../Editor/CustomSection'

// 拖拽手柄 Context
export const DragHandleContext = createContext(null)

/**
 * 模块配置映射
 */
const SECTION_CONFIG = {
    education: { component: Education, label: '教育经历' },
    workExperience: { component: WorkExperience, label: '工作经历' },
    projects: { component: Project, label: '项目经历' },
    skills: { component: Skills, label: '专业技能' },
    summary: { component: Summary, label: '个人总结' },
}

/**
 * 拖拽手柄组件
 */
function DragHandle({ attributes, listeners }) {
    return (
        <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.stopPropagation()}
            style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                cursor: 'grab',
                color: '#B0B0B5',
                transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(0,113,227,0.08)'
                e.currentTarget.style.color = '#0071E3'
            }}
            onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent'
                e.currentTarget.style.color = '#B0B0B5'
            }}
            title="拖拽排序"
        >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <circle cx="9" cy="6" r="1.5" />
                <circle cx="15" cy="6" r="1.5" />
                <circle cx="9" cy="12" r="1.5" />
                <circle cx="15" cy="12" r="1.5" />
                <circle cx="9" cy="18" r="1.5" />
                <circle cx="15" cy="18" r="1.5" />
            </svg>
        </div>
    )
}

/**
 * 可拖拽模块包装器
 */
function SortableSection({ id, children }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    // 通过 Context 传递拖拽手柄
    const dragHandle = <DragHandle attributes={attributes} listeners={listeners} />

    return (
        <DragHandleContext.Provider value={dragHandle}>
            <div ref={setNodeRef} style={style}>
                {children}
            </div>
        </DragHandleContext.Provider>
    )
}

/**
 * EditorPanel - 左侧编辑区容器
 */
function EditorPanel() {
    const resetResume = useResumeStore((state) => state.resetResume)
    const sectionOrder = useResumeStore((state) => state.sectionOrder)
    const reorderSections = useResumeStore((state) => state.reorderSections)
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    // 拖拽传感器配置
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    )

    // 处理拖拽结束
    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = sectionOrder.indexOf(active.id)
            const newIndex = sectionOrder.indexOf(over.id)
            const newOrder = arrayMove(sectionOrder, oldIndex, newIndex)
            reorderSections(newOrder)
        }
    }

    // 处理重置操作
    const handleReset = () => {
        resetResume()
        setShowResetConfirm(false)
    }

    return (
        <aside className="w-[640px] min-w-[640px] h-screen overflow-y-auto hide-scrollbar"
            style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* 顶部工具栏 */}
            <header className="sticky top-0 z-20 header-glass" style={{ padding: '16px 30px' }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <h1 className="brand-logo">极简简历</h1>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '4px 10px',
                                borderRadius: '20px',
                                background: 'rgba(34, 197, 94, 0.1)',
                                fontSize: '11px',
                                fontWeight: 500,
                                color: '#16A34A'
                            }}
                        >
                            <span
                                style={{
                                    width: '6px',
                                    height: '6px',
                                    borderRadius: '50%',
                                    background: '#22C55E',
                                    animation: 'pulse 2s infinite'
                                }}
                            />
                            已自动保存
                        </div>
                        {/* 上下滚动的隐私提示 */}
                        <div
                            style={{
                                height: '20px',
                                overflow: 'hidden',
                                fontSize: '11px',
                                color: '#86868B',
                            }}
                        >
                            <div
                                style={{
                                    animation: 'scrollUp 9s ease-in-out infinite',
                                }}
                            >
                                <div style={{ height: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>🔒</span> 本地存储，数据不上传
                                </div>
                                <div style={{ height: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>🛡️</span> 无云端服务，隐私安全
                                </div>
                                <div style={{ height: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span>💾</span> 刷新不丢失，自动保存
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowResetConfirm(true)}
                            className="btn btn-secondary text-sm py-2 px-4"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            重置
                        </button>
                        <a
                            href="https://github.com/gogogonow178/paperResume"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary text-sm py-2 px-3"
                            title="GitHub"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
                            </svg>
                        </a>
                    </div>
                </div>
            </header>

            {/* 重置确认对话框 */}
            {showResetConfirm && (
                <div
                    style={{
                        position: 'fixed',
                        inset: 0,
                        zIndex: 9999,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: '16px'
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            backdropFilter: 'blur(8px)'
                        }}
                        onClick={() => setShowResetConfirm(false)}
                    />
                    <div
                        style={{
                            position: 'relative',
                            width: '100%',
                            maxWidth: '400px',
                            backgroundColor: '#fff',
                            borderRadius: '24px',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                        }}
                    >
                        <div style={{ padding: '32px 28px 24px' }}>
                            <div
                                style={{
                                    width: '72px',
                                    height: '72px',
                                    margin: '0 auto 20px',
                                    borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #FEF2F2 0%, #FEF3C7 100%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                            >
                                <svg
                                    style={{ width: '36px', height: '36px', color: '#EF4444' }}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                                    />
                                </svg>
                            </div>
                            <h3
                                style={{
                                    fontSize: '20px',
                                    fontWeight: 700,
                                    textAlign: 'center',
                                    color: '#1D1D1F',
                                    marginBottom: '12px'
                                }}
                            >
                                确认重置所有内容？
                            </h3>
                            <p
                                style={{
                                    fontSize: '14px',
                                    lineHeight: 1.6,
                                    textAlign: 'center',
                                    color: '#6B7280',
                                    marginBottom: '8px'
                                }}
                            >
                                此操作将清除所有已填写的信息并恢复为默认示例。
                            </p>
                            <p
                                style={{
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    color: '#EF4444'
                                }}
                            >
                                ⚠️ 操作无法撤销，请谨慎处理
                            </p>
                        </div>
                        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button
                                onClick={handleReset}
                                style={{
                                    width: '100%',
                                    padding: '14px 0',
                                    fontSize: '15px',
                                    fontWeight: 600,
                                    color: '#fff',
                                    background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                                    transition: 'transform 0.15s, opacity 0.15s'
                                }}
                            >
                                确认重置
                            </button>
                            <button
                                onClick={() => setShowResetConfirm(false)}
                                style={{
                                    width: '100%',
                                    padding: '14px 0',
                                    fontSize: '15px',
                                    fontWeight: 500,
                                    color: '#6B7280',
                                    background: '#F3F4F6',
                                    border: 'none',
                                    borderRadius: '12px',
                                    cursor: 'pointer',
                                    transition: 'background 0.15s'
                                }}
                            >
                                取消
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 编辑模块列表 */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '32px 24px 120px 24px'
            }} className="space-y-16">
                {/* 基本信息 - 固定在顶部，不可拖拽 */}
                <BasicInfo />

                {/* 可拖拽排序的模块 */}
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    <SortableContext
                        items={sectionOrder}
                        strategy={verticalListSortingStrategy}
                    >
                        {sectionOrder.map((sectionId) => {
                            const config = SECTION_CONFIG[sectionId]
                            if (!config) return null
                            const Component = config.component
                            return (
                                <SortableSection key={sectionId} id={sectionId}>
                                    <Component />
                                </SortableSection>
                            )
                        })}
                    </SortableContext>
                </DndContext>

                {/* 自定义模块 - 独立处理 */}
                <CustomSection />
            </div>
        </aside>
    )
}

export default EditorPanel
