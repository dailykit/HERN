alter table "products"."customizableProductComponent"
  add constraint "customizableProductComponent_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
