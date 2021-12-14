alter table "products"."productPrice_brand_location" alter column "id" set default defaultId('products'::text,'productPrice_brand_location'::text,'id'::text);
