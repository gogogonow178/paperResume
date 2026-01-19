import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'
import RichTextEditor from './RichTextEditor'

function WorkExperience() {
    const workExperience = useResumeStore((state) => state.workExperience)
    const addWorkExperience = useResumeStore((state) => state.addWorkExperience)
    const updateWorkExperience = useResumeStore((state) => state.updateWorkExperience)
    const removeWorkExperience = useResumeStore((state) => state.removeWorkExperience)


    return (
        <CollapsibleSection title="工作经历" sectionId="workExperience" count={workExperience.length} defaultExpanded={true}>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {workExperience.map((item) => (
                    <div key={item.id}
                        className="card bg-white shadow-sm ring-1 ring-black/5 rounded-xl relative group transition-all hover:ring-black/10 hover:shadow-md"
                        style={{ padding: '24px' }}>

                        {/* 顶部操作栏 */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeWorkExperience(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="删除此项"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div>
                            {/* 公司名称 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>公司名称</label>
                                <input
                                    type="text"
                                    value={item.company}
                                    onChange={(e) => updateWorkExperience(item.id, 'company', e.target.value)}
                                    placeholder="例如：字节跳动"
                                    className="input font-medium text-[15px]"
                                />
                            </div>

                            {/* 职位与时间 */}
                            <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>职位名称</label>
                                    <input
                                        type="text"
                                        value={item.position}
                                        onChange={(e) => updateWorkExperience(item.id, 'position', e.target.value)}
                                        placeholder="例如：高级前端工程师"
                                        className="input"
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <div className="flex-1">
                                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>入职</label>
                                        <input
                                            type="text"
                                            value={item.startDate}
                                            onChange={(e) => updateWorkExperience(item.id, 'startDate', e.target.value)}
                                            placeholder="2021.03"
                                            className="input text-center"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>离职</label>
                                        <input
                                            type="text"
                                            value={item.endDate}
                                            onChange={(e) => updateWorkExperience(item.id, 'endDate', e.target.value)}
                                            placeholder="至今"
                                            className="input text-center"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* 工作描述 - 富文本编辑器 */}
                            <div>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                                    工作内容与业绩
                                </label>
                                <RichTextEditor
                                    value={item.description}
                                    onChange={(val) => updateWorkExperience(item.id, 'description', val)}
                                    placeholder="简述你的核心职责、主导项目以及取得的量化成果..."
                                    minRows={4}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                <button
                    onClick={addWorkExperience}
                    className="btn-add"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加工作经历</span>
                </button>
            </div>
        </CollapsibleSection>
    )
}

export default WorkExperience
