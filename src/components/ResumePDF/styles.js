import { StyleSheet, Font } from '@react-pdf/renderer'

// 使用本地静态资源字体 (public/fonts)
const SourceHanSans = '/fonts/SourceHanSansSC-Regular.otf'

// 注册字体
Font.register({
    family: 'SourceHanSans',
    src: SourceHanSans,
    format: 'opentype'
})

// 1mm ≈ 2.83pt
// 15mm ≈ 42.5pt (Top/Bottom)
// 22mm ≈ 62.3pt (Left/Right)

export const styles = StyleSheet.create({
    page: {
        paddingTop: 42,
        paddingBottom: 42,
        paddingLeft: 60,
        paddingRight: 60,
        fontFamily: 'SourceHanSans',
        fontSize: 10.5, // 对应 Web 14px (14 * 0.75 ≈ 10.5pt)
        lineHeight: 1.6,
        color: '#1d1d1f',
        backgroundColor: '#ffffff'
    },
    // 头部样式
    header: {
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 20,
    },
    headerInfo: {
        flex: 1,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        objectFit: 'cover',
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 6,
    },
    jobTitle: {
        fontSize: 12,
        color: '#0071e3',
        marginBottom: 8,
        fontWeight: 'medium'
    },
    contactRow: {
        flexDirection: 'row',
        gap: 15,
        fontSize: 9,
        color: '#86868b',
        flexWrap: 'wrap'
    },
    // 模块通用样式
    section: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e5e5',
        paddingBottom: 6,
        marginBottom: 10,
    },
    // 列表项样式
    item: {
        marginBottom: 12,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    itemTitle: {
        fontSize: 11,
        fontWeight: 'bold',
    },
    itemSubtitle: {
        fontSize: 10,
        color: '#424245',
        fontWeight: 'medium'
    },
    itemDate: {
        fontSize: 9,
        color: '#86868b',
    },
    itemDesc: {
        fontSize: 10,
        color: '#424245',
        lineHeight: 1.6,
        marginTop: 4
    },
    // 技能样式
    skillItem: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    skillTitle: {
        fontSize: 10,
        fontWeight: 'bold',
        width: 80,
    },
    skillContent: {
        fontSize: 10,
        flex: 1,
        color: '#424245',
        lineHeight: 1.6
    }
})
