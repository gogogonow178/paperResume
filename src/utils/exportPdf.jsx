import useResumeStore from '../store/useResumeStore'
import { buildResumePdf } from './pdfBuilder'

// 动态导入重型库以减少初始包体积 (jsPDF ~300KB, html2canvas ~150KB, JSZip ~100KB)
// 这些库仅在用户点击导出时才会加载

/**
 * 清理文件名
 */
function sanitizeFileName(name) {
    if (!name) return 'resume'
    return name
        .trim()
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .replace(/^_|_$/g, '')
        || 'resume'
}

/**
 * 导出 PDF - 高清图片版
 * 
 * 使用 html2canvas 截图方案
 * 优点：排版精确、中文支持完美、一键导出
 */
/**
 * 导出 PDF - 像素级优化版
 * 使用 html2canvas 转换为无损 PNG 后存入 PDF
 */
export async function exportToPdf(data, onProgress) {
    const container = document.getElementById('resume-preview')
    if (!container) return

    try {
        const pages = container.querySelectorAll('.a4-page')
        if (pages.length === 0) return

        onProgress?.('准备渲染高清页面…')

        // 动态导入库
        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
            import('jspdf'),
            import('html2canvas')
        ])

        let basicInfo = data?.basicInfo
        if (!basicInfo) {
            basicInfo = useResumeStore.getState().getCurrentResume().basicInfo
        }

        const safeName = sanitizeFileName(basicInfo.name)
        const fileName = `${safeName}_简历.pdf`

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i]
            onProgress?.(`正在渲染渲染中... (${i + 1}/${pages.length})`)

            await new Promise(r => requestAnimationFrame(r))

            // 彻底修复错位变形：强制设置固定的物理尺寸
            const canvas = await html2canvas(page, {
                scale: 3, // 3倍足以实现视网膜级清晰度，且兼容性更好
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                width: page.offsetWidth,
                height: page.offsetHeight,
                windowWidth: document.documentElement.clientWidth,
                windowHeight: document.documentElement.clientHeight,
                // 像素级优化：强制使用特殊的渲染设置

                onclone: (clonedDoc) => {
                    // 方案 1：直接查找克隆文档里的所有图标，不分页面，强制修正
                    const icons = clonedDoc.querySelectorAll('.contact-icon');

                    icons.forEach(icon => {
                        // 预留全局对齐控制
                        icon.style.setProperty('margin-top', '5px', 'important');
                        icon.style.setProperty('position', 'relative', 'important');
                        icon.style.setProperty('top', '5px', 'important');
                    });

                    // --- 微信图标位置微调 (PDF) ---
                    const wechatIcons = clonedDoc.querySelectorAll('.wechat-icon');
                    wechatIcons.forEach(icon => {
                        icon.style.setProperty('margin-top', '5px', 'important');
                        icon.style.setProperty('top', '5px', 'important');
                    });

                    // --- 微信文字位置微调 (PDF) ---
                    const wechatTexts = clonedDoc.querySelectorAll('.wechat-text');
                    wechatTexts.forEach(text => {
                        text.style.setProperty('margin-top', '1px', 'important');
                        text.style.setProperty('position', 'relative', 'important');
                        text.style.setProperty('top', '1px', 'important');
                    });

                    // 保持原来的清理逻辑
                    const clonedPage = clonedDoc.querySelectorAll('.a4-page')[i];
                    if (clonedPage) {
                        clonedPage.style.boxShadow = 'none';
                        clonedPage.style.margin = '0';
                    }
                }
            })

            // 使用 PNG 格式，避免 JPEG 带来的图标周围噪点
            const imgData = canvas.toDataURL('image/png')

            if (i > 0) pdf.addPage()

            // 关键：使用 PNG 且不传第二个参数压缩，保持原始细腻度
            // 保持比例 1:1 绘制到 A4
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight, undefined, 'SLOW')
        }

        onProgress?.('正在生成文件...')
        pdf.save(fileName)
        onProgress?.('导出成功')

    } catch (error) {
        console.error('PDF Export Failed', error)
        alert('导出失败，请重试')
    }
}

/**
 * 导出 PDF - 旧版截图方案 (回退备份)
 */
