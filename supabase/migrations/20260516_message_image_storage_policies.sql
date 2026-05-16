do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Public read access to message images'
  ) then
    create policy "Public read access to message images"
    on storage.objects
    for select
    to public
    using (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = 'messages'
    );
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload own message images'
  ) then
    create policy "Authenticated users can upload own message images"
    on storage.objects
    for insert
    to authenticated
    with check (
      bucket_id = 'avatars'
      and (storage.foldername(name))[1] = 'messages'
      and (storage.foldername(name))[2] = auth.uid()::text
    );
  end if;
end $$;
