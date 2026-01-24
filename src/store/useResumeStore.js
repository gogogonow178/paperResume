import { create } from 'zustand'
import { persist } from 'zustand/middleware'

/**
 * 默认示例数据 - 张三
 */
const defaultResumeData = {
    // 基本信息
    basicInfo: {
        avatar: '', // Base64 图片
        name: '张三',
        jobTitle: '高级前端工程师',
        phone: '138-xxxx-8888',
        email: 'zhangsan@example.com',
        wechat: 'wxid_zhangsan',
        city: '北京',
        website: 'zhangsan.dev',
    },

    // 教育经历
    education: [
        {
            id: 'edu-1',
            school: '北京大学',
            degree: '硕士',
            startDate: '2016-09',
            endDate: '2019-06',
            major: '计算机科学与技术',
            description: '研究方向：前端工程化与性能优化',
        },
        {
            id: 'edu-2',
            school: '清华大学',
            degree: '本科',
            startDate: '2012-09',
            endDate: '2016-06',
            major: '软件工程',
            description: '',
        },
    ],

    // 工作经历
    workExperience: [
        {
            id: 'work-1',
            company: '字节跳动',
            position: '高级前端工程师',
            startDate: '2021-03',
            endDate: '至今',
            description: '• 负责抖音 Web 端核心业务开发，日活用户超千万\n• 主导前端性能优化项目，首屏加载时间降低 40%\n• 搭建组件库和脚手架工具，提升团队开发效率 30%\n• 指导初级工程师，推动代码规范和最佳实践',
        },
        {
            id: 'work-2',
            company: '阿里巴巴',
            position: '前端工程师',
            startDate: '2019-07',
            endDate: '2021-02',
            description: '• 参与淘宝商家后台系统开发\n• 负责表单引擎和可视化搭建平台\n• 使用 React + TypeScript 构建企业级应用',
        },
    ],

    // 项目经历
    projects: [
        {
            id: 'proj-1',
            name: '极简简历编辑器',
            role: '独立开发者',
            date: '2024-01',
            link: 'https://resume.example.com',
            description: '• 一款纯前端的在线简历编辑工具\n• 使用 React + Zustand + Tailwind CSS\n• 支持实时预览、PDF 导出、本地存储',
        },
    ],

    // 专业技能
    skills: [
        {
            id: 'skill-1',
            title: '前端技术',
            content: 'React, Vue, TypeScript, Next.js, Webpack, Vite',
        },
        {
            id: 'skill-2',
            title: '其他技能',
            content: 'Node.js, Git, Docker, Figma, 敏捷开发',
        },
    ],

    // 个人总结
    summary: '热爱技术，持续学习。5 年前端开发经验，擅长复杂 Web 应用架构设计和性能优化。良好的沟通能力和团队协作精神，乐于分享和指导他人。',

    // 自定义模块
    customSections: [],

    // 模块排序顺序
    sectionOrder: ['education', 'workExperience', 'projects', 'skills', 'summary'],

    // 隐藏的模块
    hiddenSections: [],
}

// 简历数量上限
const MAX_RESUMES = 10

/**
 * 迁移老版本数据到新的多简历结构
 * @param {object} persistedState - localStorage 中的持久化状态
 * @returns {object|null} - 迁移后的状态，如无需迁移则返回 null
 */
const migrateOldData = (persistedState) => {
    // 如果已经是新结构（有 resumes 字段），无需迁移
    if (persistedState?.resumes) {
        return null
    }

    // 如果是老结构（直接有 basicInfo 等字段），进行迁移
    if (persistedState?.basicInfo) {
        const resumeId = `resume-${Date.now()}`
        const now = Date.now()

        // 提取老数据字段
        const {
            basicInfo,
            education,
            workExperience,
            projects,
            skills,
            summary,
            customSections,
            sectionOrder,
            hiddenSections,
        } = persistedState

        return {
            currentResumeId: resumeId,
            resumes: {
                [resumeId]: {
                    name: basicInfo?.name ? `${basicInfo.name}的简历` : '我的简历',
                    createdAt: now,
                    updatedAt: now,
                    data: {
                        basicInfo: basicInfo || defaultResumeData.basicInfo,
                        education: education || defaultResumeData.education,
                        workExperience: workExperience || defaultResumeData.workExperience,
                        projects: projects || defaultResumeData.projects,
                        skills: skills || defaultResumeData.skills,
                        summary: summary || defaultResumeData.summary,
                        customSections: customSections || defaultResumeData.customSections,
                        sectionOrder: sectionOrder || defaultResumeData.sectionOrder,
                        hiddenSections: hiddenSections || defaultResumeData.hiddenSections,
                    }
                }
            }
        }
    }

    return null
}

