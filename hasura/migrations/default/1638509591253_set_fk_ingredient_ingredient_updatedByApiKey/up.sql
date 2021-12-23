alter table "ingredient"."ingredient"
  add constraint "ingredient_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
