alter table "products"."comboProductComponent"
  add constraint "comboProductComponent_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
