-- 1. 为 users 表增加指纹字段
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS fingerprint TEXT;

-- 2. 创建一个索引以加速指纹查询
CREATE INDEX IF NOT EXISTS idx_users_fingerprint ON public.users(fingerprint);

-- 3. 修改处理新用户的函数
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
DECLARE
  current_fingerprint TEXT;
  fingerprint_count INT;
  initial_credits INT;
BEGIN
  -- 从元数据中获取指纹 (由前端在 signUp/signInWithOtp 时传入)
  current_fingerprint := (new.raw_user_meta_data->>'fingerprint');
  
  -- 如果指纹存在，统计该指纹已关联的账号数
  IF current_fingerprint IS NOT NULL THEN
    SELECT count(*) INTO fingerprint_count FROM public.users WHERE fingerprint = current_fingerprint;
  ELSE
    fingerprint_count := 0;
  END IF;

  -- 逻辑限制：如果该设备已有 >= 2 个账号，则新号初始点数为 0
  IF fingerprint_count >= 2 THEN
    initial_credits := 0;
  ELSE
    initial_credits := 5;
  END IF;

  INSERT INTO public.users (id, email, fingerprint, credits)
  VALUES (new.id, new.email, current_fingerprint, initial_credits);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
