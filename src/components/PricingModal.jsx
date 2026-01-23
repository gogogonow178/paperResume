import { createPortal } from 'react-dom'
import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { QRCodeSVG } from 'qrcode.react'

/**
 * 价格方案弹窗
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

    // 套餐配置（测试金额）
    const tiers = {
        trial: {
            id: 'trial',
            name: '☕️ 尝鲜包',
            price: '0.1',
            credits: 5,
            desc: '试错门槛低，适合单次体验',
            tag: '',
            color: '#666',
            pricePerCredit: '0.02'
        },
        pro: {
            id: 'pro',
            name: '🔥 求职包',
            price: '0.2',
            credits: 20,
            desc: '主力推荐，够改3份简历',
            tag: '80% 用户的选择',
            color: '#000',
            pricePerCredit: '0.01'
        },
        max: {
            id: 'max',
            name: '🚀 面霸包',
            price: '0.3',
            credits: 50,
            desc: '海投专用，深度打磨细节',
            tag: '',
            color: '#0071e3',
            pricePerCredit: '0.006'
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
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            backdropFilter: 'blur(8px)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            overscrollBehavior: 'contain'
        },
        modal: {
            width: '800px',
            maxWidth: '95vw',
            backgroundColor: '#fff',
            borderRadius: '24px',
            boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative'
        },
        closeBtn: {
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: '#f5f5f7',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 10,
            color: '#666'
        },
        content: {
            padding: '40px'
        },
        header: {
            textAlign: 'center',
            marginBottom: '40px'
        },
        grid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '20px',
            marginBottom: '32px'
        },
        card: (tier) => ({
            position: 'relative',
            border: selectedTier === tier.id ? `2px solid ${tier.color}` : '1px solid #e5e5e5',
            borderRadius: '16px',
            padding: '24px',
            cursor: 'pointer',
            backgroundColor: selectedTier === tier.id ? `${tier.color}08` : '#fff',
            transition: 'all 0.2s ease',
            transform: selectedTier === tier.id ? 'scale(1.02)' : 'scale(1)',
            overflow: 'hidden'
        }),
        tag: {
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: '#ff3b30',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 'bold',
            padding: '4px 12px',
            borderBottomLeftRadius: '12px'
        },
        payBtn: {
            width: '100%',
            padding: '16px',
            backgroundColor: '#000',
            color: '#fff',
            fontSize: '16px',
            fontWeight: '600',
            borderRadius: '12px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 'auto',
            opacity: loading ? 0.6 : 1
        },
        qrContainer: {
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            padding: '40px'
        },
        qrBox: {
            padding: '20px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
        },
        successIcon: {
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: '#34c759',
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
            color: '#666',
            fontSize: '14px',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            cursor: 'pointer'
        }
    }

    return createPortal(
        <div style={styles.overlay} onClick={handleClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={handleClose} aria-label="关闭">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* 套餐选择步骤 */}
                {step === 'tiers' && (
                    <div style={styles.content}>
                        <div style={styles.header}>
                            <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '8px' }}>
                                升级您的简历优化额度
                            </h2>
                        </div>

                        <div style={styles.grid}>
                            {Object.values(tiers).map(tier => (
                                <div
                                    key={tier.id}
                                    style={styles.card(tier)}
                                    onClick={() => setSelectedTier(tier.id)}
                                >
                                    {tier.tag && <div style={styles.tag}>{tier.tag}</div>}

                                    <div style={{ marginBottom: '16px' }}>
                                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: tier.color, marginBottom: '4px' }}>
                                            {tier.name}
                                        </div>
                                        <div style={{ fontSize: '13px', color: '#888' }}>
                                            {tier.desc}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: '20px' }}>
                                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#000' }}>¥</span>
                                        <span style={{ fontSize: '36px', fontWeight: '800', color: '#000', lineHeight: 1 }}>
                                            {tier.price}
                                        </span>
                                    </div>

                                    <div style={{ padding: '12px', backgroundColor: '#f5f5f7', borderRadius: '8px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                            <span style={{ fontSize: '13px', color: '#666' }}>包含额度</span>
                                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#000' }}>{tier.credits} 次</span>
                                        </div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <span style={{ fontSize: '12px', color: '#999' }}>单次成本</span>
                                            <span style={{ fontSize: '12px', color: '#999' }}>¥{tier.pricePerCredit}/次</span>
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
                        <h3 style={{ marginTop: '24px', fontSize: '18px', fontWeight: 'bold' }}>
                            请使用微信扫码支付
                        </h3>
                        <p style={{ color: '#666', marginTop: '8px', fontSize: '14px' }}>
                            {tiers[selectedTier].name} · ¥{tiers[selectedTier].price}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', marginTop: '16px', color: '#999', fontSize: '13px' }}>
                            <div style={{
                                width: '12px', height: '12px',
                                border: '2px solid #999', borderTopColor: 'transparent',
                                borderRadius: '50%', marginRight: '8px',
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
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
                            支付成功！
                        </h3>
                        <p style={{ color: '#666', marginTop: '12px', fontSize: '16px' }}>
                            已成功充值 <strong style={{ color: '#34c759' }}>{tiers[selectedTier].credits}</strong> 次优化额度
                        </p>
                        <button
                            style={{ ...styles.payBtn, width: 'auto', padding: '12px 48px', marginTop: '32px' }}
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
                        <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000' }}>
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
