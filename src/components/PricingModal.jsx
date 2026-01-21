import { createPortal } from 'react-dom'
import { useState } from 'react'
import { useAuth } from '../context/AuthContext'

/**
 * 价格方案弹窗
 * 提供 4.9/9.9/19.9 三档套餐
 */
export default function PricingModal({ isOpen, onClose }) {
    const { user, refreshProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [selectedTier, setSelectedTier] = useState('pro') // buffer, pro, max
    const [step, setStep] = useState('tiers') // 'tiers' | 'payment'

    if (!isOpen) return null

    // 价格方案配置
    const tiers = {
        trial: {
            id: 'trial',
            name: '☕️ 尝鲜包',
            price: '4.9',
            credits: 5,
            desc: '试错门槛低，适合单次体验',
            tag: '',
            color: '#666',
            pricePerCredit: '0.98'
        },
        pro: {
            id: 'pro',
            name: '🔥 求职包',
            price: '9.9',
            credits: 20,
            desc: '主力推荐，够改3份简历',
            tag: '80% 用户的选择',
            color: '#000',
            pricePerCredit: '0.50'
        },
        max: {
            id: 'max',
            name: '🚀 面霸包',
            price: '19.9',
            credits: 50,
            desc: '海投专用，深度打磨细节',
            tag: '',
            color: '#0071e3',
            pricePerCredit: '0.40'
        }
    }

    const handlePurchase = async () => {
        setStep('payment')

        // 模拟支付流程
        setTimeout(async () => {
            // 这里应该调用后端创建订单接口
            // 模拟支付成功后增加积分
            if (confirm('【模拟支付环境】\n\n请点击“确定”模拟支付成功\n点击“取消”模拟放弃支付')) {
                setLoading(true)
                try {
                    // 调用 Supabase RPC 或者直接更新（仅限模拟）
                    // 在真实环境中，这里应该轮询订单状态
                    alert(`模拟成功！\n已为您充值 ${tiers[selectedTier].credits} 积分`)
                    await refreshProfile() // 刷新余额
                    onClose()
                } catch (e) {
                    alert('充值失败：' + e.message)
                } finally {
                    setLoading(false)
                }
            } else {
                setStep('tiers')
            }
        }, 1000)
    }

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
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
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
        radio: {
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: selectedTier === selectedTier ? `6px solid ${tiers[selectedTier].color}` : '2px solid #ddd',
            marginRight: '12px'
        },
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
            cursor: 'pointer',
            marginTop: 'auto'
        }
    }

    return createPortal(
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <button style={styles.closeBtn} onClick={onClose}>
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {step === 'tiers' ? (
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
                                        <span style={{ fontSize: '36px', fontWeight: '800', fontFamily: 'SF Pro Display, sans-serif', color: '#000', lineHeight: 1 }}>
                                            {tier.price}
                                        </span>
                                    </div>

                                    <div style={{ padding: '12px', backgroundColor: '#f5f5f7', borderRadius: '8px', marginBottom: '16px' }}>
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
                        >
                            立即支付 ¥{tiers[selectedTier].price}
                        </button>

                        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', marginTop: '16px' }}>
                            虚拟商品一经售出不支持退款 · 支付即代表同意《用户付费协议》
                        </p>
                    </div>
                ) : (
                    // Payment Step (Simulated)
                    <div style={{ ...styles.content, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                        <div style={{ width: '48px', height: '48px', border: '3px solid #000', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                        <h3 style={{ marginTop: '24px', fontSize: '18px', fontWeight: 'bold' }}>正在跳转支付...</h3>
                        <p style={{ color: '#666', marginTop: '8px' }}>请在弹出的窗口中完成支付</p>
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
