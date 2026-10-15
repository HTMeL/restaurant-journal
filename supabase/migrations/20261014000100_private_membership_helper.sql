-- Move the membership helper out of the API-exposed "public" schema.
-- Row level security policies keep working (they reference the function by id),
-- but the helper is no longer callable as /rest/v1/rpc/is_household_member.
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.is_household_member(uuid) set schema private;
