-- Reels Rot: demo account setup + reset (Week 4)
--
-- Before running: sign up in the app with the username "demo".
-- Run this whole file once in Supabase > SQL Editor.
-- Later, if strangers make a mess of the demo, just run:   select public.reset_demo();

------------------------------------------------------------
-- 1. Mark the demo profile and stop anyone renaming it
------------------------------------------------------------

alter table public.profiles add column if not exists is_demo boolean not null default false;

update public.profiles set is_demo = true where username = 'demo';

drop policy if exists "update your own profile" on public.profiles;
create policy "update your own profile" on public.profiles for update
  using ((select auth.uid()) = id and not is_demo)
  with check ((select auth.uid()) = id and not is_demo);

------------------------------------------------------------
-- 2. reset_demo(): wipe whatever strangers did and put the demo content back
------------------------------------------------------------

create or replace function public.reset_demo()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  demo_id uuid;
  others uuid[];
  videos text[];
  reel_1 uuid;
  reel_2 uuid;
begin
  select id into demo_id from public.profiles where is_demo limit 1;
  if demo_id is null then
    return 'No demo profile found. Sign up in the app with the username "demo" first.';
  end if;

  -- Wipe everything the demo account has done (likes/comments on its reels go too).
  update public.profiles set username = 'demo', avatar_url = null where id = demo_id;
  delete from public.reels where user_id = demo_id;
  delete from public.comments where user_id = demo_id;
  delete from public.likes where user_id = demo_id;

  -- Reuse two videos that real accounts already uploaded.
  select array_agg(video_url) into videos
  from (
    select video_url from public.reels
    where user_id <> demo_id
    order by created_at
    limit 2
  ) v;
  if videos is null then
    return 'Post at least one reel from a normal account first, then run select public.reset_demo();';
  end if;

  select array_agg(id) into others from public.profiles where id <> demo_id;

  insert into public.reels (user_id, video_url, caption, created_at)
  values (demo_id, videos[1], 'my first reel, rate it 1-10', now() - interval '2 hours')
  returning id into reel_1;

  insert into public.reels (user_id, video_url, caption, created_at)
  values (demo_id, coalesce(videos[2], videos[1]), 'pov: you just opened the demo account', now() - interval '1 hour')
  returning id into reel_2;

  -- Other people liked and commented on the demo reels.
  insert into public.likes (user_id, reel_id) select o, reel_1 from unnest(others) o;
  insert into public.likes (user_id, reel_id) select o, reel_2 from unnest(others[1:2]) o;

  if array_length(others, 1) >= 1 then
    insert into public.comments (reel_id, user_id, body)
    values (reel_1, others[1], 'this is actually so good'),
           (reel_2, others[1], 'why is this me every day');
  end if;
  if array_length(others, 1) >= 2 then
    insert into public.comments (reel_id, user_id, body)
    values (reel_1, others[2], '10/10 no notes');
  end if;

  -- The demo account liked and commented on other people's reels.
  insert into public.likes (user_id, reel_id)
  select demo_id, id from public.reels where user_id <> demo_id order by created_at desc limit 2;

  insert into public.comments (reel_id, user_id, body)
  select id, demo_id, 'the demo account approves' from public.reels
  where user_id <> demo_id order by created_at desc limit 1;

  return 'Demo reset done.';
end;
$$;

-- Only you (in the SQL Editor) may run the reset, not visitors through the app.
revoke execute on function public.reset_demo() from public, anon, authenticated;

------------------------------------------------------------
-- 3. Fill the demo account now
------------------------------------------------------------

select public.reset_demo();
