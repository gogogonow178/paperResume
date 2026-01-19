import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'

/**
 * Education - 教育经历编辑模块
 * 支持添加/删除/编辑多条记录
 */
function Education() {
    const education = useResumeStore((state) => state.education)
    const addEducation = useResumeStore((state) => state.addEducation)
    const updateEducation = useResumeStore((state) => state.updateEducation)
    const removeEducation = useResumeStore((state) => state.removeEducation)

    return (
        <CollapsibleSection title="教育经历" sectionId="education" count={education.length} defaultExpanded={true}>
            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {education.map((item) => (
                    <div key={item.id}
                        className="card bg-white shadow-sm ring-1 ring-black/5 rounded-xl relative group transition-all hover:ring-black/10 hover:shadow-md"
                        style={{ padding: '24px' }}>

                        {/* 顶部操作栏 */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeEducation(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="删除此项"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div>
                            {/* 学校名称 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>学校名称</label>
                                <input
                                    type="text"
                                    value={item.school}
                                    onChange={(e) => updateEducation(item.id, 'school', e.target.value)}
                                    placeholder="例如：北京大学"
                                    className="input font-medium text-[15px]"
                                />
                            </div>

                            {/* 学历 + 专业 */}
                            <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>学历</label>
                                    <input
                                        type="text"
                                        value={item.degree}
                                        onChange={(e) => updateEducation(item.id, 'degree', e.target.value)}
                                        placeholder="例如：硕士"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>专业</label>
                                    <input
                                        type="text"
                                        value={item.major}
                                        onChange={(e) => updateEducation(item.id, 'major', e.target.value)}
                                        placeholder="例如：计算机科学与技术"
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* 时间 */}
                            <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>开始时间</label>
                                    <input
                                        type="text"
                                        value={item.startDate}
                                        onChange={(e) => updateEducation(item.id, 'startDate', e.target.value)}
                                        placeholder="2016-09"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>结束时间</label>
                                    <input
                                        type="text"
                                        value={item.endDate}
                                        onChange={(e) => updateEducation(item.id, 'endDate', e.target.value)}
                                        placeholder="2019-06"
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* 描述 */}
                            <div>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                                    在校经历
                                    <span className="text-gray-400 font-normal ml-1">（选填）</span>
                                </label>
                                <textarea
                                    value={item.description}
                                    onChange={(e) => updateEducation(item.id, 'description', e.target.value)}
                                    placeholder="简述你的在校成就、奖项荣誉或社团活动..."
                                    className="input textarea text-sm leading-relaxed"
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                <button
                    onClick={addEducation}
                    className="btn-add"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加教育经历</span>
                </button>
            </div>
        </CollapsibleSection>
    )
}

export default Education

