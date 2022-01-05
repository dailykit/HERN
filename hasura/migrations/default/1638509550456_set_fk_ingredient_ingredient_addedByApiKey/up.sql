alter table "ingredient"."ingredient"
  add constraint "ingredient_addedByApiKey_fkey"
  foreign key ("addedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
