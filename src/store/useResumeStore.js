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
        city: '北京',
        website: 'https://github.com/zhangsan',
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

/**
 * useResumeStore - Zustand 状态管理
 * 使用 persist 中间件自动同步到 localStorage
 */
const useResumeStore = create(
    persist(
        (set, get) => ({
            ...defaultResumeData,

            // ========== 基本信息 ==========
            updateBasicInfo: (field, value) => set((state) => ({
                basicInfo: { ...state.basicInfo, [field]: value }
            })),

            // ========== 教育经历 ==========
            addEducation: () => set((state) => ({
                education: [...state.education, {
                    id: `edu-${Date.now()}`,
                    school: '',
                    degree: '',
                    startDate: '',
                    endDate: '',
                    major: '',
                    description: '',
                }]
            })),
            updateEducation: (id, field, value) => set((state) => ({
                education: state.education.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),
            removeEducation: (id) => set((state) => ({
                education: state.education.filter(item => item.id !== id)
            })),

            // ========== 工作经历 ==========
            addWorkExperience: () => set((state) => ({
                workExperience: [...state.workExperience, {
                    id: `work-${Date.now()}`,
                    company: '',
                    position: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                }]
            })),
            updateWorkExperience: (id, field, value) => set((state) => ({
                workExperience: state.workExperience.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),
            removeWorkExperience: (id) => set((state) => ({
                workExperience: state.workExperience.filter(item => item.id !== id)
            })),

            // ========== 项目经历 ==========
            addProject: () => set((state) => ({
                projects: [...state.projects, {
                    id: `proj-${Date.now()}`,
                    name: '',
                    role: '',
                    date: '',
                    link: '',
                    description: '',
                }]
            })),
            updateProject: (id, field, value) => set((state) => ({
                projects: state.projects.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),
            removeProject: (id) => set((state) => ({
                projects: state.projects.filter(item => item.id !== id)
            })),

            // ========== 专业技能 ==========
            addSkill: () => set((state) => ({
                skills: [...state.skills, {
                    id: `skill-${Date.now()}`,
                    title: '',
                    content: '',
                }]
            })),
            updateSkill: (id, field, value) => set((state) => ({
                skills: state.skills.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),
            removeSkill: (id) => set((state) => ({
                skills: state.skills.filter(item => item.id !== id)
            })),

            // ========== 个人总结 ==========
            updateSummary: (value) => set({ summary: value }),

            // ========== 自定义模块 ==========
            addCustomSection: () => set((state) => ({
                customSections: [...state.customSections, {
                    id: `custom-${Date.now()}`,
                    title: '自定义模块',
                    content: '',
                }]
            })),
            updateCustomSection: (id, field, value) => set((state) => ({
                customSections: state.customSections.map(item =>
                    item.id === id ? { ...item, [field]: value } : item
                )
            })),
            removeCustomSection: (id) => set((state) => ({
                customSections: state.customSections.filter(item => item.id !== id)
            })),

            // ========== 模块排序 ==========
            reorderSections: (newOrder) => set({ sectionOrder: newOrder }),

            // ========== 模块可见性 ==========
            toggleSectionVisibility: (sectionId) => set((state) => ({
                hiddenSections: state.hiddenSections.includes(sectionId)
                    ? state.hiddenSections.filter(id => id !== sectionId)
                    : [...state.hiddenSections, sectionId]
            })),

            // ========== 重置 ==========
            resetResume: () => set({ ...defaultResumeData }),
        }),
        {
            name: 'paper-resume-storage', // localStorage key
        }
    )
)

export default useResumeStore
