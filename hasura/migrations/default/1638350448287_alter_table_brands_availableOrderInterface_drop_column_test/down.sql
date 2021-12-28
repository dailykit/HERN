comment on column "brands"."availableOrderInterface"."test" is E'This table contains all the available order interface(Kiosk, QR,Website,POS) in the instance.';
alter table "brands"."availableOrderInterface" alter column "test" drop not null;
alter table "brands"."availableOrderInterface" add column "test" _int4;
