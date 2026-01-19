import React from 'react'
import { Document, Page, View } from '@react-pdf/renderer'
import { styles } from './styles'
import { Header, Education, Experience, Skills, Summary, CustomSection } from './Modules'

const ResumePDF = ({ data }) => {
    const {
        basicInfo,
        education,
        workExperience,
        projects,
        skills,
        summary,
        customSections,
        sectionOrder,
        hiddenSections = []
    } = data

    const renderSection = (sectionId) => {
        if (hiddenSections.includes(sectionId)) return null

        switch (sectionId) {
            case 'education':
                return <Education key={sectionId} items={education} />
            case 'workExperience':
                return (
                    <Experience
                        key={sectionId}
                        title="工作经历"
                        items={workExperience}
                        titleKey="company"
                        subKey="position"
                    />
                )
            case 'projects':
                return (
                    <Experience
                        key={sectionId}
                        title="项目经历"
                        items={projects}
                        titleKey="name"
                        subKey="role"
                        // 项目大多用 date 字段而不是 startDate/endDate
                        titleKey="name"
                    />
                )
            case 'skills':
                return <Skills key={sectionId} items={skills} />
            case 'summary':
                return <Summary key={sectionId} summary={summary} />
            default:
                return null
        }
    }

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header basicInfo={basicInfo} />

                {sectionOrder.map(sectionId => renderSection(sectionId))}

                {customSections.map((section, index) => (
                    !hiddenSections.includes(`custom-${section.id}`) && (
                        <CustomSection key={`custom-${index}`} section={section} />
                    )
                ))}
            </Page>
        </Document>
    )
}

export default ResumePDF
