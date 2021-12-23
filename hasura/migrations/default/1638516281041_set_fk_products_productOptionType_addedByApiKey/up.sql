alter table "products"."productOptionType"
  add constraint "productOptionType_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
