alter table "products"."customizableProductComponent"
  add constraint "customizableProductComponent_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
