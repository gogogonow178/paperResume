import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

// Initialize Supabase Client (Backend)
// IMPORTANT: Use SERVICE_ROLE_KEY if we need admin rights, but here we use the user's JWT to context-switch
// Actually for verifying JWT, we need the Project URL and Anon Key.
// For calling the "decrement_credits" function which is security definer, Anon Key is fine IF the user is authenticated.
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY
const siliconFlowKey = process.env.SILICONFLOW_API_KEY

export default async function handler(req, res) {
    // 1. CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true)
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
    )

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' })
    }

    const { text, mode = 'standard' } = req.body
    const authHeader = req.headers.authorization

    if (!authHeader) {
        return res.status(401).json({ error: 'Missing Authorization header' })
    }

    // 2. Authenticate User with Supabase (Forward Auth Header for RLS)
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: {
            headers: {
                Authorization: authHeader,
            },
        },
    })
    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabase.auth.getUser(token)

    if (authError || !user) {
        return res.status(401).json({ error: 'Invalid User Token' })
    }

    // 3. Atomic Debit (Deduct Credit)
    // Call the 'decrement_credits' RPC function we defined in SQL
    const { data: remainingCredits, error: debitError } = await supabase.rpc('decrement_credits', {
        user_id: user.id,
        amount: 1
    })

    // Check if debit failed (e.g. insufficient funds return -1 or error)
    if (debitError) {
        console.error('Debit Error:', debitError)
        return res.status(500).json({ error: 'Database transaction failed' })
    }

    if (remainingCredits < 0) {
        return res.status(403).json({ error: 'Insufficient credits. Please upgrade.' })
    }

    // 4. Call SiliconFlow AI (DeepSeek / GLM)
    try {
        const client = new OpenAI({
            apiKey: siliconFlowKey,
            baseURL: 'https://api.siliconflow.cn/v1'
        })

        const systemPrompt = `
你是一位拥有 10 年经验的资深招聘专家。请将用户提供的【工作/项目经历】进行专业润色。
要求：
1. **结构优化**: 遵循 STAR 原则 (背景-行动-结果)，无需标注标签。
2. **动词驱动**: 使用强有力的动词开头。
3. **量化成果**: 挖掘或推断可量化的成果数据。
4. **精简文字**: 去除口语，保持客观专业。
5. **格式输出**: 直接输出润色后的文本，如果是多条经历，使用实心圆点 (•) 开头，每条经历之间**不留空行**。
`

        // Choose model based on mode or default to a cost-effective one
        const model = 'deepseek-ai/DeepSeek-V3' // Or 'THUDM/glm-4-9b-chat' which is often free/cheap on SiliconFlow

        const completion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: text }
            ],
            model: model,
            temperature: 0.7,
        })

        const rawText = completion.choices[0].message.content
        // 处理多余空行：将连续空行替换为单个换行
        const polishedText = rawText.replace(/\n\s*\n/g, '\n').trim()

        // 5. Log usage (Must await in Serverless environment)
        const { error: logError } = await supabase.from('usage_logs').insert({
            user_id: user.id,
            feature: 'resume_polish',
            input_tokens: completion.usage?.prompt_tokens,
            output_tokens: completion.usage?.completion_tokens,
            model: model
        })

        if (logError) {
            console.error('Logging error:', logError)
        }

        // 6. Return success
        return res.status(200).json({
            result: polishedText,
            credits: remainingCredits
        })

    } catch (aiError) {
        console.error('AI API Error:', aiError)
        // Refund credit if AI fails? (Optional enhancement)
        // await supabase.rpc('increment_credits', { user_id: user.id, amount: 1 })
        return res.status(502).json({ error: 'AI Service Unavailable: ' + aiError.message })
    }
}
