-- ============================================================
-- Veesaa — date of birth (age gate, 18+). Stored on profiles; captured from
-- signup metadata for email signups, and set by the Google onboarding form.
-- Paste into Supabase Studio → SQL Editor and run.
-- ============================================================

alter table public.profiles add column if not exists date_of_birth date;

-- New-user trigger now also stores date_of_birth from the signup metadata.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name, phone, date_of_birth)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', ''),
    new.raw_user_meta_data ->> 'phone',
    nullif(new.raw_user_meta_data ->> 'date_of_birth', '')::date
  )
  on conflict (id) do nothing;

  insert into public.user_settings (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

-- create-or-replace resets grants to the default (PUBLIC execute), so re-apply
-- the lockdown from migration 0020 (this is a trigger fn, never called via API).
revoke execute on function public.handle_new_user() from anon, authenticated, public;
