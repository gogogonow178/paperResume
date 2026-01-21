import { useState, useEffect } from 'react'
import EditorPanel from './components/Layout/EditorPanel'
import PreviewPanel from './components/Layout/PreviewPanel'
import MobileBlock from './components/MobileBlock'

/**
 * App 根组件
 * - 检测屏幕宽度，移动端显示拦截提示
 * - 桌面端显示双栏布局（左编辑区/右预览区）
 */
function App() {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // 检测设备宽度
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768)
        }

        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    // 移动端显示拦截页
    if (isMobile) {
        return <MobileBlock />
    }

    // 桌面端双栏布局
    return (
        <div className="flex h-screen">
            {/* 左侧编辑区 */}
            <EditorPanel />

            {/* 右侧预览区 */}
            <PreviewPanel />
        </div>
    )
}

export default App
