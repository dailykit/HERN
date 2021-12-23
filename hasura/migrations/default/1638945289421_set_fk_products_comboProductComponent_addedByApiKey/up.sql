alter table "products"."comboProductComponent"
  add constraint "comboProductComponent_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
