alter table "products"."nutritionInfo" drop constraint "nutritionInfo_addedByApiKey_fkey2",
  add constraint "nutritionInfo_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
