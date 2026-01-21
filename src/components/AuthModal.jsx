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

        // 1. 基础校验
        if (!email || !/\S+@\S+\.\S+/.test(email)) {
            setMessage({ type: 'error', text: '请输入有效的邮箱地址' })
            return
        }

        // 2. 乐观更新：如果不等待直接跳转，用户体验极佳
        // 先设为 loading 避免重复提交（虽然切界面了也点不到）
        setLoading(true)

        // 立即跳转进入 OTP 界面 (Optimistic UI)
        setStep('otp')
        setOtp('')
        setTimer(60)
        setMessage({ type: 'success', text: '正在发送验证码...' }) // 初始提示

        // 3. 后台异步发送
        try {
            // 稍微延迟一点点，让界面先渲染出来，避免卡顿
            await new Promise(resolve => setTimeout(resolve, 50))

            const { error } = await signInWithEmail(email)
            if (error) throw error

            // 发送成功
            setMessage({ type: 'success', text: '验证码已发送，请查收' })
        } catch (error) {
            // 发送失败处理
            console.error('Send OTP error:', error)
            setMessage({ type: 'error', text: error.message || '发送失败，请稍后重试' })
            setTimer(0) // 允许立即重试
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
            width: '460px', // 稍微收窄一点，因为没有 Tab 了
            maxWidth: '90vw',
            backgroundColor: '#FFFFFF',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            transform: 'scale(1)',
            padding: '40px 32px',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
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
            gap: '16px'
        },
        logobox: {
            width: '56px',
            height: '56px',
            background: '#000',
            borderRadius: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        },
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
        <div style={styles.overlay}>
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
                        <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '24px', fontWeight: 700, margin: '0', color: '#000' }}>
                            邮箱极速登录
                        </h2>
                    </div>
                </div>

                {/* 3. Content */}
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <form onSubmit={step === 'email' ? handleEmailLogin : handleOtpLogin}>
                        {step === 'email' ? (
                            <div style={{ marginBottom: '10px' }}>
                                <div style={{
                                    margin: '0 0 20px 0',
                                    display: 'flex',
                                    justifyContent: 'center'
                                }}>
                                    <span style={{
                                        backgroundColor: '#FFF1F2',
                                        color: '#BE123C',
                                        fontSize: '13px',
                                        padding: '4px 12px',
                                        borderRadius: '100px',
                                        fontWeight: '500',
                                        border: '1px solid #FFE4E6'
                                    }}>
                                        🎁 注册即送 <strong style={{ fontWeight: 700 }}>5</strong> 次 AI 深度润色
                                    </span>
                                </div>
                                <input
                                    type="email"
                                    name="email"
                                    autocomplete="email"
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
                                <div style={{ textAlign: 'center', marginBottom: '8px', fontSize: '13px', color: '#666' }}>
                                    验证码已发送至 <span style={{ fontWeight: 600, color: '#000', margin: '0 4px' }}>{email}</span>
                                    <button
                                        type="button"
                                        onClick={() => { setStep('email'); setMessage(null); }}
                                        style={{ border: 'none', background: 'none', color: '#999', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
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
                </div>

                {/* 底部协议 */}
                < div style={{ textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: '20px' }}>
                    <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#666', opacity: 1 }}>
                        个人开发维护，经费有限暂不支持手机号微信（感谢理解 ❤️）
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#999' }}>
                        登录即代表您已阅读并同意用户协议与隐私政策
                    </p>
                </div >

            </div >
        </div >,
        document.body
    )
}
