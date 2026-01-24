import { createPortal } from 'react-dom'
import { useEffect } from 'react'

/**
 * PolicyModal - 通用政策展示弹窗
 * 用于展示用户协议、隐私政策及付费协议
 */
export default function PolicyModal({ isOpen, onClose, title, content }) {
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

    if (!isOpen) return null

    const styles = {
        overlay: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.6)',
            backdropFilter: 'blur(20px)',
            zIndex: 100000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        modal: {
            width: '600px',
            maxWidth: '90vw',
            maxHeight: '80vh',
            backgroundColor: '#fff',
            borderRadius: '24px',
            boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)',
            border: '1px solid rgba(0,0,0,0.05)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
        },
        header: {
            padding: '24px 32px',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        },
        title: {
            fontSize: '20px',
            fontWeight: '700',
            margin: 0,
            color: '#000'
        },
        closeBtn: {
            padding: '8px',
            cursor: 'pointer',
            background: 'transparent',
            border: 'none',
            color: '#999'
        },
        body: {
            padding: '32px',
            overflowY: 'auto',
            fontSize: '14px',
            lineHeight: '1.8',
            color: '#333'
        },
        section: {
            marginBottom: '24px'
        },
        sectionTitle: {
            fontSize: '16px',
            fontWeight: '600',
            marginBottom: '12px',
            color: '#000',
            display: 'block'
        }
    }

    // 预设内容映射（如果传入 content 是展示内容，否则根据 title 渲染默认内容）
    const renderContent = () => {
        if (content) return content;

        if (title === '用户协议与隐私政策') {
            return (
                <>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>1. 服务说明</span>
                        <p>MiniCV 是一个基于 AI 的简历润色工具。您的邮箱仅用于账户登录、验证码接收及业务通知，我们承诺不向第三方泄露您的邮箱信息。</p>
                    </div>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>2. 账户安全</span>
                        <p>您应妥善保管登录凭证。本站采用指纹识别技术仅用于防止恶意刷取积分及风险控制，不会收集您的个人敏感生物特征信息。</p>
                    </div>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>3. 积分与消耗</span>
                        <p>通过赠送或购买获得的积分仅限在MiniCV平台内使用，用于抵扣 AI 深度润色等增值服务。积分具有时效性（如无特殊说明长期有效），不可提现或转让。</p>
                    </div>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>4. 免责声明</span>
                        <p>AI 生成的内容仅供参考，请您在投递简历前务必自行核实信息的准确性。对于因使用 AI 建议而产生的招聘结果，MiniCV平台不承担法律责任。</p>
                    </div>
                </>
            );
        }

        if (title === '用户付费协议') {
            return (
                <>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>1. 虚拟商品性质</span>
                        <p>本平台充值额度（积分/次数）属于数字化虚拟商品，一旦购买成功并充值到账，系统将不支持退款（法律法规另有规定的除外）。</p>
                    </div>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>2. 积分效力</span>
                        <p>积分充值后即时生效，可用于MiniCV平台的所有 AI 收费功能。如遇技术故障导致扣分异常，请及时联系开发者进行补发。</p>
                    </div>
                    <div style={styles.section}>
                        <span style={styles.sectionTitle}>3. 禁止行为</span>
                        <p>严禁通过非法手段获取积分、利用系统漏洞套利或进行任何形式的倒卖行为。一经发现，平台有权冻结账户并清空积分。</p>
                    </div>
                </>
            );
        }

        return <p>暂无详细内容</p>;
    }

    return createPortal(
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.header}>
                    <h2 style={styles.title}>{title}</h2>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="24" height="24" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div style={styles.body}>
                    {renderContent()}
                </div>
            </div>
        </div>,
        document.body
    )
}
