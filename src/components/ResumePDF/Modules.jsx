import React from 'react'
import { Text, View, Image } from '@react-pdf/renderer'
import { styles } from './styles'

export const Header = ({ basicInfo }) => {
    if (!basicInfo) return null

    const contactParts = [
        basicInfo.phone,
        basicInfo.email,
        basicInfo.city,
        basicInfo.website
    ].filter(Boolean)

    return (
        <View style={styles.header}>
            <View style={styles.headerRow}>
                <View style={styles.headerInfo}>
                    <Text style={styles.name}>{basicInfo.name}</Text>
                    {basicInfo.jobTitle && (
                        <Text style={styles.jobTitle}>{basicInfo.jobTitle}</Text>
                    )}
                    <View style={styles.contactRow}>
                        {contactParts.map((part, index) => (
                            <Text key={index}>
                                {part}
                                {index < contactParts.length - 1 && '    '}
                            </Text>
                        ))}
                    </View>
                </View>
                {basicInfo.avatar && (
                    <Image src={basicInfo.avatar} style={styles.avatar} />
                )}
            </View>
        </View>
    )
}

export const Summary = ({ summary }) => {
    if (!summary) return null
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>个人总结</Text>
            <Text style={styles.itemDesc}>{summary}</Text>
        </View>
    )
}

export const Education = ({ items }) => {
    if (!items || items.length === 0) return null
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>教育经历</Text>
            {items.map((item) => (
                <View key={item.id} style={styles.item} wrap={false}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>
                            {item.school}
                            {item.degree && ` · ${item.degree}`}
                        </Text>
                        <Text style={styles.itemDate}>
                            {item.startDate} - {item.endDate}
                        </Text>
                    </View>
                    {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
            ))}
        </View>
    )
}

export const Experience = ({ title, items, titleKey = 'company', subKey = 'position' }) => {
    if (!items || items.length === 0) return null
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {items.map((item) => (
                <View key={item.id} style={styles.item} wrap={false}>
                    <View style={styles.itemHeader}>
                        <Text style={styles.itemTitle}>
                            {item[titleKey]}
                            {item[subKey] && ` · ${item[subKey]}`}
                        </Text>
                        <Text style={styles.itemDate}>
                            {item.startDate || item.date}
                            {item.endDate ? ` - ${item.endDate}` : ''}
                        </Text>
                    </View>
                    {item.description && <Text style={styles.itemDesc}>{item.description}</Text>}
                </View>
            ))}
        </View>
    )
}

export const Skills = ({ items }) => {
    if (!items || items.length === 0) return null
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>专业技能</Text>
            {items.map((item) => (
                <View key={item.id} style={styles.skillItem} wrap={false}>
                    <Text style={styles.skillTitle}>{item.title}：</Text>
                    <Text style={styles.skillContent}>{item.content}</Text>
                </View>
            ))}
        </View>
    )
}

export const CustomSection = ({ section }) => {
    return (
        <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.itemDesc}>{section.content}</Text>
        </View>
    )
}
