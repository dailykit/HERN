alter table "developer"."apiKey" add column "canAddOrders" boolean
 not null default 'false';
