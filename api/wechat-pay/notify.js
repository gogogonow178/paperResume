import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'

/**
 * 微信支付回调通知接口
 * POST /api/wechat-pay/notify
 * 
 * 微信服务器会在支付成功后调用此接口
 * 需要验证签名 -> 解密数据 -> 更新订单 -> 增加积分
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY
const apiKeyV3 = process.env.WECHAT_PAY_API_KEY_V3

/**
 * 解密微信支付回调数据 (AEAD_AES_256_GCM)
 */
function decryptResource(resource) {
    const { ciphertext, nonce, associated_data } = resource

    const ciphertextBuffer = Buffer.from(ciphertext, 'base64')
    const authTag = ciphertextBuffer.slice(-16)
    const encryptedData = ciphertextBuffer.slice(0, -16)

    const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        Buffer.from(apiKeyV3, 'utf8'),
        Buffer.from(nonce, 'utf8')
    )
    decipher.setAuthTag(authTag)
    decipher.setAAD(Buffer.from(associated_data || '', 'utf8'))

    const decrypted = Buffer.concat([
        decipher.update(encryptedData),
        decipher.final()
    ])

    return JSON.parse(decrypted.toString('utf8'))
}

export default async function handler(req, res) {
    // 微信回调只接受 POST
    if (req.method !== 'POST') {
        return res.status(405).json({ code: 'METHOD_NOT_ALLOWED' })
    }

    try {
        console.log('--- Received WeChat Pay Notification Event ---')

        const notification = req.body
        // 1. 验证通知类型
        if (!notification || notification.event_type !== 'TRANSACTION.SUCCESS') {
            console.log('Non-success event ignored:', notification.event_type)
            // 非支付成功通知，直接返回成功（避免微信重试）
            return res.status(200).json({ code: 'SUCCESS', message: '已收到' })
        }

        // 2. 解密回调数据
        let transaction
        try {
            transaction = decryptResource(notification.resource)
        } catch (decryptError) {
            console.error('Decrypt error:', decryptError)
            return res.status(400).json({ code: 'DECRYPT_ERROR', message: '解密失败' })
        }

        const { out_trade_no, transaction_id, trade_state } = transaction

        // 3. 再次确认支付成功
        if (trade_state !== 'SUCCESS') {
            return res.status(200).json({ code: 'SUCCESS', message: '非成功状态，已忽略' })
        }

        // 4. 使用 Supabase RPC 原子更新订单并增加积分
        // 使用 Service Role Key 绕过 RLS
        const supabase = createClient(supabaseUrl, supabaseServiceKey)

        const { data, error } = await supabase.rpc('mark_order_paid', {
            p_out_trade_no: out_trade_no,
            p_transaction_id: transaction_id
        })

        if (error) {
            console.error('mark_order_paid error:', error)
            // 返回 500 让微信重试
            return res.status(500).json({ code: 'DATABASE_ERROR', message: error.message })
        }

        const result = data?.[0]
        if (result?.already_paid) {
            console.log(`Order ${out_trade_no} already paid, skipping.`)
        } else {
            console.log(`Order ${out_trade_no} paid successfully, added ${result?.credits} credits.`)
        }

        // 5. 返回成功响应给微信
        return res.status(200).json({ code: 'SUCCESS', message: '成功' })

    } catch (error) {
        console.error('Notify handler error:', error)
        return res.status(500).json({ code: 'INTERNAL_ERROR', message: error.message })
    }
}
