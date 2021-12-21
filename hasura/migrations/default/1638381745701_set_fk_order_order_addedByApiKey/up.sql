alter table "order"."order"
  add constraint "order_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
