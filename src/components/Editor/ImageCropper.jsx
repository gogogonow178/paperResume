import { useState, useRef, useCallback } from 'react'

/**
 * ImageCropper - 简易头像裁剪组件
 * 支持拖拽调整位置、缩放调整大小
 */
function ImageCropper({ imageSrc, onConfirm, onCancel }) {
    const [scale, setScale] = useState(1)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const containerRef = useRef(null)

    // 处理拖拽开始
    const handleMouseDown = (e) => {
        e.preventDefault()
        setIsDragging(true)
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        })
    }

    // 处理拖拽移动
    const handleMouseMove = useCallback((e) => {
        if (!isDragging) return
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        })
    }, [isDragging, dragStart])

    // 处理拖拽结束
    const handleMouseUp = () => {
        setIsDragging(false)
    }

    // 处理缩放
    const handleScaleChange = (e) => {
        setScale(parseFloat(e.target.value))
    }

    // 确认裁剪
    const handleConfirm = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        const outputSize = 400

        canvas.width = outputSize
        canvas.height = outputSize

        const img = new Image()
        img.onload = () => {
            // 计算绘制参数
            const containerSize = 240
            const imgDisplaySize = containerSize * scale
            const imgRatio = img.width / img.height

            let drawWidth, drawHeight
            if (imgRatio > 1) {
                drawHeight = imgDisplaySize
                drawWidth = drawHeight * imgRatio
            } else {
                drawWidth = imgDisplaySize
                drawHeight = drawWidth / imgRatio
            }

            // 计算源图位置（相对于裁剪框中心）
            const offsetX = (containerSize / 2 - position.x) / imgDisplaySize * img.width
            const offsetY = (containerSize / 2 - position.y) / imgDisplaySize * img.height

            const cropSize = containerSize / imgDisplaySize * Math.min(img.width, img.height)

            // 绘制白色背景
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, outputSize, outputSize)

            // 绘制图片
            const sx = Math.max(0, (img.width - cropSize) / 2 + (position.x / imgDisplaySize) * -cropSize)
            const sy = Math.max(0, (img.height - cropSize) / 2 + (position.y / imgDisplaySize) * -cropSize)

            ctx.drawImage(
                img,
                sx, sy, cropSize, cropSize,
                0, 0, outputSize, outputSize
            )

            const result = canvas.toDataURL('image/jpeg', 0.9)
            onConfirm(result)
        }
        img.src = imageSrc
    }

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 9999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                backdropFilter: 'blur(8px)'
            }}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
        >
            <div
                style={{
                    width: '100%',
                    maxWidth: '400px',
                    backgroundColor: '#fff',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                {/* 标题 */}
                <div style={{ padding: '20px 24px', borderBottom: '1px solid #E5E7EB' }}>
                    <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1D1D1F', textAlign: 'center' }}>
                        调整头像位置
                    </h3>
                    <p style={{ fontSize: '13px', color: '#86868B', textAlign: 'center', marginTop: '4px' }}>
                        拖拽图片调整位置，滑动调整大小
                    </p>
                </div>

                {/* 裁剪区域 */}
                <div style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
                    <div
                        ref={containerRef}
                        style={{
                            width: '240px',
                            height: '240px',
                            borderRadius: '50%',
                            overflow: 'hidden',
                            position: 'relative',
                            backgroundColor: '#F3F4F6',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.1)'
                        }}
                        onMouseDown={handleMouseDown}
                    >
                        <img
                            src={imageSrc}
                            alt="预览"
                            draggable={false}
                            style={{
                                position: 'absolute',
                                left: '50%',
                                top: '50%',
                                transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                                minWidth: '100%',
                                minHeight: '100%',
                                objectFit: 'cover',
                                userSelect: 'none',
                                pointerEvents: 'none'
                            }}
                        />
                    </div>
                </div>

                {/* 缩放滑块 */}
                <div style={{ padding: '0 32px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <svg style={{ width: '16px', height: '16px', color: '#86868B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
                        </svg>
                        <input
                            type="range"
                            min="0.5"
                            max="3"
                            step="0.1"
                            value={scale}
                            onChange={handleScaleChange}
                            style={{
                                flex: 1,
                                height: '4px',
                                borderRadius: '2px',
                                appearance: 'none',
                                background: `linear-gradient(to right, #000000 0%, #000000 ${((scale - 0.5) / 2.5) * 100}%, #E5E7EB ${((scale - 0.5) / 2.5) * 100}%, #E5E7EB 100%)`,
                                cursor: 'pointer'
                            }}
                        />
                        <svg style={{ width: '20px', height: '20px', color: '#86868B' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                    </div>
                </div>

                {/* 按钮 */}
                <div style={{ padding: '0 24px 24px', display: 'flex', gap: '12px' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            flex: 1,
                            padding: '14px 0',
                            fontSize: '15px',
                            fontWeight: 500,
                            color: '#6B7280',
                            background: '#F3F4F6',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer'
                        }}
                    >
                        取消
                    </button>
                    <button
                        onClick={handleConfirm}
                        style={{
                            flex: 1,
                            padding: '14px 0',
                            fontSize: '15px',
                            fontWeight: 600,
                            color: '#fff',
                            background: '#000000',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            boxShadow: '0 4px 14px rgba(0, 0, 0, 0.1)'
                        }}
                    >
                        确认
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ImageCropper
