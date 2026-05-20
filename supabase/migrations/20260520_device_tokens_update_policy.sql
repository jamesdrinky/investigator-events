-- Without an UPDATE policy on device_tokens, .upsert() from the client silently
-- fails on the second registration (when iOS returns the same token again) — the
-- INSERT path is rejected by the unique constraint, and the UPDATE path is
-- rejected by RLS. Result: device_tokens stays empty for returning users.
create policy "Users can update own tokens" on public.device_tokens
  for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
