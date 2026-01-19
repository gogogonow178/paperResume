import { useRef, useState } from 'react'
import useResumeStore from '../../store/useResumeStore'
import ImageCropper from './ImageCropper'

/**
 * BasicInfo - 基本信息编辑模块
 * 固定在顶部，不可拖拽排序
 */
function BasicInfo() {
    const basicInfo = useResumeStore((state) => state.basicInfo)
    const updateBasicInfo = useResumeStore((state) => state.updateBasicInfo)
    const fileInputRef = useRef(null)

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
            <h2 className="text-lg font-bold flex items-center gap-2 px-1" style={{ color: '#1d1d1f' }}>
                <span className="section-indicator"></span>
                基本信息
            </h2>

            <div className="card bg-white shadow-sm ring-1 ring-black/5 hover:ring-black/10 hover:shadow-md transition-all" style={{ padding: '24px', marginTop: '16px' }}>
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
                                    <svg style={{ width: '32px', height: '32px' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                            color: '#0071E3',
                            background: 'rgba(0, 113, 227, 0.08)',
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
                        value={basicInfo.name}
                        onChange={(e) => updateBasicInfo('name', e.target.value)}
                        placeholder="你的姓名"
                        className="input"
                    />
                </div>

                {/* 求职意向 */}
                <div style={{ marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>求职意向</label>
                    <input
                        type="text"
                        value={basicInfo.jobTitle}
                        onChange={(e) => updateBasicInfo('jobTitle', e.target.value)}
                        placeholder="例如：高级前端工程师"
                        className="input"
                    />
                </div>

                {/* 联系方式 - 两列布局 */}
                <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '16px' }}>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>电话</label>
                        <input
                            type="tel"
                            value={basicInfo.phone}
                            onChange={(e) => updateBasicInfo('phone', e.target.value)}
                            placeholder="手机号码"
                            className="input"
                        />
                    </div>
                    <div>
                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>邮箱</label>
                        <input
                            type="email"
                            value={basicInfo.email}
                            onChange={(e) => updateBasicInfo('email', e.target.value)}
                            placeholder="邮箱地址"
                            className="input"
                        />
                    </div>
                </div>

                {/* 城市 */}
                <div style={{ marginBottom: '16px' }}>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>所在城市</label>
                    <input
                        type="text"
                        value={basicInfo.city}
                        onChange={(e) => updateBasicInfo('city', e.target.value)}
                        placeholder="例如：北京 / 上海"
                        className="input"
                    />
                </div>

                {/* 个人链接 */}
                <div>
                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                        个人链接
                        <span className="text-gray-400 font-normal ml-1">（选填）</span>
                    </label>
                    <input
                        type="url"
                        value={basicInfo.website}
                        onChange={(e) => updateBasicInfo('website', e.target.value)}
                        placeholder="GitHub / 博客 / 作品集"
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
        </section>
    )
}

export default BasicInfo

