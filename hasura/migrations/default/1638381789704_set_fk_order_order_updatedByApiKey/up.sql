alter table "order"."order"
  add constraint "order_updatedByApiKey_fkey"
  foreign key ("updatedByApiKey")
  references "developer"."apiKey"
  ("apiKey") on update restrict on delete set null;
