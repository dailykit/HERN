alter table "products"."productPrice_brand_location" alter column "id" set default nextval('settings.env_id_seq'::regclass);
