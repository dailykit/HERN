CREATE FUNCTION brands."handleBrandSettingsSync"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    brandId int;
    brandSettingId int;
    value jsonb;
    brandSetting "brands"."brandSetting";
    -- brand "brands"."brand";
BEGIN
    IF TG_table_Name = 'brand' THEN 
    brandId := NEW."id";
    FOR brandSetting IN (SELECT * FROM "brands"."brandSetting") LOOP
    brandSettingId := brandSetting."id";
    value := brandSetting."configTemplate";
    INSERT INTO "brands"."brand_brandSetting"( "brandId", "brandSettingId", "value") VALUES (brandId, brandSettingId, value);
    END LOOP;
    ELSIF TG_TABLE_NAME = 'brandSetting' THEN
    brandSettingId := NEW."id";
    value := NEW."configTemplate";
    FOR brandId IN (SELECT id FROM "brands"."brand") LOOP
    INSERT INTO "brands"."brand_brandSetting"( "brandId", "brandSettingId", "value") VALUES (brandId, brandSettingId, value);
    END LOOP;
    END IF;
    RETURN NULL;
END
$$;