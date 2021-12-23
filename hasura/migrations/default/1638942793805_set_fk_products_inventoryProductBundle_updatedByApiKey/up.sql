alter table "products"."inventoryProductBundle"
  add constraint "inventoryProductBundle_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
