/**
 * PDF 布局辅助工具
 * 用于 jsPDF 文本绘制的布局计算
 */

// A4 尺寸 (mm)
export const A4 = {
    width: 210,
    height: 297,
    margin: {
        top: 20,
        bottom: 20,
        left: 22,
        right: 22,
    },
    get contentWidth() {
        return this.width - this.margin.left - this.margin.right
    },
    get contentHeight() {
        return this.height - this.margin.top - this.margin.bottom
    }
}

// 字体大小配置
export const FONT_SIZES = {
    name: 20,
    jobTitle: 12,
    sectionTitle: 12,
    itemTitle: 11,
    itemSubtitle: 10,
    body: 10,
    small: 9,
}

// 行高配置
export const LINE_HEIGHTS = {
    name: 10,
    sectionTitle: 8,
    body: 5,
}

// 颜色配置
export const COLORS = {
    primary: '#1D1D1F',
    secondary: '#86868B',
    accent: '#0071E3',
    border: '#E5E5E5',
}

/**
 * 文本自动换行
 * @param {jsPDF} pdf - jsPDF 实例
 * @param {string} text - 要绘制的文本
 * @param {number} maxWidth - 最大宽度 (mm)
 * @returns {string[]} 换行后的文本数组
 */
export function wrapText(pdf, text, maxWidth) {
    if (!text) return []

    const lines = []
    const paragraphs = text.split('\n')

    for (const paragraph of paragraphs) {
        if (!paragraph.trim()) {
            lines.push('')
            continue
        }

        const words = paragraph.split('')
        let currentLine = ''

        for (const char of words) {
            const testLine = currentLine + char
            const testWidth = pdf.getTextWidth(testLine)

            if (testWidth > maxWidth && currentLine) {
                lines.push(currentLine)
                currentLine = char
            } else {
                currentLine = testLine
            }
        }

        if (currentLine) {
            lines.push(currentLine)
        }
    }

    return lines
}

/**
 * 检测是否需要分页
 * @param {jsPDF} pdf - jsPDF 实例
 * @param {number} y - 当前 Y 坐标
 * @param {number} neededHeight - 需要的高度
 * @returns {number} 新的 Y 坐标
 */
export function checkPageBreak(pdf, y, neededHeight = 20) {
    const maxY = A4.height - A4.margin.bottom

    if (y + neededHeight > maxY) {
        pdf.addPage()
        return A4.margin.top
    }

    return y
}

/**
 * 绘制分隔线
 */
export function drawDivider(pdf, y, x1 = A4.margin.left, x2 = A4.width - A4.margin.right) {
    pdf.setDrawColor(229, 229, 234) // #E5E5EA
    pdf.setLineWidth(0.3)
    pdf.line(x1, y, x2, y)
    return y + 3
}

/**
 * 绘制模块标题
 */
export function drawSectionTitle(pdf, title, y) {
    y = checkPageBreak(pdf, y, 15)

    pdf.setFontSize(FONT_SIZES.sectionTitle)
    pdf.setTextColor(29, 29, 31) // #1D1D1F
    pdf.setFont('SourceHanSansSC', 'bold')
    pdf.text(title, A4.margin.left, y)

    y += 4
    y = drawDivider(pdf, y)

    return y + 2
}

/**
 * 绘制工作/项目经历条目
 */
export function drawExperienceItem(pdf, item, y, options = {}) {
    const { titleKey = 'company', subtitleKey = 'position', dateKey = 'startDate', endDateKey = 'endDate' } = options

    y = checkPageBreak(pdf, y, 25)

    // 标题行
    pdf.setFontSize(FONT_SIZES.itemTitle)
    pdf.setTextColor(29, 29, 31)
    pdf.setFont('SourceHanSansSC', 'bold')

    const title = item[titleKey] || ''
    const subtitle = item[subtitleKey] || ''
    const date = item[dateKey] ? `${item[dateKey]} - ${item[endDateKey] || '至今'}` : ''

    pdf.text(title, A4.margin.left, y)

    if (subtitle) {
        const titleWidth = pdf.getTextWidth(title + ' · ')
        pdf.setFont('SourceHanSansSC', 'normal')
        pdf.setTextColor(134, 134, 139)
        pdf.text('· ' + subtitle, A4.margin.left + pdf.getTextWidth(title + ' '), y)
    }

    // 日期（右对齐）
    if (date) {
        pdf.setFontSize(FONT_SIZES.small)
        pdf.setTextColor(134, 134, 139)
        const dateWidth = pdf.getTextWidth(date)
        pdf.text(date, A4.width - A4.margin.right - dateWidth, y)
    }

    y += 5

    // 描述
    if (item.description) {
        pdf.setFontSize(FONT_SIZES.body)
        pdf.setTextColor(66, 66, 69) // #424245
        pdf.setFont('SourceHanSansSC', 'normal')

        const lines = wrapText(pdf, item.description, A4.contentWidth)
        for (const line of lines) {
            y = checkPageBreak(pdf, y, 5)
            pdf.text(line, A4.margin.left, y)
            y += 4
        }
    }

    return y + 4
}

/**
 * 绘制技能条目
 */
export function drawSkillItem(pdf, item, y) {
    y = checkPageBreak(pdf, y, 8)

    pdf.setFontSize(FONT_SIZES.body)
    pdf.setTextColor(29, 29, 31)
    pdf.setFont('SourceHanSansSC', 'bold')
    pdf.text(item.title + '：', A4.margin.left, y)

    const titleWidth = pdf.getTextWidth(item.title + '：')
    pdf.setFont('SourceHanSansSC', 'normal')
    pdf.setTextColor(66, 66, 69)
    pdf.text(item.content || '', A4.margin.left + titleWidth, y)

    return y + 5
}
