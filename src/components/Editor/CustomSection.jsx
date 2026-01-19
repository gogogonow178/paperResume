import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'
import RichTextEditor from './RichTextEditor'

function CustomSection() {
    const customSections = useResumeStore((state) => state.customSections)
    const addCustomSection = useResumeStore((state) => state.addCustomSection)
    const updateCustomSection = useResumeStore((state) => state.updateCustomSection)
    const removeCustomSection = useResumeStore((state) => state.removeCustomSection)

    return (
        <CollapsibleSection title="自定义模块" count={customSections.length} defaultExpanded={true}>

            <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {customSections.map((item) => (
                    <div key={item.id}
                        className="card bg-white shadow-sm ring-1 ring-black/5 rounded-xl relative group transition-all hover:ring-black/10 hover:shadow-md"
                        style={{ padding: '24px' }}>

                        {/* 顶部操作栏 */}
                        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => removeCustomSection(item.id)}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                title="删除此项"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        </div>

                        <div>
                            <div style={{ marginBottom: '24px' }}>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>模块标题</label>
                                <input
                                    type="text"
                                    value={item.title}
                                    onChange={(e) => updateCustomSection(item.id, 'title', e.target.value)}
                                    placeholder="例如：奖项荣誉"
                                    className="input font-medium text-[15px]"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-gray-500 ml-1" style={{ marginBottom: '6px' }}>内容描述</label>
                                <RichTextEditor
                                    value={item.content}
                                    onChange={(val) => updateCustomSection(item.id, 'content', val)}
                                    placeholder="简述内容..."
                                    minRows={3}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '24px', marginBottom: '16px' }}>
                <button
                    onClick={addCustomSection}
                    className="btn-add"
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span>添加自定义模块</span>
                </button>
            </div>
        </CollapsibleSection>
    )
}

export default CustomSection
