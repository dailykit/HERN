alter table "products"."nutritionInfo"
  add constraint "nutritionInfo_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