export async function exportToPdfLegacy(data, onProgress) {
    const container = document.getElementById('resume-preview')
    if (!container) return

    try {
        const pages = container.querySelectorAll('.a4-page')
        if (pages.length === 0) return

        onProgress?.('正在使用回退模式导出...')

        // 动态导入重型库
        const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
            import('jspdf'),
            import('html2canvas')
        ])

        let basicInfo = data?.basicInfo
        if (!basicInfo) {
            basicInfo = useResumeStore.getState().getCurrentResume().basicInfo
        }

        const safeName = sanitizeFileName(basicInfo.name)
        const fileName = `${safeName}_简历_兼容版.pdf`

        const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
            compress: true
        })

        const pdfWidth = pdf.internal.pageSize.getWidth()
        const pdfHeight = pdf.internal.pageSize.getHeight()

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i]
            onProgress?.(`正在渲染渲染中... (${i + 1}/${pages.length})`)

            const canvas = await html2canvas(page, {
                scale: 3, // 降低一点缩放提高稳定性
                useCORS: true,
                backgroundColor: '#ffffff'
            })

            const imgData = canvas.toDataURL('image/jpeg', 0.95)
            if (i > 0) pdf.addPage()
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight)
        }

        pdf.save(fileName)
        onProgress?.('完成')

    } catch (error) {
        console.error('Legacy PDF Export Also Failed', error)
        alert('导出失败，请尝试刷新页面')
    }
}

/**
 * 导出图片 - 多页打包为 ZIP
 */
export async function exportToImage(name, onProgress) {
    const container = document.getElementById('resume-preview')
    if (!container) return

    try {
        const pages = container.querySelectorAll('.a4-page')
        if (pages.length === 0) return

        onProgress?.('加载导出模块…')

        // 动态导入 html2canvas，多页时还需要 JSZip
        const [{ default: html2canvas }] = await Promise.all([
            import('html2canvas')
        ])

        onProgress?.('正在渲染…')
        await document.fonts.ready

        const safeName = sanitizeFileName(name)
        // 获取本地完整时间 (YYYY-MM-DD_HHmmss)
        const now = new Date()
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const timeStr = `${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
        const fullTimestamp = `${dateStr}_${timeStr}`

        // 如果只有一页，直接下载单张图片
        if (pages.length === 1) {
            const canvas = await html2canvas(pages[0], {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const icons = clonedDoc.querySelectorAll('.contact-icon');
                    icons.forEach(icon => {
                        icon.style.setProperty('margin-top', '6px', 'important');
                        icon.style.setProperty('position', 'relative', 'important');
                        icon.style.setProperty('top', '6px', 'important');
                    });

                    // --- 微信控制点 (图片导出) ---
                    const wechatIcons = clonedDoc.querySelectorAll('.wechat-icon');
                    wechatIcons.forEach(icon => {
                        icon.style.setProperty('margin-top', '4.5px', 'important');
                        icon.style.setProperty('top', '4.5px', 'important');
                    });

                    const wechatTexts = clonedDoc.querySelectorAll('.wechat-text');
                    wechatTexts.forEach(text => {
                        text.style.setProperty('margin-top', '1px', 'important');
                        text.style.setProperty('position', 'relative', 'important');
                        text.style.setProperty('top', '1px', 'important');
                    });
                }
            })

            onProgress?.('保存中...')
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${safeName}_简历_${fullTimestamp}.png`
                a.click()
                URL.revokeObjectURL(url)
                onProgress?.('完成')
            })
            return
        }

        // 多页：打包成 ZIP - 动态导入 JSZip
        const { default: JSZip } = await import('jszip')
        const zip = new JSZip()
        const folder = zip.folder(`${safeName}_简历`)

        for (let i = 0; i < pages.length; i++) {
            onProgress?.(`正在渲染第 ${i + 1}/${pages.length} 页...`)
            await new Promise(r => requestAnimationFrame(r))

            const canvas = await html2canvas(pages[i], {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                onclone: (clonedDoc) => {
                    const icons = clonedDoc.querySelectorAll('.contact-icon');
                    icons.forEach(icon => {
                        icon.style.setProperty('margin-top', '3.5px', 'important');
                        icon.style.setProperty('position', 'relative', 'important');
                        icon.style.setProperty('top', '3.5px', 'important');
                    });

                    // --- 微信图标专用调试点 (多页图片导出) ---
                    const wechatIcons = clonedDoc.querySelectorAll('.wechat-icon');
                    wechatIcons.forEach(icon => {
                        icon.style.setProperty('margin-top', '4.5px', 'important');
                        icon.style.setProperty('top', '4.5px', 'important');
                    });

                    // --- 微信文字专用调试点 (多页图片导出) ---
                    const wechatTexts = clonedDoc.querySelectorAll('.wechat-text');
                    wechatTexts.forEach(text => {
                        text.style.setProperty('margin-top', '0px', 'important');
                        text.style.setProperty('position', 'relative', 'important');
                        text.style.setProperty('top', '0px', 'important');
                    });
                }
            })

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
            // 显式传入本地时间，修复 ZIP 内部文件 8 小时时差问题
            folder.file(`第${i + 1}页.png`, blob, { date: new Date() })
        }

        onProgress?.('正在打包...')
        const zipBlob = await zip.generateAsync({ type: 'blob' })

        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${safeName}_简历_${fullTimestamp}.zip`
        a.click()
        URL.revokeObjectURL(url)
        onProgress?.('完成')

    } catch (e) {
        console.error(e)
        alert('图片导出失败')
    }
}
