alter table "products"."inventoryProductBundleSachet"
  add constraint "inventoryProductBundleSachet_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
