alter table "products"."inventoryProductBundleSachet" alter column "updatedByApiKey" drop not null;
alter table "products"."inventoryProductBundleSachet" add column "updatedByApiKey" text;
