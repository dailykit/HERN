alter table "products"."nutritionInfo" drop constraint "nutritionInfo_updatedByApiKey_fkey",
  add constraint "nutritionInfo_addedByApiKey_fkey2"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
