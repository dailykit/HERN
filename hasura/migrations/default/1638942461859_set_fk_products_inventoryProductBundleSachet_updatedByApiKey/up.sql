alter table "products"."inventoryProductBundleSachet"
  add constraint "inventoryProductBundleSachet_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
