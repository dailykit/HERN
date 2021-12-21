alter table "order"."cart"
  add constraint "cart_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
