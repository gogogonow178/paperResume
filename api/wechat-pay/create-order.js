import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * 微信支付 Native 下单接口
 * POST /api/wechat-pay/create-order
 * 
 * 请求体: { tier: 'trial' | 'pro' | 'max' }
 * 返回: { code_url, out_trade_no } 或错误
 */

// 套餐配置（生产环境金额）
const TIERS = {
    trial: { price: 990, credits: 5, name: '尝鲜包' },      // 9.9 元 = 990 分
    pro: { price: 1990, credits: 20, name: '求职包' },    // 19.9 元 = 1990 分
    max: { price: 2990, credits: 50, name: '面霸包' }     // 29.9 元 = 2990 分
}

// 环境变量
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const mchId = process.env.WECHAT_PAY_MCH_ID
const apiKeyV3 = process.env.WECHAT_PAY_API_KEY_V3
const privateKey = process.env.WECHAT_PAY_PRIVATE_KEY?.replace(/\\n/g, '\n')
const serialNo = process.env.WECHAT_PAY_SERIAL_NO
const appId = process.env.WECHAT_PAY_APPID
const notifyUrl = process.env.WECHAT_PAY_NOTIFY_URL

/**
 * 生成商户订单号
 */
function generateOutTradeNo() {
    const timestamp = Date.now().toString()
    const random = crypto.randomBytes(4).toString('hex')
    return `PR${timestamp}${random}`.substring(0, 32)
}

/**
 * 生成微信支付 API v3 签名
 */
function generateSignature(method, url, timestamp, nonceStr, body) {
    const message = `${method}\n${url}\n${timestamp}\n${nonceStr}\n${body}\n`
    const sign = crypto.createSign('RSA-SHA256')
    sign.update(message)
    return sign.sign(privateKey, 'base64')
}

/**
 * 构建 Authorization 头
 */
function buildAuthHeader(method, url, body) {
    const timestamp = Math.floor(Date.now() / 1000).toString()
    const nonceStr = crypto.randomBytes(16).toString('hex')
    const signature = generateSignature(method, url, timestamp, nonceStr, body)

    return `WECHATPAY2-SHA256-RSA2048 mchid="${mchId}",nonce_str="${nonceStr}",timestamp="${timestamp}",serial_no="${serialNo}",signature="${signature}"`
}

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    // 1. 验证用户身份
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).json({ error: '请先登录' })
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: authHeader } }
    })
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return res.status(401).json({ error: '登录已过期，请重新登录' })
    }

    // 2. 验证套餐参数
    const { tier } = req.body
    if (!tier || !TIERS[tier]) {
        return res.status(400).json({ error: '无效的套餐类型' })
    }

    const tierConfig = TIERS[tier]
    const outTradeNo = generateOutTradeNo()

    // 3. 创建订单记录（状态为 pending）
    const { error: insertError } = await supabase.from('orders').insert({
        user_id: user.id,
        out_trade_no: outTradeNo,
        tier: tier,
        amount_cents: tierConfig.price,
        credits: tierConfig.credits,
        status: 'pending'
    })

    if (insertError) {
        console.error('Insert order error:', insertError)
        return res.status(500).json({ error: '创建订单失败' })
    }

    // 4. 调用微信支付 Native 下单接口
    const wxPayUrl = '/v3/pay/transactions/native'
    const requestBody = JSON.stringify({
        appid: appId,
        mchid: mchId,
        description: `MiniCV - ${tierConfig.name}`,
        out_trade_no: outTradeNo,
        notify_url: notifyUrl,
        amount: {
            total: tierConfig.price,
            currency: 'CNY'
        }
    })

    try {
        const authorization = buildAuthHeader('POST', wxPayUrl, requestBody)

        const wxResponse = await fetch('https://api.mch.weixin.qq.com' + wxPayUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authorization
            },
            body: requestBody
        })

        const wxData = await wxResponse.json()

        if (!wxResponse.ok) {
            console.error('WeChat Pay API Error:', wxData)
            // 标记订单失败
            await supabase.from('orders').update({ status: 'failed' }).eq('out_trade_no', outTradeNo)
            return res.status(502).json({
                error: '微信支付下单失败',
                detail: wxData.message || wxData.code
            })
        }

        // 5. 返回二维码链接
        return res.status(200).json({
            code_url: wxData.code_url,
            out_trade_no: outTradeNo
        })

    } catch (error) {
        console.error('WeChat Pay request failed:', error)
        await supabase.from('orders').update({ status: 'failed' }).eq('out_trade_no', outTradeNo)
        return res.status(500).json({ error: '支付服务暂不可用' })
    }
}
