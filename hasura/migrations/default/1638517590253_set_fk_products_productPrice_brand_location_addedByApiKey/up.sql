alter table "products"."productPrice_brand_location"
  add constraint "productPrice_brand_location_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
