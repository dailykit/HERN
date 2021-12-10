alter table "products"."nutritionInfo"
  add constraint "nutritionInfo_addedByApiKey_fkey2"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
