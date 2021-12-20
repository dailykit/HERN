alter table "order"."cartPayment" add column "actionRequired" boolean
 not null default 'false';
