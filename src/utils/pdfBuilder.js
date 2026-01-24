/**
 * PDF 渲染引擎 (Notion 级矢量方案)
 * 使用 jsPDF 原生指令绘制，确保文字和图标 100% 矢量清晰。
 */
import { jsPDF } from 'jspdf'

// A4 尺寸 (mm)
export const A4 = {
    width: 210,
    height: 297,
    margin: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
    },
    get contentWidth() {
        return this.width - this.margin.left - this.margin.right
    }
}

// 字体配置
const FONT = 'SourceHanSansSC'

/**
 * 核心构建函数
 */
export async function buildResumePdf(data) {
    const { basicInfo, education, workExperience, projects, skills, summary, customSections, sectionOrder, hiddenSections } = data

    // 1. 初始化 PDF
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true
    })

    // 2. 加载中文字体 (SourceHanSansSC)
    // 注意：实际项目中建议将字体 base64 存放在独立文件以减小本文件体积
    try {
        const { FONT_NORMAL_BASE64, FONT_BOLD_BASE64 } = await import('./fonts/SourceHanSansSC-Normal.js')
        pdf.addFileToVFS(`${FONT}-Normal.ttf`, FONT_NORMAL_BASE64)
        pdf.addFont(`${FONT}-Normal.ttf`, FONT, 'normal')

        pdf.addFileToVFS(`${FONT}-Bold.ttf`, FONT_BOLD_BASE64)
        pdf.addFont(`${FONT}-Bold.ttf`, FONT, 'bold')
    } catch (e) {
        console.warn('Font loading failed, falling back to standard font', e)
    }

    let y = A4.margin.top

    // --- 渲染逻辑 ---

    // 1. Header (姓名 & 职位 & 联系方式)
    y = drawHeader(pdf, basicInfo, y)

    // 2. 按顺序渲染各模块
    const SECTION_MAP = {
        summary: () => {
            if (summary) y = drawSection(pdf, '个人总结', summary, y)
        },
        education: () => {
            if (education?.length) y = drawExperienceList(pdf, '教育经历', education, y, { titleKey: 'school', subtitleKey: 'major', degreeKey: 'degree' })
        },
        workExperience: () => {
            if (workExperience?.length) y = drawExperienceList(pdf, '工作经历', workExperience, y, { titleKey: 'company', subtitleKey: 'position' })
        },
        projects: () => {
            if (projects?.length) y = drawExperienceList(pdf, '项目经历', projects, y, { titleKey: 'name', subtitleKey: 'role' })
        },
        skills: () => {
            if (skills?.length) y = drawSkills(pdf, '专业技能', skills, y)
        }
    }

    sectionOrder.forEach(id => {
        if (!hiddenSections.includes(id) && SECTION_MAP[id]) {
            SECTION_MAP[id]()
        }
    })

    // 3. 自定义模块
    customSections.forEach(section => {
        y = drawSection(pdf, section.title, section.content, y)
    })

    return pdf
}

/**
 * 绘制页眉 (基本信息)
 */
function drawHeader(pdf, info, y) {
    // 姓名
    pdf.setFont(FONT, 'bold')
    pdf.setFontSize(22)
    pdf.setTextColor(29, 29, 31)
    pdf.text(info.name || '', A4.margin.left, y)
    y += 10

    // 职位
    pdf.setFont(FONT, 'normal')
    pdf.setFontSize(11)
    pdf.setTextColor(0, 0, 0)
    pdf.text(info.jobTitle || '', A4.margin.left, y)
    y += 8

    // 联系方式 (多项排列)
    pdf.setFontSize(9)
    pdf.setTextColor(134, 134, 139)

    const items = []
    if (info.phone) items.push({ text: info.phone, icon: 'phone' })
    if (info.email) items.push({ text: info.email, icon: 'email' })
    if (info.city) items.push({ text: info.city, icon: 'city' })
    if (info.wechat) items.push({ text: info.wechat, icon: 'wechat' })
    if (info.website) items.push({ text: info.website, icon: 'website' })

    const startX = A4.margin.left
    let currentX = startX
    const rowHeight = 6
    const spacing = 6

    items.forEach((item, index) => {
        const textWidth = pdf.getTextWidth(item.text)
        const itemWidth = textWidth + 8 // 8mm 预留给图标和间距

        // 如果换行
        if (currentX + itemWidth > A4.width - A4.margin.right) {
            currentX = startX
            y += rowHeight
        }

        // 绘制占位图标 (圆形/矩形，真实图标建议用 base64 img)
        pdf.setDrawColor(200)
        pdf.setLineWidth(0.1)
        pdf.circle(currentX + 1, y - 1, 0.8)

        pdf.text(item.text, currentX + 4, y)
        currentX += itemWidth + spacing
    })

    return y + 12
}

