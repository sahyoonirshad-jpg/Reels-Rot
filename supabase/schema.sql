-- Reels Rot: database schema (Step 2)
-- Paste this whole file into Supabase > SQL Editor and click Run, once.

------------------------------------------------------------
-- 1. TABLES
------------------------------------------------------------

-- One row per person. Its id is the same id Supabase gives their login.
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  username   text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- One row per posted video.
create table if not exists public.reels (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles (id) on delete cascade,
  video_url  text not null,
  caption    text check (char_length(caption) <= 300),
  created_at timestamptz not null default now()
);

-- One row per "this person liked this reel". A person can like a reel only once.
create table if not exists public.likes (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  reel_id    uuid not null references public.reels (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, reel_id)
);

-- One row per comment.
create table if not exists public.comments (
  id         uuid primary key default gen_random_uuid(),
  reel_id    uuid not null references public.reels (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  body       text not null check (char_length(body) between 1 and 500),
  created_at timestamptz not null default now()
);

-- Newest-first feed, and comments per reel, stay fast.
create index if not exists reels_created_at_idx on public.reels (created_at desc);
create index if not exists comments_reel_id_idx on public.comments (reel_id, created_at);

------------------------------------------------------------
-- 2. WHO MAY DO WHAT (row level security)
-- Everyone can look. Only signed-in people can add things,
-- and only as themselves. You can only delete your own things.
------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.reels    enable row level security;
alter table public.likes    enable row level security;
alter table public.comments enable row level security;

create policy "profiles are public"       on public.profiles for select using (true);
create policy "update your own profile"   on public.profiles for update
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create policy "reels are public"          on public.reels for select using (true);
create policy "post reels as yourself"    on public.reels for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "delete your own reels"     on public.reels for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "likes are public"          on public.likes for select using (true);
create policy "like as yourself"          on public.likes for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "unlike your own likes"     on public.likes for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "comments are public"       on public.comments for select using (true);
create policy "comment as yourself"       on public.comments for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "delete your own comments"  on public.comments for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select on public.profiles, public.reels, public.likes, public.comments to anon, authenticated;
grant update on public.profiles to authenticated;
grant insert, delete on public.reels, public.likes, public.comments to authenticated;

------------------------------------------------------------
-- 3. AUTO-CREATE A PROFILE WHEN SOMEONE SIGNS UP
-- Supabase makes the login but not the profiles row, so this does it.
------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------
-- 4. VIDEO STORAGE
-- A public "reels" folder for video files, 50 MB max each.
-- Signed-in people can upload only into a folder named after their own id.
------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('reels', 'reels', true, 52428800, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;

create policy "upload videos to your own folder" on storage.objects for insert to authenticated
  with check (bucket_id = 'reels' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "delete your own videos" on storage.objects for delete to authenticated
  using (bucket_id = 'reels' and (storage.foldername(name))[1] = (select auth.uid())::text);
