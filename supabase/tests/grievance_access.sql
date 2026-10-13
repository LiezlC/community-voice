begin;

-- All fixtures and changes are rolled back, including the temporary Auth users.
insert into auth.users (id, aud, role, is_anonymous)
values ('88dd98c0-e05f-4618-bb5b-87550e655341', 'authenticated', 'authenticated', true),
       ('e2c60b15-9eac-4781-b92c-202a1da5b5ab', 'authenticated', 'authenticated', true);
insert into public.grievances (id, content, owner_id)
values ('028fa198-3135-43b8-b989-239de7af6708', 'Access-control legacy fixture 028fa198', null);

set local role anon;
do $$ begin
  perform id from public.grievances limit 1;
  raise exception 'Anonymous API access was unexpectedly allowed';
exception when insufficient_privilege then null;
end $$;
reset role;

set local request.jwt.claims = '{"sub":"88dd98c0-e05f-4618-bb5b-87550e655341","role":"authenticated","is_anonymous":true,"app_metadata":{}}';
set local role authenticated;
insert into public.grievances (id, content)
values ('1df4cba9-0a8d-4f1b-b059-e2c4fd3c3b82', 'Access-control reporter fixture 1df4cba9');
do $$ begin
  if (select count(*) from public.grievances) <> 1 then
    raise exception 'Reporter must see only their own new case';
  end if;
  begin
    update public.grievances set owner_id = 'e2c60b15-9eac-4781-b92c-202a1da5b5ab'
      where id = '1df4cba9-0a8d-4f1b-b059-e2c4fd3c3b82';
    raise exception 'Owner reassignment was unexpectedly allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Client-editable user_metadata must never grant operator privileges.
set local request.jwt.claims = '{"sub":"e2c60b15-9eac-4781-b92c-202a1da5b5ab","role":"authenticated","is_anonymous":true,"app_metadata":{},"user_metadata":{"grievance_admin":true}}';
set local role authenticated;
do $$ declare changed integer; begin
  if exists (select 1 from public.grievances) then
    raise exception 'Another reporter can read existing cases';
  end if;
  update public.grievances set content = 'Unauthorized edit'
    where id = '1df4cba9-0a8d-4f1b-b059-e2c4fd3c3b82';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Cross-reporter update was allowed'; end if;
  delete from public.grievances where id = '1df4cba9-0a8d-4f1b-b059-e2c4fd3c3b82';
  get diagnostics changed = row_count;
  if changed <> 0 then raise exception 'Cross-reporter deletion was allowed'; end if;
  begin
    insert into public.grievances (content, owner_id)
      values ('Spoofed case ownership', '88dd98c0-e05f-4618-bb5b-87550e655341');
    raise exception 'Spoofed ownership was allowed';
  exception when insufficient_privilege then null;
  end;
end $$;
reset role;

-- Even server metadata must not grant operator access to an anonymous session.
set local request.jwt.claims = '{"sub":"e2c60b15-9eac-4781-b92c-202a1da5b5ab","role":"authenticated","is_anonymous":true,"app_metadata":{"grievance_admin":true}}';
set local role authenticated;
do $$ begin
  if exists (select 1 from public.grievances) then
    raise exception 'Anonymous session gained operator access';
  end if;
end $$;
reset role;

set local request.jwt.claims = '{"sub":"e2c60b15-9eac-4781-b92c-202a1da5b5ab","role":"authenticated","is_anonymous":false,"app_metadata":{"grievance_admin":true}}';
set local role authenticated;
do $$ begin
  if (select count(*) from public.grievances where id in
      ('028fa198-3135-43b8-b989-239de7af6708','1df4cba9-0a8d-4f1b-b059-e2c4fd3c3b82')) <> 2 then
    raise exception 'Authorized operator cannot see both legacy and owned cases';
  end if;
end $$;
reset role;
select 'PASS: ownership isolation, blocked escalation, and operator access' as verification;
rollback;
