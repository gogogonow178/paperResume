import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'
import RichTextEditor from './RichTextEditor'

function Project() {
    const projects = useResumeStore((state) => state.projects)
    const addProject = useResumeStore((state) => state.addProject)
    const updateProject = useResumeStore((state) => state.updateProject)
    const removeProject = useResumeStore((state) => state.removeProject)

    return (
        <CollapsibleSection title="项目经历" sectionId="projects" count={projects.length} defaultExpanded={true}>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {projects.map((item) => (
                    <div key={item.id}
                        className="card bg-white shadow-sm ring-1 ring-black/5 rounded-xl relative group transition-all hover:ring-black/10 hover:shadow-md"
                        style={{ padding: '24px' }}>

                        {/* 顶部操作栏 */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeProject(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="删除此项"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div>
                            {/* 项目名称 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>项目名称</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => updateProject(item.id, 'name', e.target.value)}
                                    placeholder="例如：企业级 SAAS 系统重构"
                                    className="input font-medium text-[15px]"
                                />
                            </div>

                            {/* 角色与时间 */}
                            <div className="grid grid-cols-2" style={{ gap: '16px', marginBottom: '24px' }}>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>担任角色</label>
                                    <input
                                        type="text"
                                        value={item.role}
                                        onChange={(e) => updateProject(item.id, 'role', e.target.value)}
                                        placeholder="例如：核心开发者"
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>时间</label>
                                    <input
                                        type="text"
                                        value={item.date}
                                        onChange={(e) => updateProject(item.id, 'date', e.target.value)}
                                        placeholder="2022.03 - 2022.09"
                                        className="input"
                                    />
                                </div>
                            </div>

                            {/* 链接 */}
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                                    项目链接
                                    <span className="text-gray-400 font-normal ml-1">（选填）</span>
                                </label>
                                <input
                                    type="url"
                                    value={item.link}
                                    onChange={(e) => updateProject(item.id, 'link', e.target.value)}
                                    placeholder="https://..."
                                    className="input"
                                />
                            </div>

                            {/* 描述 - 富文本编辑器 */}
                            <div>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>
                                    项目描述
                                </label>
                                <RichTextEditor
                                    value={item.description}
                                    onChange={(val) => updateProject(item.id, 'description', val)}
                                    placeholder="简述项目背景、遇到的挑战、你的解决方案以及最终成果..."
                                    minRows={4}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                <button
                    onClick={addProject}
                    className="btn-add"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加项目经历</span>
                </button>
            </div>
        </CollapsibleSection>
    )
}

export default Project
