import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

/**
 * WelcomeModal - 首次打开提示弹窗
 * 告知用户本地存储特性与数据丢失风险
 */
export default function WelcomeModal() {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        // 检查是否已经显示过
        const hasWelcomed = localStorage.getItem('minicv_welcomed')
        if (!hasWelcomed) {
            setIsOpen(true)
        }
    }, [])

    const handleConfirm = () => {
        localStorage.setItem('minicv_welcomed', 'true')
        setIsOpen(false)
    }

    if (!isOpen) return null

    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            zIndex: 200000, // 确保在所有弹窗之上
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        modal: {
            width: '440px',
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            padding: '40px 32px',
            textAlign: 'center',
            animation: 'modal-in 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
        },
        title: {
            fontSize: '22px',
            fontWeight: '800',
            marginBottom: '16px',
            color: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
        },
        content: {
            textAlign: 'left',
            fontSize: '15px',
            lineHeight: '1.7',
            color: '#444',
            marginBottom: '32px'
        },
        list: {
            paddingLeft: '0',
            listStyle: 'none',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
        },
        listItem: {
            display: 'flex',
            gap: '10px'
        },
        icon: {
            flexShrink: 0,
            marginTop: '2px'
        },
        btn: {
            width: '100%',
            padding: '16px',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '16px',
            border: 'none',
            cursor: 'pointer',
            transition: 'transform 0.2s'
        }
    }

    return createPortal(
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <h2 style={styles.title}>
                    <span>💡</span> 数据存储重要提醒
                </h2>

                <div style={styles.content}>
                    <p style={{ marginBottom: '16px', fontWeight: '500' }}>欢迎使用 MiniCV！在使用之前，请务必知悉以下关于数据安全的说明：</p>

                    <ul style={styles.list}>
                        <li style={styles.listItem}>
                            <span style={styles.icon}>✅</span>
                            <span><strong>纯本地存储</strong>：您的简历数据仅存储在当前浏览器的本地缓存中。</span>
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.icon}>🔒</span>
                            <span><strong>隐私无踪</strong>：我们不会采集、上传或在云端备份您的任何简历内容。</span>
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.icon}>⚠️</span>
                            <span><strong>丢失风险</strong>：如果您清理浏览器缓存、更换设备或切换浏览器，现有数据将无法找回。</span>
                        </li>
                        <li style={styles.listItem}>
                            <span style={styles.icon}>📤</span>
                            <span><strong>备份建议</strong>：建议您在完成编辑后，及时导出 PDF 或备份数据，以防意外丢失。</span>
                        </li>
                    </ul>
                </div>

                <button
                    style={styles.btn}
                    onClick={handleConfirm}
                    onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
                >
                    我已了解，开始使用
                </button>

                <style>{`
                    @keyframes modal-in {
                        from { opacity: 0; transform: translateY(20px) scale(0.95); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                `}</style>
            </div>
        </div>,
        document.body
    )
}
