alter table "products"."productPrice_brand_location"
  add constraint "productPrice_brand_location_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
