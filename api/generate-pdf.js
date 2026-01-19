import { renderToBuffer, Font } from '@react-pdf/renderer'
import React from 'react'
import path from 'path'
import { fileURLToPath } from 'url'

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 注册中文字体（从项目根目录的 public/fonts 读取）
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'SourceHanSansSC-Regular.otf')

Font.register({
    family: 'SourceHanSans',
    src: fontPath,
    format: 'opentype'
})

// ============ PDF 组件（内联定义，避免 JSX 编译问题）============

import { Document, Page, View, Text, Image, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
    page: {
        paddingTop: 42,
        paddingBottom: 42,
        paddingLeft: 60,
        paddingRight: 60,
        fontFamily: 'SourceHanSans',
        fontSize: 10.5,
        lineHeight: 1.6,
        color: '#1d1d1f',
        backgroundColor: '#ffffff'
    },
    header: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
    },
    headerInfo: {
        flex: 1,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        objectFit: 'cover',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    jobTitle: {
        fontSize: 12,
        color: '#0071e3',
        marginBottom: 8,
        fontWeight: 'medium'
    },
    contactRow: {
        flexDirection: 'row',
        gap: 15,
        fontSize: 9,
        color: '#86868b',
        flexWrap: 'wrap'
    },
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingBottom: 6,
        marginBottom: 10,
    },
    item: {
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    itemDate: {
        fontSize: 9,
        color: '#86868b',
    },
    itemDesc: {
        fontSize: 10,
        color: '#424245',
        lineHeight: 1.6,
        marginTop: 4
    },
    skillItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    skillTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 80,
    },
    skillContent: {
        fontSize: 10,
        flex: 1,
        color: '#424245',
        lineHeight: 1.6
    }
})

// Header 组件
const Header = ({ basicInfo }) => {
    if (!basicInfo) return null

    const contactParts = [
        basicInfo.phone,
        basicInfo.email,
        basicInfo.city,
        basicInfo.website
    ].filter(Boolean)

    return React.createElement(View, { style: styles.header },
        React.createElement(View, { style: styles.headerRow },
            React.createElement(View, { style: styles.headerInfo },
                React.createElement(Text, { style: styles.name }, basicInfo.name),
                basicInfo.jobTitle && React.createElement(Text, { style: styles.jobTitle }, basicInfo.jobTitle),
                React.createElement(View, { style: styles.contactRow },
                    contactParts.map((part, index) =>
                        React.createElement(Text, { key: index }, part + (index < contactParts.length - 1 ? '    ' : ''))
                    )
                )
            ),
            basicInfo.avatar && React.createElement(Image, { src: basicInfo.avatar, style: styles.avatar })
        )
    )
}

// Summary 组件
const Summary = ({ summary }) => {
    if (!summary) return null
    return React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, '个人总结'),
        React.createElement(Text, { style: styles.itemDesc }, summary)
    )
}

// Education 组件
const Education = ({ items }) => {
    if (!items || items.length === 0) return null
    return React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, '教育经历'),
        items.map((item) =>
            React.createElement(View, { key: item.id, style: styles.item, wrap: false },
                React.createElement(View, { style: styles.itemHeader },
                    React.createElement(Text, { style: styles.itemTitle },
                        item.school + (item.degree ? ` · ${item.degree}` : '')
                    ),
                    React.createElement(Text, { style: styles.itemDate },
                        `${item.startDate} - ${item.endDate}`
                    )
                ),
                item.description && React.createElement(Text, { style: styles.itemDesc }, item.description)
            )
        )
    )
}

// Experience 组件（工作经历、项目经历通用）
const Experience = ({ title, items, titleKey = 'company', subKey = 'position' }) => {
    if (!items || items.length === 0) return null
    return React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, title),
        items.map((item) =>
            React.createElement(View, { key: item.id, style: styles.item, wrap: false },
                React.createElement(View, { style: styles.itemHeader },
                    React.createElement(Text, { style: styles.itemTitle },
                        item[titleKey] + (item[subKey] ? ` · ${item[subKey]}` : '')
                    ),
                    React.createElement(Text, { style: styles.itemDate },
                        (item.startDate || item.date) + (item.endDate ? ` - ${item.endDate}` : '')
                    )
                ),
                item.description && React.createElement(Text, { style: styles.itemDesc }, item.description)
            )
        )
    )
}

// Skills 组件
const Skills = ({ items }) => {
    if (!items || items.length === 0) return null
    return React.createElement(View, { style: styles.section },
        React.createElement(Text, { style: styles.sectionTitle }, '专业技能'),
        items.map((item) =>
            React.createElement(View, { key: item.id, style: styles.skillItem, wrap: false },
                React.createElement(Text, { style: styles.skillTitle }, `${item.title}：`),
                React.createElement(Text, { style: styles.skillContent }, item.content)
            )
        )
    )
}

// CustomSection 组件
const CustomSection = ({ section }) => {
    return React.createElement(View, { style: styles.section, wrap: false },
        React.createElement(Text, { style: styles.sectionTitle }, section.title),
        React.createElement(Text, { style: styles.itemDesc }, section.content)
    )
}

// 主 PDF 文档组件
function ResumePDFDocument({ data }) {
    const { basicInfo, education, workExperience, projects, skills, summary, customSections, sectionOrder, hiddenSections } = data

    const SECTION_RENDERERS = {
        summary: () => React.createElement(Summary, { key: 'summary', summary }),
        workExperience: () => React.createElement(Experience, { key: 'workExperience', title: '工作经历', items: workExperience }),
        projects: () => React.createElement(Experience, { key: 'projects', title: '项目经历', items: projects, titleKey: 'name', subKey: 'role' }),
        education: () => React.createElement(Education, { key: 'education', items: education }),
        skills: () => React.createElement(Skills, { key: 'skills', items: skills })
    }

    return React.createElement(Document, {},
        React.createElement(Page, { size: 'A4', style: styles.page },
            React.createElement(Header, { basicInfo }),
            sectionOrder && sectionOrder.map((sectionId) => {
                if (hiddenSections && hiddenSections.includes(sectionId)) return null
                const renderer = SECTION_RENDERERS[sectionId]
                return renderer ? renderer() : null
            }),
            customSections && customSections.map((section) =>
                React.createElement(CustomSection, { key: section.id, section })
            )
        )
    )
}

// ============ API Handler ============

export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    try {
        const resumeData = req.body

        if (!resumeData || !resumeData.basicInfo) {
            return res.status(400).json({ error: 'Invalid resume data' })
        }

        // 生成 PDF Buffer
        const pdfBuffer = await renderToBuffer(
            React.createElement(ResumePDFDocument, { data: resumeData })
        )

        // 设置文件名
        const safeName = (resumeData.basicInfo.name || 'resume')
            .trim()
            .replace(/[<>:"/\\|?*]/g, '')
            .replace(/\s+/g, '_')

        // 返回 PDF 文件
        res.setHeader('Content-Type', 'application/pdf')
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(safeName)}_简历.pdf"`)
        res.send(pdfBuffer)

    } catch (error) {
        console.error('PDF generation error:', error)
        res.status(500).json({ error: 'Failed to generate PDF', details: error.message })
    }
}
