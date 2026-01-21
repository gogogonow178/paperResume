import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useAuth } from '../context/AuthContext'

/**
 * AuthModal V7 - 最终原子修正版
 * 
 * !!! 警告 !!!
 * 由于 Tailwind 类名在用户环境中似乎失效（可能是 JIT 缓存问题），
 * 本版本采用 React 内联样式 (Inline Styles) 强制覆盖所有布局属性。
 * 这将无视任何 CSS 优先级问题，直接由浏览器渲染引擎执行。
 * 
 * 强制参数:
 * - 宽度: 500px
 * - 内边距: 50px
 * - 垂直间距: 40px
 */
export default function AuthModal({ isOpen, onClose, onSuccess }) {
    const [email, setEmail] = useState('')
    const [otp, setOtp] = useState('')
    const [step, setStep] = useState('email') // 'email' | 'otp'
    const [timer, setTimer] = useState(0) // 倒计时状态
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState(null)
    const [tab, setTab] = useState('wechat')
    const { signInWithEmail, verifyEmailOtp } = useAuth()

    // 防止滚动穿透
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = 'unset'
        }
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [isOpen])

    // 倒计时逻辑
    useEffect(() => {
        let interval
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(interval)
    }, [timer])

    if (!isOpen) return null

    const handleEmailLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { error } = await signInWithEmail(email)
            if (error) throw error
            setMessage({ type: 'success', text: '验证码已发送，请查收' })
            setStep('otp')
            setOtp('')
            setTimer(60) // 开始 60s 倒计时
        } catch (error) {
            setMessage({ type: 'error', text: error.message || '发送失败' })
        } finally {
            setLoading(false)
        }
    }

    const handleResend = async () => {
        setLoading(true)
        setMessage(null)
        try {
            const { error } = await signInWithEmail(email)
            if (error) throw error
            setMessage({ type: 'success', text: '验证码已重新发送' })
            setTimer(60) // 重置倒计时
        } catch (error) {
            setMessage({ type: 'error', text: error.message || '重发失败' })
        } finally {
            setLoading(false)
        }
    }

    const handleOtpLogin = async (e, manualOtp) => {
        if (e) e.preventDefault()
        const codeToUse = manualOtp || otp
        if (!codeToUse || codeToUse.length !== 6) return

        setLoading(true)
        setMessage(null)

        try {
            const { error } = await verifyEmailOtp(email, codeToUse)
            if (error) throw error
            setMessage({ type: 'success', text: '登录成功！' })
            setTimeout(() => {
                if (onSuccess) onSuccess()
                onClose() // Close modal on success
            }, 1000)
        } catch (error) {
            setMessage({ type: 'error', text: error.message || '验证失败，请重试' })
        } finally {
            setLoading(false)
        }
    }

    // 样式常量 - 只有魔法才能打败魔法
    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        modal: {
            position: 'relative',
            width: '500px', // 强制宽度 500px
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transform: 'scale(1)',
            padding: '50px', // 强制内边距 50px
            display: 'flex',
            flexDirection: 'column',
            gap: '40px' // 强制间距 40px
        },
        closeBtn: {
            position: 'absolute',
            top: '25px',
            right: '25px',
            padding: '8px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            color: '#999',
            zIndex: 10
        },
        header: {
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '20px'
        },
        logobox: {
            width: '64px',
            height: '64px',
            background: '#000',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
        tabContainer: {
            display: 'flex',
            background: '#F5F5F7',
            padding: '6px',
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.05)'
        },
        tabBtn: (isActive) => ({
            flex: 1,
            padding: '14px 0',
            border: 'none',
            borderRadius: '12px',
            background: isActive ? '#FFFFFF' : 'transparent',
            color: isActive ? '#000000' : '#86868B',
            boxShadow: isActive ? '0 2px 10px rgba(0,0,0,0.05)' : 'none',
            fontWeight: 600,
            fontSize: '15px',
            cursor: 'pointer',
            transition: 'all 0.2s'
        }),
        input: {
            width: '100%',
            padding: '18px 20px',
            fontSize: '16px',
            background: '#F5F5F7',
            border: '2px solid transparent',
            borderRadius: '16px',
            outline: 'none',
            textAlign: 'center',
            color: '#000'
        },
        submitBtn: {
            width: '100%',
            padding: '18px',
            fontSize: '16px',
            fontWeight: 700,
            background: '#000',
            color: '#fff',
            border: 'none',
            borderRadius: '16px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
            marginTop: '20px'
        }
    }

    return createPortal(
        <div style={styles.overlay} onClick={onClose}>
            <div
                style={styles.modal}
                onClick={e => e.stopPropagation()}
            >
                {/* 关闭按钮 */}
                <button style={styles.closeBtn} onClick={onClose}>
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 1. Header */}
                <div style={styles.header}>
                    <div style={styles.logobox}>
                        <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '26px', fontWeight: 700, margin: '0 0 10px 0', color: '#000' }}>
                            开启 AI 智能润色
                        </h2>
                        <p style={{ margin: 0, color: '#666', fontSize: '15px' }}>
                            新用户注册即送 <strong>5</strong> 次高级优化额度
                        </p>
                    </div>
                </div>

                {/* 2. Tabs */}
                <div style={styles.tabContainer}>
                    <button style={styles.tabBtn(tab === 'wechat')} onClick={() => setTab('wechat')}>
                        微信扫码
                    </button>
                    <button style={styles.tabBtn(tab === 'email')} onClick={() => setTab('email')}>
                        邮箱登录
                    </button>
                </div>

                {/* 3. Content */}
                <div style={{ minHeight: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    {tab === 'wechat' ? (
                        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '150px', height: '150px', background: '#fff', border: '1px solid #eee',
                                borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px'
                            }}>
                                <span style={{ color: '#ccc', fontSize: '13px' }}>即将上线</span>
                            </div>
                            <button
                                onClick={() => setTab('email')}
                                style={{ background: 'none', border: 'none', color: '#000', fontWeight: 600, cursor: 'pointer', textDecoration: 'underline' }}
                            >
                                暂不可用，请使用邮箱 →
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={step === 'email' ? handleEmailLogin : handleOtpLogin}>
                            {step === 'email' ? (
                                <div style={{ marginBottom: '10px' }}>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="请输入您的邮箱地址..."
                                        style={styles.input}
                                        disabled={loading}
                                    />
                                </div>
                            ) : (
                                <div style={{ marginBottom: '10px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                                        <span style={{ fontSize: '14px', color: '#666' }}>验证码已发送至</span>
                                        <br />
                                        <span style={{ fontWeight: 600, color: '#000' }}>{email}</span>
                                        <button
                                            type="button"
                                            onClick={() => { setStep('email'); setMessage(null); }}
                                            style={{ marginLeft: '10px', border: 'none', background: 'none', color: '#666', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                                        >
                                            修改
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        required
                                        value={otp}
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 6)
                                            setOtp(val)
                                            if (val.length === 6) handleOtpLogin(e, val)
                                        }}
                                        placeholder="请输入 6 位验证码"
                                        style={{ ...styles.input, letterSpacing: '4px', fontWeight: 'bold', fontSize: '20px' }}
                                        autoFocus
                                        disabled={loading}
                                    />

                                    {/* 倒计时与重发按钮 */}
                                    <div style={{ textAlign: 'center', marginTop: '5px' }}>
                                        {timer > 0 ? (
                                            <span style={{ fontSize: '13px', color: '#999' }}>
                                                {timer} 秒后可重新发送
                                            </span>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResend}
                                                disabled={loading}
                                                style={{
                                                    background: 'none', border: 'none', color: '#000',
                                                    fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                                                    textDecoration: 'underline'
                                                }}
                                            >
                                                重新发送验证码
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {message && (
                                <div style={{
                                    padding: '15px', borderRadius: '12px', marginBottom: '10px', fontSize: '14px', textAlign: 'center',
                                    backgroundColor: message.type === 'success' ? '#ECFDF5' : '#FEF2F2',
                                    color: message.type === 'success' ? '#065F46' : '#991B1B'
                                }}>
                                    {message.text}
                                </div>
                            )}

                            <button type="submit" style={styles.submitBtn} disabled={loading}>
                                {loading ? '处理中...' : (step === 'email' ? '获取验证码' : '登录')}
                            </button>
                        </form>
                    )}
                </div>

                {/* 底部协议 */}
                <div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                        登录即代表您已阅读并同意用户协议与隐私政策
                    </p>
                </div>

            </div>
        </div>,
        document.body
    )
}
