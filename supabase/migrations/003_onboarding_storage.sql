insert into storage.buckets(id,name,public) values('profile-photos','profile-photos',true),('startup-data-room','startup-data-room',false) on conflict(id) do update set public=excluded.public;
create policy "users upload own profile photo" on storage.objects for insert to authenticated with check(bucket_id='profile-photos' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "profile photos are readable" on storage.objects for select to public using(bucket_id='profile-photos');
create policy "founders read own data room" on storage.objects for select to authenticated using(bucket_id='startup-data-room' and (storage.foldername(name))[1]=auth.uid()::text);
create policy "founders upload own data room" on storage.objects for insert to authenticated with check(bucket_id='startup-data-room' and (storage.foldername(name))[1]=auth.uid()::text);
