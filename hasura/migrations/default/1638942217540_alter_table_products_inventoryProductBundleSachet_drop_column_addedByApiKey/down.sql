alter table "products"."inventoryProductBundleSachet" alter column "addedByApiKey" drop not null;
alter table "products"."inventoryProductBundleSachet" add column "addedByApiKey" text;
