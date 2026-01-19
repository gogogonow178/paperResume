import React from 'react'
import { Text, View } from '@react-pdf/renderer'
import { styles } from './styles'

/**
 * 通用模块容器
 * @param {string} title - 模块标题
 * @param {string} date - 可选日期
 * @param {object} style - 自定义样式
 */
export const Section = ({ title, children, style = {} }) => {
    return (
        <View style={[styles.section, style]} wrap={false}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    )
}

export default Section
