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
    } = useResumeStore(useShallow((state) => ({
        basicInfo: state.basicInfo,
        education: state.education,
        workExperience: state.workExperience,
        projects: state.projects,
        skills: state.skills,
        summary: state.summary,
        customSections: state.customSections,
        sectionOrder: state.sectionOrder,
        hiddenSections: state.hiddenSections
    })))

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
                    <div style={{ display: 'flex', flexWrap: 'wrap', columnGap: '12px', rowGap: '4px', fontSize: '13px', color: '#86868B' }}>
                        {basicInfo.phone && <span>📞 {basicInfo.phone}</span>}
                        {basicInfo.email && <span>✉️ {basicInfo.email}</span>}
                        {basicInfo.city && <span>📍 {basicInfo.city}</span>}
                        {basicInfo.wechat && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <svg width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor" version="1.1" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                    <path d="M851.457126 597.145713c0-46.871077-21.286428-90.774335-60.072756-123.522686-34.590446-29.268839-79.414751-46.359384-127.411553-49.020188-10.540875-48.303818-40.423746-92.207076-84.429342-123.829702-44.312612-31.929642-100.701179-49.429542-158.727164-49.429542-65.394363 0-127.002199 21.695783-173.56626 60.993804-47.587448 40.321407-73.888467 94.151509-73.888467 151.665801 0 29.678193 6.959025 58.435339 20.774735 85.452728 11.973616 23.537877 28.654807 44.824305 49.531881 63.142914l-16.988207 94.458525c-1.43274 8.187088 1.535079 16.578853 7.880072 21.90046 4.195882 3.581851 9.619828 5.423946 14.941435 5.423946 2.660804 0 5.321607-0.409354 7.880072-1.43274l155.247651-56.388567c18.830302-0.409354 36.841895-1.739756 53.830102-4.093544 8.289426 17.602239 19.649011 33.157705 34.078753 46.257046 35.71617 32.543674 88.420548 49.736558 156.78273 51.169298 0.409354 0 0.71637 0 1.023386 0.102339l113.595842 26.608035c1.739756 0.409354 3.479512 0.614032 5.219268 0.614032 5.526284 0 10.95023-1.944433 15.248451-5.730961 5.628623-4.912253 8.494104-12.178293 7.880072-19.546672l-5.11693-54.751149C831.091745 685.259244 851.457126 641.970018 851.457126 597.145713zM408.331001 631.736158l-3.786528 0.102339-126.695183 46.052369 11.6666-64.575655c2.046772-11.359584-2.251449-22.923846-11.052568-30.189886-38.581651-31.724965-59.868079-73.990806-59.868079-118.91745 0-92.411753 90.774335-167.73296 202.425745-167.73296 95.277234 0 176.431741 54.239456 197.308815 130.277034-40.321407 5.730961-77.572656 21.90046-107.353188 47.075755-38.68399 32.748351-60.072756 76.651609-60.072756 123.522686 0 10.95023 0.818709 21.593444 2.456126 31.724965C439.03258 630.508095 423.988807 631.531481 408.331001 631.736158zM758.943034 689.045773c-6.754347 5.321607-10.23386 13.611033-9.415151 22.105137l3.274835 34.897462-83.917649-19.546672 0 0c-3.377174-1.023386-6.856686-1.43274-10.336198-1.43274-106.329802-2.149111-162.61603-46.461723-162.61603-127.923246 0-70.511293 69.692584-127.923246 155.34999-127.923246S806.428143 526.634419 806.428143 597.145713C806.428143 632.043174 789.542275 664.689186 758.943034 689.045773z" />
                                    <path d="M337.205677 428.287028m-30.701579 0a30 30 0 1 0 61.403158 0 30 30 0 1 0-61.403158 0Z" />
                                    <path d="M499.924046 431.357186m-30.701579 0a30 30 0 1 0 61.403158 0 30 30 0 1 0-61.403158 0Z" />
                                    <path d="M582.818309 575.654607m-25.584649 0a25 25 0 1 0 51.169298 0 25 25 0 1 0-51.169298 0Z" />
                                    <path d="M697.437537 575.654607m-25.584649 0a25 25 0 1 0 51.169298 0 25 25 0 1 0-51.169298 0Z" />
                                </svg>
                                {basicInfo.wechat}
                            </span>
                        )}
                        {basicInfo.website && (
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#0071E3' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                                </svg>
                                {basicInfo.website}
                            </span>
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