/**
 * 创建默认的初始简历
 */
const createInitialResume = () => {
    const resumeId = `resume-${Date.now()}`
    const now = Date.now()
    return {
        currentResumeId: resumeId,
        resumes: {
            [resumeId]: {
                name: '我的简历',
                createdAt: now,
                updatedAt: now,
                data: { ...defaultResumeData }
            }
        }
    }
}

/**
 * useResumeStore - Zustand 状态管理
 * 支持多简历管理，使用 persist 中间件自动同步到 localStorage
 */
// 创建初始状态（确保首次加载就有默认简历）
const initialState = createInitialResume()

const useResumeStore = create(
    persist(
        (set, get) => ({
            // 当前选中的简历 ID（使用初始状态的默认值）
            currentResumeId: initialState.currentResumeId,
            // 所有简历（键值对形式，使用初始状态的默认值）
            resumes: initialState.resumes,

            // ========== 获取当前简历数据 (便捷方法) ==========
            getCurrentResume: () => {
                const { currentResumeId, resumes } = get()
                return resumes[currentResumeId]?.data || defaultResumeData
            },

            // ========== 简历管理操作 ==========

            // 获取简历列表
            getResumeList: () => {
                const { resumes, currentResumeId } = get()
                return Object.entries(resumes).map(([id, resume]) => ({
                    id,
                    name: resume.name,
                    createdAt: resume.createdAt,
                    updatedAt: resume.updatedAt,
                    isCurrent: id === currentResumeId
                })).sort((a, b) => b.createdAt - a.createdAt)
            },

            // 辅助方法：获取不重复的简历名称
            _getUniqueResumeName: (baseName) => {
                const { resumes } = get()
                const existingNames = Object.values(resumes).map(r => r.name)
                if (!existingNames.includes(baseName)) return baseName

                let counter = 1
                while (existingNames.includes(`${baseName} (${counter})`)) {
                    counter++
                }
                return `${baseName} (${counter})`
            },

            // 创建新简历
            createResume: (name = '新简历') => {
                const { resumes, _getUniqueResumeName } = get()
                const resumeCount = Object.keys(resumes).length

                // 检查是否达到上限
                if (resumeCount >= MAX_RESUMES) {
                    return { success: false, error: `已达到简历数量上限（${MAX_RESUMES}份），请先删除其他简历` }
                }

                const uniqueName = _getUniqueResumeName(name)
                const resumeId = `resume-${Date.now()}`
                const now = Date.now()

                set((state) => ({
                    currentResumeId: resumeId,
                    resumes: {
                        ...state.resumes,
                        [resumeId]: {
                            name: uniqueName,
                            createdAt: now,
                            updatedAt: now,
                            data: { ...defaultResumeData }
                        }
                    }
                }))

                return { success: true, resumeId }
            },

            // 切换简历
            switchResume: (resumeId) => {
                const { resumes } = get()
                if (resumes[resumeId]) {
                    set({ currentResumeId: resumeId })
                    return true
                }
                return false
            },

            // 重命名简历
            renameResume: (resumeId, newName) => {
                set((state) => {
                    if (!state.resumes[resumeId]) return state
                    return {
                        resumes: {
                            ...state.resumes,
                            [resumeId]: {
                                ...state.resumes[resumeId],
                                name: newName,
                                // updatedAt: Date.now() // 不更新时间，避免重命名导致排序跳动
                            }
                        }
                    }
                })
            },

            // 删除简历
            deleteResume: (resumeId) => {
                const { resumes, currentResumeId } = get()
                const resumeCount = Object.keys(resumes).length

                // 至少保留一份简历
                if (resumeCount <= 1) {
                    return { success: false, error: '至少需要保留一份简历' }
                }

                // 创建新的 resumes 对象（不包含被删除的）
                const newResumes = { ...resumes }
                delete newResumes[resumeId]

                // 如果删除的是当前简历，切换到其他简历
                let newCurrentId = currentResumeId
                if (resumeId === currentResumeId) {
                    // 切换到最近更新的简历
                    newCurrentId = Object.entries(newResumes)
                        .sort(([, a], [, b]) => b.updatedAt - a.updatedAt)[0][0]
                }

                set({
                    resumes: newResumes,
                    currentResumeId: newCurrentId
                })

                return { success: true }
            },

            // 复制简历
            duplicateResume: (resumeId) => {
                const { resumes, _getUniqueResumeName } = get()
                const resumeCount = Object.keys(resumes).length

                if (resumeCount >= MAX_RESUMES) {
                    return { success: false, error: `已达到简历数量上限（${MAX_RESUMES}份），请先删除其他简历` }
                }

                const sourceResume = resumes[resumeId]
                if (!sourceResume) {
                    return { success: false, error: '源简历不存在' }
                }

                const uniqueName = _getUniqueResumeName(sourceResume.name)
                const newResumeId = `resume-${Date.now()}`
                const now = Date.now()

                set((state) => ({
                    currentResumeId: newResumeId,
                    resumes: {
                        ...state.resumes,
                        [newResumeId]: {
                            name: uniqueName,
                            createdAt: now,
                            updatedAt: now,
                            data: JSON.parse(JSON.stringify(sourceResume.data))
                        }
                    }
                }))

                return { success: true, resumeId: newResumeId }
            },

            // ========== 辅助方法：更新当前简历的 updatedAt ==========
            _touchCurrentResume: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now()
                        }
                    }
                }))
            },

            // ========== 基本信息 ==========
            updateBasicInfo: (field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                basicInfo: {
                                    ...state.resumes[currentResumeId].data.basicInfo,
                                    [field]: value
                                }
                            }
                        }
                    }
                }))
            },

            // ========== 教育经历 ==========
            addEducation: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                education: [...state.resumes[currentResumeId].data.education, {
                                    id: `edu-${Date.now()}`,
                                    school: '',
                                    degree: '',
                                    startDate: '',
                                    endDate: '',
                                    major: '',
                                    description: '',
                                }]
                            }
                        }
                    }
                }))
            },
            updateEducation: (id, field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                education: state.resumes[currentResumeId].data.education.map(item =>
                                    item.id === id ? { ...item, [field]: value } : item
                                )
                            }
                        }
                    }
                }))
            },
            removeEducation: (id) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                education: state.resumes[currentResumeId].data.education.filter(item => item.id !== id)
                            }
                        }
                    }
                }))
            },

            // ========== 工作经历 ==========
            addWorkExperience: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                workExperience: [...state.resumes[currentResumeId].data.workExperience, {
                                    id: `work-${Date.now()}`,
                                    company: '',
                                    position: '',
                                    startDate: '',
                                    endDate: '',
                                    description: '',
                                }]
                            }
                        }
                    }
                }))
            },
            updateWorkExperience: (id, field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                workExperience: state.resumes[currentResumeId].data.workExperience.map(item =>
                                    item.id === id ? { ...item, [field]: value } : item
                                )
                            }
                        }
                    }
                }))
            },
            removeWorkExperience: (id) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                workExperience: state.resumes[currentResumeId].data.workExperience.filter(item => item.id !== id)
                            }
                        }
                    }
                }))
            },

            // ========== 项目经历 ==========
            addProject: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                projects: [...state.resumes[currentResumeId].data.projects, {
                                    id: `proj-${Date.now()}`,
                                    name: '',
                                    role: '',
                                    date: '',
                                    link: '',
                                    description: '',
                                }]
                            }
                        }
                    }
                }))
            },
            updateProject: (id, field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                projects: state.resumes[currentResumeId].data.projects.map(item =>
                                    item.id === id ? { ...item, [field]: value } : item
                                )
                            }
                        }
                    }
                }))
            },
            removeProject: (id) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                projects: state.resumes[currentResumeId].data.projects.filter(item => item.id !== id)
                            }
                        }
                    }
                }))
            },

            // ========== 专业技能 ==========
            addSkill: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                skills: [...state.resumes[currentResumeId].data.skills, {
                                    id: `skill-${Date.now()}`,
                                    title: '',
                                    content: '',
                                }]
                            }
                        }
                    }
                }))
            },
            updateSkill: (id, field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                skills: state.resumes[currentResumeId].data.skills.map(item =>
                                    item.id === id ? { ...item, [field]: value } : item
                                )
                            }
                        }
                    }
                }))
            },
            removeSkill: (id) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                skills: state.resumes[currentResumeId].data.skills.filter(item => item.id !== id)
                            }
                        }
                    }
                }))
            },

            // ========== 个人总结 ==========
            updateSummary: (value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                summary: value
                            }
                        }
                    }
                }))
            },

            // ========== 自定义模块 ==========
            addCustomSection: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                customSections: [...state.resumes[currentResumeId].data.customSections, {
                                    id: `custom-${Date.now()}`,
                                    title: '自定义模块',
                                    content: '',
                                }]
                            }
                        }
                    }
                }))
            },
            updateCustomSection: (id, field, value) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                customSections: state.resumes[currentResumeId].data.customSections.map(item =>
                                    item.id === id ? { ...item, [field]: value } : item
                                )
                            }
                        }
                    }
                }))
            },
            removeCustomSection: (id) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                customSections: state.resumes[currentResumeId].data.customSections.filter(item => item.id !== id)
                            }
                        }
                    }
                }))
            },

            // ========== 模块排序 ==========
            reorderSections: (newOrder) => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: {
                                ...state.resumes[currentResumeId].data,
                                sectionOrder: newOrder
                            }
                        }
                    }
                }))
            },

            // ========== 模块可见性 ==========
            toggleSectionVisibility: (sectionId) => {
                const { currentResumeId } = get()
                set((state) => {
                    const currentHidden = state.resumes[currentResumeId].data.hiddenSections
                    return {
                        resumes: {
                            ...state.resumes,
                            [currentResumeId]: {
                                ...state.resumes[currentResumeId],
                                updatedAt: Date.now(),
                                data: {
                                    ...state.resumes[currentResumeId].data,
                                    hiddenSections: currentHidden.includes(sectionId)
                                        ? currentHidden.filter(id => id !== sectionId)
                                        : [...currentHidden, sectionId]
                                }
                            }
                        }
                    }
                })
            },

            // ========== 重置当前简历 ==========
            resetResume: () => {
                const { currentResumeId } = get()
                set((state) => ({
                    resumes: {
                        ...state.resumes,
                        [currentResumeId]: {
                            ...state.resumes[currentResumeId],
                            updatedAt: Date.now(),
                            data: { ...defaultResumeData }
                        }
                    }
                }))
            },
        }),
        {
            name: 'minicv-storage', // localStorage key
            // 数据迁移：处理老版本数据结构
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('Failed to rehydrate store:', error)
                    return
                }

                // 检查是否需要初始化（首次使用或数据为空）
                if (!state?.resumes || Object.keys(state.resumes).length === 0) {
                    // 初始化默认简历
                    const initial = createInitialResume()
                    useResumeStore.setState(initial)
                }
            },
            // 自定义 merge 函数处理数据迁移
            merge: (persistedState, currentState) => {
                // 尝试迁移老数据
                const migratedState = migrateOldData(persistedState)
                if (migratedState) {
                    console.log('[useResumeStore] 数据迁移：老版本 -> 多简历结构')
                    return { ...currentState, ...migratedState }
                }

                // 正常合并
                return { ...currentState, ...persistedState }
            }
        }
    )
)

export default useResumeStore
