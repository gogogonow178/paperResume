import { pdf } from '@react-pdf/renderer'
import ResumePDF from '../components/ResumePDF/ResumePDF'
import { saveAs } from 'file-saver'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import JSZip from 'jszip'
import useResumeStore from '../store/useResumeStore'

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
 * 导出 PDF - ATS 友好版 (@react-pdf/renderer)
 * 
 * 优点：
 * - 真 PDF，文字可选中
 * - 声明式 UI
 * - 中文支持 (需字体)
 */
export async function exportToPdf(data, onProgress) {
    try {
        onProgress?.('准备生成...')

        let resumeData = data
        if (!resumeData || !resumeData.basicInfo) {
            resumeData = useResumeStore.getState()
        }

        const safeName = sanitizeFileName(resumeData.basicInfo.name)
        const fileName = `${safeName}_简历.pdf`

        // 延迟加载字体和渲染
        onProgress?.('正在排版...')
        await new Promise(r => setTimeout(r, 100))

        const blob = await pdf(<ResumePDF data={resumeData} />).toBlob()

        onProgress?.('正在保存...')
        saveAs(blob, fileName)
        onProgress?.('导出完成')

    } catch (error) {
        console.error('PDF Export Failed', error)
        alert('导出失败: ' + error.message)
    }
}

/**
 * 导出 PDF - 高清图片版（备用方案）
 * 
 * 使用 html2canvas 截图方案
 * 优点：排版精确、中文支持完美、一键导出
 * 缺点：文字不可选中（非 ATS 友好）
 */
export async function exportToPdfImage(data, onProgress) {
    const container = document.getElementById('resume-preview')
    if (!container) return

    try {
        const pages = container.querySelectorAll('.a4-page')
        if (pages.length === 0) return

        onProgress?.('准备渲染...')

        let basicInfo = data?.basicInfo
        if (!basicInfo) {
            basicInfo = useResumeStore.getState().basicInfo
        }

        const safeName = sanitizeFileName(basicInfo.name)
        const fileName = `${safeName}_简历.pdf`

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
            onProgress?.(`正在渲染第 ${i + 1}/${pages.length} 页...`)

            await new Promise(r => requestAnimationFrame(r))

            const canvas = await html2canvas(page, {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                imageTimeout: 0
            })

            onProgress?.(`正在生成页面 ${i + 1}...`)
            await new Promise(r => requestAnimationFrame(r))

            const imgData = canvas.toDataURL('image/jpeg', 0.98)

            if (i > 0) {
                pdf.addPage()
            }

            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST')
        }

        onProgress?.('正在保存...')
        pdf.save(fileName)
        onProgress?.('导出完成')

    } catch (error) {
        console.error('PDF Export Failed', error)
        alert('导出失败，请重试')
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

        onProgress?.('正在渲染...')
        await document.fonts.ready

        const safeName = sanitizeFileName(name)
        const date = new Date().toISOString().split('T')[0]

        // 如果只有一页，直接下载单张图片
        if (pages.length === 1) {
            const canvas = await html2canvas(pages[0], {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            onProgress?.('保存中...')
            canvas.toBlob(blob => {
                const url = URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = `${safeName}_简历_${date}.png`
                a.click()
                URL.revokeObjectURL(url)
                onProgress?.('完成')
            })
            return
        }

        // 多页：打包成 ZIP
        const zip = new JSZip()
        const folder = zip.folder(`${safeName}_简历`)

        for (let i = 0; i < pages.length; i++) {
            onProgress?.(`正在渲染第 ${i + 1}/${pages.length} 页...`)
            await new Promise(r => requestAnimationFrame(r))

            const canvas = await html2canvas(pages[i], {
                scale: 4,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            })

            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'))
            folder.file(`第${i + 1}页.png`, blob)
        }

        onProgress?.('正在打包...')
        const zipBlob = await zip.generateAsync({ type: 'blob' })

        const url = URL.createObjectURL(zipBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${safeName}_简历_${date}.zip`
        a.click()
        URL.revokeObjectURL(url)
        onProgress?.('完成')

    } catch (e) {
        console.error(e)
        alert('图片导出失败')
    }
}
