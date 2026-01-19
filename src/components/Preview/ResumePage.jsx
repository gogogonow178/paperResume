import { useRef, useState, useEffect, useCallback } from 'react'
import useResumeStore from '../../store/useResumeStore'

/**
 * ResumePage - A4 简历预览页面（支持多页）
 */
function ResumePage() {
    const basicInfo = useResumeStore((state) => state.basicInfo)
    const education = useResumeStore((state) => state.education)
    const workExperience = useResumeStore((state) => state.workExperience)
    const projects = useResumeStore((state) => state.projects)
    const skills = useResumeStore((state) => state.skills)
    const summary = useResumeStore((state) => state.summary)
    const customSections = useResumeStore((state) => state.customSections)
    const sectionOrder = useResumeStore((state) => state.sectionOrder)
    const hiddenSections = useResumeStore((state) => state.hiddenSections)

    const contentRef = useRef(null)
    const [pageCount, setPageCount] = useState(1)

    // 计算每页可用内容高度 = A4高度 - 上下padding = 297 - 30 = 267mm
    const getPageContentHeight = useCallback(() => {
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
                const pageHeight = getPageContentHeight()
                const pages = Math.ceil(height / pageHeight)
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
    }, [basicInfo, education, workExperience, projects, skills, summary, customSections, sectionOrder, hiddenSections, getPageContentHeight])

    const pageContentHeight = getPageContentHeight()

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
                                        style={{ marginLeft: '8px', fontSize: '12px', color: '#0071E3' }}>
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
                    <p style={{ fontSize: '15px', color: '#0071E3', marginBottom: '12px', fontWeight: 500 }}>
                        {basicInfo.jobTitle || '求职意向'}
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: '#86868B' }}>
                        {basicInfo.phone && <span>📞 {basicInfo.phone}</span>}
                        {basicInfo.email && <span>✉️ {basicInfo.email}</span>}
                        {basicInfo.city && <span>📍 {basicInfo.city}</span>}
                        {basicInfo.website && (
                            <a href={basicInfo.website} target="_blank" rel="noopener noreferrer" style={{ color: '#0071E3' }}>
                                🔗 链接
                            </a>
                        )}
                    </div>
                </div>
                {basicInfo.avatar && (
                    <div style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
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
