-- =============================================
-- 微信支付订单表及相关函数
-- 运行方式: 在 Supabase SQL Editor 中执行此脚本
-- =============================================

-- 1. 创建订单表
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.users(id) NOT NULL,
  out_trade_no VARCHAR(32) UNIQUE NOT NULL,  -- 商户订单号 (用于微信支付)
  transaction_id VARCHAR(64),                 -- 微信支付订单号 (支付成功后填入)
  tier VARCHAR(20) NOT NULL,                  -- 套餐类型: trial/pro/max
  amount_cents INT NOT NULL,                  -- 金额（单位：分）
  credits INT NOT NULL,                       -- 购买的积分数量
  status VARCHAR(20) DEFAULT 'pending',       -- 订单状态: pending/paid/failed/refunded
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ                         -- 支付成功时间
);

-- 2. 创建索引（加速查询）
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_out_trade_no ON public.orders(out_trade_no);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 3. 启用 RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- 4. RLS 策略：用户只能查看自己的订单
CREATE POLICY "Users can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = user_id);

-- 5. 积分增加函数（支付成功后由后端调用）
CREATE OR REPLACE FUNCTION increment_credits(p_user_id UUID, p_amount INT)
RETURNS INT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE 
  new_credits INT;
BEGIN
  UPDATE public.users 
  SET credits = credits + p_amount 
  WHERE id = p_user_id 
  RETURNING credits INTO new_credits;
  
  RETURN new_credits;
END;
$$;

-- 6. 标记订单为已支付的函数（原子操作）
CREATE OR REPLACE FUNCTION mark_order_paid(
  p_out_trade_no VARCHAR,
  p_transaction_id VARCHAR
)
RETURNS TABLE(order_id UUID, user_id UUID, credits INT, already_paid BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order RECORD;
BEGIN
  -- 锁定订单行，防止并发问题
  SELECT * INTO v_order 
  FROM public.orders o 
  WHERE o.out_trade_no = p_out_trade_no 
  FOR UPDATE;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found: %', p_out_trade_no;
  END IF;
  
  -- 检查是否已支付（幂等性）
  IF v_order.status = 'paid' THEN
    RETURN QUERY SELECT v_order.id, v_order.user_id, v_order.credits, TRUE;
    RETURN;
  END IF;
  
  -- 更新订单状态
  UPDATE public.orders 
  SET status = 'paid',
      transaction_id = p_transaction_id,
      paid_at = NOW()
  WHERE out_trade_no = p_out_trade_no;
  
  -- 增加用户积分
  PERFORM increment_credits(v_order.user_id, v_order.credits);
  
  RETURN QUERY SELECT v_order.id, v_order.user_id, v_order.credits, FALSE;
END;
$$;
