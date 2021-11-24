CREATE TYPE public.summary AS (
   pending jsonb,
   underprocessing jsonb,
   readytodispatch jsonb,
   outfordelivery jsonb,
   delivered jsonb,
   rejectedcancelled jsonb
);
CREATE FUNCTION aws.set_current_timestamp_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updated_at" = NOW();
  RETURN _new;
END;
$$;
CREATE FUNCTION brands."getSettings"(brandid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    settings jsonb = '{}';
    setting record;
    brandValue jsonb;
    res jsonb;
BEGIN
    FOR setting IN SELECT * FROM brands."storeSetting" LOOP
        SELECT value FROM brands."brand_storeSetting" WHERE "storeSettingId" = setting.id AND "brandId" = brandId INTO brandValue;
        settings := settings || jsonb_build_object(setting.identifier, COALESCE(brandValue, setting.value));
    END LOOP;
    res := jsonb_build_object('brand', jsonb_build_object(
        'logo', settings->'Brand Logo'->>'url',
        'name', settings->'Brand Name'->>'name',
        'navLinks', settings->'Nav Links',
        'contact', settings->'Contact',
        'policyAvailability', settings->'Policy Availability'
    ), 'visual', jsonb_build_object(
        'color', settings->'Primary Color'->>'color',
        'slides', settings->'Slides',
        'appTitle', settings->'App Title'->>'title',
        'favicon', settings->'Favicon'->>'url'
    ), 'availability', jsonb_build_object(
        'store', settings->'Store Availability',
        'pickup', settings->'Pickup Availability',
        'delivery', settings->'Delivery Availability',
        'referral', settings->'Referral Availability',
        'location', settings->'Location',
        'payments', settings->'Store Live'
    ), 'rewardsSettings', jsonb_build_object(
        'isLoyaltyPointsAvailable', (settings->'Loyalty Points Availability'->>'isAvailable')::boolean,
        'isWalletAvailable', (settings->'Wallet Availability'->>'isAvailable')::boolean,
        'isCouponsAvailable', (settings->'Coupons Availability'->>'isAvailable')::boolean,
        'loyaltyPointsUsage', settings->'Loyalty Points Usage'
    ), 'appSettings', jsonb_build_object(
        'scripts', settings->'Scripts'->>'value'
    ));
    RETURN res;
END;
$$;
CREATE FUNCTION public.defaultid(schema text, tab text, col text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
 declare
 idVal integer;
 queryname text;
 existsquery text;
 sequencename text;
BEGIN
sequencename = ('"' || schema || '"'|| '.' || '"' || tab || '_' || col || '_seq' || '"')::text;
execute ('CREATE SEQUENCE IF NOT EXISTS' || sequencename || 'minvalue 1000 OWNED BY "' || schema || '"."' || tab || '"."' || col || '"' );
select (
'select nextval('''
|| sequencename ||
''')') into queryname;
select call(queryname)::integer into idVal;
select ('select exists(select "' || col || '" from "' || schema || '"."' || tab || '" where "' || col || '" = ' || idVal || ')') into existsquery;
WHILE exec(existsquery) = true LOOP
      select call(queryname) into idVal;
      select ('select exists(select "' || col || '" from "' || schema || '"."' || tab || '" where "' || col || '" = ' || idVal || ')') into existsquery;
END LOOP;
return idVal;
END;
$$;
CREATE TABLE brands."brandPages" (
    "brandId" integer NOT NULL,
    route text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "internalPageName" text,
    "navigationMenuId" integer,
    id integer DEFAULT public.defaultid('brands'::text, 'navigationMenu'::text, 'id'::text) NOT NULL,
    config jsonb,
    "locationSelectorConfig" jsonb,
    "isCheckoutPage" boolean,
    "footerConfig" jsonb
);
COMMENT ON TABLE brands."brandPages" IS 'Define all the pages of website for the store';



CREATE FUNCTION brands."getValidNavigationMenu"(brandpages brands."brandPages") RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
return coalesce (brandPages."navigationMenuId", (select "navigationMenuId" from "brands"."brand" where id = brandPages."brandId") );
END;
$$;
