#!/bin/bash
# PDF 类型检测脚本
# 用法: ./check-pdf.sh 您的简历.pdf

PDF_FILE="$1"

if [ -z "$PDF_FILE" ]; then
    echo "❌ 用法: ./check-pdf.sh <PDF文件路径>"
    echo "   例如: ./check-pdf.sh ~/Downloads/张三_简历.pdf"
    exit 1
fi

if [ ! -f "$PDF_FILE" ]; then
    echo "❌ 文件不存在: $PDF_FILE"
    exit 1
fi

echo "📄 正在分析: $PDF_FILE"
echo "-----------------------------------"

# 方法1: 检查字体信息
echo ""
echo "🔍 方法1: 检查嵌入字体"
FONTS=$(mdls "$PDF_FILE" 2>/dev/null | grep kMDItemFonts)
if [ -n "$FONTS" ]; then
    echo "   ✅ 检测到字体: "
    echo "$FONTS" | sed 's/kMDItemFonts/   /'
    RESULT_FONT="text"
else
    echo "   ⚠️  未检测到嵌入字体"
    RESULT_FONT="image"
fi

# 方法2: 检查文件大小
echo ""
echo "🔍 方法2: 检查文件大小"
FILE_SIZE=$(stat -f%z "$PDF_FILE" 2>/dev/null || stat -c%s "$PDF_FILE" 2>/dev/null)
FILE_SIZE_KB=$((FILE_SIZE / 1024))
echo "   文件大小: ${FILE_SIZE_KB} KB"

if [ "$FILE_SIZE_KB" -lt 300 ]; then
    echo "   ✅ 文件较小，可能是真文字 PDF"
    RESULT_SIZE="text"
else
    echo "   ⚠️  文件较大，可能是图片 PDF"
    RESULT_SIZE="image"
fi

# 方法3: 检查 PDF 内容流中是否有文本对象
echo ""
echo "🔍 方法3: 检查 PDF 内部结构"
# 检查是否包含文本流标记 (BT...ET 是 PDF 文本对象标记)
if strings "$PDF_FILE" | grep -q "/Type /Font"; then
    echo "   ✅ 检测到 PDF 字体定义对象"
    RESULT_STRUCT="text"
else
    echo "   ⚠️  未检测到字体定义"
    RESULT_STRUCT="image"
fi

# 总结
echo ""
echo "==================================="
if [ "$RESULT_FONT" = "text" ] && [ "$RESULT_STRUCT" = "text" ]; then
    echo "🎉 结论: 这是 ATS 友好的真文字 PDF"
    echo "   文字可被招聘系统正确解析"
elif [ "$RESULT_FONT" = "image" ] && [ "$RESULT_STRUCT" = "image" ]; then
    echo "📷 结论: 这是图片 PDF（截图方案生成）"
    echo "   文字无法被招聘系统解析"
else
    echo "🤔 结论: 无法确定，建议手动检查"
    echo "   尝试用 Adobe Acrobat 打开查看字体标签"
fi
echo "==================================="
