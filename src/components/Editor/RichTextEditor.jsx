import { useRef, useCallback, useState, lazy, Suspense } from 'react'
import { useAuth } from '../../context/AuthContext'

// 动态导入 AuthModal 和 PricingModal，减少初始包体积
const AuthModal = lazy(() => import('../AuthModal'))
const PricingModal = lazy(() => import('../PricingModal'))

/**
 * RichTextEditor - 简历专用文本编辑器
 * 支持列表和缩进功能
 */
function RichTextEditor({ value, onChange, placeholder, minRows = 3 }) {
    const textareaRef = useRef(null)

    // 在当前行开头插入标记
    const insertLinePrefix = useCallback((marker) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value

        // 找到选中范围内所有行的起点
        let lineStart = text.lastIndexOf('\n', start - 1) + 1
        let lineEnd = text.indexOf('\n', end)
        if (lineEnd === -1) lineEnd = text.length

        // 获取选中的行
        const selectedLines = text.substring(lineStart, lineEnd)

        // 给每行添加前缀
        const newLines = selectedLines.split('\n').map((line, idx) => {
            // 如果是数字列表，自动递增
            if (marker === '1. ') {
                return `${idx + 1}. ${line.replace(/^\d+\.\s*/, '')}`
            }
            // 如果已有标记则不重复添加
            if (line.startsWith(marker)) return line
            return marker + line
        }).join('\n')

        const newText = text.substring(0, lineStart) + newLines + text.substring(lineEnd)
        onChange(newText)

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(lineStart, lineStart + newLines.length)
        }, 0)
    }, [onChange])

    // 缩进/取消缩进
    const adjustIndent = useCallback((increase) => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const text = textarea.value

        let lineStart = text.lastIndexOf('\n', start - 1) + 1
        let lineEnd = text.indexOf('\n', end)
        if (lineEnd === -1) lineEnd = text.length

        const selectedLines = text.substring(lineStart, lineEnd)
        const indent = '    ' // 4 spaces

        const newLines = selectedLines.split('\n').map(line => {
            if (increase) {
                return indent + line
            } else {
                // 移除开头的空格（最多4个）
                return line.replace(/^(\s{1,4})/, '')
            }
        }).join('\n')

        const newText = text.substring(0, lineStart) + newLines + text.substring(lineEnd)
        onChange(newText)

        setTimeout(() => {
            textarea.focus()
            textarea.setSelectionRange(lineStart, lineStart + newLines.length)
        }, 0)
    }, [onChange])

    // 处理回车：自动继续列表
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            const textarea = e.target
            const start = textarea.selectionStart
            const text = textarea.value

            let lineStart = text.lastIndexOf('\n', start - 1) + 1
            const currentLine = text.substring(lineStart, start)

            // 检查是否是列表项
            const bulletMatch = currentLine.match(/^(\s*)(•\s|[-*]\s|\d+\.\s)/)
            if (bulletMatch) {
                e.preventDefault()
                const indent = bulletMatch[1]
                let marker = bulletMatch[2]

                // 数字列表递增
                if (/^\d+\.\s/.test(marker)) {
                    const num = parseInt(marker) + 1
                    marker = `${num}. `
                }

                const insertion = '\n' + indent + marker
                const newText = text.substring(0, start) + insertion + text.substring(start)
                onChange(newText)

                setTimeout(() => {
                    const newPos = start + insertion.length
                    textarea.setSelectionRange(newPos, newPos)
                }, 0)
            }
        }

        // Tab 键缩进
        if (e.key === 'Tab') {
            e.preventDefault()
            adjustIndent(!e.shiftKey)
        }
    }

    // ----------------------------------------------------------------
    // AI 润色逻辑
    // ----------------------------------------------------------------
    const { user, session, userProfile, refreshProfile } = useAuth && useAuth() || {} // Fail safe if context missing
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false)
    const [isPolishing, setIsPolishing] = useState(false)

    // AI 润色结果缓存 (相同输入不重复请求，避免消耗额度)
    const polishCacheRef = useRef(new Map())

    const handlePolish = async () => {
        const textToPolish = value || ''
        if (!textToPolish.trim()) return

        // 1. 检查登录
        if (!user) {
            setIsAuthModalOpen(true)
            return
        }

        // 2. 前端预检查积分 - 积分为 0 时直接弹出充值弹窗，不发请求
        const credits = userProfile?.credits ?? 0
        if (credits <= 0) {
            setIsPricingModalOpen(true)
            return
        }

        // 3. 检查缓存 - 相同输入直接返回缓存结果
        const cacheKey = textToPolish.trim()
        const cachedResult = polishCacheRef.current.get(cacheKey)
        if (cachedResult) {
            onChange(cachedResult)
            return
        }

        // 3. 开始润色
        setIsPolishing(true)
        try {
            const res = await fetch('/api/polish', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ text: textToPolish })
            })

            const data = await res.json()

            if (!res.ok) {
                // 如果是额度不足 (403)，弹出充值弹窗
                if (res.status === 403) {
                    setIsPricingModalOpen(true)
                } else {
                    throw new Error(data.error || '请求失败')
                }
                return
            }

            // 4. 成功回填并缓存
            if (data.result) {
                // 缓存结果，限制缓存大小避免内存泄漏
                if (polishCacheRef.current.size > 50) {
                    const firstKey = polishCacheRef.current.keys().next().value
                    polishCacheRef.current.delete(firstKey)
                }
                polishCacheRef.current.set(cacheKey, data.result)

                onChange(data.result)
                // 刷新余额
                if (refreshProfile) refreshProfile()
            }

        } catch (error) {
            console.error('Polish error:', error)
            alert('润色失败，请稍后重试: ' + error.message)
        } finally {
            setIsPolishing(false)
        }
    }

    // 工具栏按钮配置 - 使用清晰的 SVG 图标
    const tools = [
        {
            action: () => insertLinePrefix('• '),
            title: '无序列表',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="4" cy="6" r="2" fill="currentColor" stroke="none" />
                    <line x1="10" y1="6" x2="21" y2="6" />
                    <circle cx="4" cy="12" r="2" fill="currentColor" stroke="none" />
                    <line x1="10" y1="12" x2="21" y2="12" />
                    <circle cx="4" cy="18" r="2" fill="currentColor" stroke="none" />
                    <line x1="10" y1="18" x2="21" y2="18" />
                </svg>
            )
        },
        {
            action: () => insertLinePrefix('1. '),
            title: '有序列表',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <text x="2" y="8" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">1</text>
                    <line x1="10" y1="6" x2="21" y2="6" />
                    <text x="2" y="14" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">2</text>
                    <line x1="10" y1="12" x2="21" y2="12" />
                    <text x="2" y="20" fontSize="8" fill="currentColor" stroke="none" fontFamily="system-ui">3</text>
                    <line x1="10" y1="18" x2="21" y2="18" />
                </svg>
            )
        },
        { type: 'divider' },
        {
            action: () => adjustIndent(false),
            title: '减少缩进 (Shift+Tab)',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="7,8 3,12 7,16" />
                    <line x1="21" y1="6" x2="11" y2="6" />
                    <line x1="21" y1="12" x2="11" y2="12" />
                    <line x1="21" y1="18" x2="11" y2="18" />
                </svg>
            )
        },
        {
            action: () => adjustIndent(true),
            title: '增加缩进 (Tab)',
            icon: (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <polyline points="3,8 7,12 3,16" />
                    <line x1="21" y1="6" x2="11" y2="6" />
                    <line x1="21" y1="12" x2="11" y2="12" />
                    <line x1="21" y1="18" x2="11" y2="18" />
                </svg>
            )
        },
    ]

    return (
        <div className="rich-text-editor">
            {/* 仅在需要时加载 AuthModal */}
            {isAuthModalOpen && (
                <Suspense fallback={null}>
                    <AuthModal
                        isOpen={isAuthModalOpen}
                        onClose={() => setIsAuthModalOpen(false)}
                        onSuccess={() => {
                            setIsAuthModalOpen(false)
                            // 登录成功后自动开始润色 (UX 优化)
                            handlePolish()
                        }}
                    />
                </Suspense>
            )}

            {/* 额度不足时显示充值弹窗 */}
            {isPricingModalOpen && (
                <Suspense fallback={null}>
                    <PricingModal
                        isOpen={isPricingModalOpen}
                        onClose={() => setIsPricingModalOpen(false)}
                    />
                </Suspense>
            )}

            {/* 工具栏 */}
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '8px 12px',
                    background: '#3A3A3C',
                    borderRadius: '10px 10px 0 0',
                }}
            >
                {/* AI 润色按钮 (高亮显示) */}
                <button
                    type="button"
                    onClick={handlePolish}
                    disabled={isPolishing || !value}
                    className="group"
                    style={{
                        height: '28px',
                        padding: '0 10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                        border: 'none',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: isPolishing || !value ? 'not-allowed' : 'pointer',
                        opacity: isPolishing || !value ? 0.7 : 1,
                        marginRight: '8px',
                        boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
                        transition: 'all 0.2s',
                    }}
                >
                    {isPolishing ? (
                        <>
                            <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            思考中…
                        </>
                    ) : (
                        <>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                            AI 润色
                        </>
                    )}
                </button>

                <div style={{ width: '1px', height: '18px', background: 'rgba(255,255,255,0.2)', margin: '0 8px' }} />

                {tools.map((tool, idx) =>
                    tool.type === 'divider' ? (
                        <div
                            key={idx}
                            style={{
                                width: '1px',
                                height: '18px',
                                background: 'rgba(255,255,255,0.2)',
                                margin: '0 8px',
                            }}
                        />
                    ) : (
                        <button
                            key={idx}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault()
                                tool.action()
                            }}
                            title={tool.title}
                            style={{
                                width: '32px',
                                height: '32px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'transparent',
                                border: 'none',
                                borderRadius: '6px',
                                color: 'rgba(255,255,255,0.9)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent'
                            }}
                        >
                            {tool.icon}
                        </button>
                    )
                )}

                {/* 提示文字 */}
                <span style={{
                    marginLeft: 'auto',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.4)',
                }}>
                    Tab 缩进 · 回车续列表
                </span>
            </div>

            {/* 文本区域 */}
            <textarea
                ref={textareaRef}
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                rows={minRows}
                className="input textarea"
                aria-label={placeholder || "输入内容"}
                style={{
                    borderRadius: '0 0 12px 12px',
                    resize: 'vertical',
                    minHeight: `${minRows * 1.7}em`,
                }}
            />
        </div >
    )
}

export default RichTextEditor
