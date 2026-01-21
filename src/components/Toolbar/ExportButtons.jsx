import { useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { exportToPdf, exportToImage } from '../../utils/exportPdf.jsx'

/**
 * ExportButtons - 导出按钮组
 */
function ExportButtons() {
    const [isExporting, setIsExporting] = useState(false)
    const [progressText, setProgressText] = useState('')
    const basicInfo = useResumeStore((state) => state.basicInfo)

    // 导出 PDF（截图方案）
    const handleExportPdf = async () => {
        if (isExporting) return
        setIsExporting(true)
        setProgressText('正在生成 PDF...')

        try {
            const resumeData = useResumeStore.getState()
            await exportToPdf(resumeData, (msg) => setProgressText(msg))
        } catch (error) {
            console.error(error)
            alert('导出失败，请重试')
        } finally {
            setIsExporting(false)
            setTimeout(() => setProgressText(''), 3000)
        }
    }

    // 导出图片
    const handleExportImage = async () => {
        if (isExporting) return
        setIsExporting(true)
        setProgressText('准备图片...')

        try {
            await new Promise(resolve => requestAnimationFrame(resolve))

            await exportToImage(basicInfo.name, (msg) => {
                setProgressText(msg)
            })
        } finally {
            setIsExporting(false)
            setProgressText('')
        }
    }

    return (
        <div className="flex gap-3 items-center">
            {/* 状态提示 */}
            {isExporting && (
                <span className="text-xs text-gray-500 animate-pulse transition-all">
                    {progressText}
                </span>
            )}

            <button
                onClick={handleExportPdf}
                disabled={isExporting}
                className="btn-add text-sm py-2.5 px-5 transition-all duration-300 transform active:scale-95"
                style={{
                    boxShadow: isExporting ? 'none' : '0 4px 12px rgba(0, 113, 227, 0.25)',
                    background: isExporting ? '#ccc' : '',
                    cursor: isExporting ? 'wait' : 'pointer'
                }}
            >
                {isExporting ? (
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                            <path className="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        {/* 保持按钮宽度大致不变 */}
                        <span className="w-16 text-center">处理中</span>
                    </span>
                ) : (
                    <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        导出 PDF
                    </>
                )}
            </button>

            <button
                onClick={handleExportImage}
                disabled={isExporting}
                className="btn btn-secondary text-sm py-2.5 px-5 active:scale-95 transition-transform"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                导出图片
            </button>
        </div>
    )
}

export default ExportButtons
