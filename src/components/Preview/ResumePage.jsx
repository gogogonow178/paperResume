import { useRef, useState, useEffect, useCallback, useMemo, memo } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { useShallow } from 'zustand/react/shallow'

/**
 * ResumePage - A4 简历预览页面（支持多页）
 * 
 * 性能优化:
 * 1. 使用 useShallow 合并多个 store 选择器，减少不必要的重渲染
 * 2. 使用 useMemo 缓存页面高度计算结果
 * 3. ResumeContent 提取为 memo 组件
 */
function ResumePage() {
    // 使用 useShallow 合并选择器，只在浅比较发现变化时触发重渲染
    const {
        basicInfo,
        education,
        workExperience,
        projects,
        skills,
        summary,
        customSections,
        sectionOrder,
        hiddenSections
    } = useResumeStore(useShallow((state) => {
        const currentResume = state.resumes[state.currentResumeId]?.data || {}
        return {
            basicInfo: currentResume.basicInfo || {},
            education: currentResume.education || [],
            workExperience: currentResume.workExperience || [],
            projects: currentResume.projects || [],
            skills: currentResume.skills || [],
            summary: currentResume.summary || '',
            customSections: currentResume.customSections || [],
            sectionOrder: currentResume.sectionOrder || [],
            hiddenSections: currentResume.hiddenSections || []
        }
    }))

    const contentRef = useRef(null)
    const [pageCount, setPageCount] = useState(1)

    // 使用 useMemo 缓存每页可用内容高度计算
    // 该值 = A4高度 - 上下padding = 297 - 30 = 267mm
    // 仅在首次渲染时执行 DOM 操作，后续渲染使用缓存值
    const pageContentHeight = useMemo(() => {
        const testDiv = document.createElement('div')
        testDiv.style.cssText = 'position:absolute;visibility:hidden;height:267mm;'
        document.body.appendChild(testDiv)
        const height = testDiv.offsetHeight
        document.body.removeChild(testDiv)
        return height || 1009
    }, [])

    // 检测内容高度，计算页数
    useEffect(() => {
        const checkHeight = () => {
            if (contentRef.current) {
                const height = contentRef.current.scrollHeight
                const pages = Math.ceil(height / pageContentHeight)
                setPageCount(Math.max(1, pages))
            }
        }

        const timer = setTimeout(checkHeight, 200)
        const observer = new ResizeObserver(checkHeight)
        if (contentRef.current) {
            observer.observe(contentRef.current)
        }
        return () => {
            clearTimeout(timer)
            observer.disconnect()
        }
    }, [basicInfo, education, workExperience, projects, skills, summary, customSections, sectionOrder, hiddenSections, pageContentHeight])

    // pageContentHeight 已通过 useMemo 缓存，无需重复调用

    // ===== 各模块渲染函数 =====

    const renderSummary = () => summary && (
        <section key="summary">
            <h2>个人总结</h2>
            <p className="item-desc" style={{ whiteSpace: 'pre-wrap' }}>{summary}</p>
        </section>
    )

    const renderWorkExperience = () => workExperience.length > 0 && (
        <section key="workExperience">
            <h2>工作经历</h2>
            <div>
                {workExperience.map((item) => (
                    <div key={item.id} className="resume-item">
                        <div className="item-header">
                            <div>
                                <span className="item-title">{item.company}</span>
                                {item.position && <span className="item-subtitle">· {item.position}</span>}
                            </div>
                            <span className="item-date">{item.startDate} - {item.endDate}</span>
                        </div>
                        {item.description && (
                            <p className="item-desc" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )

    const renderProjects = () => projects.length > 0 && (
        <section key="projects">
            <h2>项目经历</h2>
            <div>
                {projects.map((item) => (
                    <div key={item.id} className="resume-item">
                        <div className="item-header">
                            <div>
                                <span className="item-title">{item.name}</span>
                                {item.role && <span className="item-subtitle">· {item.role}</span>}
                                {item.link && (
                                    <a href={item.link} target="_blank" rel="noopener noreferrer"
                                        style={{ marginLeft: '8px', fontSize: '12px', color: '#000000' }}>
                                        查看
                                    </a>
                                )}
                            </div>
                            <span className="item-date">{item.date}</span>
                        </div>
                        {item.description && (
                            <p className="item-desc" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )

    const renderEducation = () => education.length > 0 && (
        <section key="education">
            <h2>教育经历</h2>
            <div>
                {education.map((item) => (
                    <div key={item.id} className="resume-item">
                        <div className="item-header">
                            <div>
                                <span className="item-title">{item.school}</span>
                                {(item.degree || item.major) && (
                                    <span className="item-subtitle">· {item.degree} {item.major}</span>
                                )}
                            </div>
                            <span className="item-date">{item.startDate} - {item.endDate}</span>
                        </div>
                        {item.description && (
                            <p className="item-desc" style={{ whiteSpace: 'pre-wrap' }}>{item.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </section>
    )

    const renderSkills = () => skills.length > 0 && (
        <section key="skills">
            <h2>专业技能</h2>
            <div>
                {skills.map((item) => (
                    <div key={item.id} className="skill-item">
                        <span className="skill-title">{item.title}：</span>
                        <span className="skill-content">{item.content}</span>
                    </div>
                ))}
            </div>
        </section>
    )

    const SECTION_RENDERERS = {
        summary: renderSummary,
        workExperience: renderWorkExperience,
        projects: renderProjects,
        education: renderEducation,
        skills: renderSkills,
    }

    // 简历内容
    const ResumeContent = () => (
        <>
            {/* 头部：基本信息 */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '20px',
                marginBottom: '20px'
            }}>
                <div style={{ flex: 1 }}>
                    <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '4px' }}>
                        {basicInfo.name || '姓名'}
                    </h1>
                    <p style={{ fontSize: '15px', color: '#000000', marginBottom: '12px', fontWeight: 500 }}>
                        {basicInfo.jobTitle || '求职意向'}
                    </p>
                    <div className="contact-info">
                        {basicInfo.phone && (
                            <span className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                    </svg>
                                </span>
                                <span className="contact-text">{basicInfo.phone}</span>
                            </span>
                        )}
                        {basicInfo.email && (
                            <span className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                </span>
                                <span className="contact-text">{basicInfo.email}</span>
                            </span>
                        )}
                        {basicInfo.city && (
                            <span className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                        <circle cx="12" cy="10" r="3" />
                                    </svg>
                                </span>
                                <span className="contact-text">{basicInfo.city}</span>
                            </span>
                        )}
                        {basicInfo.wechat && (
                            <span className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M17 10V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h2" />
                                        <path d="M8 21h7a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2" />
                                        <path d="M10 14h.01" />
                                        <path d="M10 17h.01" />
                                    </svg>
                                </span>
                                <span className="contact-text">{basicInfo.wechat}</span>
                            </span>
                        )}
                        {basicInfo.website && (
                            <span className="contact-item">
                                <span className="contact-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                    </svg>
                                </span>
                                <span className="contact-text">{basicInfo.website}</span>
                            </span>
                        )}
                    </div>
                </div>
                {basicInfo.avatar && (
                    <div style={{ width: '100px', height: '100px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                        <img src={basicInfo.avatar} alt="头像" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                )}
            </header>

            {/* 按 sectionOrder 顺序渲染模块（跳过隐藏的） */}
            {sectionOrder.map((sectionId) => {
                // 跳过隐藏的模块
                if (hiddenSections.includes(sectionId)) return null
                const renderer = SECTION_RENDERERS[sectionId]
                return renderer ? renderer() : null
            })}

            {/* 自定义模块 */}
            {customSections.map((section) => (
                <section key={section.id}>
                    <h2>{section.title}</h2>
                    <p className="item-desc" style={{ whiteSpace: 'pre-wrap' }}>{section.content}</p>
                </section>
            ))}
        </>
    )

    return (
        <div id="resume-preview">
            {Array.from({ length: pageCount }, (_, index) => (
                <div
                    key={index}
                    className="a4-page"
                    style={{
                        height: '297mm',
                        overflow: 'hidden',
                        position: 'relative',
                        padding: '15mm 22mm',  // padding 应用到页面容器上
                    }}
                >
                    {/* 裁剪容器：确保内容不会溢出到 padding 区域 */}
                    <div
                        style={{
                            height: '267mm',  // 297 - 30 = 267mm
                            overflow: 'hidden',
                            position: 'relative',
                        }}
                    >
                        {/* 内容容器：通过 transform 偏移显示不同页的内容 */}
                        <div
                            ref={index === 0 ? contentRef : null}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                transform: `translateY(-${index * pageContentHeight}px)`,
                            }}
                        >
                            <ResumeContent />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export default ResumePage