/**
 * 常用：检查分页并增加新页
 */
function ensureSpace(pdf, y, height) {
    if (y + height > A4.height - A4.margin.bottom) {
        pdf.addPage()
        return A4.margin.top
    }
    return y
}

/**
 * 绘制模块标题与横线
 */
function drawSectionHeader(pdf, title, y) {
    y = ensureSpace(pdf, y, 15)

    pdf.setFont(FONT, 'bold')
    pdf.setFontSize(11)
    pdf.setTextColor(29, 29, 31)
    pdf.text(title, A4.margin.left, y)

    y += 2
    pdf.setDrawColor(229, 229, 234)
    pdf.setLineWidth(0.2)
    pdf.line(A4.margin.left, y, A4.width - A4.margin.right, y)

    return y + 6
}

/**
 * 绘制简单文本段落
 */
function drawSection(pdf, title, content, y) {
    y = drawSectionHeader(pdf, title, y)

    pdf.setFont(FONT, 'normal')
    pdf.setFontSize(10)
    pdf.setTextColor(66, 66, 69)

    const lines = pdf.splitTextToSize(content || '', A4.contentWidth)
    lines.forEach(line => {
        y = ensureSpace(pdf, y, 5)
        pdf.text(line, A4.margin.left, y)
        y += 5
    })

    return y + 4
}

/**
 * 绘制经历列表 (工作/教育/项目)
 */
function drawExperienceList(pdf, title, list, y, keys) {
    y = drawSectionHeader(pdf, title, y)

    list.forEach(item => {
        y = ensureSpace(pdf, y, 10)

        // 标题 (公司/学校/项目名)
        pdf.setFont(FONT, 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(29, 29, 31)
        pdf.text(item[keys.titleKey] || '', A4.margin.left, y)

        // 副标题 (职位/专业)
        const titleWidth = pdf.getTextWidth(item[keys.titleKey] || '')
        let subtitle = item[keys.subtitleKey] || ''
        if (keys.degreeKey && item[keys.degreeKey]) subtitle += ` ${item[keys.degreeKey]}`

        if (subtitle) {
            pdf.setFont(FONT, 'normal')
            pdf.setTextColor(134, 134, 139)
            pdf.text(`· ${subtitle}`, A4.margin.left + titleWidth + 2, y)
        }

        // 日期 (右对齐)
        const date = item.startDate ? `${item.startDate} - ${item.endDate || '至今'}` : (item.date || '')
        if (date) {
            const dateWidth = pdf.getTextWidth(date)
            pdf.setFontSize(9)
            pdf.setTextColor(134, 134, 139)
            pdf.text(date, A4.width - A4.margin.right - dateWidth, y)
        }

        y += 5

        // 描述
        if (item.description) {
            pdf.setFontSize(10)
            pdf.setTextColor(66, 66, 69)
            pdf.setFont(FONT, 'normal')
            const lines = pdf.splitTextToSize(item.description, A4.contentWidth)
            lines.forEach(line => {
                y = ensureSpace(pdf, y, 5)
                pdf.text(line, A4.margin.left, y)
                y += 5
            })
        }

        y += 4
    })

    return y + 2
}

/**
 * 绘制技能条
 */
function drawSkills(pdf, title, list, y) {
    y = drawSectionHeader(pdf, title, y)

    list.forEach(item => {
        y = ensureSpace(pdf, y, 5)

        pdf.setFont(FONT, 'bold')
        pdf.setFontSize(10)
        pdf.setTextColor(29, 29, 31)
        pdf.text(`${item.title}：`, A4.margin.left, y)

        const titleWidth = pdf.getTextWidth(`${item.title}：`)
        pdf.setFont(FONT, 'normal')
        pdf.setTextColor(66, 66, 69)
        pdf.text(item.content || '', A4.margin.left + titleWidth, y)

        y += 5
    })

    return y + 2
}
