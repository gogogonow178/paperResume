-- =============================================================================
-- 修复“注册后无数据”的问题
-- 说明：目前的 RLS 策略只允许 SELECT，不允许 INSERT/UPDATE，导致前端兜底逻辑失败。
-- 请在 Supabase -> SQL Editor 中运行此脚本。
-- =============================================================================

-- 1. 允许用户修改自己的资料 (for update)
--    解决：当用户消费积分或修改信息时需要此权限
create policy "Users can update own profile" 
on public.users for update 
using ( auth.uid() = id );

-- 2. 允许用户插入自己的资料 (for insert)
--    解决：当 Trigger 失效或延迟时，允许前端 lazy init 插入数据
create policy "Users can insert own profile" 
on public.users for insert 
with check ( auth.uid() = id );

-- 3. （可选）确保 RLS 启用
alter table public.users enable row level security;
