import useResumeStore from '../../store/useResumeStore'
import CollapsibleSection from './CollapsibleSection'
import RichTextEditor from './RichTextEditor'

function Summary() {
    const summary = useResumeStore((state) => state.resumes[state.currentResumeId]?.data?.summary || '')
    const updateSummary = useResumeStore((state) => state.updateSummary)

    return (
        <CollapsibleSection title="个人总结" sectionId="summary" defaultExpanded={true}>
            <div className="card bg-white" style={{ padding: '24px', marginTop: '16px' }}>
                <RichTextEditor
                    value={summary}
                    onChange={updateSummary}
                    placeholder="简单介绍一下自己，突显核心优势..."
                    minRows={5}
                />
                <p className="text-xs text-gray-400 mt-2 text-right">
                    建议 100-200 字
                </p>
            </div>
        </CollapsibleSection>
    )
}

export default Summary
