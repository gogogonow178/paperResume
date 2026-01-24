import { useRef, useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import { createPortal } from 'react-dom'
import ImageCropper from './ImageCropper'

/**
 * BasicInfo - 基本信息编辑模块
 * 固定在顶部，不可拖拽排序
 */
function BasicInfo() {
    const basicInfo = useResumeStore((state) => state.resumes[state.currentResumeId]?.data?.basicInfo || {})
    const updateBasicInfo = useResumeStore((state) => state.updateBasicInfo)
    const resetResume = useResumeStore((state) => state.resetResume)
    const fileInputRef = useRef(null)

    // 重置确认状态
    const [showResetConfirm, setShowResetConfirm] = useState(false)

    // 裁剪状态
    const [showCropper, setShowCropper] = useState(false)
    const [tempImage, setTempImage] = useState(null)

    // 处理头像上传 - 先显示裁剪器
    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // 读取文件为 Base64
        const reader = new FileReader()
        reader.onload = (event) => {
            setTempImage(event.target.result)
            setShowCropper(true)
        }
        reader.readAsDataURL(file)

        // 清空 input 以便再次选择相同文件
        e.target.value = ''
    }

    // 确认裁剪
    const handleCropConfirm = (croppedImage) => {
        updateBasicInfo('avatar', croppedImage)
        setShowCropper(false)
        setTempImage(null)
    }

    // 取消裁剪
    const handleCropCancel = () => {
        setShowCropper(false)
        setTempImage(null)
    }

    return (
        <section style={{ marginBottom: '24px' }}>
            <h2 className="text-lg font-bold flex items-center justify-between px-1" style={{ color: '#1d1d1f' }}>
                <div className="flex items-center gap-2">
                    <span className="section-indicator"></span>
                    基本信息
                </div>

                {/* 重置按钮 - 放在后面 */}
                <button
                    onClick={() => setShowResetConfirm(true)}
                    title="重置全部内容"
                    style={{
                        padding: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#B0B0B5',
                        transition: 'all 0.2s',
                        borderRadius: '8px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(0,0,0,0.05)'
                        e.currentTarget.style.color = '#EF4444'
                        e.currentTarget.style.transform = 'rotate(-45deg) scale(1.1)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = '#B0B0B5'
                        e.currentTarget.style.transform = 'rotate(0) scale(1)'
                    }}
                >
                    <svg width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor">
                        <path d="M1019.475713 299.047872a51.197184 51.197184 0 0 0-29.182395-26.622535L768.097538 192.557729A145.911975 145.911975 0 0 0 679.014438 8.759838a147.44789 147.44789 0 0 0-186.869722 83.963382L269.436965 12.855613A51.197184 51.197184 0 0 0 204.928513 43.061952L138.372173 221.740124a51.197184 51.197184 0 0 0 0 39.421832 51.197184 51.197184 0 0 0 25.598592 24.574648L3.211607 728.080276a51.197184 51.197184 0 0 0 30.718311 66.044367L665.70317 1020.928169a51.197184 51.197184 0 0 0 17.407043 3.071831 51.197184 51.197184 0 0 0 48.125353-33.790142l162.807045-442.855642a51.197184 51.197184 0 0 0 14.335212 0 51.197184 51.197184 0 0 0 48.125353-33.790142l64.508452-175.606342a51.197184 51.197184 0 0 0-1.535915-38.90986zM282.748233 126.513362L504.944012 204.845054a51.197184 51.197184 0 0 0 65.532395-30.718311l16.383099-44.54155a45.053522 45.053522 0 0 1 57.340847-26.110564 44.029578 44.029578 0 0 1 25.08662 23.038733 42.493663 42.493663 0 0 1 0 32.766198l-14.847184 45.565494a51.197184 51.197184 0 0 0 30.718311 66.044367l221.683807 79.867607-30.206338 81.915495L252.541894 208.428856z m368.619725 781.26903l-129.016904-46.589438 63.996481-174.582398a51.197184 51.197184 0 1 0-96.250707-35.326057l-63.99648 175.09437-83.963382-30.206338 63.99648-174.582398a51.197184 51.197184 0 0 0-96.250706-35.326058L245.88626 761.358445 117.381328 716.816895l144.888031-394.218318L796.25599 512.028158z" />
                    </svg>
                </button>
            </h2>

            <div className="card bg-white" style={{ padding: '24px', marginTop: '16px' }}>
                {/* 头像上传 */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '8px', paddingBottom: '8px' }}>
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            position: 'relative',
                            cursor: 'pointer'
                        }}
                    >
                        {/* 头像容器 */}
                        <div
                            style={{
                                width: '96px',
                                height: '96px',
                                borderRadius: '50%',
                                overflow: 'hidden',
                                backgroundColor: '#F3F4F6',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                                border: '4px solid #fff'
                            }}
                        >
                            {basicInfo.avatar ? (
                                <img
                                    src={basicInfo.avatar}
                                    alt="头像"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <div style={{
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#D1D5DB'
                                }}>
                                    <svg style={{ width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 上传按钮 - 独立的，不会被遮挡 */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        style={{
                            marginTop: '12px',
                            padding: '6px 14px',
                            fontSize: '12px',
                            fontWeight: 500,
                            color: '#000000',
                            background: 'rgba(0, 0, 0, 0.05)',
                            border: 'none',
                            borderRadius: '20px',
                            cursor: 'pointer'
                        }}
                    >
                        {basicInfo.avatar ? '更换头像' : '点击上传照片'}
                    </button>

                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* 姓名 */}
                <div style={{ marginTop: '20px', marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>姓名</label>
                    <input
                        type="text"
                        name="name"
                        autoComplete="name"
                        value={basicInfo.name}
                        onChange={(e) => updateBasicInfo('name', e.target.value)}
                        placeholder="你的姓名…"
                        className="input"
                    />
                </div>

                {/* 求职意向 */}
                <div style={{ marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>求职意向</label>
                    <input
                        type="text"
                        name="jobTitle"
                        autoComplete="organization-title"
                        value={basicInfo.jobTitle}
                        onChange={(e) => updateBasicInfo('jobTitle', e.target.value)}
                        placeholder="例如：高级前端工程师…"
                        className="input"
                    />
                </div>

                {/* 联系方式 - 两列布局 */}
                <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>电话</label>
                        <input
                            type="tel"
                            name="phone"
                            autoComplete="tel"
                            value={basicInfo.phone}
                            onChange={(e) => updateBasicInfo('phone', e.target.value)}
                            placeholder="手机号码…"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>邮箱</label>
                        <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            value={basicInfo.email}
                            onChange={(e) => updateBasicInfo('email', e.target.value)}
                            placeholder="邮箱地址…"
                            className="input"
                        />
                    </div>
                </div>

                {/* 城市 */}
                <div style={{ marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>所在城市</label>
                    <input
                        type="text"
                        name="city"
                        autoComplete="address-level2"
                        value={basicInfo.city}
                        onChange={(e) => updateBasicInfo('city', e.target.value)}
                        placeholder="例如：北京 / 上海…"
                        className="input"
                    />
                </div>

                {/* 微信 (新增) */}
                <div style={{ marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                        微信号
                        <span className="text-gray-400 font-normal ml-1">（选填）</span>
                    </label>
                    <input
                        type="text"
                        name="wechat"
                        value={basicInfo.wechat || ''}
                        onChange={(e) => updateBasicInfo('wechat', e.target.value)}
                        placeholder="请输入微信号…"
                        className="input"
                    />
                </div>

                {/* 个人网站 (原个人链接) */}
                <div>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                        个人网站
                        <span className="text-gray-400 font-normal ml-1">（选填）</span>
                    </label>
                    <input
                        type="text"
                        name="website"
                        autoComplete="url"
                        value={basicInfo.website}
                        onChange={(e) => updateBasicInfo('website', e.target.value)}
                        placeholder="例如：zhangsan.dev"
                        className="input"
                    />
                </div>
            </div>

            {/* 图片裁剪弹窗 */}
            {showCropper && tempImage && (
                <ImageCropper
                    imageSrc={tempImage}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            {/* 重置确认弹窗 - 使用 Portal 渲染到 body */}
            {showResetConfirm && createPortal(
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                    <div style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(20px)' }} onClick={() => setShowResetConfirm(false)} />
                    <div style={{ position: 'relative', width: '360px', backgroundColor: '#fff', borderRadius: '32px', padding: '40px 32px', boxShadow: '0 40px 100px -20px rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.05)', textAlign: 'center' }}>
                        <div style={{ width: '56px', height: '56px', margin: '0 auto 20px', borderRadius: '18px', background: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="#EF4444" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                        </div>
                        <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#000' }}>确认重置内容？</h3>
                        <p style={{ fontSize: '15px', color: '#666', marginBottom: '32px', lineHeight: '1.4' }}>当前简历的所有内容将恢复为初始示例状态，此操作不可撤销。</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <button onClick={() => { resetResume(); setShowResetConfirm(false); }} style={{ padding: '16px', fontSize: '16px', fontWeight: 700, color: '#fff', background: '#EF4444', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>确认重置</button>
                            <button onClick={() => setShowResetConfirm(false)} style={{ padding: '16px', fontSize: '16px', fontWeight: 600, color: '#666', background: '#F5F5F7', border: 'none', borderRadius: '16px', cursor: 'pointer' }}>取消</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </section>
    )
}

export default BasicInfo

