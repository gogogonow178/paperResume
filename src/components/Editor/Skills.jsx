import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'

function Skills() {
    const skills = useResumeStore((state) => state.resumes[state.currentResumeId]?.data?.skills || [])
    const addSkill = useResumeStore((state) => state.addSkill)
    const updateSkill = useResumeStore((state) => state.updateSkill)
    const removeSkill = useResumeStore((state) => state.removeSkill)

    return (
        <CollapsibleSection title="专业技能" sectionId="skills" count={skills.length} defaultExpanded={true}>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {skills.map((item) => (
                    <div key={item.id}
                        className="card bg-white relative group transition-all"
                        style={{ padding: '24px' }}>

                        {/* 删除按钮 - 悬浮在右上角 */}
                        <div className="absolute top-1/2 -right-12 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* 把删除按钮移到卡片里面或者独立？右侧悬浮可能不管用因为宽度由卡片决定。
                                 还是放在卡片内部右上角比较稳妥。
                             */}
                        </div>

                        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', position: 'relative' }}>
                            <div className="w-1/3">
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>技能类别</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateSkill(item.id, 'title', e.target.value)}
                                    placeholder="例如：前端"
                                    className="input font-medium text-center"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>详细技能</label>
                                <input
                                    type="text"
                                    value={item.content}
                                    onChange={(e) => updateSkill(item.id, 'content', e.target.value)}
                                    placeholder="React, Vue, Node.js"
                                    className="input"
                                />
                            </div>

                            <button
                                onClick={() => removeSkill(item.id)}
                                className="absolute -top-2 -right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                title="删除此项"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                <button
                    onClick={addSkill}
                    className="btn-add"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加技能</span>
                </button>
            </div>
        </CollapsibleSection>
    )
}

export default Skills
