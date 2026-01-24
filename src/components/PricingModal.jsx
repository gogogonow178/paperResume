import { createPortal } from 'react-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'

/**
 * 价格方案弹窗 - V2 Apple/Notion 极简重构版
 * 接入微信支付 Native 扫码支付
 */
export default function PricingModal({ isOpen, onClose }) {
    const { session, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [selectedTier, setSelectedTier] = useState('pro')
    const [step, setStep] = useState('tiers') // 'tiers' | 'qrcode' | 'success' | 'error'
    const [qrCodeUrl, setQrCodeUrl] = useState('')
    const [outTradeNo, setOutTradeNo] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const pollIntervalRef = useRef(null)

    // 套餐配置（生产环境金额）
    const tiers = {
        trial: {
            id: 'trial',
            name: '☕️ 尝鲜包',
            price: '9.9',
            credits: 5,
            desc: '试错门槛低，适合单次体验',
            tag: '',
            color: '#666',
            pricePerCredit: '1.98'
        },
        pro: {
            id: 'pro',
            name: '🔥 求职包',
            price: '19.9',
            credits: 20,
            desc: '主力推荐，够改3份简历',
            tag: '80% 用户的选择',
            color: '#000',
            pricePerCredit: '1.0'
        },
        max: {
            id: 'max',
            name: '🚀 面霸包',
            price: '29.9',
            credits: 50,
            desc: '海投专用，深度打磨细节',
            tag: '',
            color: '#333333',
            pricePerCredit: '0.6'
        }
    }

    // 清理轮询定时器
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
            }
        }
    }, [])

    // 关闭弹窗时重置状态
    const handleClose = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
        setStep('tiers')
        setQrCodeUrl('')
        setOutTradeNo('')
        setErrorMessage('')
        setLoading(false)
        onClose()
    }

    // 创建订单并获取二维码
    const handlePurchase = async () => {
        setLoading(true)
        setErrorMessage('')

        try {
            const response = await fetch('/api/wechat-pay/create-order', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session?.access_token}`
                },
                body: JSON.stringify({ tier: selectedTier })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || data.detail || '下单失败')
            }

            // 保存订单信息并显示二维码
            setQrCodeUrl(data.code_url)
            setOutTradeNo(data.out_trade_no)
            setStep('qrcode')

            // 开始轮询支付状态
            startPolling(data.out_trade_no)

        } catch (error) {
            console.error('Create order error:', error)
            setErrorMessage(error.message)
            setStep('error')
        } finally {
            setLoading(false)
        }
    }

    // 轮询订单状态
    const startPolling = (orderNo) => {
        // 清除之前的轮询
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
        }

        let pollCount = 0
        const maxPolls = 120 // 最多轮询 120 次 (约 2 分钟)

        pollIntervalRef.current = setInterval(async () => {
            pollCount++

            // 超时停止轮询
            if (pollCount > maxPolls) {
                clearInterval(pollIntervalRef.current)
                pollIntervalRef.current = null
                return
            }

            try {
                const response = await fetch(`/api/wechat-pay/query-order?out_trade_no=${orderNo}`, {
                    headers: {
                        'Authorization': `Bearer ${session?.access_token}`
                    }
                })

                const data = await response.json()

                if (data.status === 'paid') {
                    // 支付成功！
                    clearInterval(pollIntervalRef.current)
                    pollIntervalRef.current = null
                    setStep('success')
                    await refreshProfile() // 刷新用户积分
                }
            } catch (error) {
                console.error('Poll error:', error)
            }
        }, 1000) // 每秒轮询一次
    }

    // 返回套餐选择
    const handleBackToTiers = () => {
        if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current)
            pollIntervalRef.current = null
        }
        setStep('tiers')
        setQrCodeUrl('')
        setOutTradeNo('')
    }

    if (!isOpen) return null

    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            overscrollBehavior: 'contain'
        },
        modal: {
            width: '800px',
            maxWidth: '95vw',
            backgroundColor: '#fff',
            borderRadius: '32px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        },
        closeBtn: {
            position: 'absolute',
            top: '25px',
            right: '25px',
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#999',
            transition: 'all 0.2s'
        },
        content: {
            padding: '40px 32px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '24px',
            marginBottom: '40px'
        },
        card: (tier) => ({
            position: 'relative',
            border: selectedTier === tier.id ? `2px solid #000` : '1px solid #f0f0f0',
            borderRadius: '24px',
            padding: '24px',
            cursor: 'pointer',
            backgroundColor: selectedTier === tier.id ? '#fff' : '#fff',
            transition: 'all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
            transform: selectedTier === tier.id ? 'translateY(-4px)' : 'translateY(0)',
            boxShadow: selectedTier === tier.id ? '0 20px 40px rgba(0,0,0,0.08)' : 'none',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
        }),
        tag: {
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '11px',
            fontWeight: '700',
            padding: '4px 12px',
            borderBottomLeftRadius: '12px'
        },
        payBtn: {
            width: '100%',
            padding: '18px',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '700',
            borderRadius: '16px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 'auto',
            opacity: loading ? 0.6 : 1,
            transition: 'all 0.2s'
        },
        qrContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '450px',
            padding: '40px'
        },
        qrBox: {
            padding: '24px',
            backgroundColor: '#fff',
            borderRadius: '24px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
            border: '1px solid #f0f0f0'
        },
        successIcon: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
        },
        errorIcon: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#ff3b30',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px'
        },
        backBtn: {
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: 'transparent',
            color: '#999',
            fontSize: '14px',
            border: 'none',
            cursor: 'pointer',
            textDecoration: 'underline'
        }
    }

    return createPortal(
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={handleClose} aria-label="关闭">
                    <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 套餐选择步骤 */}
                {step === 'tiers' && (
                    <div style={styles.content}>
                        <div style={styles.header}>
                            <h2 style={{ fontSize: '32px', fontWeight: '800', letterSpacing: '-0.02em', marginBottom: '8px', color: '#000' }}>
                                升级服务
                            </h2>
                            <p style={{ color: '#666', fontSize: '15px' }}>选择适合您的方案，解锁 AI 深度优化</p>
                        </div>

                        <div style={styles.grid}>
                            {Object.values(tiers).map(tier => (
                                <div
                                    key={tier.id}
                                    style={styles.card(tier)}
                                    onClick={() => setSelectedTier(tier.id)}
                                >
                                    {tier.tag && <div style={styles.tag}>{tier.tag}</div>}

                                    <div style={{ marginBottom: '24px' }}>
                                        <div style={{ fontSize: '20px', fontWeight: '800', color: '#000', marginBottom: '6px' }}>
                                            {tier.name.split(' ')[1]} <span style={{ fontSize: '16px' }}>{tier.name.split(' ')[0]}</span>
                                        </div>
                                        <div style={{ fontSize: '14px', color: '#888', lineHeight: '1.4' }}>
                                            {tier.desc}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '24px' }}>
                                        <span style={{ fontSize: '18px', fontWeight: '700', color: '#000', marginRight: '2px' }}>¥</span>
                                        <span style={{ fontSize: '44px', fontWeight: '900', color: '#000', lineHeight: 1, letterSpacing: '-0.03em' }}>
                                            {tier.price}
                                        </span>
                                    </div>

                                    <div style={{ padding: '16px', backgroundColor: '#F5F5F7', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontSize: '14px', color: '#666' }}>包含额度</span>
                                            <span style={{ fontSize: '14px', fontWeight: '700', color: '#000' }}>{tier.credits} 次</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#999' }}>单次成本</span>
                                            <span style={{ fontSize: '12px', color: '#999' }}>约 ¥{tier.pricePerCredit}/次</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            style={styles.payBtn}
                            onClick={handlePurchase}
                            disabled={loading}
                        >
                            {loading ? '正在创建订单...' : `立即支付 ¥${tiers[selectedTier].price}`}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '16px' }}>
                            虚拟商品一经售出不支持退款 · 支付即代表同意《用户付费协议》
                        </p>
                    </div>
                )}

                {/* 二维码支付步骤 */}
                {step === 'qrcode' && (
                    <div style={styles.qrContainer}>
                        <div style={styles.qrBox}>
                            <QRCodeSVG value={qrCodeUrl} size={200} level="M" />
                        </div>
                        <h3 style={{ marginTop: '24px', fontSize: '20px', fontWeight: '800', color: '#000' }}>
                            请使用微信扫码支付
                        </h3>
                        <p style={{ color: '#666', marginTop: '8px', fontSize: '15px' }}>
                            {tiers[selectedTier].name} · ¥{tiers[selectedTier].price}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '20px', color: '#999', fontSize: '14px' }}>
                            <div style={{
                                width: '14px', height: '14px',
                                border: '2px solid #999', borderTopColor: 'transparent',
                                borderRadius: '50%', marginRight: '10px',
                                animation: 'spin 1s linear infinite'
                            }} />
                            等待支付中...
                        </div>
                        <button style={styles.backBtn} onClick={handleBackToTiers}>
                            取消支付
                        </button>
                    </div>
                )}

                {/* 支付成功步骤 */}
                {step === 'success' && (
                    <div style={styles.qrContainer}>
                        <div style={styles.successIcon}>
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '28px', fontWeight: '800', color: '#000' }}>
                            支付成功！
                        </h3>
                        <p style={{ color: '#666', marginTop: '12px', fontSize: '16px' }}>
                            已成功充值 <strong style={{ color: '#000' }}>{tiers[selectedTier].credits}</strong> 次优化额度
                        </p>
                        <button
                            style={{ ...styles.payBtn, width: 'auto', padding: '16px 60px', marginTop: '32px' }}
                            onClick={handleClose}
                        >
                            开始使用
                        </button>
                    </div>
                )}

                {/* 错误步骤 */}
                {step === 'error' && (
                    <div style={styles.qrContainer}>
                        <div style={styles.errorIcon}>
                            <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="#fff" strokeWidth="3">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h3 style={{ fontSize: '24px', fontWeight: '800', color: '#000' }}>
                            支付遇到问题
                        </h3>
                        <p style={{ color: '#ff3b30', marginTop: '12px', fontSize: '14px' }}>
                            {errorMessage}
                        </p>
                        <button style={styles.backBtn} onClick={handleBackToTiers}>
                            返回重试
                        </button>
                    </div>
                )}
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>,
        document.body
    )
}
