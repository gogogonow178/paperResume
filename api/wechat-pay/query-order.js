import { createClient } from '@supabase/supabase-js'

/**
 * 订单状态查询接口
 * GET /api/wechat-pay/query-order?out_trade_no=xxx
 * 
 * 前端轮询此接口检测支付状态
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

export default async function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    // 禁止缓存，确保每次都返回最新状态
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    res.setHeader('Pragma', 'no-cache')
    res.setHeader('Expires', '0')

    if (req.method === 'OPTIONS') {
        return res.status(200).end()
    }

    if (req.method !== 'GET') {
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
        return res.status(401).json({ error: '登录已过期' })
    }

    // 2. 获取订单号参数
    const { out_trade_no } = req.query
    if (!out_trade_no) {
        return res.status(400).json({ error: '缺少订单号' })
    }

    // 3. 查询订单状态（RLS 会自动限制只能查自己的订单）
    const { data: order, error: queryError } = await supabase
        .from('orders')
        .select('status, credits, paid_at')
        .eq('out_trade_no', out_trade_no)
        .eq('user_id', user.id)
        .single()

    if (queryError || !order) {
        return res.status(404).json({ error: '订单不存在' })
    }

    // 4. 如果已支付，同时返回用户最新积分
    let userCredits = null
    if (order.status === 'paid') {
        const { data: profile } = await supabase
            .from('users')
            .select('credits')
            .eq('id', user.id)
            .single()
        userCredits = profile?.credits
    }

    return res.status(200).json({
        status: order.status,
        credits_added: order.credits,
        paid_at: order.paid_at,
        user_credits: userCredits
    })
}
