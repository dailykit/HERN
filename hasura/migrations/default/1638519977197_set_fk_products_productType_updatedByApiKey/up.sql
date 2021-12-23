alter table "products"."productType"
  add constraint "productType_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
