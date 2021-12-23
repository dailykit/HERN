alter table "products"."productType"
  add constraint "productType_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
