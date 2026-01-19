/**
 * 图片压缩工具
 * 将上传的图片压缩至指定大小以内，裁剪为正方形，转为 Base64
 */

/**
 * 压缩图片
 * @param {File} file - 图片文件
 * @param {number} maxSizeKB - 最大大小（KB），默认 200KB
 * @param {number} maxDimension - 最大尺寸（像素），默认 400px
 * @returns {Promise<string>} Base64 字符串
 */
export async function compressImage(file, maxSizeKB = 200, maxDimension = 400) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
                // 创建 Canvas
                const canvas = document.createElement('canvas')
                const ctx = canvas.getContext('2d')

                // 计算裁剪尺寸（正方形）
                const size = Math.min(img.width, img.height)
                const sx = (img.width - size) / 2
                const sy = (img.height - size) / 2

                // 设置输出尺寸
                const outputSize = Math.min(size, maxDimension)
                canvas.width = outputSize
                canvas.height = outputSize

                // 绘制裁剪后的图片
                ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize)

                // 尝试不同质量进行压缩
                let quality = 0.9
                let result = canvas.toDataURL('image/jpeg', quality)

                // 如果超过目标大小，逐步降低质量
                while (result.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
                    quality -= 0.1
                    result = canvas.toDataURL('image/jpeg', quality)
                }

                resolve(result)
            }

            img.onerror = () => reject(new Error('图片加载失败'))
            img.src = e.target.result
        }

        reader.onerror = () => reject(new Error('文件读取失败'))
        reader.readAsDataURL(file)
    })
}
