import { useState, useContext, createContext, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
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
                e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                e.currentTarget.style.color = '#000000'
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
 * 简历选择器组件 - 紧凑版
 */
function ResumeSelector() {
    const [isOpen, setIsOpen] = useState(false)
    const [isRenaming, setIsRenaming] = useState(null)
    const [newName, setNewName] = useState('')
    const [toastMessage, setToastMessage] = useState(null)
    const [deleteConfirm, setDeleteConfirm] = useState(null)
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef(null)
    const dropdownRef = useRef(null)
    const closeTimerRef = useRef(null)

    const currentResumeId = useResumeStore((state) => state.currentResumeId)
    const resumes = useResumeStore((state) => state.resumes)
    const createResume = useResumeStore((state) => state.createResume)
    const switchResume = useResumeStore((state) => state.switchResume)
    const renameResume = useResumeStore((state) => state.renameResume)
    const deleteResume = useResumeStore((state) => state.deleteResume)
    const duplicateResume = useResumeStore((state) => state.duplicateResume)

    // 直接从 resumes 计算列表，确保响应式更新
    const resumeList = Object.entries(resumes || {}).map(([id, resume]) => ({
        id,
        name: resume.name,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
        isCurrent: id === currentResumeId
    })).sort((a, b) => b.createdAt - a.createdAt)

    const currentResume = resumes?.[currentResumeId]

    useEffect(() => {
        const handleClickOutside = (e) => {
            // 点击外部时关闭（排除按钮和下拉菜单区域）
            const isClickOnButton = buttonRef.current && buttonRef.current.contains(e.target)
            const isClickOnDropdown = dropdownRef.current && dropdownRef.current.contains(e.target)
            if (!isClickOnButton && !isClickOnDropdown) {
                setIsOpen(false)
                setIsRenaming(null)
            }
        }
        if (isOpen) document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [isOpen])

    useEffect(() => {
        if (toastMessage) {
            const timer = setTimeout(() => setToastMessage(null), 2500)
            return () => clearTimeout(timer)
        }
    }, [toastMessage])

    const showToast = (message, type = 'success') => setToastMessage({ message, type })

    // 新建简历
    const handleCreate = () => {
        const result = createResume('新简历')
        if (result.success) {
            setIsOpen(false)
            showToast('新简历已创建')
        } else {
            showToast(result.error, 'error')
        }
    }

    const handleSwitch = (id) => {
        if (id !== currentResumeId) {
            switchResume(id)
            setIsOpen(false)
        }
    }

    const handleStartRename = (id, name) => {
        setIsRenaming(id)
        setNewName(name)
    }

    const handleConfirmRename = (id) => {
        if (newName.trim()) {
            renameResume(id, newName.trim())
            showToast('已重命名')
        }
        setIsRenaming(null)
        setNewName('')
    }

    const handleDelete = (id) => {
        const result = deleteResume(id)
        if (result.success) {
            showToast('已删除')
            setDeleteConfirm(null)
        } else {
            showToast(result.error, 'error')
        }
    }

    const handleDuplicate = (id) => {
        const result = duplicateResume(id)
        if (result.success) {
            setIsOpen(false)
            showToast('已复制')
        } else {
            showToast(result.error, 'error')
        }
    }

    const [renderDropdown, setRenderDropdown] = useState(false)

    // 延迟卸载逻辑，确保退出动画播完
    useEffect(() => {
        if (isOpen) {
            setRenderDropdown(true)
        } else {
            const timer = setTimeout(() => setRenderDropdown(false), 400)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    // 处理 Hover 展开
    const handleMouseEnter = () => {
        if (closeTimerRef.current) clearTimeout(closeTimerRef.current)

        // 即时计算位置
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            setDropdownPosition({
                top: rect.bottom + 8,
                left: rect.right - 260
            })
        }
        setIsOpen(true)
    }

    // 处理 Hover 关闭 (带宽限期)
    const handleMouseLeave = () => {
        closeTimerRef.current = setTimeout(() => {
            setIsOpen(false)
        }, 300) // 略微增加宽限期，体验更从容
    }

    return (
        <>
            {/* Toast - 使用 Portal 渲染到 body */}
            {toastMessage && createPortal(
                <div
                    style={{
                        position: 'fixed',
                        top: '40px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        padding: '12px 24px',
                        borderRadius: '100px',
                        fontSize: '14px',
                        fontWeight: 600,
                        zIndex: 10000,
                        backgroundColor: toastMessage.type === 'error' ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0, 0, 0, 0.8)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        animation: 'toast-in 0.3s cubic-bezier(0.18, 0.89, 0.32, 1.28)'
                    }}
                    role="alert"
                    aria-live="polite"
                >
                    {toastMessage.type === 'error' ? (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    ) : (
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    )}
                    {toastMessage.message}
                    <style>{`
                        @keyframes toast-in {
                            from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
                            to { transform: translateX(-50%) translateY(0); opacity: 1; }
                        }
                    `}</style>
                </div>,
                document.body
            )}

            {/* 删除确认弹窗 - 使用 Portal 渲染到 body */}
            {deleteConfirm && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setDeleteConfirm(null)} />
                    <div style={{ position: 'relative', width: '360px', backgroundColor: '#fff', borderRadius: '32px', padding: '40px 32px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', margin: '0 auto 20px', borderRadius: '18px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#000' }}>确认删除简历？</h3>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '32px', lineHeight: '1.4' }}>"{deleteConfirm.name}" 将被永久删除，且无法找回。</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={() => handleDelete(deleteConfirm.id)} style={{ padding: '16px', fontSize: '16px', fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>确认删除</button>
                            <button onClick={() => setDeleteConfirm(null)} style={{ padding: '16px', fontSize: '16px', fontWeight: 600, color: '#666', background: '#F5F5F7', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>取消</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* 下拉菜单 - 使用 Portal 渲染到 body */}
            <div
                style={{ position: 'relative' }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <button
                    ref={buttonRef}
                    onClick={() => {
                        if (!isOpen) handleMouseEnter()
                        setIsOpen(!isOpen)
                    }}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 12px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        borderRadius: '0',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 500,
                        color: '#1D1D1F',
                        transition: 'all 0.15s'
                    }}
                    aria-haspopup="listbox"
                    aria-expanded={isOpen}
                >
                    <span style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {currentResume?.name || '我的简历'}
                    </span>
                    <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {renderDropdown && createPortal(
                <div
                    ref={dropdownRef}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        position: 'fixed',
                        top: dropdownPosition.top,
                        left: dropdownPosition.left,
                        width: '260px',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                        backdropFilter: 'blur(16px)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 40px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05)',
                        zIndex: 10000,
                        overflow: 'hidden',
                        // 优雅动画定义
                        opacity: isOpen ? 1 : 0,
                        transform: isOpen ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.98)',
                        visibility: isOpen ? 'visible' : 'hidden',
                        transformOrigin: 'top right',
                        transition: 'opacity 0.3s ease, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), visibility 0.3s',
                        pointerEvents: isOpen ? 'auto' : 'none'
                    }}
                    role="listbox"
                >
                    <div style={{ maxHeight: '240px', overflowY: 'auto', padding: '6px' }}>
                        {resumeList.map((resume) => (
                            <div
                                key={resume.id}
                                style={{ display: 'flex', alignItems: 'center', padding: '8px 10px', borderRadius: '8px', backgroundColor: resume.isCurrent ? 'rgba(0,0,0,0.08)' : 'transparent', cursor: 'pointer' }}
                                onClick={() => handleSwitch(resume.id)}
                                role="option"
                                aria-selected={resume.isCurrent}
                            >
                                <div style={{ width: '18px', marginRight: '8px' }}>
                                    {resume.isCurrent && <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="#000000" strokeWidth={2.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {isRenaming === resume.id ? (
                                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); handleConfirmRename(resume.id); } if (e.key === 'Escape') { e.stopPropagation(); setIsRenaming(null); } }} onBlur={() => handleConfirmRename(resume.id)} autoFocus onClick={(e) => e.stopPropagation()} style={{ width: '100%', padding: '2px 6px', fontSize: '13px', border: '1px solid #0071E3', borderRadius: '4px', outline: 'none' }} aria-label="简历名称" />
                                    ) : (
                                        <span style={{ fontSize: '13px', fontWeight: resume.isCurrent ? 600 : 400, color: resume.isCurrent ? '#000000' : '#1D1D1F', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>{resume.name}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', gap: '2px', opacity: 0.5 }}>
                                    <button onClick={(e) => { e.stopPropagation(); handleStartRename(resume.id, resume.name) }} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }} title="重命名" aria-label="重命名"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                                    <button onClick={(e) => { e.stopPropagation(); handleDuplicate(resume.id) }} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer' }} title="复制" aria-label="复制"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg></button>
                                    {resumeList.length > 1 && <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); setDeleteConfirm({ id: resume.id, name: resume.name }) }} style={{ padding: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#EF4444' }} title="删除" aria-label="删除"><svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>}
                                </div>
                            </div>
                        ))}
                    </div>
                    {/* 底部功能栏：整合新建简历 */}
                    <div style={{ padding: '8px', borderTop: '1px solid #F0F0F0', backgroundColor: '#fafafa' }}>
                        <button
                            onClick={(e) => { e.stopPropagation(); handleCreate(); }}
                            style={{
                                width: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '6px',
                                padding: '12px',
                                fontSize: '13px',
                                fontWeight: 700,
                                color: '#FFFFFF',
                                backgroundColor: '#000000',
                                border: 'none',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333333'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000000'}
                        >
                            新建简历
                        </button>
                    </div>
                </div>,
                document.body
            )}
        </>
    )
}


/**
 * EditorPanel - 左侧编辑区
 * 
 * 布局优化 v2：
 * - 顶部工具栏精简：Logo + 简历选择器 + 更多菜单
 * - 删除冗余状态提示（自动保存、隐私轮播）
 * - 次要功能整合到菜单中
 */
function EditorPanel() {
    const sectionOrder = useResumeStore((state) => state.resumes[state.currentResumeId]?.data?.sectionOrder || [])
    const reorderSections = useResumeStore((state) => state.reorderSections)

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    )

    const handleDragEnd = (event) => {
        const { active, over } = event
        if (active.id !== over?.id) {
            const oldIndex = sectionOrder.indexOf(active.id)
            const newIndex = sectionOrder.indexOf(over.id)
            const newOrder = arrayMove(sectionOrder, oldIndex, newIndex)
            reorderSections(newOrder)
        }
    }

    return (
        <aside className="w-[640px] min-w-[640px] h-screen flex flex-col" style={{ backgroundColor: 'var(--color-bg)' }}>
            {/* 极简顶部工具栏 - 统一高度为 64px 且垂直居中 */}
            <header className="z-20 flex-shrink-0 bg-white border-b border-gray-100" style={{ height: '64px', display: 'flex', alignItems: 'center', padding: '0 24px' }}>
                <div className="flex items-center justify-between w-full">
                    {/* 左侧：仅 Logo (保持简洁) */}
                    <div className="flex items-center gap-4">
                        <h1 className="brand-logo" style={{ fontSize: '20px' }}>极简简历</h1>
                    </div>

                    {/* 右侧：简历管理入口 (一体化整合) */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <ResumeSelector />
                    </div>
                </div>
            </header>

            {/* 编辑模块列表 - 独立的滚动容器 */}
            <div className="flex-1 overflow-y-auto hide-scrollbar">
                <div style={{ maxWidth: '600px', margin: '0 auto', padding: '24px 24px 120px 24px' }} className="space-y-16">
                    <BasicInfo />

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={sectionOrder} strategy={verticalListSortingStrategy}>
                            {sectionOrder.map((sectionId) => {
                                const config = SECTION_CONFIG[sectionId]
                                if (!config) return null
                                const Component = config.component
                                return (
                                    <SortableSection key={sectionId} editMode={true} id={sectionId}>
                                        <Component />
                                    </SortableSection>
                                )
                            })}
                        </SortableContext>
                    </DndContext>

                    <div style={{ marginTop: '64px' }}>
                        <CustomSection />
                    </div>
                </div>
            </div>
        </aside>
    )
}

export default EditorPanel
