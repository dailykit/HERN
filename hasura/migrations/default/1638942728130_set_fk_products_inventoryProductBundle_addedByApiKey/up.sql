alter table "products"."inventoryProductBundle"
  add constraint "inventoryProductBundle_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
