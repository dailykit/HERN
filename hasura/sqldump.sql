
CREATE FUNCTION brands.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION public.extractdatefromdate(var timestamp with time zone) RETURNS date
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN TO_DATE(var::text,'YYYY-MM-DD');
END
$$;
CREATE FUNCTION public.extractdayfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( day FROM var );
END
$$;
CREATE FUNCTION public.extractdowfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( dow FROM var );
END
$$;
CREATE FUNCTION public.extracthourfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( hour FROM var );
END
$$;
CREATE FUNCTION public.extractmonthfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( month FROM var );
END
$$;
CREATE FUNCTION public.extractquarterfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( quarter FROM var );
END
$$;
CREATE FUNCTION public.extractweekfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( week FROM var );
END
$$;
CREATE FUNCTION public.extractyearfromdate(var timestamp with time zone) RETURNS integer
    LANGUAGE plpgsql IMMUTABLE
    AS $$
BEGIN
    RETURN extract( year FROM var );
END
$$;
CREATE TABLE "order".cart (
    id integer DEFAULT public.defaultid('order'::text, 'cart'::text, 'id'::text) NOT NULL,
    "paidPrice" numeric DEFAULT 0 NOT NULL,
    "customerId" integer,
    "paymentStatus" text DEFAULT 'PENDING'::text NOT NULL,
    status text DEFAULT 'CART_PENDING'::text NOT NULL,
    "paymentMethodId" text,
    "transactionId" text,
    "paymentCustomerId" text,
    "fulfillmentInfo" jsonb,
    tip numeric DEFAULT 0 NOT NULL,
    address jsonb,
    "customerInfo" jsonb,
    source text DEFAULT 'a-la-carte'::text NOT NULL,
    "subscriptionOccurenceId" integer,
    "walletAmountUsed" numeric DEFAULT 0 NOT NULL,
    "isTest" boolean DEFAULT false NOT NULL,
    "brandId" integer,
    "couponDiscount" numeric DEFAULT 0 NOT NULL,
    "loyaltyPointsUsed" integer DEFAULT 0 NOT NULL,
    "paymentId" uuid,
    "paymentUpdatedAt" timestamp with time zone,
    "paymentRequestInfo" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "customerKeycloakId" text,
    "orderId" integer,
    amount numeric DEFAULT 0,
    "transactionRemark" jsonb,
    "stripeInvoiceId" text,
    "stripeInvoiceDetails" jsonb,
    "statementDescriptor" text,
    "paymentRetryAttempt" integer DEFAULT 0 NOT NULL,
    "lastUpdatedBy" jsonb DEFAULT '{}'::jsonb,
    "isArchived" boolean DEFAULT false,
    created_at_month integer GENERATED ALWAYS AS (public.extractmonthfromdate(created_at)) STORED,
    created_at_day integer GENERATED ALWAYS AS (public.extractdayfromdate(created_at)) STORED,
    created_at_week integer GENERATED ALWAYS AS (public.extractweekfromdate(created_at)) STORED,
    created_at_year integer GENERATED ALWAYS AS (public.extractyearfromdate(created_at)) STORED,
    created_at_hour integer GENERATED ALWAYS AS (public.extracthourfromdate(created_at)) STORED,
    created_at_dow integer GENERATED ALWAYS AS (public.extractdowfromdate(created_at)) STORED,
    created_at_quarter integer GENERATED ALWAYS AS (public.extractquarterfromdate(created_at)) STORED,
    created_at_date date GENERATED ALWAYS AS (public.extractdatefromdate(created_at)) STORED,
    "experienceClassId" integer,
    "parentCartId" integer,
    "deliveryParentShare" numeric DEFAULT 100,
    "experienceClassTypeId" integer,
    "retryPaymentMethod" text,
    "locationId" integer,
    "locationTableId" integer,
    "locationKioskId" integer,
    "offerDiscountParentShare" numeric DEFAULT 100 NOT NULL,
    "activeCartPaymentId" integer,
    "totalToPay" numeric,
    "balanceToPay" numeric
);
CREATE FUNCTION "cartFunctions"."cartBilling"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 rewardIds int[];
 rewardId int;
 reward record;
 rangeId int;
 subscriptionId int;
 cartItemTaxBreakDown jsonb;
 cartItem "order"."cartItem";
 cartItemId int;
BEGIN
  -- Item total
    itemTotal := coalesce((SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    itemTotalDiscount := coalesce((SELECT SUM(coalesce("discount",0)) FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    discountedItemTotal := itemTotal - itemTotalDiscount;
    rewardIds := ARRAY(SELECT "rewardId" FROM "order"."cart_rewards" WHERE "cartId" = cart."id");
    FOREACH rewardId IN ARRAY rewardIds LOOP
        SELECT * FROM crm.reward WHERE id = rewardId INTO reward;
        IF reward."type" = 'Discount'
            THEN
            IF  reward."rewardValue"->>'type' = 'conditional'
                THEN 
                offerDiscount := discountedItemTotal * ((reward."rewardValue"->'value'->>'percentage')::numeric / 100);
                IF offerDiscount >  (reward."rewardValue"->'value'->>'max')::numeric
                    THEN offerDiscount := (reward."rewardValue"->'value'->>'max')::numeric;
                END IF;
            ELSIF reward."rewardValue"->>'type' = 'absolute' THEN
                offerDiscount := (reward."rewardValue"->>'value')::numeric;
            ELSE
                offerDiscount := 0;
            END IF;
        END IF;
    END LOOP;
    IF offerDiscount > discountedItemTotal THEN
        offerDiscount := discountedItemTotal;
    END IF;
    totalDiscount := itemTotalDiscount + offerDiscount;
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN deliveryPrice := 0;
    ELSIF cart."source" = 'a-la-carte' THEN
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        deliveryPrice := coalesce((SELECT "charge" from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId AND itemTotal >= "charge"."orderValueFrom" AND itemTotal < "charge"."orderValueUpto"), 
        (SELECT MAX("charge") from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId ));
    ELSE
        SELECT "subscriptionId" 
        FROM crm."brand_customer" 
        WHERE "brandId" = cart."brandId" 
        AND "keycloakId" = cart."customerKeycloakId" 
        INTO subscriptionId;
        SELECT "deliveryPrice" 
        FROM subscription."subscription_zipcode" 
        WHERE "subscriptionId" = subscriptionId 
        AND zipcode = cart.address->>'zipcode'
        INTO deliveryPrice;
    END IF;
    FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
    SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
    SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
    IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'false' THEN
        itemTotalTaxExcluded := itemTotalTaxExcluded + (cartItemTaxBreakDown->>'taxAmount')::numeric;
    END IF;
     IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'true' THEN
        itemTotalInclusiveTax := itemTotalInclusiveTax + (cartItemTaxBreakDown->>'taxAmount')::numeric;
    END IF;
    END LOOP;
    subTotal := itemTotal - totalDiscount + deliveryPrice;
    totalToPay := subTotal + itemTotalTaxExcluded;  
    return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartBillingByCartId"(cartid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 rewardIds int[];
 rewardId int;
 reward record;
 rangeId int;
 subscriptionId int;
 cartItemTaxBreakDown jsonb;
 cartItem "order"."cartItem";
 cartItemId int;
 cart "order"."cart";
BEGIN
    SELECT * INTO cart FROM "order"."cart" WHERE "id" = cartId;
  -- Item total
    itemTotal := (SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "cartId" = cart."id");
    itemTotalDiscount := (SELECT SUM(coalesce("discount",0)) FROM "order"."cartItem" WHERE "cartId" = cart."id");
    discountedItemTotal := itemTotal - itemTotalDiscount;
    rewardIds := ARRAY(SELECT "rewardId" FROM "order"."cart_rewards" WHERE "cartId" = cart."id");
    FOREACH rewardId IN ARRAY rewardIds LOOP
        SELECT * FROM crm.reward WHERE id = rewardId INTO reward;
        IF reward."type" = 'Discount'
            THEN
            IF  reward."rewardValue"->>'type' = 'conditional'
                THEN 
                offerDiscount := discountedItemTotal * ((reward."rewardValue"->'value'->>'percentage')::numeric / 100);
                IF offerDiscount >  (reward."rewardValue"->'value'->>'max')::numeric
                    THEN offerDiscount := (reward."rewardValue"->'value'->>'max')::numeric;
                END IF;
            ELSIF reward."rewardValue"->>'type' = 'absolute' THEN
                offerDiscount := (reward."rewardValue"->>'value')::numeric;
            ELSE
                offerDiscount := 0;
            END IF;
        END IF;
    END LOOP;
    IF offerDiscount > discountedItemTotal THEN
        offerDiscount := discountedItemTotal;
    END IF;
    totalDiscount := itemTotalDiscount + offerDiscount;
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN deliveryPrice := 0;
    ELSIF cart."source" = 'a-la-carte' THEN
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        deliveryPrice := coalesce((SELECT "charge" from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId AND itemTotal >= "charge"."orderValueFrom" AND itemTotal < "charge"."orderValueUpto"), 
        (SELECT MAX("charge") from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId ));
    ELSE
        SELECT "subscriptionId" 
        FROM crm."brand_customer" 
        WHERE "brandId" = cart."brandId" 
        AND "keycloakId" = cart."customerKeycloakId" 
        INTO subscriptionId;
        SELECT "deliveryPrice" 
        FROM subscription."subscription_zipcode" 
        WHERE "subscriptionId" = subscriptionId 
        AND zipcode = cart.address->>'zipcode'
        INTO deliveryPrice;
    END IF;
    FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
    SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
    SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
    IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = false THEN
        itemTotalTaxExcluded := itemTotalTaxExcluded + (cartItemTaxBreakDown->>'taxAmount')::numeric;
    END IF;
     IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = true THEN
        itemTotalInclusiveTax := itemTotalInclusiveTax + (cartItemTaxBreakDown->>'taxAmount')::numeric;
    END IF;
    END LOOP;
    subTotal := itemTotal - totalDiscount + deliveryPrice;
    totalToPay := subTotal + itemTotalTaxExcluded;  
    return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartBillingForChilds"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 childCart "order"."cart";
 cartBillingForParent jsonb;
 cartRecord "order"."cart";
BEGIN
cartRecord := cart;
For childCart in (select * from "order"."cart" where "parentCartId" = cartRecord."id") loop
select "cartFunctions"."cartBillingForParent"(childCart) into cartBillingForParent;
itemTotal := itemTotal + (cartBillingForParent->>'itemTotal')::numeric;
itemTotalDiscount := itemTotalDiscount + (cartBillingForParent->>'itemTotalDiscount')::numeric;
discountedItemTotal := discountedItemTotal + (cartBillingForParent->>'discountedItemTotal')::numeric;
offerDiscount := offerDiscount + (cartBillingForParent->>'offerDiscount')::numeric;
totalDiscount := totalDiscount + (cartBillingForParent->>'totalDiscount')::numeric;
deliveryPrice := deliveryPrice + (cartBillingForParent->>'deliveryPrice')::numeric;
itemTotalTaxExcluded := itemTotalTaxExcluded + (cartBillingForParent->>'itemTotalTaxExcluded')::numeric;
itemTotalInclusiveTax := itemTotalInclusiveTax + (cartBillingForParent->>'itemTotalInclusiveTax')::numeric;
subTotal := subTotal + (cartBillingForParent->>'subTotal')::numeric;
totalToPay := totalToPay + (cartBillingForParent->>'totalToPay')::numeric;
end loop;
return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartBillingForParent"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 rewardIds int[];
 rewardId int;
 reward record;
 rangeId int;
 subscriptionId int;
 cartItemTaxBreakDown jsonb;
 cartItem "order"."cartItem";
 cartItemId int;
BEGIN
IF cart."parentCartId" is not null then
  -- Item total
    itemTotal := coalesce((SELECT SUM("unitPrice"*("parentShare")/100) FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    itemTotalDiscount := coalesce((SELECT SUM(coalesce("discount",0)*("parentShare")/100) FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    discountedItemTotal := itemTotal - itemTotalDiscount;
offerDiscount := (select ("cartFunctions"."cartBilling"(cart)->>'offerDiscount')::numeric);
    offerDiscount := offerDiscount*(coalesce(cart."offerDiscountParentShare", 0)/100);
    totalDiscount := itemTotalDiscount + offerDiscount;
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN deliveryPrice := 0;
    ELSIF cart."source" = 'a-la-carte' THEN
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        deliveryPrice := coalesce((SELECT "charge" from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId AND itemTotal >= "charge"."orderValueFrom" AND itemTotal < "charge"."orderValueUpto"), 
        (SELECT MAX("charge") from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId ));
    ELSE
        SELECT "subscriptionId" 
        FROM crm."brand_customer" 
        WHERE "brandId" = cart."brandId" 
        AND "keycloakId" = cart."customerKeycloakId" 
        INTO subscriptionId;
        SELECT "deliveryPrice" 
        FROM subscription."subscription_zipcode" 
        WHERE "subscriptionId" = subscriptionId 
        AND zipcode = cart.address->>'zipcode'
        INTO deliveryPrice;
    END IF;
    deliveryPrice := deliveryPrice*(coalesce(cart."deliveryParentShare", 0)/100);
    FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
    SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
    SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
    IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'false' THEN
        itemTotalTaxExcluded := itemTotalTaxExcluded + (((cartItemTaxBreakDown->>'taxAmount')::numeric)*((cartItem."parentShare"/100)));
    END IF;
     IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'true' THEN
        itemTotalInclusiveTax := itemTotalInclusiveTax + (((cartItemTaxBreakDown->>'taxAmount')::numeric)*((cartItem."parentShare"/100)));
    END IF;
    END LOOP;
    subTotal := itemTotal - totalDiscount + deliveryPrice;
    totalToPay := subTotal + itemTotalTaxExcluded;  
end if;
    return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartBillingForSelf"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 rewardIds int[];
 rewardId int;
 reward record;
 rangeId int;
 subscriptionId int;
 cartItemTaxBreakDown jsonb;
 cartItem "order"."cartItem";
 cartItemId int;
 parentShare numeric;
BEGIN
IF cart."parentCartId" is null then
parentShare := 0;
end if;
  -- Item total
    itemTotal := coalesce((SELECT SUM("unitPrice"*(1-(coalesce(parentShare,"parentShare")/100))) FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    itemTotalDiscount := coalesce((SELECT SUM(coalesce("discount",0)*(1-(coalesce(parentShare,"parentShare")/100))) FROM "order"."cartItem" WHERE "cartId" = cart."id"),0);
    discountedItemTotal := itemTotal - itemTotalDiscount;
offerDiscount := (select ("cartFunctions"."cartBilling"(cart)->>'offerDiscount')::numeric);
    offerDiscount := offerDiscount*(1-coalesce(cart."offerDiscountParentShare", 0)/100);
    totalDiscount := itemTotalDiscount + offerDiscount;
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN deliveryPrice := 0;
    ELSIF cart."source" = 'a-la-carte' THEN
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        deliveryPrice := coalesce((SELECT "charge" from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId AND itemTotal >= "charge"."orderValueFrom" AND itemTotal < "charge"."orderValueUpto"), 
        (SELECT MAX("charge") from "fulfilment"."charge" WHERE "charge"."mileRangeId" = rangeId ));
    ELSE
        SELECT "subscriptionId" 
        FROM crm."brand_customer" 
        WHERE "brandId" = cart."brandId" 
        AND "keycloakId" = cart."customerKeycloakId" 
        INTO subscriptionId;
        SELECT "deliveryPrice" 
        FROM subscription."subscription_zipcode" 
        WHERE "subscriptionId" = subscriptionId 
        AND zipcode = cart.address->>'zipcode'
        INTO deliveryPrice;
    END IF;
      IF cart."parentCartId" is not null then
    parentShare := cart."deliveryParentShare";
    END IF;
    deliveryPrice := deliveryPrice*(1-coalesce(parentShare, 0)/100);
    FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
    SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
    IF cart."parentCartId" is not null then
    parentShare := cartItem."parentShare";
    END IF;
    SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
    IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'false' THEN
        itemTotalTaxExcluded := itemTotalTaxExcluded + (((cartItemTaxBreakDown->>'taxAmount')::numeric)*(1-(parentShare/100)));
    END IF;
     IF (cartItemTaxBreakDown->>'isTaxIncluded') = 'true' THEN
        itemTotalInclusiveTax := itemTotalInclusiveTax + (((cartItemTaxBreakDown->>'taxAmount')::numeric)*(1-(parentShare/100)));
    END IF;
    END LOOP;
    subTotal := itemTotal - totalDiscount + deliveryPrice;
    totalToPay := subTotal + itemTotalTaxExcluded;  
    return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay);
END;
$$;
CREATE TABLE "order"."cartItem" (
    id integer DEFAULT public.defaultid('order'::text, 'cartItem'::text, 'id'::text) NOT NULL,
    "cartId" integer,
    "parentCartItemId" integer,
    "isModifier" boolean DEFAULT false NOT NULL,
    "productId" integer,
    "productOptionId" integer,
    "comboProductComponentId" integer,
    "customizableProductComponentId" integer,
    "simpleRecipeYieldId" integer,
    "sachetItemId" integer,
    "isAssembled" boolean DEFAULT false NOT NULL,
    "unitPrice" numeric DEFAULT 0 NOT NULL,
    "refundPrice" numeric DEFAULT 0 NOT NULL,
    "stationId" integer,
    "labelTemplateId" integer,
    "packagingId" integer,
    "instructionCardTemplateId" integer,
    "assemblyStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "position" numeric,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "isLabelled" boolean DEFAULT false NOT NULL,
    "isPortioned" boolean DEFAULT false NOT NULL,
    accuracy numeric DEFAULT 5,
    "ingredientSachetId" integer,
    "isAddOn" boolean DEFAULT false NOT NULL,
    "addOnLabel" text,
    "addOnPrice" numeric,
    "isAutoAdded" boolean DEFAULT false NOT NULL,
    "inventoryProductBundleId" integer,
    "subscriptionOccurenceProductId" integer,
    "subscriptionOccurenceAddOnProductId" integer,
    "packingStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "modifierOptionId" integer,
    "subRecipeYieldId" integer,
    status text DEFAULT 'PENDING'::text NOT NULL,
    "lastUpdatedBy" jsonb DEFAULT '{}'::jsonb,
    "rootCartItemId" integer,
    path text,
    level integer,
    count integer,
    "levelType" text,
    "displayName" text,
    "processingName" text,
    "operationConfigId" integer,
    "displayUnit" text,
    "displayUnitQuantity" numeric,
    "cartItemType" text,
    "displayBulkDensity" numeric,
    "productOptionType" text,
    "orderMode" text,
    "displayServing" integer,
    "ingredientId" integer,
    "ingredientProcessingId" integer,
    "bulkItemId" integer,
    "supplierItemId" integer,
    "displayImage" jsonb,
    "experienceClassId" integer,
    "experienceClassTypeId" integer,
    "parentShare" numeric DEFAULT 100 NOT NULL,
    "taxSetting" jsonb DEFAULT '{"type": "cartBased"}'::jsonb NOT NULL,
    "parentCartId" integer,
    discount numeric
);
CREATE FUNCTION "cartFunctions"."cartItemTaxBreakDown"(cartitem "order"."cartItem") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
isTaxable boolean := coalesce(cartItem."taxSetting"->>'isTaxable', 'true')::boolean;
isTaxIncluded boolean := coalesce(cartItem."taxSetting"->>'isTaxIncluded', 'false')::boolean;
taxType text := coalesce(cartItem."taxSetting"->>'taxType', 'cartBased');
taxPercentage numeric;
taxBreakdown jsonb;
taxAmount numeric;
unitPrice numeric := cartItem."unitPrice" - coalesce(cartItem."discount",0);
BEGIN
if isTaxable = false then
taxPercentage := 0;
else
taxPercentage := coalesce(cartItem."taxSetting"->>'taxPercentage', '7')::numeric;
end if;
IF isTaxIncluded = true then
select (unitPrice - unitPrice/(1+taxPercentage/100)) into taxAmount;
taxBreakDown := jsonb_build_object('taxAmount', taxAmount, 'isTaxIncluded', isTaxIncluded, 'taxPercentage', taxPercentage, 'taxType', taxType);
return taxBreakdown;
else
select unitPrice*taxPercentage/100 into taxAmount;
taxBreakDown := jsonb_build_object('taxAmount', taxAmount, 'isTaxIncluded', isTaxIncluded, 'taxPercentage', taxPercentage, 'taxType', taxType );
return taxBreakdown;
end if;
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotal"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return (SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "cartId" = cart."id");
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalExcludedTax"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalExcludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = false THEN
    totalExcludedTax := totalExcludedTax + (cartItemTaxBreakDown->>'taxAmount')::numeric;
END IF;
END LOOP;
    return coalesce(totalExcludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalExcludedTaxForChild"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalExcludedTax numeric :=0;
BEGIN
    FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "parentCartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = false THEN
    totalExcludedTax := totalExcludedTax + ((cartItemTaxBreakDown->>'taxAmount')::numeric * (cartItem."parentShare"/100));
END IF;
END LOOP;
    return coalesce(totalExcludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalExcludedTaxPaidByParent"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalExcludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = false THEN
    totalExcludedTax := totalExcludedTax + ((cartItemTaxBreakDown->>'taxAmount')::numeric * (cartItem."parentShare"/100));
END IF;
END LOOP;
    return coalesce(totalExcludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalExcludedTaxPaidBySelf"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalExcludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = false THEN
    totalExcludedTax := totalExcludedTax + ((cartItemTaxBreakDown->>'taxAmount')::numeric * (1 - cartItem."parentShare"/100));
END IF;
END LOOP;
    return coalesce(totalExcludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalForChild"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return (SELECT SUM("unitPrice"*("parentShare"/100)) FROM "order"."cartItem" WHERE "parentCartId" = cart."id");
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalIncludedTax"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalIncludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = true THEN
    totalIncludedTax := totalIncludedTax + (cartItemTaxBreakDown->>'taxAmount')::numeric;
END IF;
END LOOP;
    return coalesce(totalIncludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalIncludedTaxBorneByParent"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalIncludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = true THEN
    totalIncludedTax := totalIncludedTax + ((cartItemTaxBreakDown->>'taxAmount')::numeric * (cartItem."parentShare"/100));
END IF;
END LOOP;
    return coalesce(totalIncludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalIncludedTaxBorneBySelf"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartItemTaxBreakDown jsonb;
cartItem "order"."cartItem";
cartItemId int;
totalIncludedTax numeric :=0;
BEGIN
FOR cartItemId in SELECT "id" FROM "order"."cartItem" WHERE "cartId" = cart."id" LOOP
SELECT * INTO cartItem FROM "order"."cartItem" WHERE "id" = cartItemId;
SELECT "cartFunctions"."cartItemTaxBreakDown"(cartItem) INTO cartItemTaxBreakDown;
IF (cartItemTaxBreakDown->>'isTaxIncluded')::boolean = true THEN
    totalIncludedTax := totalIncludedTax + ((cartItemTaxBreakDown->>'taxAmount')::numeric * (1 - cartItem."parentShare"/100));
END IF;
END LOOP;
    return coalesce(totalIncludedTax,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalPaidByParent"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return (SELECT SUM("unitPrice"*("parentShare"/100)) FROM "order"."cartItem" WHERE "cartId" = cart."id");
END;
$$;
CREATE FUNCTION "cartFunctions"."cartItemTotalPaidBySelf"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return (SELECT SUM("unitPrice"*(1-"parentShare"/100)) FROM "order"."cartItem" WHERE "cartId" = cart."id");
END;
$$;
CREATE FUNCTION "cartFunctions"."cartOwnerBilling"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
 itemTotal numeric := 0;
 itemTotalDiscount numeric :=0;
 discountedItemTotal numeric :=0;
 offerDiscount numeric :=0;
 totalDiscount numeric :=0;
 deliveryPrice numeric :=0;
 subTotal numeric :=0;
 itemTotalTaxExcluded numeric :=0;
 totalToPay numeric :=0;
 balanceToPay numeric :=0;
 itemTotalInclusiveTax numeric :=0;
 childCart "order"."cart";
 cartBillingForSelf jsonb;
 cartBillingForChilds jsonb;
 walletAmountUsable numeric := 0;
 walletAmountUsed numeric := cart."walletAmountUsed";
loyaltyPointsUsable numeric := 0;
loyaltyPointsUsed  numeric:= cart."loyaltyPointsUsed";
loyaltyAmountApplied numeric := 0;
BEGIN
select "cartFunctions"."cartBillingForSelf"(cart) into cartBillingForSelf;
select "cartFunctions"."cartBillingForChilds"(cart) into cartBillingForChilds;
itemTotal := itemTotal + (cartBillingForSelf->>'itemTotal')::numeric + (cartBillingForChilds->>'itemTotal')::numeric;
itemTotalDiscount := itemTotalDiscount + (cartBillingForSelf->>'itemTotalDiscount')::numeric + (cartBillingForChilds->>'itemTotalDiscount')::numeric;
discountedItemTotal := discountedItemTotal + (cartBillingForSelf->>'discountedItemTotal')::numeric + (cartBillingForChilds->>'discountedItemTotal')::numeric;
offerDiscount := offerDiscount + (cartBillingForSelf->>'offerDiscount')::numeric + (cartBillingForChilds->>'offerDiscount')::numeric;
totalDiscount := totalDiscount + (cartBillingForSelf->>'totalDiscount')::numeric + (cartBillingForChilds->>'totalDiscount')::numeric;
deliveryPrice := deliveryPrice + (cartBillingForSelf->>'deliveryPrice')::numeric + (cartBillingForChilds->>'deliveryPrice')::numeric;
itemTotalTaxExcluded := itemTotalTaxExcluded + (cartBillingForSelf->>'itemTotalTaxExcluded')::numeric + (cartBillingForChilds->>'itemTotalTaxExcluded')::numeric;
itemTotalInclusiveTax := itemTotalInclusiveTax + (cartBillingForSelf->>'itemTotalInclusiveTax')::numeric + (cartBillingForChilds->>'itemTotalInclusiveTax')::numeric;
subTotal := subTotal + (cartBillingForSelf->>'subTotal')::numeric + (cartBillingForChilds->>'subTotal')::numeric;
totalToPay := totalToPay + (cartBillingForSelf->>'totalToPay')::numeric + (cartBillingForChilds->>'totalToPay')::numeric;
balanceToPay := round(totalToPay, 2) - cart."amount" - coalesce(walletAmountUsed,0) - coalesce(loyaltyAmountApplied,0);
return JSONB_BUILD_OBJECT('itemTotal',itemTotal, 'subTotal',subTotal, 'itemTotalDiscount',itemTotalDiscount, 'discountedItemTotal',discountedItemTotal, 'offerDiscount',offerDiscount, 'totalDiscount',totalDiscount, 'deliveryPrice',deliveryPrice, 'itemTotalTaxExcluded', itemTotalTaxExcluded, 'itemTotalInclusiveTax', itemTotalInclusiveTax, 'totalToPay', totalToPay, 'balanceToPay',balanceToPay, 'walletAmountUsed', walletAmountUsed, 'loyaltyAmountApplied', loyaltyAmountApplied );
END;
$$;
CREATE FUNCTION "cartFunctions"."cartSubTotal"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
subTotal numeric :=0;
BEGIN
    subTotal := subTotal + (SELECT "cartFunctions"."cartItemTotal"(cart));
    return coalesce(subTotal,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."cartTotalPrice"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
cartTotal numeric :=0;
subTotal numeric :=0;
cartItemTotalForChild numeric :=0;
excludedTaxPaidBySelf numeric :=0;
excludedTaxForChild numeric :=0;
BEGIN
    subTotal := (SELECT "cartFunctions"."cartSubTotal"(cart));
    cartItemTotalForChild := (SELECT "cartFunctions"."cartItemTotalForChild"(cart));
    excludedTaxPaidBySelf :=  (SELECT "cartFunctions"."cartItemTotalExcludedTaxPaidBySelf"(cart));
    excludedTaxForChild :=  (SELECT "cartFunctions"."cartItemTotalExcludedTaxForChild"(cart));
    cartTotal := subTotal + cartItemTotalForChild + excludedTaxPaidBySelf + excludedTaxForChild;
    return coalesce(cartTotal,0);
END;
$$;
CREATE FUNCTION "cartFunctions"."handleExperienceCartItemUnitPrice"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
PERFORM "cartFunctions"."resetExperiencePrice"(coalesce(New."parentCartId",Old."parentCartId"));
return null;
end;
$$;
CREATE FUNCTION "cartFunctions"."resetExperiencePrice"(cartid integer) RETURNS jsonb
    LANGUAGE plpgsql
    AS $$
DECLARE
 totalParticipants int;
 experienceclasstype "experiences"."experienceClassType";
 experienceAveragePrice numeric := 0;
BEGIN
totalParticipants :=( SELECT count(id) FROM "order"."cartItem" WHERE "experienceClassId" IS NOT NULL
    AND "parentCartId" = cartId);
SELECT * INTO experienceclasstype FROM "experiences"."experienceClassType" WHERE id = (SELECT "experienceClassTypeId" FROM "order"."cart" WHERE "id" = cartId);
SELECT  ("experiences"."priceRanges"(experienceclasstype)->'averagePriceBreak'->(totalParticipants - 1)->>'averagePrice')::numeric INTO experienceAveragePrice;
UPDATE "order"."cartItem" SET "unitPrice" = experienceAveragePrice WHERE "experienceClassId" IS NOT NULL
     AND "parentCartId" = cartId;
     return JSONB_BUILD_OBJECT('status','success');
END;
$$;
CREATE FUNCTION "cartFunctions"."unitPricePaidByParent"(cartitem "order"."cartItem") RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return cartItem."unitPrice"*(cartItem."parentShare"/100);
END;
$$;
CREATE FUNCTION "cartFunctions"."unitPricePaidBySelf"(cartitem "order"."cartItem") RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    return cartItem."unitPrice"*(1-(cartItem."parentShare"/100));
END;
$$;
CREATE FUNCTION content.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION crm."createBrandCustomer"(keycloakid text, brandid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO crm."brand_customer"("keycloakId", "brandId") VALUES(keycloakId, brandId);
END;
$$;
CREATE FUNCTION crm."createCustomer2"(keycloakid text, brandid integer, email text, clientid text) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    customerId int;
BEGIN
    INSERT INTO crm.customer("keycloakId", "email", "sourceBrandId")
    VALUES(keycloakId, email, brandId)
    RETURNING id INTO customerId;
    RETURN customerId;
END;
$$;
CREATE FUNCTION crm."createCustomerWLR"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO crm.wallet("keycloakId", "brandId") VALUES (NEW."keycloakId", NEW."brandId");
    INSERT INTO crm."loyaltyPoint"("keycloakId", "brandId") VALUES (NEW."keycloakId", NEW."brandId");
    INSERT INTO crm."customerReferral"("keycloakId", "brandId") VALUES(NEW."keycloakId", NEW."brandId");
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."deductLoyaltyPointsPostOrder"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cart record;
    amount numeric;
    loyaltyPointId int;
    setting record;
    temp record;
    rate numeric;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT * FROM "order"."cart" WHERE id = NEW."cartId" INTO cart;
    SELECT id FROM crm."loyaltyPoint" WHERE "keycloakId" = NEW."keycloakId" AND "brandId" = NEW."brandId" INTO loyaltyPointId; 
    IF cart."loyaltyPointsUsed" > 0 THEN
        SELECT crm."getLoyaltyPointsConversionRate"(NEW."brandId") INTO rate;
        amount := ROUND((cart."loyaltyPointsUsed" * rate), 2);
        INSERT INTO crm."loyaltyPointTransaction"("loyaltyPointId", "points", "orderCartId", "type", "amountRedeemed")
        VALUES (loyaltyPointId, cart."loyaltyPointsUsed", cart.id, 'DEBIT', amount);
    END IF;
    RETURN NULL;
END
$$;
CREATE FUNCTION crm."deductWalletAmountPostOrder"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cart record;
    walletId int;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT * FROM "order"."cart" WHERE id = NEW."cartId" INTO cart;
    SELECT id FROM crm."wallet" WHERE "keycloakId" = NEW."keycloakId" AND "brandId" = NEW."brandId" INTO walletId; 
    IF cart."walletAmountUsed" > 0 THEN
        INSERT INTO crm."walletTransaction"("walletId", "amount", "orderCartId", "type")
        VALUES (walletId, cart."walletAmountUsed", cart.id, 'DEBIT');
    END IF;
    RETURN NULL;
END
$$;
CREATE TABLE crm."customerData" (
    id integer NOT NULL,
    data jsonb NOT NULL
);
COMMENT ON TABLE crm."customerData" IS 'This lists all the customers data which are available in the brand.';
CREATE FUNCTION crm."getCustomer2"(keycloakid text, brandid integer, customeremail text, clientid text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    customer record;
    brandCustomer record;
    newCustomerId int;
BEGIN
    SELECT * from crm.customer WHERE "keycloakId" = keycloakId INTO customer;
    IF customer IS NULL THEN
        SELECT crm."createCustomer2"(keycloakId, brandId, customerEmail, clientId) INTO newCustomerId;
    END IF;
    SELECT * FROM crm."brand_customer" WHERE "keycloakId" = keycloakId AND "brandId" = brandId INTO brandCustomer;
    IF brandCustomer is NULL THEN
        PERFORM crm."createBrandCustomer"(keycloakId, brandId);
    END IF;
    -- SELECT * FROM crm.customer WHERE "keycloakId" = keycloakId INTO customer;
    RETURN QUERY SELECT 1 AS id, jsonb_build_object('email', customeremail) AS data;
    -- RETURN jsonb_build_object('id', COALESCE(customer.id, newCustomerId), 'email', customeremail, 'isTest', false, 'keycloakId', keycloakid);
END;
$$;
CREATE FUNCTION crm."getLoyaltyPointsConversionRate"(brandid integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
    setting record;
    temp record;
    obj jsonb;
BEGIN
    SELECT * FROM brands."storeSetting" WHERE "type" = 'rewards' and "identifier" = 'Loyalty Points Usage' INTO setting;
    SELECT * FROM brands."brand_storeSetting" WHERE "brandId" = brandid AND "storeSettingId" = setting.id INTO temp;
    -- IF temp IS NOT NULL THEN
    --     setting := temp;
    -- END IF;
    SELECT setting.value INTO obj;
    RETURN 0.01;
END
$$;
CREATE FUNCTION crm.handle_brand_customer_event_logging() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    oldTitle text;
    oldServing integer;
    oldCount integer;
    newTitle text;
    newServing integer;
    newCount integer;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Brand customer has been created',
                    'fields', '{}'::json
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isSubscriber" != NEW."isSubscriber" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN NEW."isSubscriber" = true THEN 'Brand customer has been subscribed.' ELSE 'Brand customer has been unsubscribed.' END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                        'isSubscriber', OLD."isSubscriber",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                        'isSubscriber', NEW."isSubscriber",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."subscriptionId" != NEW."subscriptionId" THEN
        IF OLD."subscriptionId" IS NULL THEN
            SELECT title INTO newTitle FROM subscription."subscriptionTitle" WHERE id = (SELECT "subscriptionTitleId" from subscription.subscription WHERE id = NEW."subscriptionId");
            SELECT "servingSize" INTO newServing FROM subscription."subscriptionServing" WHERE id = (SELECT "subscriptionServingId" from subscription.subscription WHERE id = NEW."subscriptionId");
            SELECT count INTO newCount FROM subscription."subscriptionItemCount" WHERE id = (SELECT "subscriptionItemCountId" from subscription.subscription WHERE id = NEW."subscriptionId");
        ELSE
            SELECT title INTO oldTitle FROM subscription."subscriptionTitle" WHERE id = (SELECT "subscriptionTitleId" from subscription.subscription WHERE id = OLD."subscriptionId");
            SELECT "servingSize" INTO oldServing FROM subscription."subscriptionServing" WHERE id = (SELECT "subscriptionServingId" from subscription.subscription WHERE id = OLD."subscriptionId");
            SELECT count INTO oldCount FROM subscription."subscriptionItemCount" WHERE id = (SELECT "subscriptionItemCountId" from subscription.subscription WHERE id = OLD."subscriptionId");
            SELECT title INTO newTitle FROM subscription."subscriptionTitle" WHERE id = (SELECT "subscriptionTitleId" from subscription.subscription WHERE id = NEW."subscriptionId");
            SELECT "servingSize" INTO newServing FROM subscription."subscriptionServing" WHERE id = (SELECT "subscriptionServingId" from subscription.subscription WHERE id = NEW."subscriptionId");
            SELECT count INTO newCount FROM subscription."subscriptionItemCount" WHERE id = (SELECT "subscriptionItemCountId" from subscription.subscription WHERE id = NEW."subscriptionId");
        END IF;
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN OLD."subscriptionId" IS NULL THEN CONCAT('Brand customer has subscribed to ', newTitle, ', serves ', newServing, ', count ', newCount) ELSE CONCAT('Brand customer changed plan from ', oldTitle, ', serves ', oldServing, ', count ', oldCount, ' to ', newTitle, ', serves ', newServing, ', count ', newCount) END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'subscriptionId', OLD."subscriptionId",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'subscriptionId', NEW."subscriptionId",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."subscriptionAddressId" != NEW."subscriptionAddressId" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN OLD."subscriptionAddressId" IS NULL THEN CONCAT('Brand customer has set default address to ', NEW."subscriptionAddressId") ELSE CONCAT('Brand customer changed address from ', OLD."subscriptionAddressId", ' to ', NEW."subscriptionAddressId") END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'subscriptionAddressId', OLD."subscriptionAddressId",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'subscriptionAddressId', NEW."subscriptionAddressId",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."subscriptionPaymentMethodId" != NEW."subscriptionPaymentMethodId" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN OLD."subscriptionPaymentMethodId" IS NULL THEN CONCAT('Brand customer has set default payment method to ', NEW."subscriptionPaymentMethodId") ELSE CONCAT('Brand customer changed default payment method from ', OLD."subscriptionPaymentMethodId", ' to ', NEW."subscriptionPaymentMethodId") END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'subscriptionPaymentMethodId', OLD."subscriptionPaymentMethodId",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'subscriptionPaymentMethodId', NEW."subscriptionPaymentMethodId",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isAutoSelectOptOut" != NEW."isAutoSelectOptOut" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN OLD."isAutoSelectOptOut" = true THEN 'Brand customer has opted out of auto select products.' ELSE 'Brand customer has opted into auto select products.' END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'isAutoSelectOptOut', OLD."isAutoSelectOptOut",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'isAutoSelectOptOut', NEW."isAutoSelectOptOut",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."subscriptionOnboardStatus" != NEW."subscriptionOnboardStatus" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', CONCAT('Brand customer onboarding status has been moved from ', OLD."subscriptionOnboardStatus", ' to ', NEW."subscriptionOnboardStatus"),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'subscriptionOnboardStatus', OLD."subscriptionOnboardStatus",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'subscriptionOnboardStatus', NEW."subscriptionOnboardStatus",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isSubscriptionCancelled" != NEW."isSubscriptionCancelled" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN NEW."isSubscriptionCancelled" = true THEN 'Brand customer has cancelled subscription.' ELSE 'Brand customer has resumed subscription.' END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'isSubscriptionCancelled', OLD."isSubscriptionCancelled",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'isSubscriptionCancelled', NEW."isSubscriptionCancelled",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."pausePeriod" != NEW."pausePeriod" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                NEW.id,
                NEW."keycloakId",
                'Brand Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN NEW."pausePeriod" = '{}' THEN 'Brand customer has cleared their pause period.' ELSE CONCAT('Brand customer has paused their subscription from ', NEW."pausePeriod"->'startDate', ' to ', NEW."pausePeriod"->'endDate') END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'pausePeriod', OLD."pausePeriod",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                            'pausePeriod', NEW."pausePeriod",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'DELETE' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId", "keycloakId", type, updated_by, log) 
            VALUES (
                OLD.id,
                OLD."keycloakId",
                'Brand Customer',
                OLD."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Brand customer has been deleted.',
                    'fields', '{}'::json
                )
            );
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm.hasura_scheduled_event_on_new_brand_customer() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 touchpoint_identifier text := 'tpi_new_brand_customer';
 brand_touchpoint record;
 eventid text;
 customer_email text;
BEGIN
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier;    
    IF brand_touchpoint."isActive" is true then
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = New."keycloakId" and "sourceBrandId" = New."brandId";
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', NEW."brandId", 'includeHeader',true, 'includeFooter', true,'brandCustomerId', New."id")) into eventid;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TABLE crm.campaign (
    id integer DEFAULT public.defaultid('crm'::text, 'campaign'::text, 'id'::text) NOT NULL,
    type text NOT NULL,
    "metaDetails" jsonb,
    "conditionId" integer,
    "isRewardMulti" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    priority integer DEFAULT 1 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE crm.campaign IS 'This table contains all the campaigns across the system.';
COMMENT ON COLUMN crm.campaign.id IS 'Auto generated id for the campaign table row.';
COMMENT ON COLUMN crm.campaign.type IS 'A campaign can be of many types, differentiating how they are implemented. This type here refers to that. The value in this should come from the campaignType table.';
COMMENT ON COLUMN crm.campaign."metaDetails" IS 'This jsonb value contains all the meta details like title, description and picture for this campaign.';
COMMENT ON COLUMN crm.campaign."conditionId" IS 'This represents the rule condition that would be checked for trueness before considering this campaign for implementation for rewards.';
COMMENT ON COLUMN crm.campaign."isRewardMulti" IS 'A campaign could have many rewards. If this is true, that means that all the valid rewards would be applied to the transaction. If false, it would pick the valid reward with highest priority.';
COMMENT ON COLUMN crm.campaign."isActive" IS 'Whether this campaign is active or not.';
COMMENT ON COLUMN crm.campaign."isArchived" IS 'Marks the deletion of campaign if user attempts to delete it.';
CREATE FUNCTION crm.iscampaignvalid(campaign crm.campaign) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res json;
    temp int;
BEGIN
    SELECT COUNT(*) FROM crm."reward" WHERE "campaignId" = campaign."id" LIMIT 1 into temp;
    IF campaign."conditionId" IS NULL AND temp < 1
        THEN res := json_build_object('status', false, 'error', 'Campaign Condition Or Reward not provided');
    ELSEIF campaign."conditionId" IS NULL
        THEN res := json_build_object('status', false, 'error', 'Campaign Condition not provided');
    ELSEIF temp < 1
        THEN res := json_build_object('status', false, 'error', 'Reward not provided');
    ELSEIF campaign."metaDetails"->'description' IS NULL OR coalesce(TRIM(campaign."metaDetails"->>'description'), '')= ''
        THEN res := json_build_object('status', false, 'error', 'Description not provided');
    ELSE
        res := json_build_object('status', true, 'error', '');
    END IF;
    RETURN res;
END
$$;
CREATE TABLE crm.coupon (
    id integer DEFAULT public.defaultid('crm'::text, 'coupon'::text, 'id'::text) NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "metaDetails" jsonb,
    code text NOT NULL,
    "isRewardMulti" boolean DEFAULT false NOT NULL,
    "visibleConditionId" integer,
    "isVoucher" boolean DEFAULT false NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "couponStartTimeStamp" timestamp without time zone,
    "couponEndTimeStamp" timestamp without time zone
);
COMMENT ON TABLE crm.coupon IS 'This table contains all the coupons across the system.';
COMMENT ON COLUMN crm.coupon.id IS 'Auto generated id for the coupon table row.';
COMMENT ON COLUMN crm.coupon."isActive" IS 'Whether this coupon is active or not.';
COMMENT ON COLUMN crm.coupon."metaDetails" IS 'This jsonb value contains all the meta details like title, description and picture for this coupon.';
COMMENT ON COLUMN crm.coupon."isRewardMulti" IS 'A coupon could have many rewards. If this is true, that means that all the valid rewards would be applied to the transaction. If false, it would pick the valid reward with highest priority.';
COMMENT ON COLUMN crm.coupon."visibleConditionId" IS 'This represents the rule condition that would be checked for trueness before showing the coupon in the store. Please note that this condition doesn''t check if reward is valid or not but strictly just maintains the visibility of the coupon.';
COMMENT ON COLUMN crm.coupon."isArchived" IS 'Marks the deletion of coupon if user attempts to delete it.';
CREATE FUNCTION crm.iscouponvalid(coupon crm.coupon) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res json;
    temp int;
BEGIN
    SELECT COUNT(*) FROM crm."reward" WHERE "couponId" = coupon."id" into temp;
    IF coupon."visibleConditionId" IS NULL AND temp < 1
        THEN res := json_build_object('status', false, 'error', 'Coupon Condition Or Reward not provided');
    ELSEIF coupon."visibleConditionId" IS NULL
        THEN res := json_build_object('status', false, 'error', 'Coupon Condition not provided');
    ELSEIF temp < 1
        THEN res := json_build_object('status', false, 'error', 'Reward not provided');
    ELSEIF coupon."metaDetails"->'title' IS NULL OR coalesce(TRIM(coupon."metaDetails"->>'title'), '')= ''
        THEN res := json_build_object('status', false, 'error', 'Title not provided');
    ELSEIF coupon."metaDetails"->'description' IS NULL OR coalesce(TRIM(coupon."metaDetails"->>'description'), '')= ''
        THEN res := json_build_object('status', false, 'error', 'Description not provided');
    ELSE
        res := json_build_object('status', true, 'error', '');
    END IF;
    RETURN res;
END
$$;
CREATE FUNCTION crm."postOrderCampaignRewardsTriggerFunction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    params jsonb;
    rewardsParams jsonb;
    campaign record;
    condition record;
    campaignValidity boolean := false;
    rewardValidity boolean;
    reward record;
    rewardIds int[] DEFAULT '{}';
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    params := jsonb_build_object('keycloakId', NEW."keycloakId", 'orderId', NEW.id::int, 'cartId', NEW."cartId", 'brandId', NEW."brandId");
    FOR campaign IN SELECT * FROM crm."campaign" WHERE id IN (SELECT "campaignId" FROM crm."brand_campaign" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true) AND "isActive" = true AND "type" = 'Post Order' ORDER BY priority DESC, updated_at DESC LOOP
        params := params || jsonb_build_object('campaignType', campaign."type", 'table', TG_TABLE_NAME, 'campaignId', campaign.id, 'rewardId', null);
        SELECT rules."isConditionValidFunc"(campaign."conditionId", params) INTO campaignValidity;
        IF campaignValidity = false THEN
            CONTINUE;
        END IF;
        FOR reward IN SELECT * FROM crm.reward WHERE "campaignId" = campaign.id ORDER BY position DESC LOOP
            params := params || jsonb_build_object('rewardId', reward.id);
            SELECT rules."isConditionValidFunc"(reward."conditionId", params) INTO rewardValidity;
            IF rewardValidity = true THEN
                rewardIds := rewardIds || reward.id;
                IF campaign."isRewardMulti" = false THEN
                    EXIT;
                END IF;
            END IF;
        END LOOP;
        IF array_length(rewardIds, 1) > 0 THEN
            rewardsParams := params || jsonb_build_object('campaignType', campaign."type");
            PERFORM crm."processRewardsForCustomer"(rewardIds, rewardsParams);
        END IF;
    END LOOP;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."postOrderCouponRewards"() RETURNS trigger
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    rec record;
    reward record;
    rewardIds int[];
    params jsonb;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    params := jsonb_build_object('keycloakId', NEW."keycloakId", 'orderId', NEW.id, 'cartId', NEW."cartId", 'brandId', NEW."brandId", 'campaignType', 'Post Order');
    FOR rec IN SELECT * FROM "order"."cart_rewards" WHERE "cartId" = NEW."cartId" LOOP
        SELECT * FROM crm.reward WHERE id = rec."rewardId" INTO reward;
        IF reward."type" = 'Loyalty Point Credit' OR reward."type" = 'Wallet Amount Credit' THEN
            rewardIds := rewardIds || reward.id;
        END IF;
        rewardIds := rewardIds || rec."rewardId";
    END LOOP;
    IF array_length(rewardIds, 1) > 0 THEN
        PERFORM crm."processRewardsForCustomer"(rewardIds, params);
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."processLoyaltyPointTransaction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW."type" = 'CREDIT'
        THEN
        UPDATE crm."loyaltyPoint"
        SET points = points + NEW.points
        WHERE id = NEW."loyaltyPointId";
    ELSE
        UPDATE crm."loyaltyPoint"
        SET points = points - NEW.points
        WHERE id = NEW."loyaltyPointId";
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."processRewardsForCustomer"(rewardids integer[], params jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    reward record;
    loyaltyPointId int;
    walletId int;
    pointsToBeCredited int;
    amountToBeCredited numeric;
    cartAmount numeric;
    returnedId int;
BEGIN
    FOR reward IN SELECT * FROM crm.reward WHERE id = ANY(rewardIds) LOOP
        IF reward."type" = 'Loyalty Point Credit' THEN 
            SELECT id FROM crm."loyaltyPoint" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO loyaltyPointId;
            IF loyaltyPointId IS NOT NULL THEN
                IF reward."rewardValue"->>'type' = 'absolute' THEN
                    SELECT (reward."rewardValue"->>'value')::int INTO pointsToBeCredited;
                ELSIF reward."rewardValue"->>'type' = 'conditional' THEN
                    SELECT "amount" FROM "order"."cart" WHERE id = (params->'cartId')::int INTO cartAmount;
                    pointsToBeCredited := ROUND(cartAmount * ((reward."rewardValue"->'value'->'percentage')::numeric / 100));
                    IF pointsToBeCredited > (reward."rewardValue"->'value'->'max')::numeric THEN
                        pointsToBeCredited := (reward."rewardValue"->'value'->'max')::numeric;
                    END IF;
                ELSE
                    CONTINUE;
                END IF;
                INSERT INTO crm."loyaltyPointTransaction" ("loyaltyPointId", "points", "type")VALUES(loyaltyPointId, pointsToBeCredited, 'CREDIT') RETURNING id INTO returnedId;
                IF reward."couponId" IS NOT NULL THEN
                    INSERT INTO crm."rewardHistory"("rewardId", "couponId", "keycloakId", "orderCartId", "orderId", "loyaltyPointTransactionId", "loyaltyPoints", "brandId")
                    VALUES(reward.id, reward."couponId", params->>'keycloakId', (params->>'cartId')::int, (params->>'orderId')::int, returnedId, pointsToBeCredited, (params->>'brandId')::int);
                ELSE
                    INSERT INTO crm."rewardHistory"("rewardId", "campaignId", "keycloakId", "orderCartId", "orderId", "loyaltyPointTransactionId", "loyaltyPoints", "brandId")
                    VALUES(reward.id, reward."campaignId", params->>'keycloakId', (params->>'cartId')::int, (params->>'orderId')::int, returnedId, pointsToBeCredited, (params->>'brandId')::int);
                END IF;
            END IF;
        ELSIF reward."type" = 'Wallet Amount Credit' THEN
            SELECT id FROM crm."wallet" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO walletId;
            IF walletId IS NOT NULL THEN
                IF reward."rewardValue"->>'type' = 'absolute' THEN 
                    SELECT (reward."rewardValue"->>'value')::int INTO amountToBeCredited;
                ELSIF reward."rewardValue"->>'type' = 'conditional' THEN
                    SELECT "amount" FROM "order"."cart" WHERE id = (params->'cartId')::int INTO cartAmount;
                    amountToBeCredited := ROUND(cartAmount * ((reward."rewardValue"->'value'->'percentage')::numeric / 100), 2);
                    IF amountToBeCredited > (reward."rewardValue"->'value'->'max')::numeric THEN
                        amountToBeCredited := (reward."rewardValue"->'value'->'max')::numeric;
                    END IF;
                ELSE
                    CONTINUE;
                END IF;
                INSERT INTO crm."walletTransaction" ("walletId", "amount", "type") VALUES(walletId, amountToBeCredited, 'CREDIT') RETURNING id INTO returnedId;
                IF reward."couponId" IS NOT NULL THEN
                    INSERT INTO crm."rewardHistory"("rewardId", "couponId", "keycloakId", "orderCartId", "orderId", "walletTransactionId", "walletAmount", "brandId")
                    VALUES(reward.id, reward."couponId", params->>'keycloakId', (params->>'cartId')::int, (params->>'orderId')::int, returnedId, amountToBeCredited, (params->>'brandId')::int);
                ELSE
                    INSERT INTO crm."rewardHistory"("rewardId", "campaignId", "keycloakId", "orderCartId", "orderId", "walletTransactionId", "walletAmount", "brandId")
                    VALUES(reward.id, reward."campaignId", params->>'keycloakId', (params->>'cartId')::int, (params->>'orderId')::int, returnedId, amountToBeCredited, (params->>'brandId')::int);
                END IF;
            END IF;
        ELSIF reward."type" = 'Discount' THEN
            IF reward."couponId" IS NOT NULL THEN
                INSERT INTO crm."rewardHistory"("rewardId", "couponId", "keycloakId", "orderCartId", "orderId", "discount", "brandId")
                VALUES(reward.id, reward."couponId", params->>'keycloakId', (params->>'cartId')::int, (params->>'orderId')::int, (SELECT "couponDiscount" FROM "order"."cart" WHERE id = (params->>'cartId')::int), (params->>'brandId')::int);
            END IF;
        ELSE
            CONTINUE;
        END IF; 
    END LOOP;
END;
$$;
CREATE FUNCTION crm."processWalletTransaction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW."type" = 'CREDIT'
        THEN
        UPDATE crm."wallet"
        SET amount = amount + NEW.amount
        WHERE id = NEW."walletId";
    ELSE
        UPDATE crm."wallet"
        SET amount = amount - NEW.amount
        WHERE id = NEW."walletId";
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."referralCampaignRewardsTriggerFunction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    params jsonb;
    rewardsParams jsonb;
    campaign record;
    condition record;
    referrerKeycloakId text;
    campaignValidity boolean := false;
    rewardValidity boolean;
    reward record;
    rewardIds int[] DEFAULT '{}';
    referral record;
    referralRewardGiven boolean := false;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    IF TG_TABLE_NAME = 'customerReferral' THEN
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'brandId', NEW."brandId");
        SELECT "keycloakId" FROM crm."customerReferral" WHERE "referralCode" = NEW."referredByCode" INTO referrerKeycloakId;
    ELSIF TG_TABLE_NAME = 'order' THEN
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'orderId', NEW.id::int, 'cartId', NEW."cartId", 'brandId', NEW."brandId");
        SELECT "keycloakId" FROM crm."customerReferral" WHERE "referralCode" = (SELECT "referredByCode" FROM crm."customerReferral" WHERE "keycloakId" = NEW."keycloakId" AND "brandId" = NEW."brandId") INTO referrerKeycloakId;
    ELSE 
        RETURN NULL;
    END IF;
    SELECT * FROM crm."customerReferral" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO referral;
    IF referral."referralStatus" = 'COMPLETED' THEN
        RETURN NULL;
    END IF;
    FOR campaign IN SELECT * FROM crm."campaign" WHERE id IN (SELECT "campaignId" FROM crm."brand_campaign" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true) AND "isActive" = true AND "type" = 'Referral' ORDER BY priority DESC, updated_at DESC LOOP
        params := params || jsonb_build_object('campaignType', campaign."type", 'table', TG_TABLE_NAME, 'campaignId', campaign.id, 'rewardId', null);
        SELECT * FROM crm."customerReferral" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO referral;
        IF referral."referralStatus" = 'COMPLETED' OR referralRewardGiven = true THEN
            CONTINUE;
        END IF;
        SELECT rules."isConditionValidFunc"(campaign."conditionId", params) INTO campaignValidity;
        IF campaignValidity = false THEN
            CONTINUE;
        END IF;
        FOR reward IN SELECT * FROM crm.reward WHERE "campaignId" = campaign.id ORDER BY position DESC LOOP
            params := params || jsonb_build_object('rewardId', reward.id);
            SELECT rules."isConditionValidFunc"(reward."conditionId", params) INTO rewardValidity;
            IF rewardValidity = true THEN
                IF reward."rewardValue"->>'type' = 'absolute' OR (reward."rewardValue"->>'type' = 'conditional' AND params->'cartId' IS NOT NULL) THEN
                    rewardIds := rewardIds || reward.id;
                    IF campaign."isRewardMulti" = false THEN
                        EXIT;
                    END IF;
                END IF;
            END IF;
        END LOOP;
        IF array_length(rewardIds, 1) > 0 THEN
            rewardsParams := params || jsonb_build_object('campaignType', campaign."type", 'keycloakId', referrerKeycloakId);
            PERFORM crm."processRewardsForCustomer"(rewardIds, rewardsParams);
            --  create  reward history
            --  trigger -> processRewardForCusotmer
            UPDATE crm."customerReferral"
            SET "referralCampaignId" = campaign.id, "referralStatus" = 'COMPLETED'
            WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int;
            referralRewardGiven := true;
        END IF;
    END LOOP;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."rewardsTriggerFunction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    params jsonb;
    rewardsParams jsonb;
    campaign record;
    condition record;
    campaignType text;
    referrerKeycloakId text;
    campaignValidity boolean := false;
    rewardValidity boolean;
    finalRewardValidity boolean := false;
    reward record;
    rewardIds int[] DEFAULT '{}';
    cartId int;
    referral record;
    postOrderRewardGiven boolean := false;
    signupRewardGiven boolean := false;
    referralRewardGiven boolean := false;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    IF TG_TABLE_NAME = 'customerReferral' THEN
        -- no role of cart in referral
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'brandId', NEW."brandId");
        SELECT "keycloakId" FROM crm."customerReferral" WHERE "referralCode" = NEW."referredByCode" INTO referrerKeycloakId;
    ELSIF TG_TABLE_NAME = 'order' THEN
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'orderId', NEW.id::int, 'cartId', NEW."cartId", 'brandId', NEW."brandId");
    ELSE 
        RETURN NULL;
    END IF;
    FOR campaign IN SELECT * FROM crm."campaign" WHERE id IN (SELECT "campaignId" FROM crm."brand_campaign" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true) ORDER BY priority DESC, updated_at DESC LOOP
        params := params || jsonb_build_object('campaignType', campaign."type", 'table', TG_TABLE_NAME, 'campaignId', campaign.id, 'rewardId', null);
        IF campaign."isActive" = false THEN
            -- isActive flag isn't working in query
            CONTINUE;
        END IF;
        SELECT * FROM crm."customerReferral" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO referral;
        IF campaign."type" = 'Sign Up' AND (referral."signupStatus" = 'COMPLETED' OR signupRewardGiven = true) THEN
            CONTINUE;
        END IF;
        IF campaign."type" = 'Referral' AND (referral."referralStatus" = 'COMPLETED' OR referralRewardGiven = true OR referral."referredByCode" IS NULL OR referrerKeycloakId IS NULL) THEN
            CONTINUE;
        END IF;
        IF campaign."type" = 'Post Order' AND (params->>'cartId' IS NULL OR postOrderRewardGiven = true) THEN
            CONTINUE;
        END IF;
        SELECT rules."isConditionValidFunc"(campaign."conditionId", params) INTO campaignValidity;
        IF campaignValidity = false THEN
            CONTINUE;
        END IF;
        FOR reward IN SELECT * FROM crm.reward WHERE "campaignId" = campaign.id ORDER BY priority DESC LOOP
            params := params || jsonb_build_object('rewardId', reward.id);
            SELECT rules."isConditionValidFunc"(reward."conditionId", params) INTO rewardValidity;
            IF rewardValidity = true THEN
                rewardIds := rewardIds || reward.id;
                IF campaign."isRewardMulti" = false THEN
                    finalRewardValidity := finalRewardValidity OR rewardValidity;
                    EXIT;
                END IF;
            END IF;
            finalRewardValidity := finalRewardValidity OR rewardValidity;
        END LOOP;
        IF finalRewardValidity = true AND array_length(rewardIds, 1) > 0 THEN
            rewardsParams := params || jsonb_build_object('campaignType', campaign."type");
            IF campaign."type" = 'Referral' THEN
                -- reward should be given to referrer
                rewardsParams := params || jsonb_build_object('keycloakId', referrerKeycloakId);
            END IF;
            PERFORM crm."processRewardsForCustomer"(rewardIds, rewardsParams);
            IF campaign."type" = 'Sign Up' THEN
                UPDATE crm."customerReferral"
                SET "signupCampaignId" = campaign.id, "signupStatus" = 'COMPLETED'
                WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int;
                signupRewardGiven := true;
            ELSIF campaign."type" = 'Referral' THEN
                UPDATE crm."customerReferral"
                SET "referralCampaignId" = campaign.id, "referralStatus" = 'COMPLETED'
                WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int;
                referralRewardGiven := true;
            ELSIF campaign."type" = 'Post Order' THEN
                postOrderRewardGiven := true;
            ELSE
                CONTINUE;
            END IF;
        END IF;
    END LOOP;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."setLoyaltyPointsUsedInCart"(cartid integer, points integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE "order"."cart"
    SET "loyaltyPointsUsed" = points
    WHERE id = cartid;
END
$$;
CREATE TABLE public.response (
    success boolean NOT NULL,
    message text NOT NULL
);
CREATE FUNCTION crm."setReferralCode"(params jsonb) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    rec record;
    kId text;
    code text;
    success boolean := true;
    message text := 'Referral code applied!';
BEGIN
    SELECT "referredByCode" FROM  crm."customerReferral" WHERE "referralCode" = (params->>'referralCode')::text AND "brandId" = (params->>'brandId')::int INTO code;
    IF code IS NOT NULL THEN
        -- case when code is already applied
        success := false;
        message := 'Referral code already applied!';
    ELSE
        IF params->>'input' LIKE '%@%' THEN 
            SELECT "keycloakId" FROM crm.customer WHERE email = params->>'input' INTO kId;
            SELECT * FROM crm.brand_customer WHERE "keycloakId" = kId AND "brandId" = (params->>'brandId')::int INTO rec;
            IF rec IS NULL THEN
                success := false;
                message := 'Incorrect email!';
            END IF;
            IF kId IS NOT NULL THEN
                SELECT "referralCode" FROM crm."customerReferral" WHERE "keycloakId" = kId AND "brandId" = (params->>'brandId')::int INTO code;
                IF code IS NOT NULL AND code != params->>'referralCode' THEN
                    PERFORM "crm"."updateReferralCode"((params->>'referralCode')::text, code::text);
                ELSE
                    success := false;
                    message := 'Incorrect email!';
                END IF;
            ELSE
                success := false;
                message := 'Incorrect email!';
            END IF;
        ELSE
            SELECT "referralCode" FROM crm."customerReferral" WHERE "referralCode" = (params->>'input')::text AND "brandId" = (params->>'brandId')::int INTO code;
            IF code is NOT NULL AND code != params->>'referralCode' THEN
                PERFORM "crm"."updateReferralCode"((params->>'referralCode')::text, code::text);
            ELSE
                success := false;
                message := 'Incorrect referral code!';
            END IF;
        END IF;
    END IF;
    RETURN QUERY SELECT success AS success, message AS message;
END;
$$;
CREATE FUNCTION crm."setWalletAmountUsedInCart"(cartid integer, validamount numeric) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE "order"."cart"
    SET "walletAmountUsed" = validAmount
    WHERE id = cartId;
END
$$;
CREATE FUNCTION crm.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION crm."signUpCampaignRewardsTriggerFunction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    params jsonb;
    rewardsParams jsonb;
    campaign record;
    condition record;
    referrerKeycloakId text;
    campaignValidity boolean := false;
    rewardValidity boolean;
    reward record;
    rewardIds int[] DEFAULT '{}';
    referral record;
    signupRewardGiven boolean := false;
BEGIN
    IF NEW."keycloakId" IS NULL THEN
        RETURN NULL;
    END IF;
    IF TG_TABLE_NAME = 'customerReferral' THEN
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'brandId', NEW."brandId");
        SELECT "keycloakId" FROM crm."customerReferral" WHERE "referralCode" = NEW."referredByCode" INTO referrerKeycloakId;
    ELSIF TG_TABLE_NAME = 'order' THEN
        params := jsonb_build_object('keycloakId', NEW."keycloakId", 'orderId', NEW.id::int, 'cartId', NEW."cartId", 'brandId', NEW."brandId");
    ELSE 
        RETURN NULL;
    END IF;
    SELECT * FROM crm."customerReferral" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO referral;
    IF referral."signupStatus" = 'COMPLETED' THEN
        RETURN NULL;
    END IF;
    FOR campaign IN SELECT * FROM crm."campaign" WHERE id IN (SELECT "campaignId" FROM crm."brand_campaign" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true) AND "isActive" = true AND "type" = 'Sign Up' ORDER BY priority DESC, updated_at DESC LOOP
        params := params || jsonb_build_object('campaignType', campaign."type", 'table', TG_TABLE_NAME, 'campaignId', campaign.id, 'rewardId', null);
        SELECT * FROM crm."customerReferral" WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int INTO referral;
        IF referral."signupStatus" = 'COMPLETED' OR signupRewardGiven = true THEN
            CONTINUE;
        END IF;
        SELECT rules."isConditionValidFunc"(campaign."conditionId", params) INTO campaignValidity;
        IF campaignValidity = false THEN
            CONTINUE;
        END IF;
        FOR reward IN SELECT * FROM crm.reward WHERE "campaignId" = campaign.id ORDER BY position DESC LOOP
            params := params || jsonb_build_object('rewardId', reward.id);
            SELECT rules."isConditionValidFunc"(reward."conditionId", params) INTO rewardValidity;
            IF rewardValidity = true THEN
                IF reward."rewardValue"->>'type' = 'absolute' OR (reward."rewardValue"->>'type' = 'conditional' AND params->'cartId' IS NOT NULL) THEN
                    rewardIds := rewardIds || reward.id;
                    IF campaign."isRewardMulti" = false THEN
                        EXIT;
                    END IF;
                END IF;
            END IF;
        END LOOP;
        IF array_length(rewardIds, 1) > 0 THEN
            rewardsParams := params || jsonb_build_object('campaignType', campaign."type");
            PERFORM crm."processRewardsForCustomer"(rewardIds, rewardsParams);
            UPDATE crm."customerReferral"
            SET "signupCampaignId" = campaign.id, "signupStatus" = 'COMPLETED'
            WHERE "keycloakId" = params->>'keycloakId' AND "brandId" = (params->>'brandId')::int;
            signupRewardGiven := true;
        END IF;
    END LOOP;
    RETURN NULL;
END;
$$;
CREATE FUNCTION crm."updateBrand_customer"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   UPDATE "crm"."brand_customer"
SET "subscriptionTitleId" = (select "subscriptionTitleId" from "subscription"."subscription" where id = NEW."subscriptionId"),
"subscriptionServingId" = (select "subscriptionServingId" from "subscription"."subscription" where id = NEW."subscriptionId"),
"subscriptionItemCountId" = (select "subscriptionItemCountId" from "subscription"."subscription" where id = NEW."subscriptionId")
WHERE id = NEW.id;
    RETURN null;
END;
$$;
CREATE FUNCTION crm."updateReferralCode"(referralcode text, referredbycode text) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE crm."customerReferral"
    SET "referredByCode" = referredByCode
    WHERE "referralCode" = referralCode;
END;
$$;
CREATE FUNCTION crm.updateissubscribertimestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF NEW."isSubscriber" = true and old."isSubscriber" = false THEN
    update "crm"."brand_customer" set "isSubscriberTimeStamp" = now();
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION datahub_schema."createHasuraScheduledEventForEmailTouchPoint"(scheduledtime timestamp with time zone, var_payload jsonb) RETURNS text
    LANGUAGE plpgsql
    AS $$
declare
eventid text;
BEGIN
INSERT into "hdb_catalog"."hdb_scheduled_events" ("webhook_conf", "scheduled_time", retry_conf, payload, header_conf)
values ('"https://testhern.dailykit.org/server/webhook/email-template-handler"', scheduledTime, '{
    "num_retries": 0,
    "retry_interval_seconds": 10,
    "timeout_seconds": 60,
    "tolerance_seconds": 21600
}', "var_payload", '[]') returning id into eventid;
return eventid;
END;
$$;
CREATE FUNCTION developer."handleIsActiveForWebhookEvent"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
isactive boolean;
BEGIN
IF TG_OP = 'DELETE' then
if 
(select count("availableWebhookEventId") from "developer"."webhookUrl_events" 
where "availableWebhookEventId" = old."availableWebhookEventId") = 0
then
update "developer"."availableWebhookEvent"
set "isActive" = false where id = old."availableWebhookEventId";
end if;
else
select "isActive" from "developer"."availableWebhookEvent" where id = NEW."availableWebhookEventId" into isactive;
IF isactive = false then
update "developer"."availableWebhookEvent"
set "isActive" = true where id = NEW."availableWebhookEventId";
END IF;
end if;
RETURN NULL;
END
$$;
CREATE FUNCTION developer."handleProcessedWebhookEventsByUrl"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE 
    webhookUrl_event "developer"."webhookUrl_events";
    webhookUrlId record;
    url text;
BEGIN
FOR webhookUrl_event in (SELECT * from "developer"."webhookUrl_events" where "availableWebhookEventId" = NEW."availableWebhookEventId")
loop
INSERT into "developer"."processedWebhookEventsByUrl" ("processedWebhookEventsId", "webhookUrl_eventsId", "urlEndPoint", "attemptedTime") 
values(
NEW.id, 
webhookUrl_event."id", 
(select "urlEndpoint" from "developer"."webhookUrl" where id = webhookUrl_event."webhookUrlId"), 
0)
;
end loop;
RETURN Null;
END
$$;
CREATE FUNCTION developer."manageHasuraEventsForWebhooks"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
IF NEW."isActive" = true and old."isActive" = false then
insert into "hdb_catalog"."event_triggers" (
"name", "type", "schema_name", "table_name", "configuration", "comment"
) values (
NEW."hasuraEventRowData"->>'name',
'table',
NEW."hasuraEventRowData"->>'schemaName',
NEW."hasuraEventRowData"->>'tableName',
NEW."hasuraEventRowData"->'configuration',
NEW."hasuraEventRowData"->>'comment'
);
else if NEW."isActive" = false and old."isActive" = true
then
delete from "hdb_catalog"."event_triggers" where "name" = NEW."hasuraEventRowData"->>'name';
end if;
end if;
RETURN NULL;
END
$$;
CREATE FUNCTION developer.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION developer."updateProcessedWebhookEventsByUrl"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
getStatus integer;
BEGIN
SELECT "Response"->>'status' FROM "developer"."webhookUrl_EventsLog" where id=NEW."id" into getStatus;
UPDATE "developer"."processedWebhookEventsByUrl" SET "attemptedTime"="attemptedTime"+1, "statusCode"=getStatus, "response"=NEW."Response"  WHERE id=NEW."processedWebhookEventsByUrlId";
RETURN Null;
END
$$;
CREATE FUNCTION "deviceHub".set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE editor."priorityFuncTable" (
    id integer NOT NULL
);
CREATE FUNCTION editor."HandlePriority4"(arg jsonb) RETURNS SETOF editor."priorityFuncTable"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
    currentdata jsonb;
    datalist jsonb :='[]';
    tablenameinput text;
    schemanameinput text;
    currentdataid int;
    currentdataposition numeric;
    columnToBeUpdated text;
BEGIN
    datalist := arg->>'data1';
    schemanameinput := arg->>'schemaname';
    tablenameinput := arg->>'tablename';
    columnToBeUpdated := COALESCE(arg->>'column', 'position');
IF arg IS NOT NULL THEN
    FOR currentdata IN SELECT * FROM jsonb_array_elements(datalist) LOOP
        currentdataid := currentdata->>'id';
        currentdataposition := currentdata->>columnToBeUpdated;
         PERFORM editor."updatePriorityFinal"(tablenameinput,schemanameinput, currentdataid, currentdataposition, columnToBeUpdated);
    END LOOP;
END IF;
RETURN QUERY
SELECT
  1 AS id;
END;
$$;
CREATE FUNCTION editor.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION editor."updatePriorityFinal"(tablename text, schemaname text, id integer, pos numeric, col text) RETURNS record
    LANGUAGE plpgsql
    AS $$
DECLARE
    data record;
    querystring text := '';
BEGIN
  querystring := 'UPDATE '||'"'||schemaname||'"' || '.'||'"'||tablename||'"'||'set ' || col || ' ='|| pos ||'where "id" ='|| id ||' returning *';
    EXECUTE querystring into data ; 
  RETURN data;
END;
$$;
CREATE FUNCTION experiences."hasura_scheduled_event_on_experienceBooking"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
touchpoint_identifier text := 'tpi_experience_booked_confirmation';
 brand_touchpoint record;
 eventid text;
 customer_email text;
 experience_booking_data record;
 brand_customer record;
BEGIN
    IF NEW."experienceBookingId" IS NOT NULL THEN
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier;    
    IF brand_touchpoint."isActive" is true then
        SELECT * INTO experience_booking_data FROM "experiences"."experienceBooking" WHERE "id" = NEW."experienceBookingId";
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId " and "sourceBrandId" = 1;
        SELECT * INTO brand_customer FROM "crm"."brand_customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId " and "brandId" = 1;
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', brand_customer."id", 'bookingId', New."experienceBookingId")) into eventid;
    END IF;
    RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION experiences."hasura_scheduled_event_on_experienceBookingCancellation"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
touchpoint_identifier text := 'tpi_experience_cancelled';
 brand_touchpoint record;
 eventid text;
 customer_email text;
 brand_customer record;
BEGIN
    IF NEW."isCancelled" = true AND OLD."isCancelled" = false THEN
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier;    
    IF brand_touchpoint."isActive" is true then
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = New."hostKeycloakId" and "sourceBrandId" = 1;
        SELECT * INTO brand_customer FROM "crm"."brand_customer" WHERE "keycloakId" = New."hostKeycloakId" and "brandId" = 1;
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', brand_customer."id", 'bookingId', New."id")) into eventid;
    END IF;
    RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION experiences."hasura_scheduled_event_on_experiencePollCreate"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
touchpoint_identifier_for_poll_created text := 'tpi_poll_created';
touchpoint_identifier_for_poll_reminder text := 'tpi_poll_reminder';
touchpoint_identifier_for_poll_invitation_reminder text := 'tpi_poll_invitation_reminder';
 brand_touchpoint_for_poll_created record;
 brand_touchpoint_for_poll_reminder record;
 brand_touchpoint_poll_invitation_reminder record;
 participants text;
 eventid text;
 customer_email text;
 host_customer record;
BEGIN
    IF NEW."experienceClassId" IS NULL THEN  --checking if it is a poll entry (since poll has no experienceClassId linked at start)
    SELECT * INTO brand_touchpoint_for_poll_created FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier_for_poll_created;    
    SELECT * INTO brand_touchpoint_for_poll_reminder FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier_for_poll_reminder;    
    SELECT * INTO brand_touchpoint_poll_invitation_reminder FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier_for_poll_invitation_reminder;    
    IF brand_touchpoint_for_poll_created."isActive" is true then
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = New."hostKeycloakId" and "sourceBrandId" = 1;
        SELECT * INTO host_customer FROM "crm"."brand_customer" WHERE "keycloakId" = New."hostKeycloakId" and "brandId" = 1;
        --hasura scheduled event for pollCreated email to host
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint_for_poll_created."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint_for_poll_created."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', host_customer."id", 'bookingId', New."id")) into eventid;
    END IF;
    IF brand_touchpoint_for_poll_reminder."isActive" is true then
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = New."hostKeycloakId" and "sourceBrandId" = 1;
        SELECT * INTO host_customer FROM "crm"."brand_customer" WHERE "keycloakId" = New."hostKeycloakId" and "brandId" = 1;
        --hasura scheduled event for poll reminder email to host
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select New."cutoffTime" - INTERVAL '2 days'*coalesce(brand_touchpoint_for_poll_reminder."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint_for_poll_reminder."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', host_customer."id", 'bookingId', New."id")) into eventid;
     END IF;
    IF brand_touchpoint_poll_invitation_reminder."isActive" is true then
        SELECT * INTO host_customer FROM "crm"."brand_customer" WHERE "keycloakId" = New."hostKeycloakId" and "brandId" = 1;
        -- SELECT LTRIM(string_agg(distinct("email"::text), ',')::text, ',' ) INTO participants FROM "experiences"."experienceBookingParticipant" WHERE "experienceBookingId" = New."id";
        --hasura scheduled event for poll invitation reminder email to all the invitees 
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select New."cutoffTime" - INTERVAL '2 days'*coalesce(brand_touchpoint_poll_invitation_reminder."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint_poll_invitation_reminder."configuredEmailTriggerTitle", 'email','all_experienceBooking_participants', 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', host_customer."id", 'bookingId', New."id")) into eventid;
    END IF;
    RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION experiences."hasura_scheduled_event_on_experienceThankyou"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
touchpoint_identifier text := 'tpi_experience_thankyou';
 brand_touchpoint record;
 eventid text;
 customer_email text;
 experience_booking_data record;
 brand_customer record;
BEGIN
    IF NEW."experienceBookingId" IS NOT NULL THEN
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier;    
    IF brand_touchpoint."isActive" is true then
        SELECT * INTO experience_booking_data FROM "experiences"."experienceBooking" WHERE "id" = NEW."experienceBookingId";
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId " and "sourceBrandId" = 1;
        SELECT * INTO brand_customer FROM "crm"."brand_customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId " and "brandId" = 1;
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', brand_customer."id", 'bookingId', New."experienceBookingId")) into eventid;
    END IF;
    RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;
CREATE TABLE experiences.experience (
    id integer DEFAULT public.defaultid('experiences'::text, 'experience'::text, 'id'::text) NOT NULL,
    title text,
    assets jsonb,
    description text,
    "metaData" jsonb,
    ohyay_wsid text,
    "isKitMandatory" boolean DEFAULT true NOT NULL
);
CREATE FUNCTION experiences."isSaved"(experiencedata experiences.experience, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result boolean:= false;
    arg jsonb;
BEGIN
  arg := JSONB_BUILD_OBJECT('id',experienceData."id", 'keycloakId', (params->>'keycloakId')::text);
   SELECT "experiences"."isSavedFunc"(arg) INTO result;
   RETURN result;
END;
$$;
CREATE FUNCTION experiences."isSavedFunc"(params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    RETURN (SELECT EXISTS(SELECT 1 FROM "crm"."customer_savedEntities" WHERE "experienceId" = (params->>'id')::INT AND "keycloakId" = (params->>'keycloakId')::TEXT));
END;
$$;
CREATE TABLE experiences."experienceClassType" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceClassType'::text, 'id'::text) NOT NULL,
    title text DEFAULT 'Private'::text NOT NULL,
    "minimumBookingAmount" numeric,
    "minimumParticipant" integer,
    "maximumParticipant" integer
);
CREATE FUNCTION experiences."priceRanges"(classtype experiences."experienceClassType") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    priceRanges jsonb;
    rec record;
    range jsonb;
    perPersonPrice numeric;
    counter int := 1;
    totalPrice numeric;
    priceBreak jsonb[] = '{}';
    averagePrice numeric;
    averagePriceBreak jsonb[] = '{}';
    totalPriceBreak jsonb[] = '{}';
BEGIN
    priceRanges = jsonb_build_array();
    FOR rec IN SELECT * FROM experiences."experiencePriceLevel" WHERE id = ANY(SELECT "experiencePriceLevelId" FROM experiences."experienceClassType_experiencePriceLevel" WHERE "experienceClassTypeId" = classType.id) ORDER BY "from" ASC LOOP
        priceRanges := priceRanges || jsonb_build_object('from', rec."from", 'to', rec."to", 'price', rec."price");
    END LOOP;
    perPersonPrice = classType."minimumBookingAmount";
    totalPrice = classType."minimumBookingAmount";
    WHILE counter <= classType."maximumParticipant" LOOP
        FOR range IN SELECT * FROM JSONB_ARRAY_ELEMENTS(priceRanges) LOOP
            IF (range->>'from')::int <= counter AND (range->>'to')::int >= counter THEN
                perPersonPrice := (range->>'price')::numeric;
                totalPrice := (totalPrice + (range->>'price')::numeric)::numeric;
                EXIT;
            END IF;
        END LOOP;
        IF counter > 1 AND counter <= classType."minimumParticipant" THEN
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', 0);
        ELSE    
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', perPersonPrice);
        END IF;
            totalPriceBreak := totalPriceBreak || jsonb_build_object('person', counter, 'totalPrice', totalPrice);
            averagePrice := totalPrice/counter; 
            averagePriceBreak := averagePriceBreak || jsonb_build_object('person', counter, 'averagePrice', averagePrice);
        counter := counter + 1;
    END LOOP;
    RETURN json_build_object('ranges', priceRanges, 'breakByPerson', priceBreak, 'totalPriceBreak',totalPriceBreak,'averagePriceBreak',averagePriceBreak);
END;
$$;
CREATE FUNCTION experiences."priceRangesByExperienceClassTypeId"(experienceclasstypeid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    priceRanges jsonb;
    rec record;
    range jsonb;
    perPersonPrice numeric;
    counter int := 1;
    totalPrice numeric;
    priceBreak jsonb[] = '{}';
    averagePrice numeric;
    averagePriceBreak jsonb[] = '{}';
    totalPriceBreak jsonb[] = '{}';
    classType "experiences"."experienceClassType";
BEGIN
    select * into classType  from "experiences"."experienceClassType" where "id" = experienceClassTypeId;
    priceRanges = jsonb_build_array();
    FOR rec IN SELECT * FROM experiences."experiencePriceLevel" WHERE id = ANY(SELECT "experiencePriceLevelId" FROM experiences."experienceClassType_experiencePriceLevel" WHERE "experienceClassTypeId" = classType.id) ORDER BY "from" ASC LOOP
        priceRanges := priceRanges || jsonb_build_object('from', rec."from", 'to', rec."to", 'price', rec."price");
    END LOOP;
    perPersonPrice = classType."minimumBookingAmount";
    totalPrice = classType."minimumBookingAmount";
    WHILE counter <= classType."maximumParticipant" LOOP
        FOR range IN SELECT * FROM JSONB_ARRAY_ELEMENTS(priceRanges) LOOP
            IF (range->>'from')::int <= counter AND (range->>'to')::int >= counter THEN
                perPersonPrice := (range->>'price')::numeric;
                totalPrice := (totalPrice + (range->>'price')::numeric)::numeric;
                EXIT;
            END IF;
        END LOOP;
        IF counter > 1 AND counter <= classType."minimumParticipant" THEN
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', 0);
        ELSE    
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', perPersonPrice);
        END IF;
            totalPriceBreak := totalPriceBreak || jsonb_build_object('person', counter, 'totalPrice', totalPrice);
            averagePrice := totalPrice/counter; 
            averagePriceBreak := averagePriceBreak || jsonb_build_object('person', counter, 'averagePrice', averagePrice);
        counter := counter + 1;
    END LOOP;
    RETURN json_build_object('ranges', priceRanges, 'breakByPerson', priceBreak, 'totalPriceBreak',totalPriceBreak,'averagePriceBreak',averagePriceBreak);
END;
$$;
CREATE FUNCTION experiences."priceRangesFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    priceRanges jsonb;
    rec record;
    range jsonb;
    perPersonPrice numeric;
    counter int := 1;
    totalPrice numeric;
    priceBreak jsonb[] = '{}';
    averagePrice numeric;
    averagePriceBreak jsonb[] = '{}';
    totalPriceBreak jsonb[] = '{}';
BEGIN
    priceRanges = jsonb_build_array();
    FOR rec IN SELECT * FROM experiences."experiencePriceLevel" WHERE id = ANY(SELECT "experiencePriceLevelId" FROM experiences."experienceClassType_experiencePriceLevel" WHERE "experienceClassTypeId" = (params->>'id')::int) ORDER BY "from" ASC LOOP
        priceRanges := priceRanges || jsonb_build_object('from', rec."from", 'to', rec."to", 'price', rec."price");
    END LOOP;
    perPersonPrice = (params->>'minimumBookingAmount')::numeric ;
    totalPrice = (params->>'minimumBookingAmount')::numeric;
    WHILE counter <= (params->>'maximumParticipant')::int LOOP
        FOR range IN SELECT * FROM JSONB_ARRAY_ELEMENTS(priceRanges) LOOP
            IF (range->>'from')::int <= counter AND (range->>'to')::int >= counter THEN
                perPersonPrice := (range->>'price')::numeric;
                totalPrice := (totalPrice + (range->>'price')::numeric)::numeric;
                EXIT;
            END IF;
        END LOOP;
        IF counter > 1 AND counter <= (params->>'minimumParticipant')::int THEN
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', 0);
        ELSE    
            priceBreak := priceBreak || jsonb_build_object('person', counter, 'price', perPersonPrice);
        END IF;
            totalPriceBreak := totalPriceBreak || jsonb_build_object('person', counter, 'totalPrice', totalPrice);
            averagePrice := totalPrice/counter; 
            averagePriceBreak := averagePriceBreak || jsonb_build_object('person', counter, 'averagePrice', averagePrice);
        counter := counter + 1;
    END LOOP;
    RETURN json_build_object('ranges', priceRanges, 'breakByPerson', priceBreak, 'totalPriceBreak',totalPriceBreak,'averagePriceBreak',averagePriceBreak);
END;
$$;
CREATE FUNCTION experiences."resetExperienceClassBooking"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
touchpoint_identifier text := 'tpi_experience_booked_confirmation';
 brand_touchpoint record;
 eventid text;
 customer_email text;
 experience_booking_data record;
 brand_customer record;
BEGIN
    IF NEW."experienceBookingId" IS NULL THEN
        UPDATE "experiences"."experienceClass" SET "isBooked" = FALSE, "isActive" = TRUE WHERE "id" = NEW."id";    
    END IF;
    IF NEW."experienceBookingId" IS NOT NULL THEN
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = touchpoint_identifier;    
    IF brand_touchpoint."isActive" is true then
        SELECT * INTO experience_booking_data FROM "experiences"."experienceBooking" WHERE "id" = NEW."experienceBookingId";
        SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId" and "sourceBrandId" = 1;
        SELECT * INTO brand_customer FROM "crm"."brand_customer" WHERE "keycloakId" = experience_booking_data."hostKeycloakId" and "brandId" = 1;
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', 1, 'includeHeader',true, 'includeFooter', true,'brandCustomerId', brand_customer."id", 'bookingId', New."experienceBookingId")) into eventid;
    END IF;
    RETURN NEW;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION experiences."setExpertId"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
actualExpertId int;
BEGIN
   SELECT "expertId" INTO actualExpertId FROM "experiences"."experience_expert" WHERE "experienceId" = NEW."experienceId" AND "isAdmin" = true limit 1;
   IF NEW."expertId" IS NULL OR NEW."expertId" != actualExpertId THEN
        UPDATE "experiences"."experienceClass" SET "expertId" = actualExpertId where id = NEW.id;
   END IF;
   RETURN New;
END;
$$;
CREATE FUNCTION experiences.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE experts.expert (
    id integer DEFAULT public.defaultid('experts'::text, 'expert'::text, 'id'::text) NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    email text NOT NULL,
    description text,
    assets jsonb
);
COMMENT ON TABLE experts.expert IS 'This contains the all the information of expert.';
CREATE FUNCTION experts.expert(expertdata experts.expert) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
return UPPER(CONCAT(expertdata."firstName", ' ', expertdata."lastName"));
END;
$$;
CREATE TABLE fulfilment."mileRange" (
    id integer DEFAULT public.defaultid('fulfilment'::text, 'mileRange'::text, 'id'::text) NOT NULL,
    "from" numeric,
    "to" numeric,
    "leadTime" integer,
    "prepTime" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "timeSlotId" integer,
    zipcodes jsonb,
    "distanceType" text DEFAULT 'aerial'::text,
    "geoBoundary" jsonb,
    state text,
    city text,
    "isExcluded" boolean DEFAULT false
);
COMMENT ON TABLE fulfilment."mileRange" IS 'This shows the delivery range of the particular brand.';
CREATE FUNCTION fulfilment."preOrderDeliveryValidity"(milerange fulfilment."mileRange", "time" time without time zone) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    fromVal time;
    toVal time;
BEGIN
    SELECT "from" into fromVal FROM fulfilment."timeSlot" WHERE id = mileRange."timeSlotId";
    SELECT "to" into toVal FROM fulfilment."timeSlot" WHERE id = mileRange."timeSlotId";
    RETURN true;
END
$$;
CREATE TABLE fulfilment."timeSlot" (
    id integer DEFAULT public.defaultid('fulfilment'::text, 'timeSlot'::text, 'id'::text) NOT NULL,
    "recurrenceId" integer,
    "isActive" boolean DEFAULT true NOT NULL,
    "from" time without time zone,
    "to" time without time zone,
    "pickUpLeadTime" integer DEFAULT 120,
    "pickUpPrepTime" integer DEFAULT 30
);
COMMENT ON TABLE fulfilment."timeSlot" IS 'This shows the time slot of brand as per mile range.';
CREATE FUNCTION fulfilment."preOrderPickupTimeFrom"(timeslot fulfilment."timeSlot") RETURNS time without time zone
    LANGUAGE plpgsql STABLE
    AS $$
  -- SELECT "from".timeslot AS fromtime, "pickupLeadTime".timeslot AS buffer, diff(fromtime, buffer) as "pickupFromTime"
  BEGIN
  return ("from".timeslot - "pickupLeadTime".timeslot);
  END
$$;
CREATE FUNCTION fulfilment."preOrderPickupValidity"(timeslot fulfilment."timeSlot", "time" time without time zone) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    -- IF JSONB_ARRAY_LENGTH(ordercart."cartInfo"->'products') = 0
    --     THEN RETURN json_build_object('status', false, 'error', 'No items in cart!');
    -- ELSIF ordercart."paymentMethodId" IS NULL OR ordercart."stripeCustomerId" IS NULL
    --     THEN RETURN json_build_object('status', false, 'error', 'No payment method selected!');
    -- ELSIF ordercart."address" IS NULL
    --     THEN RETURN json_build_object('status', false, 'error', 'No address selected!');
    -- ELSE
        RETURN true;
    -- END IF;
END
$$;
CREATE FUNCTION fulfilment.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION hdb_catalog.check_violation(msg text) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
  BEGIN
    RAISE check_violation USING message=msg;
  END;
$$;
CREATE FUNCTION hdb_catalog.event_trigger_table_name_update() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF (NEW.table_schema, NEW.table_name) <> (OLD.table_schema, OLD.table_name)  THEN
    UPDATE hdb_catalog.event_triggers
    SET schema_name = NEW.table_schema, table_name = NEW.table_name
    WHERE (schema_name, table_name) = (OLD.table_schema, OLD.table_name);
  END IF;
  RETURN NEW;
END;
$$;
CREATE FUNCTION hdb_catalog.hdb_schema_update_event_notifier() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    instance_id uuid;
    occurred_at timestamptz;
    invalidations json;
    curr_rec record;
  BEGIN
    instance_id = NEW.instance_id;
    occurred_at = NEW.occurred_at;
    invalidations = NEW.invalidations;
    PERFORM pg_notify('hasura_schema_update', json_build_object(
      'instance_id', instance_id,
      'occurred_at', occurred_at,
      'invalidations', invalidations
      )::text);
    RETURN curr_rec;
  END;
$$;
CREATE FUNCTION hdb_catalog.inject_table_defaults(view_schema text, view_name text, tab_schema text, tab_name text) RETURNS void
    LANGUAGE plpgsql
    AS $$
    DECLARE
        r RECORD;
    BEGIN
      FOR r IN SELECT column_name, column_default FROM information_schema.columns WHERE table_schema = tab_schema AND table_name = tab_name AND column_default IS NOT NULL LOOP
          EXECUTE format('ALTER VIEW %I.%I ALTER COLUMN %I SET DEFAULT %s;', view_schema, view_name, r.column_name, r.column_default);
      END LOOP;
    END;
$$;
CREATE FUNCTION hdb_catalog.insert_event_log(schema_name text, table_name text, trigger_name text, op text, row_data json) RETURNS text
    LANGUAGE plpgsql
    AS $$
  DECLARE
    id text;
    payload json;
    session_variables json;
    server_version_num int;
    trace_context json;
  BEGIN
    id := gen_random_uuid();
    server_version_num := current_setting('server_version_num');
    IF server_version_num >= 90600 THEN
      session_variables := current_setting('hasura.user', 't');
      trace_context := current_setting('hasura.tracecontext', 't');
    ELSE
      BEGIN
        session_variables := current_setting('hasura.user');
      EXCEPTION WHEN OTHERS THEN
                  session_variables := NULL;
      END;
      BEGIN
        trace_context := current_setting('hasura.tracecontext');
      EXCEPTION WHEN OTHERS THEN
        trace_context := NULL;
      END;
    END IF;
    payload := json_build_object(
      'op', op,
      'data', row_data,
      'session_variables', session_variables,
      'trace_context', trace_context
    );
    INSERT INTO hdb_catalog.event_log
                (id, schema_name, table_name, trigger_name, payload)
    VALUES
    (id, schema_name, table_name, trigger_name, payload);
    RETURN id;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_BulkItemHistoryCreateUpdate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkItemHistoryCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkItemHistoryCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_BulkItemHistoryCreateUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."purchaseOrderItemId" , OLD."bulkItemId" , OLD."quantity" , OLD."bulkWorkOrderId" , OLD."id" , OLD."orderSachetId" , OLD."comment" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."purchaseOrderItemId" , NEW."bulkItemId" , NEW."quantity" , NEW."bulkWorkOrderId" , NEW."id" , NEW."orderSachetId" , NEW."comment" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkItemHistoryCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkItemHistoryCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_BulkWorkOrderCreateUpdate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkWorkOrderCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkWorkOrderCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_BulkWorkOrderCreateUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."inputBulkItemId" , OLD."userId" , OLD."outputQuantity" , OLD."outputBulkItemId" , OLD."id" , OLD."inputQuantity" , OLD."inputQuantityUnit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."inputBulkItemId" , NEW."userId" , NEW."outputQuantity" , NEW."outputBulkItemId" , NEW."id" , NEW."inputQuantity" , NEW."inputQuantityUnit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkWorkOrderCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('BulkWorkOrderCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_Bulk_Imports_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."confirm"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."confirm"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('Bulk_Imports' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('Bulk_Imports' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_New_Webhook_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('New_Webhook' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('New_Webhook' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_Order_Created_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('Order_Created' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('Order_Created' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_SachetItemHistoryCreateUpdate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetItemHistoryCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetItemHistoryCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_SachetItemHistoryCreateUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."sachetItemId" , OLD."quantity" , OLD."sachetWorkOrderId" , OLD."id" , OLD."orderSachetId" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."sachetItemId" , NEW."quantity" , NEW."sachetWorkOrderId" , NEW."id" , NEW."orderSachetId" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetItemHistoryCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetItemHistoryCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_SachetWorkOrderCreateUpdate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetWorkOrderCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetWorkOrderCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_SachetWorkOrderCreateUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."stationId" , OLD."inputBulkItemId" , OLD."userId" , OLD."outputQuantity" , OLD."outputSachetItemId" , OLD."id" , OLD."inputQuantity"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."stationId" , NEW."inputBulkItemId" , NEW."userId" , NEW."outputQuantity" , NEW."outputSachetItemId" , NEW."id" , NEW."inputQuantity"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetWorkOrderCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('SachetWorkOrderCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_bulkItemUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."committed" , OLD."onHand" , OLD."isAvailable"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."committed" , NEW."onHand" , NEW."isAvailable"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('bulkItemUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('bulkItemUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createCustomerByClient_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createCustomerByClient' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createCustomerByClient' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createDelivery_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."deliveryPartnershipId"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."deliveryPartnershipId"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createDelivery' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createDelivery' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createNotificationTrigger_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isActive"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isActive"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createNotificationTrigger' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createNotificationTrigger' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createOccurenceScheduledEvent_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurenceScheduledEvent' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurenceScheduledEvent' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createOccurenceScheduledEvent_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."cutoffTimeStamp"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."cutoffTimeStamp"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurenceScheduledEvent' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurenceScheduledEvent' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createOccurences_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurences' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurences' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createOccurences_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."endDate"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."endDate"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurences' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createOccurences' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_createStripeCustomer_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createStripeCustomer' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('createStripeCustomer' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_customerSignupWebhookEvent_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('customerSignupWebhookEvent' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('customerSignupWebhookEvent' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_customer_signup_webhook_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('customer_signup_webhook' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('customer_signup_webhook' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleCartPayment_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."paymentRetryAttempt"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."paymentRetryAttempt"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleCartPayment' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleCartPayment' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleCustomerSignup_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleCustomerSignup' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleCustomerSignup' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleNewOrder_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleNewOrder' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleNewOrder' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleSubscriptionCancelled_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isSubscriptionCancelled"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isSubscriptionCancelled"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleSubscriptionCancelled' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleSubscriptionCancelled' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleTemplate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleTemplate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleTemplate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleThirdPartyOrders_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleThirdPartyOrders' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleThirdPartyOrders' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleWebhookEventCreation_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isActive"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isActive"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleWebhookEventCreation' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleWebhookEventCreation' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handle_isSubscriber_update2_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isSubscriber"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isSubscriber"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handle_isSubscriber_update2' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handle_isSubscriber_update2' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_handleisActiveEventTrigger_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isActive"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isActive"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleisActiveEventTrigger' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('handleisActiveEventTrigger' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_ingredientSachetModified_DELETE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', NULL
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_ingredientSachetModified_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_ingredientSachetModified_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."liveMOF" , OLD."createdAt" , OLD."ingredientId" , OLD."quantity" , OLD."visibility" , OLD."isArchived" , OLD."tracking" , OLD."id" , OLD."updatedAt" , OLD."ingredientProcessingId" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."liveMOF" , NEW."createdAt" , NEW."ingredientId" , NEW."quantity" , NEW."visibility" , NEW."isArchived" , NEW."tracking" , NEW."id" , NEW."updatedAt" , NEW."ingredientProcessingId" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('ingredientSachetModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_initiatePayment2_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('initiatePayment2' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('initiatePayment2' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_initiatePayment2_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."paymentRetryAttempt"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."paymentRetryAttempt"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('initiatePayment2' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('initiatePayment2' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_manageUser_DELETE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', NULL
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('manageUser' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('manageUser' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_manageUser_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."email"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."email"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('manageUser' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('manageUser' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_mofUpdate_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('mofUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('mofUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_mofUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."isLive" , OLD."isPublished" , OLD."position"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."isLive" , NEW."isPublished" , NEW."position"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('mofUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('mofUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_onEnvChange_DELETE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', NULL
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_onEnvChange_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_onEnvChange_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."belongsTo" , OLD."value" , OLD."id" , OLD."title"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."belongsTo" , NEW."value" , NEW."id" , NEW."title"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('onEnvChange' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_orderReceivedWebhookEvent_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderReceivedWebhookEvent' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderReceivedWebhookEvent' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_orderSachetUpsert_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderSachetUpsert' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderSachetUpsert' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_orderSachetUpsert_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderSachetUpsert' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('orderSachetUpsert' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_order_recieve_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('order_recieve' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('order_recieve' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_packagingHistory_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('packagingHistory' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('packagingHistory' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_packagingHistory_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."purchaseOrderItemId" , OLD."quantity" , OLD."packagingId" , OLD."id" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."purchaseOrderItemId" , NEW."quantity" , NEW."packagingId" , NEW."id" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('packagingHistory' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('packagingHistory' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_printKOT_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('printKOT' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('printKOT' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_printLabel_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('printLabel' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('printLabel' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_purchaseOrderItemCreateUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status" , OLD."orderQuantity" , OLD."bulkItemId" , OLD."supplierId" , OLD."supplierItemId" , OLD."mandiPurchaseOrderItemId" , OLD."details" , OLD."packagingId" , OLD."id" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status" , NEW."orderQuantity" , NEW."bulkItemId" , NEW."supplierId" , NEW."supplierItemId" , NEW."mandiPurchaseOrderItemId" , NEW."details" , NEW."packagingId" , NEW."id" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('purchaseOrderItemCreateUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('purchaseOrderItemCreateUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sachetItemModified_DELETE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', NULL
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sachetItemModified_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sachetItemModified_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."committed" , OLD."maxLevel" , OLD."awaiting" , OLD."onHand" , OLD."consumed" , OLD."bulkItemId" , OLD."unitSize" , OLD."isAvailable" , OLD."isArchived" , OLD."id" , OLD."parLevel" , OLD."unit"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."committed" , NEW."maxLevel" , NEW."awaiting" , NEW."onHand" , NEW."consumed" , NEW."bulkItemId" , NEW."unitSize" , NEW."isAvailable" , NEW."isArchived" , NEW."id" , NEW."parLevel" , NEW."unit"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sachetItemUpdate_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."committed" , OLD."onHand" , OLD."isAvailable"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."committed" , NEW."onHand" , NEW."isAvailable"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemUpdate' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sachetItemUpdate' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sendEmailOnOrderCartStatusChange_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."status"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."status"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendEmailOnOrderCartStatusChange' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendEmailOnOrderCartStatusChange' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sendExperinceBookingEmail_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."rsvp"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."rsvp"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendExperinceBookingEmail' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendExperinceBookingEmail' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_sendWebhookEvents_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendWebhookEvents' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('sendWebhookEvents' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_supplierItemModified_DELETE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', NULL
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_supplierItemModified_INSERT"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row(OLD );
      _new := row(NEW );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', NULL,
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION hdb_views."notify_hasura_supplierItemModified_UPDATE"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
  DECLARE
    _old record;
    _new record;
    _data json;
  BEGIN
    IF TG_OP = 'UPDATE' THEN
      _old := row((SELECT  "e"  FROM  (SELECT  OLD."importId" , OLD."unitSize" , OLD."certificates" , OLD."prices" , OLD."supplierId" , OLD."isArchived" , OLD."name" , OLD."id" , OLD."sku" , OLD."unit" , OLD."bulkItemAsShippedId" , OLD."leadTime"        ) AS "e"      ) );
      _new := row((SELECT  "e"  FROM  (SELECT  NEW."importId" , NEW."unitSize" , NEW."certificates" , NEW."prices" , NEW."supplierId" , NEW."isArchived" , NEW."name" , NEW."id" , NEW."sku" , NEW."unit" , NEW."bulkItemAsShippedId" , NEW."leadTime"        ) AS "e"      ) );
    ELSE
    /* initialize _old and _new with dummy values for INSERT and UPDATE events*/
      _old := row((select 1));
      _new := row((select 1));
    END IF;
    _data := json_build_object(
      'old', row_to_json(OLD ),
      'new', row_to_json(NEW )
    );
    BEGIN
      IF (TG_OP <> 'UPDATE') OR (_old <> _new) THEN
        PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
      END IF;
      EXCEPTION WHEN undefined_function THEN
        IF (TG_OP <> 'UPDATE') OR (_old *<> _new) THEN
          PERFORM hdb_catalog.insert_event_log(CAST(TG_TABLE_SCHEMA AS text), CAST(TG_TABLE_NAME AS text), CAST('supplierItemModified' AS text), TG_OP, _data);
        END IF;
    END;
    RETURN NULL;
  END;
$$;
CREATE FUNCTION ingredient."MOFCost"(mofid integer) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    mof record;
    bulkItemId int;
    supplierItemId int;
    supplierItem record;
    costs jsonb;
BEGIN
    SELECT * FROM ingredient."modeOfFulfillment" WHERE id = mofId into mof;
    IF mof."bulkItemId" IS NOT NULL
        THEN SELECT mof."bulkItemId" into bulkItemId;
    ELSE
        SELECT bulkItemId FROM inventory."sachetItem" WHERE id = mof."sachetItemId" into bulkItemId;
    END IF;
    SELECT "supplierItemId" FROM inventory."bulkItem" WHERE id = bulkItemId into supplierItemId;
    SELECT * FROM inventory."supplierItem" WHERE id = supplierItemId into supplierItem;
    IF supplierItem.prices IS NULL OR supplierItem.prices->0->'unitPrice'->>'value' = ''
        THEN RETURN 0;
    ELSE
        RETURN (supplierItem.prices->0->'unitPrice'->>'value')::numeric/supplierItem."unitSize";
    END IF;
END
$$;
CREATE FUNCTION ingredient."MOFNutritionalInfo"(mofid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    info jsonb;
    mof record;
    bulkItemId int;
BEGIN
    SELECT * FROM ingredient."modeOfFulfillment" WHERE id = mofId into mof;
    IF mof."bulkItemId" IS NOT NULL
        THEN SELECT "nutritionInfo" FROM inventory."bulkItem" WHERE id = mof."bulkItemId" into info;
        RETURN info;
    ELSE
        SELECT bulkItemId FROM inventory."sachetItem" WHERE id = mof."sachetItemId" into bulkItemId;
        SELECT "nutritionInfo" FROM inventory."bulkItem" WHERE id = bulkItemId into info;
        RETURN info;
    END IF;
END
$$;
CREATE TABLE ingredient."ingredientSachet" (
    id integer DEFAULT public.defaultid('ingredient'::text, 'ingredientSachet'::text, 'id'::text) NOT NULL,
    quantity numeric NOT NULL,
    "ingredientProcessingId" integer NOT NULL,
    "ingredientId" integer NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now(),
    tracking boolean DEFAULT true NOT NULL,
    unit text NOT NULL,
    visibility boolean DEFAULT true NOT NULL,
    "liveMOF" integer,
    "isArchived" boolean DEFAULT false NOT NULL,
    "nutritionId" integer,
    "nutritionSetting" text DEFAULT 'auto'::text
);
COMMENT ON TABLE ingredient."ingredientSachet" IS 'This lists records of all the sachets across all the brand.';
CREATE FUNCTION ingredient.cost(sachet ingredient."ingredientSachet") RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    cost numeric;
BEGIN
    SELECT ingredient."sachetCost"(sachet.id) into cost;
    RETURN cost;
END
$$;
CREATE FUNCTION ingredient."createSachet"(qty numeric, unit text, processingid integer, ingredientid integer, tracking boolean, visibility boolean) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    newId int;
BEGIN
    INSERT INTO "ingredient"."ingredientSachet"("quantity", "unit", "ingredientProcessingId", "ingredientId", "tracking", "visibility")
    VALUES(qty, unit, processingId, ingredientId, tracking, visibility)
    RETURNING id INTO newId;
    RETURN newId;
END;
$$;
CREATE TABLE ingredient."modeOfFulfillment" (
    id integer DEFAULT public.defaultid('ingredient'::text, 'modeOfFulfillment'::text, 'id'::text) NOT NULL,
    "stationId" integer,
    "labelTemplateId" integer,
    "bulkItemId" integer,
    "isPublished" boolean DEFAULT true NOT NULL,
    "position" numeric,
    "ingredientSachetId" integer NOT NULL,
    "packagingId" integer,
    "isLive" boolean DEFAULT true NOT NULL,
    accuracy integer,
    "sachetItemId" integer,
    "operationConfigId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "ingredientId" integer,
    "ingredientProcessingId" integer,
    "nutritionId" integer,
    "isArchived" boolean DEFAULT false NOT NULL
);
CREATE FUNCTION ingredient."getMOFCost"(mof ingredient."modeOfFulfillment") RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    cost numeric;
BEGIN
    SELECT ingredient."MOFCost"(mof.id) into cost;
    RETURN cost;
END
$$;
CREATE FUNCTION ingredient."getMOFNutritionalInfo"(mof ingredient."modeOfFulfillment") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    info jsonb;
BEGIN
    SELECT ingredient."MOFNutritionalInfo"(mof.id) into info;
    RETURN info;
END
$$;
CREATE TABLE ingredient.ingredient (
    id integer DEFAULT public.defaultid('ingredient'::text, 'ingredient'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    image text,
    "isPublished" boolean DEFAULT false NOT NULL,
    category text,
    "createdAt" date DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL,
    assets jsonb,
    "nutritionId" integer
);
COMMENT ON TABLE ingredient.ingredient IS 'This lists records of all the ingredient across all the brand.';
CREATE FUNCTION ingredient.image_validity(ing ingredient.ingredient) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT NOT(ing.image IS NULL)
$$;
CREATE FUNCTION ingredient.imagevalidity(image ingredient.ingredient) RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
    SELECT NOT(image.image IS NULL)
$$;
CREATE FUNCTION ingredient.isingredientvalid(ingredient ingredient.ingredient) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    temp jsonb;
BEGIN
    SELECT * FROM ingredient."ingredientSachet" where "ingredientId" = ingredient.id LIMIT 1 into temp;
    IF temp IS NULL
        THEN return json_build_object('status', false, 'error', 'Not sachet present');
    ELSIF ingredient.category IS NULL
        THEN return json_build_object('status', false, 'error', 'Category not provided');
    ELSIF ingredient.image IS NULL OR LENGTH(ingredient.image) = 0
        THEN return json_build_object('status', true, 'error', 'Image not provided');
    ELSE
        return json_build_object('status', true, 'error', '');
    END IF;
END
$$;
CREATE FUNCTION ingredient.ismodevalid(mode ingredient."modeOfFulfillment") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  temp json;
  isSachetValid boolean;
BEGIN
    SELECT ingredient.isSachetValid("ingredientSachet".*) 
        FROM ingredient."ingredientSachet"
        WHERE "ingredientSachet".id = mode."ingredientSachetId" into temp;
    SELECT temp->'status' into isSachetValid;
    IF NOT isSachetValid
        THEN return json_build_object('status', false, 'error', 'Sachet is not valid');
    ELSIF mode."stationId" IS NULL
        THEN return json_build_object('status', false, 'error', 'Station is not provided');
    ELSIF mode."bulkItemId" IS NULL AND mode."sachetItemId" IS NULL
        THEN return json_build_object('status', false, 'error', 'Item is not provided');
    ELSE
        return json_build_object('status', true, 'error', '');
    END IF;
END
$$;
CREATE FUNCTION ingredient.issachetvalid(sachet ingredient."ingredientSachet") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  temp json;
  isIngredientValid boolean;
BEGIN
    SELECT ingredient.isIngredientValid(ingredient.*) FROM ingredient.ingredient where ingredient.id = sachet."ingredientId" into temp;
    SELECT temp->'status' into isIngredientValid;
    IF NOT isIngredientValid
        THEN return json_build_object('status', false, 'error', 'Ingredient is not valid');
    -- ELSIF sachet."defaultNutritionalValues" IS NULL
    --     THEN return json_build_object('status', true, 'error', 'Default nutritional values not provided');
    ELSE
        return json_build_object('status', true, 'error', '');
    END IF;
END
$$;
CREATE TABLE "simpleRecipe"."simpleRecipe" (
    id integer DEFAULT public.defaultid('simpleRecipe'::text, 'simpleRecipe'::text, 'id'::text) NOT NULL,
    author text,
    name jsonb NOT NULL,
    "cookingTime" text,
    utensils jsonb,
    description text,
    cuisine text,
    image text,
    show boolean DEFAULT true NOT NULL,
    assets jsonb DEFAULT jsonb_build_object('images', '[]'::jsonb, 'videos', '[]'::jsonb) NOT NULL,
    type text,
    "isPublished" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL,
    "notIncluded" jsonb,
    "showIngredients" boolean DEFAULT true NOT NULL,
    "showIngredientsQuantity" boolean DEFAULT true NOT NULL,
    "showProcedures" boolean DEFAULT true NOT NULL,
    "isSubRecipe" boolean
);
CREATE FUNCTION ingredient.issimplerecipevalid(recipe "simpleRecipe"."simpleRecipe") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    -- SELECT ingredient.isSachetValid("ingredientSachet".*) 
    --     FROM ingredient."ingredientSachet"
    --     WHERE "ingredientSachet".id = mode."ingredientSachetId" into temp;
    -- SELECT temp->'status' into isSachetValid;
    IF recipe.utensils IS NULL OR ARRAY_LENGTH(recipe.utensils) = 0
        THEN return json_build_object('status', false, 'error', 'Utensils not provided');
    ELSIF recipe.procedures IS NULL OR ARRAY_LENGTH(recipe.procedures) = 0
        THEN return json_build_object('status', false, 'error', 'Cooking steps are not provided');
    ELSIF recipe.ingredients IS NULL OR ARRAY_LENGTH(recipe.ingredients) = 0
        THEN return json_build_object('status', false, 'error', 'Ingrdients are not provided');
    ELSE
        return json_build_object('status', true, 'error', '');
    END IF;
END
$$;
CREATE FUNCTION ingredient."nutritionalInfo"(sachet ingredient."ingredientSachet") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    info jsonb;
BEGIN
    SELECT ingredient."sachetNutritionalInfo"(sachet.id) into info;
    RETURN info;
END
$$;
CREATE FUNCTION ingredient."sachetCost"(sachetid integer) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    sachet record;
    mofId int;
    temp numeric;
BEGIN
    SELECT * FROM ingredient."ingredientSachet" WHERE id = sachetId INTO sachet;
    SELECT id FROM ingredient."modeOfFulfillment" WHERE "ingredientSachetId" = sachetId ORDER BY COALESCE(position, id) DESC LIMIT 1 INTO mofId;
    SELECT ingredient."MOFCost"(mofId) INTO temp;
    IF temp IS NULL OR temp = 0
        THEN SELECT "cost"->'value' FROM ingredient."ingredientProcessing" WHERE id = sachet."ingredientProcessingId" INTO temp;
    END IF;
    IF temp IS NULL
        THEN RETURN 0;
    ELSE
        RETURN temp*sachet.quantity;
    END IF;
END
$$;
CREATE FUNCTION ingredient."sachetNutritionalInfo"(sachetid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    info jsonb;
    sachet record;
    mofId int;
    per numeric;
BEGIN
    SELECT * FROM ingredient."ingredientSachet" WHERE id = sachetId INTO sachet;
    -- order by position and not id
    SELECT id FROM ingredient."modeOfFulfillment" WHERE "ingredientSachetId" = sachetId ORDER BY id DESC NULLS LAST LIMIT 1 INTO mofId;
    SELECT ingredient."MOFNutritionalInfo"(mofId) INTO info;
    IF info IS NULL
        THEN SELECT "nutritionalInfo" FROM ingredient."ingredientProcessing" WHERE id = sachet."ingredientProcessingId" INTO info;
    END IF;
    IF info IS NULL
        THEN RETURN info;
    ELSE
        SELECT split_part(COALESCE((info->>'per'), '1 gms'), ' ', 1)::numeric into per;
        RETURN json_build_object(
            'per', per,
            'iron', COALESCE((info->>'iron')::numeric, 0) * (sachet.quantity)::numeric/per,
            'sodium', COALESCE((info->>'sodium')::numeric, 0) * (sachet.quantity)::numeric/per,
            'sugars', COALESCE((info->>'sugars')::numeric, 0) * (sachet.quantity)::numeric/per,
            'calcium', COALESCE((info->>'calcium')::numeric, 0) * (sachet.quantity)::numeric/per,
            'protein', COALESCE((info->>'protein')::numeric, 0) * (sachet.quantity)::numeric/per,
            'calories', COALESCE((info->>'calories')::numeric, 0) * (sachet.quantity)::numeric/per,
            'totalFat', COALESCE((info->>'totalFat')::numeric, 0) * (sachet.quantity)::numeric/per,
            'transFat', COALESCE((info->>'transFat')::numeric, 0) * (sachet.quantity)::numeric/per,
            'vitaminA', COALESCE((info->>'vitaminA')::numeric, 0) * (sachet.quantity)::numeric/per,
            'vitaminC', COALESCE((info->>'vitaminC')::numeric, 0) * (sachet.quantity)::numeric/per,
            'cholesterol', COALESCE((info->>'cholesterol')::numeric, 0) * (sachet.quantity)::numeric/per,
            'dietaryFibre', COALESCE((info->>'dietaryFibre')::numeric, 0) * (sachet.quantity)::numeric/per,
            'saturatedFat', COALESCE((info->>'saturatedFat')::numeric, 0) * (sachet.quantity)::numeric/per,
            'totalCarbohydrates', COALESCE((info->>'totalCarbohydrates')::numeric, 0) * (sachet.quantity)::numeric/per,
             'allergens', (info->'allergens'),
             'excludes', (info->'excludes')
        );
    END IF;
END
$$;
CREATE FUNCTION ingredient.sachetvalidity(sachet ingredient."ingredientSachet") RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT NOT(sachet.unit IS NULL OR sachet.quantity <= 0)
$$;
CREATE FUNCTION ingredient."set_current_timestamp_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updatedAt" = NOW();
  RETURN _new;
END;
$$;
CREATE FUNCTION ingredient.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION ingredient.unit_conversions_ingredient_sachet(item ingredient."ingredientSachet", from_unit text, from_unit_bulk_density numeric, quantity numeric, to_unit text, to_unit_bulk_density numeric) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
  local_quantity                   numeric;
  local_from_unit                  text; 
  local_from_unit_bulk_density     numeric; 
  local_to_unit_bulk_density       numeric;
  known_units                      text[] := '{kg, g, mg, oz, l, ml}';
  result                           jsonb;
  custom_to_unit_conversion_id     integer;
  custom_from_unit_conversion_id   integer;
BEGIN
  /* setup */
  -- resolve quantity
  IF quantity IS NULL OR quantity = -1 THEN
    local_quantity := item."unitSize"::numeric;
  ELSE
    local_quantity := quantity;
  END IF;
  -- resolve from_unit
  IF from_unit IS NULL OR from_unit = ''
    THEN
    local_from_unit := item.unit;
  ELSE
    local_from_unit := from_unit;
  END IF;
  -- resolve from_unit_bulk_density
  IF from_unit_bulk_density IS NULL OR from_unit_bulk_density = -1 THEN
    local_from_unit_bulk_density := item."bulkDensity";
  ELSE
    local_from_unit_bulk_density := from_unit_bulk_density;
  END IF;
  -- resolve to_unit_bulk_density
  IF to_unit_bulk_density IS NULL OR to_unit_bulk_density = -1 THEN
    local_to_unit_bulk_density := item."bulkDensity";
  ELSE
    local_to_unit_bulk_density := to_unit_bulk_density;
  END IF;
  IF to_unit <> ALL(known_units) AND to_unit != '' THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'ingredient', -- schema name
      'ingredientSachet_unitConversion', -- tablename
      item.id,
      to_unit
    ) INTO custom_to_unit_conversion_id;
  END IF;
  IF local_from_unit <> ALL(known_units) THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'ingredient', -- schema name
      'ingredientSachet_unitConversion', -- tablename
      item.id,
      local_from_unit
    ) INTO custom_from_unit_conversion_id;
  END IF;
  /* end setup */
  IF local_from_unit = ANY(known_units) THEN -- local_from_unit is standard
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is also standard
        SELECT data FROM inventory.standard_to_standard_unit_converter(
          local_quantity, 
          local_from_unit, 
          local_from_unit_bulk_density,
          to_unit,
          local_to_unit_bulk_density,
          'ingredient', -- schema name
          'ingredientSachet_unitConversion', -- tablename
          item.id,
          'all'
        ) INTO result;
    ELSE -- to_unit is custom and not ''
      -- convert from standard to custom
      SELECT data FROM inventory.standard_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  ELSE -- local_from_unit is custom
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is standard
      SELECT data FROM inventory.custom_to_standard_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        'ingredient', -- schema name
        'ingredientSachet_unitConversion', -- tablename
        item.id
      ) INTO result;
    ELSE -- to_unit is also custom and not ''
      SELECT data FROM inventory.custom_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density, 
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  END IF;
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END;
$_$;
CREATE FUNCTION ingredient."updateModeOfFulfillment"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    update "ingredient"."modeOfFulfillment"
   SET "ingredientId" = (select "ingredientId" from "ingredient"."ingredientSachet" where id = NEW."ingredientSachetId"),
      "ingredientProcessingId" = (select "ingredientProcessingId" from "ingredient"."ingredientSachet" where id = NEW."ingredientSachetId");
    RETURN NULL;
END;
$$;
CREATE FUNCTION ingredient.validity(sachet ingredient."ingredientSachet") RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  SELECT NOT(sachet.unit IS NULL OR sachet.quantity <= 0)
$$;
CREATE TABLE insights.analytics (
    id integer NOT NULL
);
COMMENT ON TABLE insights.analytics IS 'This table contains all the unique ID.';
CREATE FUNCTION insights."getAcceptedVsRejectedOrders"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    result jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
            SELECT row_to_json(row) FROM (
                SELECT 
                    COALESCE(SUM(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then "amountPaid" end), 0) as "acceptedTotal",
                    COALESCE(COUNT(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then a.id end), 0) as "acceptedCount",
                    COALESCE(SUM(case when ("isRejected" = true) then "amountPaid" end), 0) as "rejectedTotal",
                    COALESCE(COUNT(case when ("isRejected" = true) then a.id end), 0) as "rejectedCount",
   jsonb_agg(jsonb_build_object(''id'', a.id, ''created_at'', a."created_at", ''amount paid'', a."amountPaid")) as "orderRefs"
                FROM "order"."order" a 
                JOIN "order"."cart" b ON a.id = b."orderId" 
                WHERE (%s)
            ) AS row
        ', params->>'where') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 COALESCE(SUM(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then "amountPaid" end), 0) as "acceptedTotal",
    --                 COALESCE(COUNT(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then a.id end), 0) as "acceptedCount",
    --                 COALESCE(SUM(case when ("isRejected" = true) then "amountPaid" end), 0) as "rejectedTotal",
    --                 COALESCE(COUNT(case when ("isRejected" = true) then a.id end), 0) as "rejectedCount"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, (params->>'brandId')::integer, params->>'source') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 COALESCE(SUM(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then "amountPaid" end), 0) as "acceptedTotal",
    --                 COALESCE(COUNT(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then a.id end), 0) as "acceptedCount",
    --                 COALESCE(SUM(case when ("isRejected" = true) then "amountPaid" end), 0) as "rejectedTotal",
    --                 COALESCE(COUNT(case when ("isRejected" = true) then a.id end), 0) as "rejectedCount"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, (params->>'brandId')::integer) into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 COALESCE(SUM(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then "amountPaid" end), 0) as "acceptedTotal",
    --                 COALESCE(COUNT(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then a.id end), 0) as "acceptedCount",
    --                 COALESCE(SUM(case when ("isRejected" = true) then "amountPaid" end), 0) as "rejectedTotal",
    --                 COALESCE(COUNT(case when ("isRejected" = true) then a.id end), 0) as "rejectedCount"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 b.source = ''%s''
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, params->>'source') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 COALESCE(SUM(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then "amountPaid" end), 0) as "acceptedTotal",
    --                 COALESCE(COUNT(case when ("isAccepted" = true AND ("isRejected" IS NULL OR "isRejected" = false)) then a.id end), 0) as "acceptedCount",
    --                 COALESCE(SUM(case when ("isRejected" = true) then "amountPaid" end), 0) as "rejectedTotal",
    --                 COALESCE(COUNT(case when ("isRejected" = true) then a.id end), 0) as "rejectedCount"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --             ) 
    --         ) AS row
    --     ',fromDate, toDate) into sql;
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO result;
    END IF;
    return result;
END;
$$;
CREATE FUNCTION insights."getCustomerByGroupby"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
            SELECT FORMAT('
            SELECT json_agg(row_to_json(row)) FROM (
            SELECT
                %s,
                count(cc.id),
                jsonb_agg(jsonb_build_object(
                ''id'',
                cc.id,
                ''email'',
                cc.email,
                ''isSubscriber'',
                cc."isSubscriber",
                ''created_at'',
                cc.created_at,
                ''source'',
                cc.source
                )
            ) as "customerRefs"
            FROM
            crm.brand_customer cb
            JOIN crm.customer cc ON (cc."keycloakId" = cb."keycloakId")
            where
                %s
            GROUP BY
                GROUPING SETS ((), %s)
            ) AS row
        ', params->>'columns', params->>'where', params->>'groupingSets') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getEarningByCoupons"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    -- total numeric;
    -- count numeric;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
        SELECT json_agg(row_to_json(row)) FROM (
            select
                id,
                "isActive",
                "code",
                "couponStartTimeStamp",
                "couponEndTimeStamp",
                (
                    select
                        coalesce(sum("amountPaid"), 0) as "totalEarning"
                    from
                        "order"."order" oo
                        JOIN "order"."cart" oc ON oo.id = oc."orderId"
                    where
                        oo."id" in (
                            select
                                "orderId"
                            from
                                "crm"."rewardHistory"
                            where
                                "couponId" = cc.id
                    ) and %s
                )
            from
                "crm"."coupon" cc 
            where 
                %s
            order by
                "totalEarning" desc
        ) AS row
    ', params->>'where',params->>'couponWhere') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getEarningByProducts"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    nodes jsonb;
    sql text;
BEGIN
    SELECT FORMAT('
         select json_agg(row_to_json(row)) as data from (select
    id,
    type,
    name,
        (
        select
            coalesce(sum("unitPrice"), 0)
        from
            "order"."cartItem"
        where
            "productId" = p.id and "level" = 1
            and "cartId" in (
                select
                    "cartId"
                from
                    "order"."order" o
                    JOIN "order"."cart" c ON o.id = c."orderId"
                where
                    %s
            )
    ) AS "total",
    (
        select
            count(id)
        from
            "order"."cartItem"
        where
            "productId" = p.id and "level" = 1
            and "cartId" in (
                select
                    "cartId"
                from
                    "order"."order" o
                    JOIN "order"."cart" c ON o.id = c."orderId"
                where
                    %s
            )
    ) AS "orderCount"
from
    "products"."product" p where %s
order by
    "total" desc nulls last) as row
    ', params->>'where',params->>'where',params->>'productWhere') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getOrdersByStatus"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    result jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
            SELECT row_to_json(row) FROM (
                SELECT 
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
                        ) as _row
                    ) as "pending",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
                        ) as _row
                    ) as "underProcessing",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
                        ) as _row
                    ) as "readyToAssemble",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
                        ) as _row
                    ) as "readyToDisptach",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
                        ) as _row
                    ) as "delivered",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "isRejected" = true then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "isRejected" = true then a.id end), 0) as "count"
                        ) as _row
                    ) as "rejected",
                    array_agg(a.id) as "orderIds"
                FROM "order"."order" a 
                JOIN "order"."cart" b ON a.id = b."orderId" 
                WHERE (%s) 
            ) AS row
        ',params->>'where') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "isRejected" = true then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "isRejected" = true then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "rejected"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, (params->>'brandId')::integer, params->>'source') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "isRejected" = true then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "isRejected" = true then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "rejected"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, (params->>'brandId')::integer) into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND
    --                 COALESCE("isRejected", false) = false AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 b.source = ''%s''
    --             ) 
    --         ) AS row
    --     ', fromDate, toDate, params->>'source') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT row_to_json(row) FROM (
    --             SELECT 
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_PENDING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_UNDER_PROCESSING'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_ASSEMBLE'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_READY_TO_DISPATCH'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when ("status" = ''ORDER_DELIVERED'' AND COALESCE("isRejected", false) = false) then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "isRejected" = true then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "isRejected" = true then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "rejected"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --             ) 
    --         ) AS row
    --     ',fromDate, toDate) into sql;
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO result;
    END IF;
    return result;
END;
$$;
CREATE FUNCTION insights."getOrdersRecieved"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    -- total numeric;
    -- count numeric;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
            SELECT json_agg(row_to_json(row)) FROM (
                SELECT 
                    %s,
                    COUNT(a.id),
                    SUM("amountPaid") as "total",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "status" = ''ORDER_PENDING'' then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "status" = ''ORDER_PENDING'' then a.id end), 0) as "count"
                        ) as _row
                    ) as "pending",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "status" = ''ORDER_UNDER_PROCESSING'' then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "status" = ''ORDER_UNDER_PROCESSING'' then a.id end), 0) as "count"
                        ) as _row
                    ) as "underProcessing",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then a.id end), 0) as "count"
                        ) as _row
                    ) as "readyToAssemble",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "status" = ''ORDER_READY_TO_DISPATCH'' then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_DISPATCH'' then a.id end), 0) as "count"
                        ) as _row
                    ) as "readyToDispatch",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "status" = ''ORDER_DELIVERED'' then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "status" = ''ORDER_DELIVERED'' then a.id end), 0) as "count"
                        ) as _row
                    ) as "delivered",
                    (
                        SELECT row_to_json(_row) FROM (
                            SELECT 
                                COALESCE(SUM(case when "isRejected" = true then "amountPaid" end), 0) as "total", 
                                COALESCE(COUNT(case when "isRejected" = true then a.id end), 0) as "count"
                        ) as _row
                    ) as "rejected",
                    jsonb_agg(jsonb_build_object(''id'', a.id, ''created_at'', a."created_at", ''amount paid'', a."amountPaid")) as "orderRefs"
                FROM "order"."order" a 
                JOIN "order"."cart" b ON a.id = b."orderId" 
                WHERE (%s) 
                GROUP BY GROUPING SETS ((),%s)
            ) AS row
        ', params->>'columns', params->>'where', params->>'groupingSets') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_PENDING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_PENDING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_UNDER_PROCESSING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_UNDER_PROCESSING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_DISPATCH'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_DISPATCH'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_DELIVERED'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_DELIVERED'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_PENDING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_PENDING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_UNDER_PROCESSING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_UNDER_PROCESSING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_DISPATCH'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_DISPATCH'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_DELIVERED'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_DELIVERED'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_PENDING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_PENDING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_UNDER_PROCESSING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_UNDER_PROCESSING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_DISPATCH'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_DISPATCH'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_DELIVERED'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_DELIVERED'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_PENDING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_PENDING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "pending",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_UNDER_PROCESSING'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_UNDER_PROCESSING'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "underProcessing",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_ASSEMBLE'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToAssemble",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_READY_TO_DISPATCH'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_READY_TO_DISPATCH'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "readyToDisptach",
    --                 (
    --                     SELECT row_to_json(_row) FROM (
    --                         SELECT 
    --                             COALESCE(SUM(case when "status" = ''ORDER_DELIVERED'' then "amountPaid" end), 0) as "total", 
    --                             COALESCE(COUNT(case when "status" = ''ORDER_DELIVERED'' then a.id end), 0) as "count"
    --                     ) as _row
    --                 ) as "delivered"
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'groupingSets') into sql;
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getRecipeSummary"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    nodes jsonb;
    sql text;
BEGIN
    SELECT FORMAT('
         select
    json_agg(row_to_json(row)) as data
from
    (
        select
            *,
            (
                select
                    "created_at"
                from
                    "order"."cartItem"
                where
                    level = 3
                    and "simpleRecipeYieldId" in (
                        select
                            id
                        from
                            "simpleRecipe"."simpleRecipeYield"
                        where
                            "simpleRecipeId" = s.id
                    )
                    and "cartId" in (
                        select
                            id
                        from
                            "order"."cart"
                        where
                            %s
                    )
                order by
                    "created_at" desc nulls last
                limit
                    1
            ) as "lastOrderedAt"
        from
            "simpleRecipe"."simpleRecipe" s
        order by
            "lastOrderedAt" desc nulls last
        limit
            10
    ) as row', params->>'where') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getRegisteredCustomers"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
            SELECT FORMAT('
            SELECT json_agg(row_to_json(row)) FROM (
                SELECT 
                    %s,
                    COUNT(CASE WHEN b."source" = ''a-la-carte'' THEN a.id END) AS "onDemand",
                    COUNT(CASE WHEN b."source" = ''subscription'' THEN a.id END) AS "subscription"
                FROM crm.brand_customer a
                JOIN crm.customer b ON (a."keycloakId" = b."keycloakId")
                WHERE (%s) 
                GROUP BY GROUPING SETS ((), %s)
            ) AS row
        ', params->>'columns', params->>'where', params->>'groupingSets') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(CASE WHEN b."source" = ''a-la-carte'' THEN a.id END) AS "onDemand",
    --                 COUNT(CASE WHEN b."source" = ''subscription'' THEN a.id END) AS "subscription"
    --             FROM crm.brand_customer a
    --             JOIN crm.customer b ON (a."keycloakId" = b."keycloakId")
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(CASE WHEN b."source" = ''a-la-carte'' THEN a.id END) AS "onDemand",
    --                 COUNT(CASE WHEN b."source" = ''subscription'' THEN a.id END) AS "subscription"
    --             FROM crm.brand_customer a
    --             JOIN crm.customer b ON (a."keycloakId" = b."keycloakId")
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(CASE WHEN a."source" = ''a-la-carte'' THEN id END) AS "onDemand",
    --                 COUNT(CASE WHEN a."source" = ''subscription'' THEN id END) AS "subscription"
    --             FROM crm.customer a
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(CASE WHEN a."source" = ''a-la-carte'' THEN id END) AS "onDemand",
    --                 COUNT(CASE WHEN a."source" = ''subscription'' THEN id END) AS "subscription"
    --             FROM crm.customer a
    --             WHERE (
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'groupingSets') into sql;
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getSubscribedCustomers"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
            SELECT json_agg(row_to_json(row)) FROM (
                SELECT 
                    %s,
                    COUNT(a.id),
                    jsonb_agg(jsonb_build_object(''id'', a.id, ''created_at'', a."created_at")) as "orderRefs"
                FROM crm.brand_customer a
                JOIN crm.customer b ON (a."keycloakId" = b."keycloakId")
                WHERE (%s) 
                GROUP BY GROUPING SETS ((), %s)
            ) AS row
        ', params->>'columns',params->>'where', params->>'groupingSets') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id)
    --             FROM crm.brand_customer a
    --             JOIN crm.customer b ON (a."keycloakId" = b."keycloakId")
    --             WHERE (
    --                 a."isSubscriber" = true AND
    --                 a."isSubscriberTimeStamp" IS NOT NULL AND
    --                 a."isSubscriberTimeStamp" >= ''%s'' AND
    --                 a."isSubscriberTimeStamp" < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id)
    --             FROM crm.brand_customer a
    --             WHERE (
    --                 a."isSubscriber" = true AND
    --                 a."isSubscriberTimeStamp" IS NOT NULL AND
    --                 a."isSubscriberTimeStamp" >= ''%s'' AND
    --                 a."isSubscriberTimeStamp" < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --             GROUP BY GROUPING SETS ((), %s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getTopCustomers"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    nodes jsonb;
    sql text;
BEGIN
    SELECT FORMAT('
         select json_agg(row_to_json(row)) as data from (
         select *, 
         (select sum("amountPaid") from "order"."order" o JOIN "order"."cart" oc ON o.id = oc."orderId" where o."keycloakId" = c."keycloakId" and %s) as "totalAmountPaid",
         (select sum("tax") from "order"."order" o JOIN "order"."cart" oc ON o.id = oc."orderId" where o."keycloakId" = c."keycloakId" and %s) as "totalTax",
         (select sum("discount") from "order"."order" o JOIN "order"."cart" oc ON o.id = oc."orderId" where o."keycloakId" = c."keycloakId" and %s) as "totalDiscount",
         (select count(o.id) from "order"."order" o JOIN "order"."cart" oc ON o.id = oc."orderId" where o."keycloakId" = c."keycloakId" and %s) as "totalOrders",
         (
        select
            "firstName"
        from
            "platform"."customer"
        where
            "keycloakId" = c."keycloakId"
    ) as "firstName",
    (
        select
            "lastName"
        from
            "platform"."customer"
        where
            "keycloakId" = c."keycloakId"
    ) as "lastName",
    (
        select
            "phoneNumber"
        from
            "platform"."customer"
        where
            "keycloakId" = c."keycloakId"
    ) as "phoneNumber"
         from "crm"."customer" c where %s order by "totalAmountPaid" desc %s
         ) as row
    ', params->>'where',params->>'where',params->>'where',params->>'where',params->>'customerWhere',params->>'limit') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getTopProducts"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    nodes jsonb;
    sql text;
BEGIN
    SELECT FORMAT('
         select json_agg(row_to_json(row)) as data from (SELECT id, "name", ("assets"->''images''), (select count(id) from "order"."cartItem" where "productId" = p.id and 
 "level" = 1 and 
 "cartId" in (select id from "order"."cart" where %s)) as "orderCount"
 ,
 (
                select
                    "created_at"
                from
                    "order"."cartItem"
                where
                    "productId" = p.id
                    and "level" = 1
                    and "cartId" in (
                        select
                            id
                        from
                            "order"."cart"
                            where %s
                    )
                order by
                    "created_at" desc
                limit
                    1
            ) as "orderedAt", "isArchived"
 from "products"."product" p order by "orderCount" desc limit 10) as row
    ', params->>'where', params->>'where') into sql;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getTotalEarnings"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    -- fromDate date;
    -- toDate date;
    -- total numeric;
    -- count numeric;
    nodes jsonb;
    sql text;
BEGIN
    -- fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
    -- toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    SELECT FORMAT('
        SELECT json_agg(row_to_json(row)) FROM (
            SELECT 
                %s,
                COUNT(a.id),
                SUM("amountPaid") as "total", 
                COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
                COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand",
                jsonb_agg(jsonb_build_object(''id'', a.id, ''created_at'', a."created_at", ''amount paid'', a."amountPaid")) as "orderRefs"
            FROM "order"."order" a 
            JOIN "order"."cart" b ON a.id = b."orderId" 
            WHERE (%s) 
            GROUP BY GROUPING SETS ((),%s)
        ) AS row
    ', params->>'columns', params->>'where', params->>'groupingSets') into sql;
    -- IF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total", 
    --                 COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
    --                 COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand" 
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s AND
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NOT NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total", 
    --                 COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
    --                 COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand" 
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 a."brandId" = %s
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, (params->>'brandId')::integer, params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NOT NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total", 
    --                 COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
    --                 COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand" 
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s'' AND
    --                 b.source = ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'source', params->>'groupingSets') into sql;
    -- ELSIF ((params->>'brandId')::integer IS NULL) AND (params->>'source' IS NULL) THEN
    --     SELECT FORMAT('
    --         SELECT json_agg(row_to_json(row)) FROM (
    --             SELECT 
    --                 %s,
    --                 COUNT(a.id),
    --                 SUM("amountPaid") as "total", 
    --                 COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
    --                 COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand" 
    --             FROM "order"."order" a 
    --             JOIN "order"."cart" b ON a.id = b."orderId" 
    --             WHERE (
    --                 "isAccepted" = true AND 
    --                 COALESCE("isRejected", false) = false AND 
    --                 "paymentStatus" = ''SUCCEEDED'' AND
    --                 a.created_at >= ''%s'' AND
    --                 a.created_at < ''%s''
    --             ) 
    --             GROUP BY GROUPING SETS ((),%s)
    --         ) AS row
    --     ', params->>'columns', fromDate, toDate, params->>'groupingSets') into sql;
    -- END IF;
    IF sql IS NOT NULL THEN
        EXECUTE sql INTO nodes;
    END IF;
    return nodes;
END;
$$;
CREATE FUNCTION insights."getTotalEarnings2"(record insights.analytics, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    fromDate date;
    toDate date;
    total numeric;
    count numeric;
    nodes jsonb;
    sql text;
BEGIN
    IF(params->'timeline'->>'type' = 'custom') THEN
        fromDate := COALESCE(params->'timeline'->>'from', TO_CHAR(now(), 'yyyy-mm-dd'));
        toDate := COALESCE(params->'timeline'->>'to', TO_CHAR(now(), 'yyyy-mm-dd'));
    END IF;
    SELECT FORMAT('
        SELECT json_agg(row_to_json(row)) FROM (
            SELECT 
                EXTRACT(YEAR FROM a.created_at) AS "year",
                SUM("amountPaid") as "total", 
                COALESCE(SUM(case when "source" = ''subscription'' then "amountPaid" end), 0) as "subscription", 
                COALESCE(SUM(case when "source" = ''a-la-carte'' then "amountPaid" end), 0) as "ondemand" 
            FROM "order"."order" a 
            JOIN "order"."cart" b ON a.id = b."orderId" 
            WHERE (
                "isAccepted" = true AND 
                COALESCE("isRejected", false) = false AND 
                "paymentStatus" = ''SUCCEEDED'' AND
                a.created_at >= ''%s'' AND
                a.created_at < ''%s'' AND
                a."brandId" = %s AND
                b.source = ''%s''
            ) 
            GROUP BY GROUPING SETS ((),%s)
        ) AS row
    ', fromDate, toDate, (params->>'brandId')::integer, params->>'source', params->>'groupingSets') into sql;
    EXECUTE sql INTO nodes;
    return nodes;
END
$$;
CREATE FUNCTION insights.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION inventory."customToCustomUnitConverter"(quantity numeric, unit_id integer, bulkdensity numeric DEFAULT 1, unit_to_id integer DEFAULT NULL::integer) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
from_custom_rule record;
to_custom_rule record;
result jsonb := '{"error": null, "result": null}'::jsonb;
proceed text := NULL;
from_in_standard jsonb;
BEGIN  
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_to_id
    into to_custom_rule;
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_id
    into from_custom_rule;
  IF to_custom_rule IS NULL THEN
    proceed := 'to_unit';
  ELSEIF from_custom_rule IS NULL THEN
    proceed := 'from_unit';
  END IF;
  IF proceed IS NULL THEN
    SELECT data->'result'->'custom'->from_custom_rule.input_unit
      FROM inventory."unitVariationFunc"(quantity, from_custom_rule.input_unit, (-1)::numeric, to_custom_rule.output_unit::text, unit_id) 
      INTO from_in_standard;
    SELECT data 
      FROM inventory."standardToCustomUnitConverter"(
        (from_in_standard->'equivalentValue')::numeric, 
        (from_in_standard->>'toUnitName')::text, 
        (-1)::numeric, 
        unit_to_id
      )
      INTO result;
    result := jsonb_build_object(
      'error', 
      'null'::jsonb,
      'result',
      jsonb_build_object(
        'value',
        quantity,
        'toUnitName',
        to_custom_rule.input_unit,
        'fromUnitName',
        from_custom_rule.input_unit,
        'equivalentValue',
        (result->'result'->'equivalentValue')::numeric
      )
    );
  ELSEIF proceed = 'to_unit' THEN
    result := 
      format('{"error": "no custom unit is defined with the id: %s for argument to_unit, create a conversion rule in the master.\"unitConversion\" table."}', unit_to_id)::jsonb;
  ELSEIF proceed = 'from_unit' THEN
    result := 
      format('{"error": "no custom unit is defined with the id: %s for argument from_unit, create a conversion rule in the master.\"unitConversion\" table."}', unit_id)::jsonb;
  END IF;
  RETURN QUERY
  SELECT
    1 AS id,
    result as data;
END;
$$;
CREATE FUNCTION inventory."customToCustomUnitConverter"(quantity numeric, unit text, bulkdensity numeric DEFAULT 1, unitto text DEFAULT NULL::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
from_custom_rule record;
to_custom_rule record;
result jsonb := '{"error": null, "result": null}'::jsonb;
proceed text := NULL;
from_in_standard jsonb;
BEGIN  
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE "inputUnitName" = unitTo
    into to_custom_rule;
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE "inputUnitName" = unit
    into from_custom_rule;
  IF to_custom_rule IS NULL THEN
    proceed := 'to_unit';
  ELSEIF from_custom_rule IS NULL THEN
    proceed := 'from_unit';
  END IF;
  IF proceed IS NULL THEN
    SELECT data->'result'->'custom'->unit
      FROM inventory."unitVariationFunc"('tablename', quantity, unit, -1, to_custom_rule.output_unit::text) 
      INTO from_in_standard;
    SELECT data 
      FROM inventory."standardToCustomUnitConverter"((from_in_standard->'equivalentValue')::numeric, (from_in_standard->>'toUnitName')::text, -1, unitTo)
      INTO result;
    result := jsonb_build_object(
      'error', 
      'null'::jsonb,
      'result',
      jsonb_build_object(
        'value',
        quantity,
        'toUnitName',
        unitTo,
        'fromUnitName',
        unit,
        'equivalentValue',
        (result->'result'->'equivalentValue')::numeric
      )
    );
  ELSEIF proceed = 'to_unit' THEN
    result := 
      format('{"error": "no custom unit is defined with the name: %s, create a conversion rule in the master.\"unitConversion\" table."}', unitTo::text)::jsonb;
  ELSEIF proceed = 'from_unit' THEN
    result := 
      format('{"error": "no custom unit is defined with the name: %s, create a conversion rule in the master.\"unitConversion\" table."}', unit::text)::jsonb;
  END IF;
  RETURN QUERY
  SELECT
    1 AS id,
    result as data;
END;
$$;
CREATE FUNCTION inventory."customUnitVariationFunc"(quantity numeric, unit_id integer, tounit text DEFAULT NULL::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
result jsonb;
custom_conversions jsonb;
standard_conversions jsonb;
custom_unit_definition record;
BEGIN 
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_id
    into custom_unit_definition;
  If custom_unit_definition IS NOT NULL THEN
    custom_conversions := 
        jsonb_build_object(
          custom_unit_definition.input_unit, 
          jsonb_build_object(
            'value', 
            quantity, 
            'toUnitName', 
            custom_unit_definition.output_unit,
            'fromUnitName',
            custom_unit_definition.input_unit,
            'equivalentValue',
            quantity * custom_unit_definition.conversion_factor
          )
        );
    SELECT data->'result'->'standard' 
      FROM inventory."unitVariationFunc"(quantity * custom_unit_definition.conversion_factor, custom_unit_definition.output_unit, -1, toUnit) 
      INTO standard_conversions;
  ELSE 
    result := 
      format('{"error": "no custom unit is defined with the name: %s, create a conversion rule in the master.\"unitConversion\" table."}', custom_unit_definition.input_unit)::jsonb;
  END IF;
  result :=
    jsonb_build_object(
      'error',
      result->>'error',
      'result', 
      jsonb_build_object(
        'custom', 
        custom_conversions, 
        'standard', 
        standard_conversions
      )
    );
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END
$$;
CREATE FUNCTION inventory."customUnitVariationFunc"(quantity numeric, customunit text, tounit text DEFAULT NULL::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
result jsonb;
custom_conversions jsonb;
standard_conversions jsonb;
custom_unit_definition record;
BEGIN 
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE "inputUnitName" = customUnit
    into custom_unit_definition;
  If custom_unit_definition IS NOT NULL THEN
    custom_conversions := 
        jsonb_build_object(customUnit, jsonb_build_object(
            'value', 
            quantity, 
            'toUnitName', 
            custom_unit_definition.output_unit,
            'fromUnitName',
            custom_unit_definition.input_unit,
            'equivalentValue',
            quantity * custom_unit_definition.conversion_factor
          )
        );
    SELECT data->'result'->'standard' 
      FROM inventory."unitVariationFunc"('tablename', quantity * custom_unit_definition.conversion_factor, custom_unit_definition.output_unit, -1, toUnit) 
      INTO standard_conversions;
  ELSE 
    result := 
      format('{"error": "no custom unit is defined with the name: %s, create a conversion rule in the master.\"unitConversion\" table."}', customUnit)::jsonb;
  END IF;
  result :=
    jsonb_build_object(
      'error',
      result->>'error',
      'result', 
      jsonb_build_object(
        'custom', 
        custom_conversions, 
        'standard', 
        standard_conversions
      )
    );
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END
$$;
CREATE FUNCTION inventory.custom_to_custom_unit_converter(quantity numeric, from_unit text, from_bulk_density numeric, to_unit text, to_unit_bulk_density numeric, from_unit_id integer, to_unit_id integer) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
from_custom_rule record;
to_custom_rule record;
result jsonb := '{"error": null, "result": null}'::jsonb;
proceed text := NULL;
from_in_standard jsonb;
BEGIN  
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = to_unit_id
    into to_custom_rule;
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = from_unit_id
    into from_custom_rule;
  IF to_custom_rule IS NULL THEN
    proceed := 'to_unit';
  ELSEIF from_custom_rule IS NULL THEN
    proceed := 'from_unit';
  END IF;
  IF proceed IS NULL THEN
    SELECT data->'result'->'custom'->from_custom_rule.input_unit
      FROM inventory.custom_to_standard_unit_converter(
        quantity, 
        from_custom_rule.input_unit, 
        from_bulk_density,
        to_custom_rule.output_unit::text, 
        to_unit_bulk_density,
        from_unit_id,
        '',
        '',
        0
      ) INTO from_in_standard;
    SELECT data 
      FROM inventory.standard_to_custom_unit_converter(
        (from_in_standard->'equivalentValue')::numeric, 
        (from_in_standard->>'toUnitName')::text, 
        from_bulk_density,
        to_unit,
        to_unit_bulk_density,
        to_unit_id
      ) INTO result;
    result := jsonb_build_object(
      'error', 
      'null'::jsonb,
      'result',
      jsonb_build_object(
        'value',
        quantity,
        'toUnitName',
        to_unit,
        'fromUnitName',
        from_unit,
        'equivalentValue',
        (result->'result'->'equivalentValue')::numeric
      )
    );
  ELSEIF proceed = 'to_unit' THEN
    result := 
      format(
        '{"error": "no custom unit is defined with the id: %s for argument to_unit, create a conversion rule in the master.\"unitConversion\" table."}', 
        to_unit_id
      )::jsonb;
  ELSEIF proceed = 'from_unit' THEN
    result := 
      format(
        '{"error": "no custom unit is defined with the id: %s for argument from_unit, create a conversion rule in the master.\"unitConversion\" table."}', 
        from_unit_id
      )::jsonb;
  END IF;
  RETURN QUERY
  SELECT
    1 AS id,
    result as data;
END;
$$;
CREATE FUNCTION inventory.custom_to_standard_unit_converter(quantity numeric, from_unit text, from_bulk_density numeric, to_unit text, to_unit_bulk_density numeric, unit_conversion_id integer, schemaname text, tablename text, entity_id integer) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
result jsonb;
custom_conversions jsonb;
standard_conversions jsonb;
custom_unit_definition record;
BEGIN 
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_conversion_id
    into custom_unit_definition;
  If custom_unit_definition IS NOT NULL THEN
    custom_conversions := 
      jsonb_build_object(
        custom_unit_definition.input_unit, 
        jsonb_build_object(
          'value', 
          quantity, 
          'toUnitName', 
          custom_unit_definition.output_unit,
          'fromUnitName',
          custom_unit_definition.input_unit,
          'equivalentValue',
          quantity * custom_unit_definition.conversion_factor
        )
      );
    SELECT data->'result'
      FROM inventory.standard_to_standard_unit_converter(
        quantity * custom_unit_definition.conversion_factor, 
        custom_unit_definition.output_unit, 
        from_bulk_density, 
        to_unit, 
        to_unit_bulk_density,
        schemaname,
        tablename,
        entity_id,
        'all'
      ) INTO standard_conversions;
  ELSE 
    result := 
      format(
        '{"error": "no custom unit is defined with the id: %s and name: %s, create a conversion rule in the master.\"unitConversion\" table."}', 
        unit_conversion_id,
        from_unit
      )::jsonb;
  END IF;
  result :=
    jsonb_build_object(
      'error',
      result->>'error',
      'result', 
      jsonb_build_object(
        'custom', 
        custom_conversions, 
        'others', 
        standard_conversions
      )
    );
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END;
$$;
CREATE FUNCTION inventory."matchIngredientIngredient"(ingredients jsonb, ingredientids integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
ingredient_i record;
ingredient record;
result jsonb;
arr jsonb := '[]';
matched_ingredient jsonb;
BEGIN
  IF ingredientIds IS NOT NULL THEN
    FOR ingredient_i IN 
      SELECT name, id FROM ingredient.ingredient 
      WHERE name IS NOT NULL 
      AND id = ANY(ingredientIds) LOOP
      SELECT * FROM jsonb_array_elements(ingredients) AS found_ingredient
      WHERE (found_ingredient ->> 'ingredientName')::text = ingredient_i.name 
      into matched_ingredient;
      IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
          'ingredient',
          matched_ingredient,
          'ingredientId',
          ingredient_i.id
        ); 
      END IF;
    END LOOP;
  ELSE 
    FOR ingredient_i IN 
      SELECT name, id FROM ingredient.ingredient 
      WHERE name IS NOT NULL 
    LOOP
      SELECT * FROM jsonb_array_elements(ingredients) AS found_ingredient
      WHERE (found_ingredient ->> 'ingredientName')::text = ingredient_i.name 
      into matched_ingredient;
      IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
          'ingredient',
          matched_ingredient,
          'ingredientId',
          ingredient_i.id
        ); 
      END IF;
    END LOOP;
  END IF;
result := jsonb_build_object('matchIngredientIngredient', arr);
RETURN QUERY
  SELECT 
    1 AS id,
    result AS data;
END;
$$;
CREATE FUNCTION inventory."matchIngredientSachetItem"(ingredients jsonb, supplieriteminputs integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE supplier_item record;
result jsonb;
arr jsonb := '[]';
matched_ingredient jsonb;
BEGIN IF supplierItemInputs IS NOT NULL THEN FOR supplier_item IN
SELECT "sachetItem".id sachet_id,
  "supplierItem".id,
  "supplierItem".name
FROM inventory."sachetItem"
  Inner JOIN inventory."bulkItem" ON "bulkItemId" = "bulkItem"."id"
  Inner JOIN inventory."supplierItem" ON "supplierItemId" = "supplierItem"."id"
WHERE "supplierItem".id = ANY (supplierItemInputs) LOOP
SELECT *
FROM jsonb_array_elements(ingredients) AS found_ingredient
WHERE (found_ingredient->>'ingredientName') = supplier_item.name INTO matched_ingredient;
IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
  'ingredient',
  matched_ingredient,
  'supplierItemId',
  supplier_item.id,
  'sachetItemId',
  supplier_item.sachet_id
);
END IF;
END LOOP;
ELSE FOR supplier_item IN
SELECT "sachetItem".id sachet_id,
  "supplierItem".id,
  "supplierItem".name
FROM inventory."sachetItem"
  Inner JOIN inventory."bulkItem" ON "bulkItemId" = "bulkItem"."id"
  Inner JOIN inventory."supplierItem" ON "supplierItemId" = "supplierItem"."id" LOOP
SELECT *
FROM jsonb_array_elements(ingredients) AS found_ingredient
WHERE (found_ingredient->>'ingredientName') = supplier_item.name INTO matched_ingredient;
IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
  'ingredient',
  matched_ingredient,
  'supplierItemId',
  supplier_item.id,
  'sachetItemId',
  supplier_item.sachet_id
);
END IF;
END LOOP;
END IF;
result := jsonb_build_object('ingredientSachetItemMatches', arr);
RETURN QUERY
SELECT 1 AS id,
  result as data;
END;
$$;
CREATE FUNCTION inventory."matchIngredientSupplierItem"(ingredients jsonb, supplieriteminputs integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE supplier_item record;
ingredient record;
result jsonb;
arr jsonb := '[]';
matched_ingredient jsonb;
BEGIN IF supplierItemInputs IS NOT NULL THEN FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name"
FROM inventory."supplierItem"
WHERE "supplierItem".id = ANY (supplierItemInputs) LOOP
SELECT *
FROM jsonb_array_elements(ingredients) AS found_ingredient
WHERE (found_ingredient->>'ingredientName') = supplier_item.name INTO matched_ingredient;
IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
  'ingredient',
  matched_ingredient,
  'supplierItemId',
  supplier_item.id
);
END IF;
END LOOP;
ELSE FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name"
FROM inventory."supplierItem" LOOP
SELECT *
FROM jsonb_array_elements(ingredients) AS found_ingredient
WHERE (found_ingredient->>'ingredientName') = supplier_item.name INTO matched_ingredient;
IF matched_ingredient IS NOT NULL THEN arr := arr || jsonb_build_object(
  'ingredient',
  matched_ingredient,
  'supplierItemId',
  supplier_item.id
);
END IF;
END LOOP;
END IF;
result := jsonb_build_object('ingredientSupplierItemMatches', arr);
RETURN QUERY
SELECT 1 AS id,
  result as data;
END;
$$;
CREATE FUNCTION inventory."matchSachetIngredientSachet"(sachets jsonb, ingredientsachetids integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE sachet_ingredient record;
sachet record;
result jsonb;
arr jsonb := '[]';
matched_sachet jsonb;
BEGIN IF ingredientSachetIds IS NOT NULL THEN FOR sachet_ingredient IN 
SELECT
  "ingredientSachet".id,
  quantity,
  "processingName",
  name
FROM
  ingredient."ingredientSachet"
  JOIN ingredient."ingredientProcessing" ON "ingredientProcessingId" = "ingredientProcessing".id
  JOIN ingredient.ingredient ON "ingredientSachet"."ingredientId" = ingredient.id
WHERE
  "ingredientSachet"."quantity" IS NOT NULL
  AND "ingredientProcessing"."processingName" IS NOT NULL
  AND "ingredientSachet".id = ANY (ingredientSachetIds) LOOP
SELECT
  *
FROM
  jsonb_array_elements(sachets) AS found_sachet
WHERE
  (found_sachet ->> 'quantity') :: int = sachet_ingredient."quantity"
  AND (found_sachet ->> 'processingName') = sachet_ingredient."processingName"
  AND (found_sachet ->> 'ingredientName') = sachet_ingredient.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
    'sachet',
    matched_sachet,
    'ingredientSachetId',
    sachet_ingredient.id,
    'isProcessingExactMatch',
    true
  );
END IF;
END LOOP;
ELSE FOR sachet_ingredient IN
SELECT
  "ingredientSachet".id,
  quantity,
  "processingName",
  name
FROM
  ingredient."ingredientSachet"
  JOIN ingredient."ingredientProcessing" ON "ingredientProcessingId" = "ingredientProcessing".id
  JOIN ingredient.ingredient ON "ingredientSachet"."ingredientId" = ingredient.id
WHERE
  "ingredientSachet"."quantity" IS NOT NULL
  AND "ingredientProcessing"."processingName" IS NOT NULL LOOP
SELECT
  *
FROM
  jsonb_array_elements(sachets) AS found_sachet
WHERE
  (found_sachet ->> 'quantity') :: int = sachet_ingredient."quantity"
  AND (found_sachet ->> 'processingName') = sachet_ingredient."processingName"
  AND (found_sachet ->> 'ingredientName') = sachet_ingredient.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
    'sachet',
    matched_sachet,
    'ingredientSachetId',
    sachet_ingredient.id,
    'isProcessingExactMatch',
    true
  );
END IF;
END LOOP;
END IF;
result := jsonb_build_object('sachetIngredientSachetMatches', arr);
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$$;
CREATE FUNCTION inventory."matchSachetSachetItem"(sachets jsonb, sachetitemids integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE supplier_item record;
sachet record;
result jsonb;
arr jsonb := '[]';
matched_sachet jsonb;
BEGIN IF sachetItemIds IS NOT NULL THEN FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name",
  "processingName",
  "bulkItem".id "processingId",
  "sachetItem"."unitSize",
  "sachetItem"."unit",
  "sachetItem".id sachet_item_id
FROM inventory."supplierItem"
  LEFT JOIN inventory."bulkItem" ON "supplierItem"."id" = "bulkItem"."supplierItemId"
  LEFT JOIN inventory."sachetItem" ON "sachetItem"."bulkItemId" = "bulkItem"."id"
WHERE "sachetItem"."unitSize" IS NOT NULL
  AND "sachetItem".id = ANY (sachetItemIds) LOOP
SELECT *
FROM jsonb_array_elements(sachets) AS found_sachet
WHERE (found_sachet->>'quantity')::int = supplier_item."unitSize"
  AND (found_sachet->>'processingName') = supplier_item."processingName"
  AND (found_sachet->>'ingredientName') = supplier_item.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
  'sachet',
  matched_sachet,
  'supplierItemId',
  supplier_item.id,
  'supplierItemUnit',
  supplier_item.unit,
  'matched_sachetId',
  supplier_item.sachet_item_id,
  'isProcessingExactMatch',
  true
);
END IF;
END LOOP;
ELSE FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name",
  "processingName",
  "bulkItem".id "processingId",
  "sachetItem"."unitSize",
  "sachetItem"."unit",
  "sachetItem"."id" sachet_item_id
FROM inventory."supplierItem"
  LEFT JOIN inventory."bulkItem" ON "supplierItem"."id" = "bulkItem"."supplierItemId"
  LEFT JOIN inventory."sachetItem" ON "sachetItem"."bulkItemId" = "bulkItem"."id"
WHERE "sachetItem"."unitSize" IS NOT NULL
  AND "processingName" IS NOT NULL LOOP
SELECT *
FROM jsonb_array_elements(sachets) AS found_sachet
WHERE (found_sachet->>'quantity')::int = supplier_item."unitSize"
  AND (found_sachet->>'processingName') = supplier_item."processingName"
  AND (found_sachet->>'ingredientName') = supplier_item.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
  'sachet',
  matched_sachet,
  'supplierItemId',
  supplier_item.id,
  'supplierItemUnit',
  supplier_item.unit,
  'matched_sachetId',
  supplier_item.sachet_item_id,
  'isProcessingExactMatch',
  true
);
END IF;
END LOOP;
END IF;
result := jsonb_build_object('sachetSachetItemMatches', arr);
RETURN QUERY
SELECT 1 AS id,
  result as data;
END;
$$;
CREATE FUNCTION inventory."matchSachetSupplierItem"(sachets jsonb, supplieriteminputs integer[]) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE supplier_item record;
sachet record;
result jsonb;
arr jsonb := '[]';
matched_sachet jsonb;
BEGIN IF supplierItemInputs IS NOT NULL THEN FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name",
  "supplierItem"."unitSize",
  "supplierItem".unit,
  "processingName"
FROM inventory."supplierItem"
  LEFT JOIN inventory."bulkItem" ON "bulkItemAsShippedId" = "bulkItem"."id"
WHERE "supplierItem".id = ANY (supplierItemInputs) LOOP
SELECT *
FROM jsonb_array_elements(sachets) AS found_sachet
WHERE (found_sachet->>'quantity')::int = supplier_item."unitSize"
  AND (found_sachet->>'processingName') = supplier_item."processingName"
  AND (found_sachet->>'ingredientName') = supplier_item.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
  'sachet',
  matched_sachet,
  'supplierItemId',
  supplier_item.id,
  'isProcessingExactMatch',
  true
);
END IF;
END LOOP;
ELSE FOR supplier_item IN
SELECT "supplierItem".id,
  "supplierItem"."name",
  "supplierItem"."unitSize",
  "supplierItem".unit,
  "processingName"
FROM inventory."supplierItem"
  LEFT JOIN inventory."bulkItem" ON "bulkItemAsShippedId" = "bulkItem"."id"
WHERE "processingName" IS NOT NULL LOOP
SELECT *
FROM jsonb_array_elements(sachets) AS found_sachet
WHERE (found_sachet->>'quantity')::int = supplier_item."unitSize"
  AND (found_sachet->>'processingName') = supplier_item."processingName"
  AND (found_sachet->>'ingredientName') = supplier_item.name INTO matched_sachet;
IF matched_sachet IS NOT NULL THEN arr := arr || jsonb_build_object(
  'sachet',
  matched_sachet,
  'supplierItemId',
  supplier_item.id,
  'isProcessingExactMatch',
  true
);
END IF;
END LOOP;
END IF;
result := jsonb_build_object('sachetSupplierItemMatches', arr);
RETURN QUERY
SELECT 1 AS id,
  result as data;
END;
$$;
CREATE FUNCTION inventory."setBulkItemNutritionalInfo"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
userDefinedNutritionId int;
dynamicNutritionId int;
BEGIN
Select id from "products"."nutritionInfo" where "bulkItemId" = NEW.id into userDefinedNutritionId;
if userDefinedNutritionId is not null then
NEW."nutritionId" := userDefinedNutritionId;
RETURN NEW;
else
select "nutritionId" from "inventory"."supplierItem" where id = New."supplierItemId" into dynamicNutritionId;
  NEW."nutritionId" := dynamicNutritionId;
    RETURN NEW;
END IF;
RETURN NEW;
END;
$$;
CREATE FUNCTION inventory."set_current_timestamp_updatedAt"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  _new record;
BEGIN
  _new := NEW;
  _new."updatedAt" = NOW();
  RETURN _new;
END;
$$;
CREATE FUNCTION inventory.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION inventory."standardToCustomUnitConverter"(quantity numeric, unit text, bulkdensity numeric DEFAULT 1, unit_to_id numeric DEFAULT NULL::numeric) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
result jsonb := '{"error": null, "result": null}'::jsonb;
custom_rule record;
converted_standard jsonb;
BEGIN  
  -- unit_to_id is the id of a custom rule in master."unitConversion"
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_to_id
    into custom_rule;
  IF custom_rule IS NOT NULL THEN
    SELECT data FROM inventory."unitVariationFunc"(quantity, unit, (-1)::numeric, custom_rule.output_unit, -1) into converted_standard;
    result := jsonb_build_object(
      'error', 
      'null'::jsonb, 
      'result', 
      jsonb_build_object(
        'fromUnitName', 
        unit, 
        'toUnitName', 
        custom_rule.input_unit,
        'value',
        quantity,
        'equivalentValue',
        (converted_standard->'result'->'standard'->custom_rule.output_unit->>'equivalentValue')::numeric / custom_rule.conversion_factor
    ));
  ELSE
    -- costruct an error msg
    result := 
      format('{"error": "no custom unit is defined with the id: %s, create a conversion rule in the master.\"unitConversion\" table."}', unit_to_id)::jsonb;
  END IF;
  RETURN QUERY
  SELECT
    1 AS id,
    result as data;
END;
$$;
CREATE FUNCTION inventory.standard_to_all_converter(quantity numeric, from_unit text, from_bulk_density numeric, tablename text, entity_id integer, all_mode text DEFAULT 'all'::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$ 
DECLARE 
definitions jsonb := $${"kg":{"name":{"abbr":"kg","singular":"Kilogram","plural":"Kilograms"},"base":"g","factor":1000},
                        "g":{"name":{"abbr":"g","singular":"Gram","plural":"Grams"},"base":"g","factor":1},
                        "mg":{"name":{"abbr":"mg","singular":"Miligram","plural":"MiliGrams"},"base":"g","factor":0.001},
                        "oz":{"name":{"abbr":"oz","singular":"Ounce","plural":"Ounces"},"base":"g","factor":28.3495},
                        "l":{"name":{"abbr":"l","singular":"Litre","plural":"Litres"},"base":"ml","factor":1000,"bulkDensity":1},
                        "ml":{"name":{"abbr":"ml","singular":"Millilitre","plural":"Millilitres"},"base":"ml","factor":1,"bulkDensity":1}
                        }$$;
unit_key record;
custom_unit_key record;
from_definition jsonb;
local_result jsonb;
result_standard jsonb := '{}'::jsonb;
result_custom jsonb := '{}'::jsonb;
result jsonb := '{"error": null, "result": null}'::jsonb;
converted_value numeric;
BEGIN  
  IF all_mode = 'standard' OR all_mode = 'all' THEN
    from_definition := definitions -> from_unit;
    FOR unit_key IN SELECT key, value FROM jsonb_each(definitions) LOOP
      -- unit_key is definition from definitions.
      IF unit_key.value -> 'bulkDensity' THEN
        -- to is volume
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric / (unit_key.value->>'bulkDensity')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      ELSE
        -- to is mass
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume 
          converted_value := quantity *  (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric * (from_unit_bulk_density)::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      END IF;
      result_standard := result_standard || jsonb_build_object(unit_key.key, local_result);
    END LOOP;
  ELSIF all_mode = 'custom' OR all_mode = 'all' THEN
    FOR custom_unit_key IN
      EXECUTE format(
        $$SELECT 
          "inputUnitName" input_unit, 
          "outputUnitName" output_unit, 
          "conversionFactor" conversion_factor, 
          "unitConversionId" unit_conversion_id
        FROM %I
        INNER JOIN master."unitConversion"
        ON "unitConversionId" = "unitConversion".id
        WHERE "entityId" = (%s)::integer;$$,
        tablename,
        entity_id
      )
      LOOP
        SELECT data FROM inventory.standard_to_custom_unit_converter(
          quantity,
          from_unit, 
          from_bulk_density,
          custom_unit_key.input_unit,
          (-1)::numeric,
          custom_unit_key.unit_conversion_id
        ) INTO local_result;
        result_custom := result_custom || jsonb_build_object(custom_unit_key.input_unit, local_result);
      END LOOP;
  END IF;
  result := jsonb_build_object(
    'result',
    jsonb_build_object('standard', result_standard, 'custom', result_custom),
    'error',
    'null'::jsonb
  );
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$_$;
CREATE FUNCTION inventory.standard_to_all_converter(quantity numeric, from_unit text, from_bulk_density numeric, schemaname text DEFAULT ''::text, tablename text DEFAULT ''::text, entity_id integer DEFAULT '-1'::integer, all_mode text DEFAULT 'all'::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$ 
DECLARE 
definitions jsonb := $${"kg":{"name":{"abbr":"kg","singular":"Kilogram","plural":"Kilograms"},"base":"g","factor":1000},
                        "g":{"name":{"abbr":"g","singular":"Gram","plural":"Grams"},"base":"g","factor":1},
                        "mg":{"name":{"abbr":"mg","singular":"Miligram","plural":"MiliGrams"},"base":"g","factor":0.001},
                        "oz":{"name":{"abbr":"oz","singular":"Ounce","plural":"Ounces"},"base":"g","factor":28.3495},
                        "l":{"name":{"abbr":"l","singular":"Litre","plural":"Litres"},"base":"ml","factor":1000,"bulkDensity":1},
                        "ml":{"name":{"abbr":"ml","singular":"Millilitre","plural":"Millilitres"},"base":"ml","factor":1,"bulkDensity":1}
                        }$$;
unit_key record;
custom_unit_key record;
from_definition jsonb;
local_result jsonb;
result_standard jsonb := '{}'::jsonb;
result_custom jsonb := '{}'::jsonb;
result jsonb := '{"error": null, "result": null}'::jsonb;
converted_value numeric;
BEGIN  
  IF all_mode = 'standard' OR all_mode = 'all' THEN
    from_definition := definitions -> from_unit;
    FOR unit_key IN SELECT "key", value FROM jsonb_each(definitions) LOOP
      -- unit_key is definition from definitions.
      IF unit_key.value -> 'bulkDensity' THEN
        -- to is volume
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key."key",
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric / (unit_key.value->>'bulkDensity')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key."key",
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      ELSE
        -- to is mass
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume 
          converted_value := quantity *  (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric * (from_unit_bulk_density)::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key."key",
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            from_unit,
            'toUnitName',
            unit_key."key",
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      END IF;
      result_standard := result_standard || jsonb_build_object(unit_key.key, local_result);
    END LOOP;
  END IF;
  IF all_mode = 'custom' OR all_mode = 'all' THEN
    FOR custom_unit_key IN
      EXECUTE format(
        $$SELECT 
          "inputUnitName" input_unit, 
          "outputUnitName" output_unit, 
          "conversionFactor" conversion_factor, 
          "unitConversionId" unit_conversion_id
        FROM %I.%I
        INNER JOIN master."unitConversion"
        ON "unitConversionId" = "unitConversion".id
        WHERE "entityId" = (%s)::integer;$$,
        schemaname,
        tablename,
        entity_id
      )
      LOOP
        SELECT data FROM inventory.standard_to_custom_unit_converter(
          quantity,
          from_unit, 
          from_bulk_density,
          custom_unit_key.input_unit,
          (1)::numeric,
          custom_unit_key.unit_conversion_id
        ) INTO local_result;
        result_custom := result_custom || jsonb_build_object(custom_unit_key.input_unit, local_result);
      END LOOP;
  END IF;
  result := jsonb_build_object(
    'result',
    jsonb_build_object('standard', result_standard, 'custom', result_custom),
    'error',
    'null'::jsonb
  );
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$_$;
CREATE FUNCTION inventory.standard_to_custom_unit_converter(quantity numeric, from_unit text, from_bulk_density numeric, to_unit text, to_unit_bulk_density numeric, unit_conversion_id integer) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
result jsonb := '{"error": null, "result": null}'::jsonb;
custom_rule record;
converted_standard jsonb;
BEGIN  
  -- unit_to_id is the id of a custom rule in master."unitConversion"
  SELECT "inputUnitName" input_unit, "outputUnitName" output_unit, "conversionFactor" conversion_factor 
    FROM master."unitConversion" 
    WHERE id = unit_conversion_id
    into custom_rule;
  IF custom_rule IS NOT NULL THEN
    SELECT data FROM inventory.standard_to_standard_unit_converter(
      quantity, 
      from_unit, 
      from_bulk_density,
      custom_rule.output_unit, 
      to_unit_bulk_density,
      '', -- schemaname
      '', -- tablename
      0 -- entity id
    ) into converted_standard;
    result := jsonb_build_object(
      'error', 
      'null'::jsonb, 
      'result', 
      jsonb_build_object(
        'fromUnitName', 
        from_unit, 
        'toUnitName', 
        custom_rule.input_unit,
        'value',
        quantity,
        'equivalentValue',
        (converted_standard->'result'->'standard'->custom_rule.output_unit->>'equivalentValue')::numeric / custom_rule.conversion_factor
    ));
  ELSE
    -- costruct an error msg
    result := 
      format(
        '{"error": "no custom unit is defined with the id: %s and name: %s, create a conversion rule in the master.\"unitConversion\" table."}', 
        unit_conversion_id,
        to_unit
      )::jsonb;
  END IF;
  RETURN QUERY
  SELECT
    1 AS id,
    result as data;
END;
$$;
CREATE FUNCTION inventory.standard_to_standard_unit_converter(quantity numeric, from_unit text, from_bulk_density numeric, to_unit text, to_unit_bulk_density numeric, schemaname text, tablename text, entity_id integer, all_mode text DEFAULT 'all'::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$ 
DECLARE 
definitions jsonb := $${"kg":{"name":{"abbr":"kg","singular":"Kilogram","plural":"Kilograms"},"base":"g","factor":1000},
                        "g":{"name":{"abbr":"g","singular":"Gram","plural":"Grams"},"base":"g","factor":1},
                        "mg":{"name":{"abbr":"mg","singular":"Miligram","plural":"MiliGrams"},"base":"g","factor":0.001},
                        "oz":{"name":{"abbr":"oz","singular":"Ounce","plural":"Ounces"},"base":"g","factor":28.3495},
                        "l":{"name":{"abbr":"l","singular":"Litre","plural":"Litres"},"base":"ml","factor":1000,"bulkDensity":1},
                        "ml":{"name":{"abbr":"ml","singular":"Millilitre","plural":"Millilitres"},"base":"ml","factor":1,"bulkDensity":1}
                        }$$;
unit_key record;
from_definition jsonb;
to_definition jsonb;
local_result jsonb;
result_standard jsonb := '{}'::jsonb;
result jsonb := '{"error": null, "result": null}'::jsonb;
converted_value numeric;
BEGIN  
  -- 1. get the from definition of this unit;
  from_definition := definitions -> from_unit;
  -- gql forces the value of uni_to, passing '' should work.
  IF to_unit = '' OR to_unit IS NULL THEN 
    -- to_unit is '', convert to all (standard to custom)
    SELECT data from inventory.standard_to_all_converter(
      quantity,
      from_unit, 
      from_bulk_density,
      schemaname,
      tablename,
      entity_id,
      all_mode
    ) INTO result;
  ELSE 
    to_definition := definitions -> to_unit;
    IF to_definition -> 'bulkDensity' THEN
      -- to is volume
      IF from_definition -> 'bulkDensity' THEN
        -- from is volume too
        -- ignore bulkDensity as they should be same in volume to volume of same entity.
        converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
        local_result := jsonb_build_object(
          'fromUnitName',
          from_unit,
          'toUnitName',
          to_definition->'name'->>'abbr',
          'value',
          quantity,
          'equivalentValue',
          converted_value
        );
      ELSE
        -- from is mass
        converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric / (to_unit_bulk_density)::numeric;
        local_result := jsonb_build_object(
          'fromUnitName',
          from_unit,
          'toUnitName',
          to_definition->'name'->>'abbr',
          'value',
          quantity,
          'equivalentValue',
          converted_value
        );
      END IF;
    ELSE
      -- to is mass
      IF from_definition -> 'bulkDensity' THEN
        -- from is volume 
        converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric * (from_bulk_density)::numeric;
        local_result := jsonb_build_object(
          'fromUnitName',
          from_unit,
          'toUnitName',
          to_definition->'name'->>'abbr',
          'value',
          quantity,
          'equivalentValue',
          converted_value
        );
      ELSE
        -- from is mass too
        converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
        local_result := jsonb_build_object(
          'fromUnitName',
          from_unit,
          'toUnitName',
          to_definition->'name'->>'abbr',
          'value',
          quantity,
          'equivalentValue',
          converted_value
        );
      END IF;
    END IF;
  result_standard := result_standard || jsonb_build_object(to_definition->'name'->>'abbr', local_result);
  result := jsonb_build_object(
    'result',
    jsonb_build_object('standard', result_standard),
    'error',
    'null'::jsonb
  );
  END IF;
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$_$;
CREATE FUNCTION inventory."unitVariationFunc"(quantity numeric, unit text DEFAULT NULL::text, bulkdensity numeric DEFAULT 1, unitto text DEFAULT NULL::text, unit_id integer DEFAULT NULL::integer) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$ 
DECLARE 
definitions jsonb := $${"kg":{"name":{"abbr":"kg","singular":"Kilogram","plural":"Kilograms"},"base":"g","factor":1000},
                        "g":{"name":{"abbr":"g","singular":"Gram","plural":"Grams"},"base":"g","factor":1},
                        "mg":{"name":{"abbr":"mg","singular":"Miligram","plural":"MiliGrams"},"base":"g","factor":0.001},
                        "oz":{"name":{"abbr":"oz","singular":"Ounce","plural":"Ounces"},"base":"g","factor":28.3495},
                        "l":{"name":{"abbr":"l","singular":"Litre","plural":"Litres"},"base":"ml","factor":1000,"bulkDensity":1},
                        "ml":{"name":{"abbr":"ml","singular":"Millilitre","plural":"Millilitres"},"base":"ml","factor":1,"bulkDensity":1}
                        }$$;
known_units text[] := '{kg, g, mg, oz, l, ml}';
unit_key record;
from_definition jsonb;
to_definition jsonb;
local_result jsonb;
result_standard jsonb := '{}'::jsonb;
result jsonb := '{"error": null, "result": null}'::jsonb;
converted_value numeric;
BEGIN  
  IF unit = ANY(known_units) THEN
  -- 1. get the from definition of this unit;
    from_definition := definitions -> unit;
    -- gql forces the value of unitTo, passing '' should work.
    IF unitTo IS NULL OR unitTo = '' THEN
      FOR unit_key IN SELECT key, value FROM jsonb_each(definitions) LOOP
        -- unit_key is definition from definitions.
        IF unit_key.value -> 'bulkDensity' THEN
          -- to is volume
          IF from_definition -> 'bulkDensity' THEN
            -- from is volume too
            converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
            local_result := jsonb_build_object(
              'fromUnitName',
              unit,
              'toUnitName',
              unit_key.key,
              'value',
              quantity,
              'equivalentValue',
              converted_value
            );
          ELSE
            -- from is mass
            converted_value := quantity * (unit_key.value->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
            local_result := jsonb_build_object(
              'fromUnitName',
              unit,
              'toUnitName',
              unit_key.key,
              'value',
              quantity,
              'equivalentValue',
              converted_value
            );
          END IF;
        ELSE
          -- to is mass
          IF from_definition -> 'bulkDensity' THEN
            -- from is volume 
            converted_value := quantity * (from_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
            local_result := jsonb_build_object(
              'fromUnitName',
              unit,
              'toUnitName',
              unit_key.key,
              'value',
              quantity,
              'equivalentValue',
              converted_value
            );
          ELSE
            -- from is mass too
            converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
            local_result := jsonb_build_object(
              'fromUnitName',
              unit,
              'toUnitName',
              unit_key.key,
              'value',
              quantity,
              'equivalentValue',
              converted_value
            );
          END IF;
        END IF;
        result_standard := result_standard || jsonb_build_object(unit_key.key, local_result);
      END LOOP;
  ELSE -- unitTo is not null
    to_definition := definitions -> unitTo;
      IF to_definition -> 'bulkDensity' THEN
        -- to is volume
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume too
          converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass
          converted_value := quantity * (to_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      ELSE
        -- to is mass
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume 
          converted_value := quantity * (from_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass too
          converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      END IF;
    result_standard := result_standard || jsonb_build_object(to_definition->'name'->>'abbr', local_result);
  END IF;
    result := jsonb_build_object(
      'result',
      jsonb_build_object('standard', result_standard),
      'error',
      'null'::jsonb
    );
  ELSE -- @param unit is not in standard_definitions
    IF unit_id IS NULL THEN
      result := jsonb_build_object(
        'error',
        'unit_id must not be null'
      );
    ELSE
      -- check if customConversion is possible with @param unit
      -- inventory."customUnitVariationFunc" also does error handling for us :)
      -- @param unit_id should not be null here
      -- @param unitTo is a standard unit
      SELECT data from inventory."customUnitVariationFunc"(quantity, unit_id, unitTo) into result;
    END IF;
  END IF;
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$_$;
CREATE FUNCTION inventory."unitVariationFunc"(tablename text, quantity numeric, unit text, bulkdensity numeric DEFAULT 1, unitto text DEFAULT NULL::text) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$ 
DECLARE 
definitions jsonb := $${"kg":{"name":{"abbr":"kg","singular":"Kilogram","plural":"Kilograms"},"base":"g","factor":1000},
                        "g":{"name":{"abbr":"g","singular":"Gram","plural":"Grams"},"base":"g","factor":1},
                        "mg":{"name":{"abbr":"mg","singular":"Miligram","plural":"MiliGrams"},"base":"g","factor":0.001},
                        "oz":{"name":{"abbr":"oz","singular":"Ounce","plural":"Ounces"},"base":"g","factor":28.3495},
                        "l":{"name":{"abbr":"l","singular":"Litre","plural":"Litres"},"base":"ml","factor":1000,"bulkDensity":1},
                        "ml":{"name":{"abbr":"ml","singular":"Millilitre","plural":"Millilitres"},"base":"ml","factor":1,"bulkDensity":1}
                        }$$;
known_units text[] := '{kg, g, mg, oz, l, ml}';
unit_key record;
from_definition jsonb;
to_definition jsonb;
local_result jsonb;
result_standard jsonb := '{}'::jsonb;
result jsonb := '{"error": null, "result": null}'::jsonb;
converted_value numeric;
BEGIN  
  IF unit = ANY(known_units) THEN
  -- 1. get the from definition of this unit;
    from_definition := definitions -> unit;
    -- gql forces the value of unitTo, passing "" should work.
    IF unitTo IS NULL OR unitTo = '' THEN
    FOR unit_key IN SELECT key, value FROM jsonb_each(definitions) LOOP
      -- unit_key is definition from definitions.
      IF unit_key.value -> 'bulkDensity' THEN
        -- to is volume
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass
          converted_value := quantity * (unit_key.value->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      ELSE
        -- to is mass
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume 
          converted_value := quantity * (from_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass too
          converted_value := quantity * (from_definition->>'factor')::numeric / (unit_key.value->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            unit_key.key,
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      END IF;
      result_standard := result_standard || jsonb_build_object(unit_key.key, local_result);
    END LOOP;
  ELSE -- unitTo is not null
    to_definition := definitions -> unitTo;
      IF to_definition -> 'bulkDensity' THEN
        -- to is volume
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume too
          converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass
          converted_value := quantity * (to_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      ELSE
        -- to is mass
        IF from_definition -> 'bulkDensity' THEN
          -- from is volume 
          converted_value := quantity * (from_definition->>'bulkDensity')::numeric * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        ELSE
          -- from is mass too
          converted_value := quantity * (from_definition->>'factor')::numeric / (to_definition->>'factor')::numeric;
          local_result := jsonb_build_object(
            'fromUnitName',
            unit,
            'toUnitName',
            to_definition->'name'->>'abbr',
            'value',
            quantity,
            'equivalentValue',
            converted_value
          );
        END IF;
      END IF;
    result_standard := result_standard || jsonb_build_object(to_definition->'name'->>'abbr', local_result);
  END IF;
  -- TODO: is is_unit_to_custom == true -> handle standard to custom (probably another sql func)
    result := jsonb_build_object(
      'result',
      jsonb_build_object('standard', result_standard),
      'error',
      'null'::jsonb
    );
  ELSE -- @param unit is not in standard_definitions
    -- check if customConversion is possible with @param unit
    -- inventory."customUnitVariationFunc" also does error handling for us :)
    SELECT data from inventory."customUnitVariationFunc"(quantity, unit, unitTo) into result;
  END IF;
RETURN QUERY
SELECT
  1 AS id,
  result as data;
END;
$_$;
CREATE TABLE inventory."bulkItem" (
    id integer DEFAULT public.defaultid('inventory'::text, 'bulkItem'::text, 'id'::text) NOT NULL,
    "processingName" text NOT NULL,
    "supplierItemId" integer NOT NULL,
    labor jsonb,
    "shelfLife" jsonb,
    yield jsonb,
    "nutritionInfo" jsonb,
    sop jsonb,
    allergens jsonb,
    "parLevel" numeric,
    "maxLevel" numeric,
    "onHand" numeric DEFAULT 0 NOT NULL,
    "storageCondition" jsonb,
    "createdAt" timestamp with time zone DEFAULT now(),
    "updatedAt" timestamp with time zone DEFAULT now(),
    "bulkDensity" numeric DEFAULT 1,
    equipments jsonb,
    unit text,
    committed numeric DEFAULT 0 NOT NULL,
    awaiting numeric DEFAULT 0 NOT NULL,
    consumed numeric DEFAULT 0 NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    image jsonb
);
COMMENT ON TABLE inventory."bulkItem" IS 'This table contains all the records of bulkitem across all the brand.';
CREATE FUNCTION inventory.unit_conversions_bulk_item(item inventory."bulkItem", from_unit text, from_unit_bulk_density numeric, quantity numeric, to_unit text, to_unit_bulk_density numeric) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
  local_quantity                   numeric;
  local_from_unit                  text; 
  local_from_unit_bulk_density     numeric; 
  local_to_unit_bulk_density       numeric;
  known_units                      text[] := '{kg, g, mg, oz, l, ml}';
  result                           jsonb;
  custom_to_unit_conversion_id     integer;
  custom_from_unit_conversion_id   integer;
BEGIN
  /* setup */
  -- resolve quantity
  IF quantity IS NULL OR quantity = -1 THEN
    local_quantity := item."unitSize"::numeric;
  ELSE
    local_quantity := quantity;
  END IF;
  -- resolve from_unit
  IF from_unit IS NULL OR from_unit = ''
    THEN
    local_from_unit := item.unit;
  ELSE
    local_from_unit := from_unit;
  END IF;
  -- resolve from_unit_bulk_density
  IF from_unit_bulk_density IS NULL OR from_unit_bulk_density = -1 THEN
    local_from_unit_bulk_density := item."bulkDensity";
  ELSE
    local_from_unit_bulk_density := from_unit_bulk_density;
  END IF;
  -- resolve to_unit_bulk_density
  IF to_unit_bulk_density IS NULL OR to_unit_bulk_density = -1 THEN
    local_to_unit_bulk_density := item."bulkDensity";
  ELSE
    local_to_unit_bulk_density := to_unit_bulk_density;
  END IF;
  IF to_unit <> ALL(known_units) AND to_unit != '' THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'bulkItem_unitConversion', -- tablename
      item.id,
      to_unit
    ) INTO custom_to_unit_conversion_id;
  END IF;
  IF local_from_unit <> ALL(known_units) THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'bulkItem_unitConversion', -- tablename
      item.id,
      local_from_unit
    ) INTO custom_from_unit_conversion_id;
  END IF;
  /* end setup */
  IF local_from_unit = ANY(known_units) THEN -- local_from_unit is standard
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is also standard
        SELECT data FROM inventory.standard_to_standard_unit_converter(
          local_quantity, 
          local_from_unit, 
          local_from_unit_bulk_density,
          to_unit,
          local_to_unit_bulk_density,
          'inventory', -- schema name
          'bulkItem_unitConversion', -- tablename
          item.id,
          'all'
        ) INTO result;
    ELSE -- to_unit is custom and not ''
      -- convert from standard to custom
      SELECT data FROM inventory.standard_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  ELSE -- local_from_unit is custom
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is standard
      SELECT data FROM inventory.custom_to_standard_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        'inventory', -- schema name
        'bulkItem_unitConversion', -- tablename
        item.id
      ) INTO result;
    ELSE -- to_unit is also custom and not ''
      SELECT data FROM inventory.custom_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density, 
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  END IF;
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END;
$_$;
CREATE TABLE inventory."sachetItem" (
    id integer DEFAULT public.defaultid('inventory'::text, 'sachetItem'::text, 'id'::text) NOT NULL,
    "unitSize" numeric NOT NULL,
    "parLevel" numeric,
    "maxLevel" numeric,
    "onHand" numeric DEFAULT 0 NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "bulkItemId" integer NOT NULL,
    unit text NOT NULL,
    consumed numeric DEFAULT 0 NOT NULL,
    awaiting numeric DEFAULT 0 NOT NULL,
    committed numeric DEFAULT 0 NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "asShipped" boolean
);
COMMENT ON TABLE inventory."sachetItem" IS 'This lists records of all the sachet items across all the brands.';
CREATE FUNCTION inventory.unit_conversions_sachet_item(item inventory."sachetItem", from_unit text, from_unit_bulk_density numeric, quantity numeric, to_unit text, to_unit_bulk_density numeric) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
  local_quantity                   numeric;
  local_from_unit                  text; 
  local_from_unit_bulk_density     numeric; 
  local_to_unit_bulk_density       numeric;
  known_units                      text[] := '{kg, g, mg, oz, l, ml}';
  result                           jsonb;
  custom_to_unit_conversion_id     integer;
  custom_from_unit_conversion_id   integer;
BEGIN
  /* setup */
  -- resolve quantity
  IF quantity IS NULL OR quantity = -1 THEN
    local_quantity := item."unitSize"::numeric;
  ELSE
    local_quantity := quantity;
  END IF;
  -- resolve from_unit
  IF from_unit IS NULL OR from_unit = ''
    THEN
    local_from_unit := item.unit;
  ELSE
    local_from_unit := from_unit;
  END IF;
  -- resolve from_unit_bulk_density
  IF from_unit_bulk_density IS NULL OR from_unit_bulk_density = -1 THEN
    local_from_unit_bulk_density := item."bulkDensity";
  ELSE
    local_from_unit_bulk_density := from_unit_bulk_density;
  END IF;
  -- resolve to_unit_bulk_density
  IF to_unit_bulk_density IS NULL OR to_unit_bulk_density = -1 THEN
    local_to_unit_bulk_density := item."bulkDensity";
  ELSE
    local_to_unit_bulk_density := to_unit_bulk_density;
  END IF;
  IF to_unit <> ALL(known_units) AND to_unit != '' THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'sachetItem_unitConversion', -- tablename
      item.id,
      to_unit
    ) INTO custom_to_unit_conversion_id;
  END IF;
  IF local_from_unit <> ALL(known_units) THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'sachetItem_unitConversion', -- tablename
      item.id,
      local_from_unit
    ) INTO custom_from_unit_conversion_id;
  END IF;
  /* end setup */
  IF local_from_unit = ANY(known_units) THEN -- local_from_unit is standard
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is also standard
        SELECT data FROM inventory.standard_to_standard_unit_converter(
          local_quantity, 
          local_from_unit, 
          local_from_unit_bulk_density,
          to_unit,
          local_to_unit_bulk_density,
          'inventory', -- schema name
          'sachetItem_unitConversion', -- tablename
          item.id,
          'all'
        ) INTO result;
    ELSE -- to_unit is custom and not ''
      -- convert from standard to custom
      SELECT data FROM inventory.standard_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  ELSE -- local_from_unit is custom
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is standard
      SELECT data FROM inventory.custom_to_standard_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        'inventory', -- schema name
        'sachetItem_unitConversion', -- tablename
        item.id
      ) INTO result;
    ELSE -- to_unit is also custom and not ''
      SELECT data FROM inventory.custom_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density, 
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  END IF;
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END;
$_$;
CREATE TABLE inventory."supplierItem" (
    id integer DEFAULT public.defaultid('inventory'::text, 'supplierItem'::text, 'id'::text) NOT NULL,
    name text,
    "unitSize" integer,
    prices jsonb,
    "supplierId" integer,
    unit text,
    "leadTime" jsonb,
    certificates jsonb,
    "bulkItemAsShippedId" integer,
    sku text,
    "importId" integer,
    "isArchived" boolean DEFAULT false NOT NULL,
    "unitConversionId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE inventory."supplierItem" IS 'This lists records of all the supplier items across all the supplier.';
COMMENT ON COLUMN inventory."supplierItem"."unitSize" IS 'deprecated';
COMMENT ON COLUMN inventory."supplierItem".unit IS 'deprecated';
CREATE FUNCTION inventory.unit_conversions_supplier_item(item inventory."supplierItem", from_unit text, from_unit_bulk_density numeric, quantity numeric, to_unit text, to_unit_bulk_density numeric) RETURNS SETOF crm."customerData"
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
  local_quantity                   numeric;
  local_from_unit                  text; 
  local_from_unit_bulk_density     numeric; 
  local_to_unit_bulk_density       numeric;
  known_units                      text[] := '{kg, g, mg, oz, l, ml}';
  result                           jsonb;
  custom_to_unit_conversion_id     integer;
  custom_from_unit_conversion_id   integer;
BEGIN
  /* setup */
  -- resolve quantity
  IF quantity IS NULL OR quantity = -1 THEN
    local_quantity := item."unitSize"::numeric;
  ELSE
    local_quantity := quantity;
  END IF;
  -- resolve from_unit
  IF from_unit IS NULL OR from_unit = ''
    THEN
    local_from_unit := item.unit;
  ELSE
    local_from_unit := from_unit;
  END IF;
  -- resolve from_unit_bulk_density
  IF from_unit_bulk_density IS NULL OR from_unit_bulk_density = -1 THEN
    local_from_unit_bulk_density := item."bulkDensity";
  ELSE
    local_from_unit_bulk_density := from_unit_bulk_density;
  END IF;
  -- resolve to_unit_bulk_density
  IF to_unit_bulk_density IS NULL OR to_unit_bulk_density = -1 THEN
    local_to_unit_bulk_density := item."bulkDensity";
  ELSE
    local_to_unit_bulk_density := to_unit_bulk_density;
  END IF;
  IF to_unit <> ALL(known_units) AND to_unit != '' THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'supplierItem_unitConversion', -- tablename
      item.id,
      to_unit
    ) INTO custom_to_unit_conversion_id;
  END IF;
  IF local_from_unit <> ALL(known_units) THEN
    EXECUTE format(
      $$SELECT 
        "unitConversionId" unit_conversion_id
      FROM %I.%I
      INNER JOIN master."unitConversion"
      ON "unitConversionId" = "unitConversion".id
      WHERE "entityId" = (%s)::integer
      AND "inputUnitName" = '%s';$$,
      'inventory', -- schema name
      'supplierItem_unitConversion', -- tablename
      item.id,
      local_from_unit
    ) INTO custom_from_unit_conversion_id;
  END IF;
  /* end setup */
  IF local_from_unit = ANY(known_units) THEN -- local_from_unit is standard
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is also standard
        SELECT data FROM inventory.standard_to_standard_unit_converter(
          local_quantity, 
          local_from_unit, 
          local_from_unit_bulk_density,
          to_unit,
          local_to_unit_bulk_density,
          'inventory', -- schema name
          'supplierItem_unitConversion', -- tablename
          item.id,
          'all'
        ) INTO result;
    ELSE -- to_unit is custom and not ''
      -- convert from standard to custom
      SELECT data FROM inventory.standard_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  ELSE -- local_from_unit is custom
    IF to_unit = ANY(known_units) OR to_unit = '' OR to_unit IS NULL THEN -- to_unit is standard
      SELECT data FROM inventory.custom_to_standard_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density,
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        'inventory', -- schema name
        'supplierItem_unitConversion', -- tablename
        item.id
      ) INTO result;
    ELSE -- to_unit is also custom and not ''
      SELECT data FROM inventory.custom_to_custom_unit_converter(
        local_quantity, 
        local_from_unit, 
        local_from_unit_bulk_density, 
        to_unit,
        local_to_unit_bulk_density,
        custom_from_unit_conversion_id,
        custom_to_unit_conversion_id     
      ) INTO result;
    END IF;
  END IF;
  RETURN QUERY
  SELECT
    1 as id,
    result as data;
END;
$_$;
CREATE FUNCTION master.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION notifications.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE "onDemand".menu (
    id integer DEFAULT public.defaultid('onDemand'::text, 'menu'::text, 'id'::text) NOT NULL,
    data jsonb
);
COMMENT ON TABLE "onDemand".menu IS 'This lists records of all the menu across all the brands.';
CREATE FUNCTION "onDemand"."getMenu"(params jsonb) RETURNS SETOF "onDemand".menu
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    colId int;
    menu jsonb[] = '{}';
    cleanMenu jsonb[] DEFAULT '{}';
    r jsonb;
    collection jsonb;
    isValid jsonb;
    category jsonb;
    productCategory record;
    product record;
    oldObject jsonb;
    newObject jsonb;
    exists boolean := false;
    index int;
    i int;
    arr int[];
BEGIN
    FOR colId IN SELECT "collectionId" FROM "onDemand"."brand_collection" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true LOOP
        SELECT "onDemand"."isCollectionValid"(colId, params) INTO isValid;
        -- RETURN QUERY SELECT 1 AS id, jsonb_build_object('menu', isValid) AS data;
        IF (isValid->'status')::boolean = true THEN
            FOR productCategory IN SELECT * FROM "onDemand"."collection_productCategory" WHERE "collectionId" = colId ORDER BY position DESC NULLS LAST LOOP
                category := jsonb_build_object(
                    'name', productCategory."productCategoryName", 
                    'inventoryProducts', '{}',
                    'simpleRecipeProducts', '{}',
                    'customizableProducts', '{}',
                    'comboProducts', '{}'
                );
                FOR product IN SELECT * FROM "onDemand"."collection_productCategory_product" WHERE "collection_productCategoryId" = productCategory.id ORDER BY position DESC NULLS LAST LOOP
                    IF product."simpleRecipeProductId" IS NOT NULL THEN
                        category := category || jsonb_build_object('simpleRecipeProducts', (REPLACE(REPLACE(category->>'simpleRecipeProducts', ']', '}'), '[', '{'))::int[] || product."simpleRecipeProductId");
                    ELSIF product."inventoryProductId" IS NOT NULL THEN
                        category := category || jsonb_build_object('inventoryProducts', (REPLACE(REPLACE(category->>'inventoryProducts', ']', '}'), '[', '{'))::int[] || product."inventoryProductId");
                    ELSIF product."customizableProductId" IS NOT NULL THEN
                        category := category || jsonb_build_object('customizableProducts', (REPLACE(REPLACE(category->>'customizableProducts', ']', '}'), '[', '{'))::int[] || product."customizableProductId");
                    ELSIF product."comboProductId" IS NOT NULL THEN
                        category := category || jsonb_build_object('comboProducts', (REPLACE(REPLACE(category->>'comboProducts', ']', '}'), '[', '{'))::int[] || product."comboProductId"); 
                    ELSE
                        CONTINUE;
                    END IF;
                    -- RETURN QUERY SELECT 1 AS id, jsonb_build_object('menu', product.id) AS data;
                END LOOP;
                -- RETURN QUERY SELECT category->>'name' AS name, category->'comboProducts' AS "comboProducts",  category->'customizableProducts' AS "customizableProducts", category->'simpleRecipeProducts' AS "simpleRecipeProducts", category->'inventoryProducts' AS "inventoryProducts";
                menu := menu || category;
            END LOOP;
        ELSE
            CONTINUE;
        END IF;
    END LOOP;
    -- RETURN;
    FOREACH oldObject IN ARRAY(menu) LOOP
        exists := false;
        i := NULL;
        IF array_length(cleanMenu, 1) IS NOT NULL THEN
            FOR index IN 0..array_length(cleanMenu, 1) LOOP
                IF cleanMenu[index]->>'name' = oldObject->>'name' THEN
                    exists := true;
                    i := index; 
                    EXIT;
                ELSE
                    CONTINUE;
                END IF;
            END LOOP;
        END IF;
        IF exists = true THEN
            cleanMenu[i] := jsonb_build_object(
                'name', cleanMenu[i]->>'name',
                'simpleRecipeProducts', (REPLACE(REPLACE(cleanMenu[i]->>'simpleRecipeProducts', ']', '}'), '[', '{'))::int[] || (REPLACE(REPLACE(oldObject->>'simpleRecipeProducts', ']', '}'), '[', '{'))::int[],
                'inventoryProducts', (REPLACE(REPLACE(cleanMenu[i]->>'inventoryProducts', ']', '}'), '[', '{'))::int[] || (REPLACE(REPLACE(oldObject->>'inventoryProducts', ']', '}'), '[', '{'))::int[],
                'customizableProducts', (REPLACE(REPLACE(cleanMenu[i]->>'customizableProducts', ']', '}'), '[', '{'))::int[] || (REPLACE(REPLACE(oldObject->>'customizableProducts', ']', '}'), '[', '{'))::int[],
                'comboProducts', (REPLACE(REPLACE(cleanMenu[i]->>'comboProducts', ']', '}'), '[', '{'))::int[] || (REPLACE(REPLACE(oldObject->>'comboProducts', ']', '}'), '[', '{'))::int[]
            );
            -- RETURN QUERY SELECT 1 AS id, jsonb_build_object('menu', cleanMenu[i]) AS data;
        ELSE
            cleanMenu := cleanMenu || oldObject;
        END IF;
    END LOOP;
    IF array_length(cleanMenu, 1) IS NOT NULL THEN
        FOR index IN 0..array_length(cleanMenu, 1) LOOP
            IF cleanMenu[index]->>'simpleRecipeProducts' = '{}' THEN
                cleanMenu[index] := cleanMenu[index] || jsonb_build_object('simpleRecipeProducts', (cleanMenu[index]->>'simpleRecipeProducts')::int[]);
            END IF;
            IF cleanMenu[index]->>'inventoryProducts' = '{}' THEN
                cleanMenu[index] := cleanMenu[index] || jsonb_build_object('inventoryProducts', (cleanMenu[index]->>'inventoryProducts')::int[]);
            END IF;
            IF cleanMenu[index]->>'customizableProducts' = '{}' THEN
                cleanMenu[index] := cleanMenu[index] || jsonb_build_object('customizableProducts', (cleanMenu[index]->>'customizableProducts')::int[]);
            END IF;
            IF cleanMenu[index]->>'comboProducts' = '{}' THEN
                cleanMenu[index] := cleanMenu[index] || jsonb_build_object('comboProducts', (cleanMenu[index]->>'comboProducts')::int[]);
            END IF;
        END LOOP;
    END IF;
    RETURN QUERY SELECT 1 AS id, jsonb_build_object('menu', cleanMenu) AS data;
END;
$$;
CREATE FUNCTION "onDemand"."getMenuV2"(params jsonb) RETURNS SETOF "onDemand".menu
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    colId int;
    idArr int[];
    menu jsonb[] := '{}';
    object jsonb;
    isValid jsonb;
    category jsonb;
    productCategory record;
    rec record;
    cleanMenu jsonb[] := '{}'; -- without duplicates
    cleanCategory jsonb; -- without duplicates
    categoriesIncluded text[];
    productsIncluded int[];
    updatedProducts int[];
    productId int;
    pos int := 0;
    collectionIdArray int[];
BEGIN
    -- select coalesce(((params->> 'collectionIdArray')::int[]),(SELECT "collectionId" FROM "onDemand"."brand_collection" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true)) into collectionIdArray;
    -- generating menu data from collections
    FOR colId IN SELECT "collectionId" FROM "onDemand"."brand_collection" WHERE "brandId" = (params->>'brandId')::int AND "isActive" = true LOOP
        SELECT "onDemand"."isCollectionValid"(colId, params) INTO isValid;
        IF (isValid->'status')::boolean = true THEN
            FOR productCategory IN SELECT * FROM "onDemand"."collection_productCategory" WHERE "collectionId" = colId ORDER BY position DESC NULLS LAST LOOP
                idArr := '{}'::int[];
                FOR rec IN SELECT * FROM "onDemand"."collection_productCategory_product" WHERE "collection_productCategoryId" = productCategory.id ORDER BY position DESC NULLS LAST LOOP
                    idArr := idArr || rec."productId";
                END LOOP;
                category := jsonb_build_object(
                    'name', productCategory."productCategoryName",
                    'products', idArr
                );
                menu := menu || category;
            END LOOP;
        ELSE
            CONTINUE;
        END IF;
    END LOOP;
    -- merge duplicate categories and remove duplicate products
    FOREACH category IN ARRAY(menu) LOOP
        pos := ARRAY_POSITION(categoriesIncluded, category->>'name');
        IF pos >= 0 THEN
            updatedProducts := '{}'::int[];
            productsIncluded := '{}'::int[];
            FOR productId IN SELECT * FROM JSONB_ARRAY_ELEMENTS(cleanMenu[pos]->'products') LOOP
                updatedProducts := updatedProducts || productId;
                productsIncluded := productsIncluded || productId; -- wil remove same products under same category in different collections
            END LOOP;
            FOR productId IN SELECT * FROM JSONB_ARRAY_ELEMENTS(category->'products') LOOP
                IF ARRAY_POSITION(productsIncluded, productId) >= 0 THEN
                    CONTINUE;
                ELSE
                   updatedProducts := updatedProducts || productId;
                   productsIncluded := productsIncluded || productId; -- will remove same products under same category in same collection
                END IF;
            END LOOP;
            cleanMenu[pos] := jsonb_build_object('name', category->>'name', 'products', updatedProducts);
        ELSE
            cleanMenu := cleanMenu || category;
            categoriesIncluded := categoriesIncluded || (category->>'name')::text;
        END IF;
    END LOOP;
    RETURN QUERY SELECT 1 AS id, jsonb_build_object('menu', cleanMenu) AS data;
END;
$$;
CREATE FUNCTION "onDemand"."getOnlineStoreProduct"(productid integer, producttype text) RETURNS SETOF "onDemand".menu
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res jsonb;
BEGIN
  IF producttype = 'simpleRecipeProduct' THEN
        SELECT products."getOnlineStoreSRPProduct"(productid) INTO res;
    ELSIF producttype = 'inventoryProduct' THEN
        SELECT products."getOnlineStoreIPProduct"(productid) INTO res;
    ELSIF producttype = 'customizableProduct' THEN
        SELECT products."getOnlineStoreCUSPProduct"(productid) INTO res;
    ELSE
        SELECT products."getOnlineStoreCOMPProduct"(productid) INTO res;
    END IF;
    RETURN QUERY SELECT 1 AS id, res AS data;
END;
$$;
CREATE TABLE "onDemand"."collection_productCategory_product" (
    "collection_productCategoryId" integer NOT NULL,
    id integer DEFAULT public.defaultid('onDemand'::text, 'collection_productCategory_product'::text, 'id'::text) NOT NULL,
    "position" numeric,
    "importHistoryId" integer,
    "productId" integer NOT NULL
);
COMMENT ON TABLE "onDemand"."collection_productCategory_product" IS 'This shows the relationship between collection, product category and product.';
CREATE FUNCTION "onDemand"."getProductDetails"(rec "onDemand"."collection_productCategory_product") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    product record;
    productName text;
    productType text;
    productImage text;
BEGIN
    IF rec."simpleRecipeProductId" IS NOT NULL THEN
        SELECT * FROM products."simpleRecipeProduct" WHERE id = rec."simpleRecipeProductId" INTO product;
        productName := product.name;
        productType := 'simpleRecipeProduct';
        IF product.assets IS NOT NULL AND JSONB_ARRAY_LENGTH(product.assets->'images') > 0 THEN
            productImage := product.assets->'images'#>>'{0}';
        ELSE
            productImage := NULL;
        END IF;
    ELSIF rec."inventoryProductId" IS NOT NULL THEN
        SELECT * FROM products."inventoryProduct" WHERE id = rec."inventoryProductId" INTO product;
        productName := product.name;
        productType := 'inventoryProduct';
        IF product.assets IS NOT NULL AND JSONB_ARRAY_LENGTH(product.assets->'images') > 0 THEN
            productImage := product.assets->'images'#>>'{0}';
        ELSE
            productImage := NULL;
        END IF;
    ELSEIF rec."customizableProductId" IS NOT NULL THEN
        SELECT * FROM products."customizableProduct" WHERE id = rec."customizableProductId" INTO product;
        productName := product.name;
        productType := 'customizableProduct';
        IF product.assets IS NOT NULL AND JSONB_ARRAY_LENGTH(product.assets->'images') > 0 THEN
            productImage := product.assets->'images'#>>'{0}';
        ELSE
            productImage := NULL;
        END IF;
    ELSE
        SELECT * FROM products."comboProduct" WHERE id = rec."comboProductId" INTO product;
        productName := product.name;
        productType := 'comboProduct';
        IF product.assets IS NOT NULL AND JSONB_ARRAY_LENGTH(product.assets->'images') > 0 THEN
            productImage := product.assets->'images'#>>'{0}';
        ELSE
            productImage := NULL;
        END IF;
    END IF;
    RETURN jsonb_build_object(
        'name', productName,
        'type', productType,
        'image', productImage
    );
END
$$;
CREATE TABLE "onDemand"."storeData" (
    id integer DEFAULT public.defaultid('onDemand'::text, 'storeData'::text, 'id'::text) NOT NULL,
    "brandId" integer,
    settings jsonb
);
CREATE FUNCTION "onDemand"."getStoreData"(requestdomain text) RETURNS SETOF "onDemand"."storeData"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    brandId int;
    settings jsonb;
BEGIN
    SELECT id FROM brands.brand WHERE "domain" = requestDomain INTO brandId; 
    IF brandId IS NULL THEN
        SELECT id FROM brands.brand WHERE "isDefault" = true INTO brandId;
    END IF;
    SELECT brands."getSettings"(brandId) INTO settings;
    RETURN QUERY SELECT 1 AS id, brandId AS brandId, settings as settings;
END;
$$;
CREATE FUNCTION "onDemand"."isCollectionValid"(collectionid integer, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res jsonb;
    collection record;
    isValid boolean := false;
BEGIN
    IF params->>'date' IS NOT NULL THEN
        SELECT * FROM "onDemand"."collection" WHERE id = collectionId INTO collection;
        IF collection."rrule" IS NOT NULL THEN
            SELECT rules."rruleHasDateFunc"(collection."rrule"::_rrule.rruleset, (params->>'date')::timestamp) INTO isValid;
        ELSE
            isValid := true;
        END IF;
    END IF;
    res := jsonb_build_object('status', isValid);
    return res;
END;
$$;
CREATE TABLE "onDemand"."modifierCategoryOption" (
    id integer DEFAULT public.defaultid('onDemand'::text, 'modifierCategoryOption'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "originalName" text NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    discount numeric DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    image text,
    "isActive" boolean DEFAULT true NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "operationConfigId" integer,
    "modifierCategoryId" integer NOT NULL,
    "sachetItemId" integer,
    "ingredientSachetId" integer,
    "simpleRecipeYieldId" integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE FUNCTION "onDemand"."modifierCategoryOptionCartItem"(option "onDemand"."modifierCategoryOption") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    -- counter := option.quantity;
    -- IF option."sachetItemId" IS NOT NULL THEN 
    --     WHILE counter >= 1 LOOP
    --         items := items || jsonb_build_object('sachetItemId', option."sachetItemId", 'modifierOptionId', option.id);
    --         counter := counter - 1;
    --     END LOOP;
    -- ELSEIF option."simpleRecipeYieldId" IS NOT NULL THEN
    --     WHILE counter >= 1 LOOP
    --         items := items || jsonb_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId", 'modifierOptionId', option.id);
    --         counter := counter - 1;
    --     END LOOP;
    -- ELSEIF option."ingredientSachetId" IS NOT NULL THEN
    --     WHILE counter >= 1 LOOP
    --         items := items || jsonb_build_object('ingredientSachetId', option."ingredientSachetId", 'modifierOptionId', option.id);
    --         counter := counter - 1;
    --     END LOOP;
    -- ELSE
    --     items := items;
    -- END IF;
    RETURN jsonb_build_object('data', jsonb_build_array(jsonb_build_object('unitPrice', option.price, 'discount', (option.price * (option.discount / 100)), 'modifierOptionId', option.id)));
END;
$$;
CREATE FUNCTION "onDemand"."numberOfCategories"(colid integer) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res int;
BEGIN
    SELECT COUNT(*) FROM "onDemand"."collection_productCategory" WHERE "collectionId" = colId INTO res;
    RETURN res;
END;
$$;
CREATE FUNCTION "onDemand"."numberOfProducts"(colid integer) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    arr int[] := '{}';
    res int;
    rec record;
BEGIN
    FOR rec IN SELECT id FROM "onDemand"."collection_productCategory" WHERE "collectionId" = colId LOOP
        arr := arr || rec.id;
    END LOOP;
    SELECT COUNT(*) FROM "onDemand"."collection_productCategory_product" WHERE "collection_productCategoryId" = ANY(arr) INTO res;
    return res;
END;
$$;
CREATE FUNCTION "onDemand".set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION "order"."addOnTotal"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   total numeric := 0;
   product "order"."cartItem";
BEGIN
    IF cart."source" = 'a-la-carte' THEN
        RETURN 0;
    ELSE
        FOR product IN SELECT * FROM "order"."cartItem" WHERE "cartId" = cart.id LOOP
            total := total + COALESCE(product."addOnPrice", 0);
            IF product."isAddOn" = true THEN
                total := total + product."unitPrice";
            END IF;
        END LOOP;
        RETURN total;
    END IF;
END
$$;
CREATE FUNCTION "order"."addOnTotal2"(cartid integer, source text) RETURNS numeric
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
   total numeric := 0;
   product "order"."cartItem";
BEGIN
    IF source = 'a-la-carte' THEN
        RETURN 0;
    ELSE
        FOR product IN SELECT * FROM "order"."cartItem" WHERE "cartId" = cartId LOOP
            total := total + COALESCE(product."addOnPrice", 0);
            IF product."isAddOn" = true THEN
                total := total + product."unitPrice";
            END IF;
        END LOOP;
        RETURN total;
    END IF;
END
$$;
CREATE FUNCTION "order"."balancePayment"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   total numeric := 0;
   rec record;
BEGIN
    IF cart."experienceClassId" IS NOT NULL THEN
        SELECT * INTO rec FROM "experiences"."experienceClass" WHERE "id" = cart."experienceClassId";
        IF rec."experienceBookingId" IS NOT NULL THEN
           SELECT ("cartFunctions"."cartOwnerBilling"(cart)->>'totalToPay')::numeric INTO total;
            total := total - cart."amount";
        ELSE
            SELECT "minimumBookingAmount" INTO total FROM "experiences"."experienceClassType" WHERE "id" = cart."experienceClassTypeId";
        END IF ;
    ELSE
        SELECT ("cartFunctions"."cartOwnerBilling"(cart)->>'totalToPay')::numeric INTO total;
        total := total - cart."amount";
    END IF;
    RETURN COALESCE(total, 0);
END;
$$;
CREATE FUNCTION "order"."cartBillingDetails"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    item jsonb := '{}';
    itemTotal numeric;
    addOnTotal numeric;
    deliveryPrice numeric;
    subTotal numeric;
    tax numeric;
    taxPercent numeric;
    isTaxIncluded boolean;
    discount numeric;
    totalPrice numeric;
BEGIN
    SELECT "order"."isTaxIncluded"(cart.*) INTO isTaxIncluded;
    SELECT "order"."itemTotal"(cart.*) INTO itemTotal;
    SELECT "order"."addOnTotal"(cart.*) INTO addOnTotal;
    SELECT "order"."deliveryPrice"(cart.*) INTO deliveryPrice; 
    SELECT "order"."discount"(cart.*) INTO discount; 
    SELECT "order"."subTotal"(cart.*) INTO subTotal;
    SELECT "order".tax(cart.*) INTO tax;
    SELECT "order"."taxPercent"(cart.*) INTO taxPercent;
    SELECT "order"."totalPrice"(cart.*) INTO totalPrice;
    item:=item || jsonb_build_object('isTaxIncluded', isTaxIncluded);
    item:=item || jsonb_build_object('discount', jsonb_build_object('value', discount, 'label', 'Discount'));
    item:=item || jsonb_build_object('loyaltyPointsUsed', jsonb_build_object('value', cart."loyaltyPointsUsed", 'label', 'Loyalty Points'));
    item:=item || jsonb_build_object('walletAmountUsed', jsonb_build_object('value', cart."walletAmountUsed", 'label', 'Wallet Amount'));
    item:=item || jsonb_build_object('itemTotal', jsonb_build_object('value', itemTotal, 'description', 'Includes your base price and add on price.', 'label','Item Total', 'comment', CONCAT('Includes add on total of ', '{{',COALESCE(addOnTotal,0),'}}')));
    item:=item || jsonb_build_object('deliveryPrice', jsonb_build_object('value', deliveryPrice, 'description', '', 'label','Delivery Fee', 'comment', ''));
    IF isTaxIncluded = false THEN
        item:=item || jsonb_build_object('subTotal', jsonb_build_object('value', subTotal, 'description', '', 'label','Sub Total', 'comment', ''));
        item:=item || jsonb_build_object('tax', jsonb_build_object('value', tax, 'description', '', 'label','Tax', 'comment', CONCAT('Your tax is calculated at ', taxPercent,'%')));
        item:=item || jsonb_build_object('totalPrice', jsonb_build_object('value', totalPrice, 'description', '', 'label','Total Price', 'comment', ''));
    ELSE
        item:=item || jsonb_build_object('totalPrice', jsonb_build_object('value', totalPrice, 'description', '', 'label','Total Price', 'comment', CONCAT('Tax inclusive of ', '{{',tax,'}}', ' at ', taxPercent, '%')));
    END IF;
    RETURN item;
END
$$;
CREATE FUNCTION "order"."cartBillingDetails2"(cart "order".cart, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    item jsonb := '{}';
    itemTotal numeric;
    addOnTotal numeric;
    deliveryPrice numeric;
    subTotal numeric;
    tax numeric;
    taxPercent numeric;
    isTaxIncluded boolean;
    totalPrice numeric;
BEGIN
    SELECT "order"."isTaxIncluded"(cart) INTO isTaxIncluded;
    SELECT "order"."itemTotal2"(cart,params) INTO itemTotal;
    SELECT "order"."addOnTotal"(cart) INTO addOnTotal;
    SELECT "order"."deliveryPrice2"(cart,params) INTO deliveryPrice;
    SELECT "order"."subTotal2"(cart,params) INTO subTotal;
    SELECT "order"."tax2"(cart,params) INTO tax;
    IF tax IS NULL THEN 
        tax := 0;
    END IF;
    SELECT "order"."taxPercent"(cart) INTO taxPercent;
    SELECT "order"."totalPrice2"(cart,params) INTO totalPrice;
    item:=item || jsonb_build_object('isTaxIncluded', isTaxIncluded);
    item:=item || jsonb_build_object('itemTotal', jsonb_build_object('value', itemTotal, 'description', 'Includes your base price and add on price.', 'label','Item Total', 'comment', CONCAT('Includes add on total of ', '{{',COALESCE(addOnTotal,0),'}}')));
    item:=item || jsonb_build_object('deliveryPrice', jsonb_build_object('value', deliveryPrice, 'description', '', 'label','Delivery Fee', 'comment', ''));
    IF isTaxIncluded = false THEN
        item:=item || jsonb_build_object('subTotal', jsonb_build_object('value', subTotal, 'description', '', 'label','Sub Total', 'comment', ''));
        item:=item || jsonb_build_object('tax', jsonb_build_object('value', tax, 'description', '', 'label','Tax', 'comment', CONCAT('Your tax is calculated at ', taxPercent,'%')));
        item:=item || jsonb_build_object('totalPrice', jsonb_build_object('value', totalPrice, 'description', '', 'label','Total Price', 'comment', ''));
    ELSE
        item:=item || jsonb_build_object('totalPrice', jsonb_build_object('value', totalPrice, 'description', '', 'label','Total Price', 'comment', CONCAT('Tax inclusive of ', '{{',tax,'}}', ' at ', taxPercent, '%')));
    END IF;
    RETURN item;
END
$$;
CREATE FUNCTION "order"."clearFulfillmentInfo"(cartid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE "order"."cart"
    SET "fulfillmentInfo" = NULL
    WHERE id = cartId;
END
$$;
CREATE FUNCTION "order"."createExperienceBooking"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 rec record;
 deadline timestamp with time zone;
 bookingexperienceid int;
BEGIN
  IF NEW."paymentStatus" = 'SUCCEEDED' THEN
    SELECT (NOW() + interval '10 day') INTO deadline;
    SELECT * INTO rec FROM "order"."cart" WHERE "id" = NEW."cartId";
    --creating a new experinceBooking row when a cart payment is succeeded
    INSERT INTO "experiences"."experienceBooking" ("experienceClassId","hostKeycloakId","cutoffTime","cartId")
    VALUES (rec."experienceClassId", rec."customerKeycloakId", deadline, rec."id") 
    ON CONFLICT ON CONSTRAINT "experienceBooking_experienceClassId_hostKeycloakId_key" 
    DO NOTHING
    RETURNING id INTO bookingexperienceid;
    -- updating the experience with experienceBookingId to make it completly booked for others
    IF bookingexperienceid IS NOT NULL THEN
        UPDATE "experiences"."experienceClass" SET "experienceBookingId" = bookingexperienceid, "isBooked" = true 
        WHERE "id" = rec."experienceClassId";
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  RETURN New;
END;
$$;
CREATE FUNCTION "order"."createSachets"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    inventorySachet "products"."inventoryProductBundleSachet";
    sachet "simpleRecipe"."simpleRecipeYield_ingredientSachet";
    counter int;
    modifierOption record;
    sachetItemId int; 
    bulkItemId int; 
BEGIN
    IF (NEW."simpleRecipeYieldId" IS NOT NULL) and (NEW."ingredientSachetId" is null) THEN
        FOR sachet IN SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = NEW."simpleRecipeYieldId" LOOP
            IF sachet."ingredientSachetId" IS NOT NULL THEN
                 -- live MOF and tag sachetItem or bulkItem
                SELECT "sachetItemId", "bulkItemId" INTO sachetItemId, bulkItemId FROM ingredient."modeOfFulfillment" WHERE id = (SELECT "liveMOF" FROM ingredient."ingredientSachet" WHERE id = sachet."ingredientSachetId");
                INSERT INTO "order"."cartItem"("parentCartItemId","ingredientSachetId","cartId", "sachetItemId", "bulkItemId") VALUES (NEW.id, sachet."ingredientSachetId", NEW."cartId", sachetItemId, bulkItemId);
            ELSEIF sachet."subRecipeYieldId" IS NOT NULL THEN
                INSERT INTO "order"."cartItem"("parentCartItemId","subRecipeYieldId","cartId") VALUES (NEW.id, sachet."subRecipeYieldId", NEW."cartId");
            END IF;
        END LOOP;
    ELSEIF (NEW."inventoryProductBundleId" IS NOT NULL) and (NEW."sachetItemId" is null) THEN
        FOR inventorySachet IN SELECT * FROM "products"."inventoryProductBundleSachet" WHERE "inventoryProductBundleId" = NEW."inventoryProductBundleId" LOOP
            IF inventorySachet."sachetItemId" IS NOT NULL THEN
                INSERT INTO "order"."cartItem"("parentCartItemId","sachetItemId", "cartId") VALUES (NEW.id, inventorySachet."sachetItemId", NEW."cartId");
            END IF;
        END LOOP;
    ELSEIF (NEW."subRecipeYieldId" IS NOT NULL) and (NEW."ingredientSachetId" is null) and NEW."subRecipeYieldId" is null THEN
        FOR sachet IN SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = NEW."subRecipeYieldId" LOOP
            IF sachet."ingredientSachetId" IS NOT NULL THEN
                INSERT INTO "order"."cartItem"("parentCartItemId","ingredientSachetId","cartId") VALUES (NEW.id, sachet."ingredientSachetId", NEW."cartId");
            ELSEIF sachet."subRecipeYieldId" IS NOT NULL THEN
                INSERT INTO "order"."cartItem"("parentCartItemId","subRecipeYieldId","cartId") VALUES (NEW.id, sachet."subRecipeYieldId", NEW."cartId");
            END IF;
        END LOOP;
    ELSEIF NEW."modifierOptionId" IS NOT NULL and NEW."ingredientSachetId" is null and NEW."sachetItemId" is null and NEW."simpleRecipeYieldId" is null THEN
        SELECT * FROM "onDemand"."modifierCategoryOption" WHERE id = NEW."modifierOptionId" INTO modifierOption;
        counter := modifierOption.quantity;
        IF modifierOption."sachetItemId" IS NOT NULL THEN 
            WHILE counter >= 1 LOOP
                INSERT INTO "order"."cartItem"("parentCartItemId","sachetItemId","cartId") VALUES (NEW.id,  modifierOption."sachetItemId", NEW."cartId");
                counter := counter - 1;
            END LOOP;
        ELSEIF modifierOption."simpleRecipeYieldId" IS NOT NULL THEN
            WHILE counter >= 1 LOOP
                 INSERT INTO "order"."cartItem"("parentCartItemId","subRecipeYieldId","cartId") VALUES (NEW.id,  modifierOption."simpleRecipeYieldId", NEW."cartId");
                counter := counter - 1;
            END LOOP;
        ELSEIF modifierOption."ingredientSachetId" IS NOT NULL THEN
            WHILE counter >= 1 LOOP
             -- live MOF and tag sachetItem or bulkItem
                -- SELECT * FROM ingredient."modeOfFulfillment" WHERE id = (SELECT "liveMOF" FROM ingredient."ingredientSachet" WHERE id = modifierOption."ingredientSachetId") INTO taggedItem;
                INSERT INTO "order"."cartItem"("parentCartItemId","ingredientSachetId","cartId") VALUES (NEW.id, modifierOption."ingredientSachetId", NEW."cartId");
                counter := counter - 1;
            END LOOP;
        END IF;
    END IF;
    RETURN null;
END;
$$;
CREATE FUNCTION "order"."deliveryPrice"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    value numeric;
    total numeric;
    rangeId int;
    subscriptionId int;
    price numeric:=0;
BEGIN
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN RETURN 0;
    END IF;
    IF cart."source" = 'a-la-carte' THEN
        SELECT "order"."itemTotal"(cart) into total;
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        SELECT charge from "fulfilment"."charge" WHERE charge."mileRangeId" = rangeId AND total >= charge."orderValueFrom" AND total < charge."orderValueUpto" into value;
        IF value IS NOT NULL
            THEN RETURN value;
        END IF;
        SELECT MAX(charge) from "fulfilment"."charge" WHERE charge."mileRangeId" = rangeId into value;
        IF value IS NULL
            THEN RETURN 0;
        ELSE 
            RETURN value;
        END IF;
    ELSE
        SELECT "subscriptionId" 
        FROM crm."brand_customer" 
        WHERE "brandId" = cart."brandId" 
        AND "keycloakId" = cart."customerKeycloakId" 
        INTO subscriptionId;
        SELECT "deliveryPrice" 
        FROM subscription."subscription_zipcode" 
        WHERE "subscriptionId" = subscriptionId 
        AND zipcode = cart.address->>'zipcode'
        INTO price;
        RETURN COALESCE(price, 0);
    END IF;
    RETURN 0;
END
$$;
CREATE FUNCTION "order"."deliveryPrice2"(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    value numeric := 0 ;
    total numeric := 0;
    rangeId int ;
    subscriptionId int;
    price numeric := 0;
    parentShare numeric := 0;
    childShare numeric := 0;
BEGIN
    parentShare := cart."deliveryParentShare" / 100 ;
    childShare  := 1 - parentShare; 
    IF cart."fulfillmentInfo"::json->>'type' LIKE '%PICKUP' OR cart."fulfillmentInfo" IS NULL
        THEN RETURN 0;
    END IF;
    IF cart."source" = 'a-la-carte' THEN
        SELECT "order"."itemTotal2"(cart.*, params) into total;
        SELECT cart."fulfillmentInfo"::json#>'{"slot","mileRangeId"}' as int into rangeId;
        SELECT charge from "fulfilment"."charge" WHERE charge."mileRangeId" = rangeId AND total >= charge."orderValueFrom" AND total < charge."orderValueUpto" into value;
        IF value IS NOT NULL
            THEN RETURN value;
        END IF;
        SELECT MAX(charge) from "fulfilment"."charge" WHERE charge."mileRangeId" = rangeId into value;
        IF value IS NULL
            THEN RETURN 0;
        ELSE
            RETURN value;
        END IF;
    ELSE
        SELECT "subscriptionId"
        FROM crm."brand_customer"
        WHERE "brandId" = cart."brandId"
        AND "keycloakId" = cart."customerKeycloakId"
        INTO subscriptionId;
        SELECT "deliveryPrice"
        FROM subscription."subscription_zipcode"
        WHERE "subscriptionId" = subscriptionId
        AND zipcode = cart.address->>'zipcode'
        INTO price;
        IF (params->>'shareFor')::text != '' OR  (params->>'shareFor')::text IS NOT NULL THEN
            IF (params->>'shareFor')::text = 'parent' THEN 
                price := price * parentShare;
            ELSIF (params->>'shareFor')::text = 'child' THEN
                price := price * childShare;
            END IF;
        END IF;
        RETURN COALESCE(price, 0);
    END IF;
    RETURN 0;
END
$$;
CREATE FUNCTION "order".discount(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   totalPrice numeric;
   itemTotal numeric;
   deliveryPrice numeric;
   rewardIds int[];
   rewardId int;
   reward record;
   discount numeric := 0;
BEGIN
    SELECT "order"."itemTotal"(cart.*) into itemTotal;
    SELECT "order"."deliveryPrice"(cart.*) into deliveryPrice;
    totalPrice := ROUND(itemTotal + deliveryPrice, 2);
    rewardIds := ARRAY(SELECT "rewardId" FROM "order"."cart_rewards" WHERE "cartId" = cart.id);
    FOREACH rewardId IN ARRAY rewardIds LOOP
        SELECT * FROM crm.reward WHERE id = rewardId INTO reward;
        IF reward."type" = 'Discount'
            THEN
            IF  reward."rewardValue"->>'type' = 'conditional'
                THEN 
                discount := totalPrice * ((reward."rewardValue"->'value'->>'percentage')::numeric / 100);
                IF discount >  (reward."rewardValue"->'value'->>'max')::numeric
                    THEN discount := (reward."rewardValue"->'value'->>'max')::numeric;
                END IF;
            ELSIF reward."rewardValue"->>'type' = 'absolute' THEN
                discount := (reward."rewardValue"->>'value')::numeric;
            ELSE
                discount := 0;
            END IF;
        END IF;
    END LOOP;
    IF discount > totalPrice THEN
        discount := totalPrice;
    END IF;
    RETURN ROUND(discount, 2);
END;
$$;
CREATE FUNCTION "order".discount2(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   totalPrice numeric := 0;
   itemTotal numeric := 0;
   deliveryPrice numeric := 0;
   rewardIds int[];
   rewardId int;
   reward record;
   discount numeric := 0;
BEGIN
    SELECT "order"."itemTotal2"(cart.*, params) into itemTotal;
    SELECT "order"."deliveryPrice2"(cart.*, params) into deliveryPrice;
    totalPrice := ROUND(itemTotal + deliveryPrice, 2);
    rewardIds := ARRAY(SELECT "rewardId" FROM crm."rewardHistory" WHERE "orderCartId" = cart.id);
    FOREACH rewardId IN ARRAY rewardIds LOOP
        SELECT * FROM crm.reward WHERE id = rewardId INTO reward;
        IF reward."type" = 'Discount'
            THEN
            IF  reward."rewardValue"->>'type' = 'conditional'
                THEN
                discount := totalPrice * ((reward."rewardValue"->'value'->>'percentage')::numeric / 100);
                IF discount >  (reward."rewardValue"->'value'->>'max')::numeric
                    THEN discount := (reward."rewardValue"->'value'->>'max')::numeric;
                END IF;
            ELSIF reward."rewardValue"->>'type' = 'absolute' THEN
                discount := (reward."rewardValue"->>'value')::numeric;
            ELSE
                discount := 0;
            END IF;
        END IF;
    END LOOP;
    IF discount > totalPrice THEN
        discount := totalPrice;
    END IF;
    RETURN ROUND(discount, 2);
END;
$$;
CREATE FUNCTION "order"."duplicateCartItem"(params jsonb) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    PERFORM "order"."duplicateCartItemVolatile"(params);
    RETURN QUERY SELECT true AS success, 'Item duplicated!' AS message;
END;
$$;
CREATE FUNCTION "order"."duplicateCartItemVolatile"(params jsonb) RETURNS SETOF void
    LANGUAGE plpgsql
    AS $$
DECLARE
    currentItem record;
    item record;
    parentCartItemId int;
BEGIN
    SELECT * FROM "order"."cartItem" WHERE id = (params->>'cartItemId')::int INTO item;
    INSERT INTO "order"."cartItem"("cartId", "parentCartItemId", "isModifier", "productId", "productOptionId", "comboProductComponentId", "customizableProductComponentId", "simpleRecipeYieldId", "sachetItemId", "unitPrice", "ingredientSachetId", "isAddOn", "addOnPrice", "inventoryProductBundleId", "modifierOptionId", "subRecipeYieldId") 
    VALUES(item."cartId", (params->>'parentCartItemId')::int, item."isModifier", item."productId", item."productOptionId", item."comboProductComponentId", item."customizableProductComponentId", item."simpleRecipeYieldId", item."sachetItemId", item."unitPrice", item."ingredientSachetId", item."isAddOn", item."addOnPrice", item."inventoryProductBundleId", item."modifierOptionId", item."subRecipeYieldId")
    RETURNING id INTO parentCartItemId;
    FOR currentItem IN SELECT * FROM "order"."cartItem" WHERE "parentCartItemId" = item.id LOOP
        IF currentItem."ingredientSachetId" IS NULL AND currentItem."sachetItemId" IS NULL AND currentItem."subRecipeYieldId" IS NULL THEN
            PERFORM "order"."duplicateCartItemVolatile"(jsonb_build_object('cartItemId', currentItem.id, 'parentCartItemId', parentCartItemId));
        END IF;
    END LOOP;
END;
$$;
CREATE FUNCTION "order"."experiencePrice"(cartitemdata "order"."cartItem", params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    paramsForExperiencePrice jsonb;
    result jsonb;
BEGIN
    paramsForExperiencePrice := JSONB_BUILD_OBJECT('cartId', cartItemData."cartId",'experienceClassId', cartItemData."experienceClassId", 'experienceClassTypeId', cartItemData."experienceClassTypeId", 'parentShare', cartItemData."parentShare",'shareFor',(params->>'shareFor')::text);
    SELECT "order"."experiencePriceFunc"(paramsForExperiencePrice) INTO result;
    RETURN result;
END;
$$;
CREATE FUNCTION "order"."experiencePriceFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    classTypeRecord record;
    priceRanges jsonb;
    paramsForTotalParticipants jsonb;
    paramsForPriceRanges jsonb;
    rec jsonb;
    participants integer;
    cartId integer;
    averagePrice numeric;
    parentShare numeric;
    childShare numeric;
BEGIN
    parentShare := ((params->>'parentShare')::numeric / 100)::numeric;
    childShare  := 1 - parentShare;
    SELECT "parentCartId" INTO cartId FROM "order"."cart" WHERE "id" = (params->>'cartId')::int;
    paramsForTotalParticipants := JSONB_BUILD_OBJECT('cartId',cartId, 'experienceClassId',(params->>'experienceClassId')::int);
    SELECT "order"."totalParticipantsFunc"(paramsForTotalParticipants) INTO participants;
    SELECT * INTO classTypeRecord FROM "experiences"."experienceClassType" WHERE id = (params->>'experienceClassTypeId')::int;
    paramsForPriceRanges := JSONB_BUILD_OBJECT('id', classTypeRecord."id", 'minimumBookingAmount', classTypeRecord."minimumBookingAmount", 'minimumParticipant', classTypeRecord."minimumParticipant", 'maximumParticipant',classTypeRecord."maximumParticipant");
    SELECT "experiences"."priceRangesFunc"(paramsForPriceRanges) INTO priceRanges;
    FOR rec IN SELECT * FROM JSONB_ARRAY_ELEMENTS((priceRanges->>'averagePriceBreak')::JSONB) LOOP
        IF (rec->>'person')::integer = participants THEN
            IF (params->>'shareFor')::text != '' OR  (params->>'shareFor')::text IS NOT NULL THEN
                IF (params->>'shareFor')::text = 'parent' THEN 
                    averagePrice := (rec->>'averagePrice')::numeric * parentShare;
                ELSIF (params->>'shareFor')::text = 'child' THEN
                    averagePrice := (rec->>'averagePrice')::numeric * childShare;
                ELSE
                    averagePrice := (rec->>'averagePrice')::numeric ;
                END IF;
            ELSE
                averagePrice := (rec->>'averagePrice')::numeric ;
            END IF;    
            RETURN JSONB_BUILD_OBJECT('averagePrice',averagePrice);
        END IF;
    END LOOP;
    RETURN JSONB_BUILD_OBJECT('averagePrice',averagePrice);
END;
$$;
CREATE TABLE "order"."orderAnalytics" (
    created_at_date date,
    created_at_month integer,
    count integer,
    sum numeric
);
CREATE FUNCTION "order"."getOrderAnalytics"(group_by text) RETURNS SETOF "order"."orderAnalytics"
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  BEGIN
    RETURN QUERY 
  execute format('select "created_at_date", 0, count(id)::int as "count", sum(amount) as "sum" from "order"."cart" group by %s', group_By);
END;
$$;
CREATE FUNCTION "order"."handleProductOption"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cart "order"."cart";
    productOption products."productOption";
    mode text;
    validFor text;
    counter int := 0;
    sachet "simpleRecipe"."simpleRecipeYield_ingredientSachet";
BEGIN
    IF NEW."productOptionId" IS NULL THEN
        RETURN NULL;
    END IF;
    SELECT * from "order"."cart" WHERE id = NEW.cartId INTO cart;
    IF cart."paymentStatus" = 'SUCCEEDED' THEN
        SELECT * INTO productOption FROM products."productOption" WHERE id = NEW."productOptionId";
        SELECT "orderMode" INTO mode FROM products."productOptionType" WHERE title = productOption."type";
        SELECT "validWhen" INTO validFor FROM "order"."orderMode" WHERE title = mode;
        IF validFor = 'recipe' THEN
            counter := productOption.quantity;
            WHILE counter >= 1 LOOP
                INSERT INTO "order"."cartItem"("parentCartItemId","simpleRecipeYieldId") VALUES (NEW.id, productOption."simpleRecipeYieldId") RETURNING id;
                FOR sachet IN SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = productOption."simpleRecipeYieldId" LOOP
                    INSERT INTO "order"."cartItem"("parentCartItemId","ingredientSachetId") VALUES (id, sachet."ingredientSachetId");
                END LOOP;
                counter := counter - 1;
            END LOOP;
        ELSIF validFor = 'sachetItem' THEN
            counter := productOption.quantity;
            WHILE counter >= 1 LOOP
                INSERT INTO "order"."cartItem"("parentCartItemId","sachetItemId") VALUES (NEW.id, productOption."sachetItemId") RETURNING id;
                counter := counter - 1;
            END LOOP;
        END IF;
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."handleSubscriberStatus"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW."paymentStatus" = 'PENDING' OR NEW."subscriptionOccurenceId" IS NULL THEN
        RETURN NULL;
    END IF;
    UPDATE crm."customer" SET "isSubscriber" = true WHERE "keycloakId" = NEW."customerKeycloakId";
    UPDATE crm."brand_customer" SET "isSubscriber" = true WHERE "brandId" = NEW."brandId" AND "keycloakId" = NEW."customerKeycloakId";
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."handle_CRUD_cart_rewards"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    parentCartId int;
    cartId int := coalesce(NEW."id",OLD."id");
BEGIN
    SELECT "parentCartId" INTO parentCartId FROM "order"."cart" WHERE "id" = cartId;
    PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', cartId));
    PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', parentCartId));
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."handle_CRUD_on_cart"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF OLD."parentCartId" IS NOT NULL THEN
            PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', OLD."parentCartId"));
        END IF;
    ELSIF (TG_OP = 'UPDATE') THEN
        PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', NEW."id"));
    END IF;
RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."handle_CRUD_on_cartItem"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF (TG_OP = 'DELETE') THEN
        IF OLD."cartId" IS NOT NULL THEN
            PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', OLD."cartId"));
            PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', OLD."parentCartId"));
        END IF;
        RETURN OLD;
    ELSE
        IF NEW."cartId" IS NOT NULL THEN
            PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', NEW."cartId"));
            PERFORM "order"."handle_cart_status"(JSONB_BUILD_OBJECT('cartId', NEW."parentCartId"));
        END IF;
        RETURN NEW;
    END IF;
END;
$$;
CREATE FUNCTION "order".handle_cart_item_event_logging() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    brandCustomerId integer;
    cart "order".cart;
BEGIN
    IF NEW."parentCartItemId" IS NOT NULL THEN
        RETURN NULL;
    END IF;
    IF TG_OP = 'INSERT' THEN
        SELECT id INTO brandCustomerId FROM crm."brand_customer" 
            WHERE 
                "keycloakId" = (SELECT "customerKeycloakId" FROM "order"."cart" WHERE id = NEW."cartId") AND 
                "brandId" = (SELECT "brandId" FROM "order"."cart" WHERE id = NEW."cartId");
        SELECT * INTO cart FROM "order".cart WHERE id = NEW."cartId";
    ELSIF TG_OP = 'UPDATE' OR TG_OP ='DELETE' THEN
        SELECT id INTO brandCustomerId FROM crm."brand_customer" 
            WHERE 
                "keycloakId" = (SELECT "customerKeycloakId" FROM "order"."cart" WHERE id = OLD."cartId") AND 
                "brandId" = (SELECT "brandId" FROM "order"."cart" WHERE id = OLD."cartId");
        SELECT * INTO cart FROM "order".cart WHERE id = OLD."cartId";
    END IF;
    IF TG_OP = 'INSERT' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                brandCustomerId,
                cart."subscriptionOccurenceId",
                cart."customerKeycloakId",
                NEW."cartId",
                'Cart Item',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Product has been added to the cart',
                    'fields', jsonb_build_object(
                        'old', '{}'::json,
                        'new', jsonb_build_object(
                            'id', NEW.id,
                            'updated_at', NEW.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = NEW."productId")
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                brandCustomerId,
                cart."subscriptionOccurenceId",
                cart."customerKeycloakId",
                cart.id,
                'Cart Item',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', CONCAT('Product status has been changed from ', OLD.status , ' to ', NEW.status),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'id', OLD.id,
                            'status', OLD.status,
                            'updated_at', OLD.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = OLD."productId")
                        ),
                        'new', jsonb_build_object(
                            'id', NEW.id,
                            'status', NEW.status,
                            'updated_at', NEW.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = NEW."productId")
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isAssembled" != NEW."isAssembled" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                brandCustomerId,
                cart."subscriptionOccurenceId",
                cart."customerKeycloakId",
                cart.id,
                'Cart Item',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', CONCAT('Product has been marked ', (CASE WHEN NEW."isAssembled" = true THEN 'assembled' ELSE 'unassembled' END)),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'id', OLD.id,
                            'isAssembled', OLD."isAssembled",
                            'updated_at', OLD.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = OLD."productId")
                        ),
                        'new', jsonb_build_object(
                            'id', NEW.id,
                            'isAssembled', NEW."isAssembled",
                            'updated_at',  NEW.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = NEW."productId")
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'DELETE' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                brandCustomerId,
                cart."subscriptionOccurenceId",
                cart."customerKeycloakId",
                cart.id,
                'Cart Item',
                '{}'::json,
                jsonb_build_object(
                    'message', 'Product has been removed from the cart',
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                            'id', OLD.id,
                            'updated_at', OLD.updated_at,
                            'name', (SELECT name FROM products.product WHERE id = OLD."productId")
                        ),
                        'new', jsonb_build_object(
                            'id', OLD.id,
                            'updated_at', now(),
                            'name', (SELECT name FROM products.product WHERE id = OLD."productId")
                        )
                    )
                )
            );
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order".handle_cart_status(params jsonb) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
  rec "order"."cart";
  balanceToPay numeric :=0;
  totalToPay numeric := 0;
  paymentStatus text;
  cartOwnerBilling jsonb;
  cartId int;
BEGIN
   IF (params->>'cartId') IS NOT NULL THEN
cartId := (params->>'cartId')::int;
        SELECT * INTO rec FROM "order"."cart" WHERE "id" = cartId;
        SELECT "cartFunctions"."cartOwnerBilling"(rec) INTO cartOwnerBilling;
        balanceToPay := (cartOwnerBilling->>'balanceToPay')::numeric;
        totalToPay := (cartOwnerBilling->>'totalToPay')::numeric;
        IF balanceToPay > 0 THEN 
            paymentStatus := 'PENDING';
        ELSIF balanceToPay > 0 AND rec."amount" > 0 THEN 
            paymentStatus := 'PARTIAL';
        ELSE 
            paymentStatus := 'SUCCEEDED';
        END IF;
            UPDATE "order"."cart" SET "paymentStatus" = paymentStatus
, "totalToPay" = totalToPay
, "balanceToPay" = balanceToPay 
WHERE "id" = cartId;
    END IF;
    RETURN COALESCE(balanceToPay,0);
END;
$$;
CREATE FUNCTION "order".handle_on_cart_update_logging() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    brandCustomerId integer;
BEGIN
    SELECT id INTO brandCustomerId FROM crm."brand_customer" 
    WHERE 
        "keycloakId" = COALESCE(NEW."customerKeycloakId", OLD."customerKeycloakId") AND 
        "brandId" = COALESCE(NEW."brandId", OLD."brandId");
    IF TG_OP = 'INSERT' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                brandCustomerId,
                NEW."subscriptionOccurenceId",
                NEW."customerKeycloakId",
                NEW.id,
                'Cart',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Cart has been created!',
                    'fields', '{}'::json
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."paymentStatus" != NEW."paymentStatus" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', CONCAT('Payment status has been changed from ', OLD."paymentStatus", ' to ', NEW."paymentStatus"),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'paymentStatus', OLD."paymentStatus",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'paymentStatus', NEW."paymentStatus",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', CONCAT('Order status has been changed from ', OLD.status, ' to ', NEW.status),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'status', OLD.status,
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'status', NEW.status,
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."transactionId" != NEW."transactionId" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN CONCAT('Payment intent has been set to ', NEW."transactionId")
                        WHEN TG_OP = 'UPDAte' THEN CONCAT('Payment intent has been changed from ', OLD."transactionId", ' to ', NEW."transactionId")
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'transactionId', OLD."transactionId",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'transactionId', NEW."transactionId",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."stripeInvoiceId" != NEW."stripeInvoiceId" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN CONCAT('Invoice has been set to ', NEW."stripeInvoiceId")
                        WHEN TG_OP = 'UPDATE' THEN CONCAT('Invoice has been changed from ', OLD."stripeInvoiceId", ' to ', NEW."stripeInvoiceId")
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'stripeInvoiceId', OLD."stripeInvoiceId",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'stripeInvoiceId', NEW."stripeInvoiceId",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD.address != NEW.address THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN 'Customer address has been set to the cart.'
                        WHEN TG_OP = 'UDPATE' THEN 'Customer address has been changed.'
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'address', OLD.address,
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'address', NEW.address,
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."customerInfo" != NEW."customerInfo" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN 'Customer details has been set to the cart.'
                        WHEN TG_OP = 'UPDATE' THEN 'Customer details has been changed.'
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'customerInfo', OLD."customerInfo",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'customerInfo', NEW."customerInfo",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."fulfillmentInfo" != NEW."fulfillmentInfo" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN 'Fulfillment details has been set to the cart.'
                        WHEN TG_OP = 'UPDATE' THEN 'Fulfillment details has been changed.'
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'fulfillmentInfo', OLD."fulfillmentInfo",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'fulfillmentInfo', NEW."fulfillmentInfo",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."paymentMethodId" != NEW."paymentMethodId" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', (
                    CASE
                        WHEN TG_OP = 'INSERT' THEN CONCAT('Payment method has been set to ', NEW."paymentMethodId")
                        WHEN TG_OP = 'UPDATE' THEN CONCAT('Payment method has been change from ', OLD."paymentMethodId", ' to ', NEW."paymentMethodId")
                        ELSE ''
                    END
                ),
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'paymentMethodId', OLD."paymentMethodId",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'paymentMethodId', NEW."paymentMethodId",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isArchived" != NEW."isArchived" THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            NEW."subscriptionOccurenceId",
            NEW."customerKeycloakId",
            NEW.id,
            'Cart',
            NEW."lastUpdatedBy",
            jsonb_build_object(
                'message', 'Cart has been archived.',
                'fields', jsonb_build_object(
                    'old', jsonb_build_object(
                      'isArchived', OLD."isArchived",
                    'updated_at', OLD."updated_at"
                    ),
                    'new', jsonb_build_object(
                      'isArchived', NEW."isArchived",
                    'updated_at', NEW."updated_at"
                    )
                )
            )
        );
    END IF;
    IF TG_OP = 'DELETE' THEN
        INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
            brandCustomerId,
            OLD."subscriptionOccurenceId",
            OLD."customerKeycloakId",
            OLD.id,
            'Cart',
            '{}'::json,
            jsonb_build_object(
                'message', 'Cart has been deleted.',
                'fields', '{}'::json
            )
        );
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order".handle_on_order_update_logging() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    brandCustomerId integer;
    cart "order".cart;
BEGIN
    -- IF TG_OP = 'UPDATE' OR TG_OP = 'INSERT' THEN
    --     SELECT id INTO brandCustomerId FROM crm."brand_customer" 
    --         WHERE 
    --             "keycloakId" = NEW."keycloakId" AND 
    --             "brandId" = NEW."brandId";
    --     SELECT * INTO cart FROM "order".cart WHERE id = NEW."cartId";
    -- ELSIF TG_OP = 'DELETE' THEN
    --     SELECT id INTO brandCustomerId FROM crm."brand_customer" 
    --         WHERE 
    --             "keycloakId" = OLD."keycloakId" AND 
    --             "brandId" = OLD."brandId";
    --     SELECT * INTO cart FROM "order".cart WHERE id = OLD."cartId";
    -- END IF;
    -- IF TG_OP = 'INSERT' THEN
    --     INSERT INTO settings."activityLogs"
    --         ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
    --         VALUES (
    --             brandCustomerId,
    --             cart."subscriptionOccurenceId",
    --             cart."customerKeycloakId",
    --             cart.id,
    --             'Order',
    --             NEW."lastUpdatedBy",
    --             jsonb_build_object(
    --                 'message', 'Order has been placed!',
    --                 'fields', jsonb_build_object(
    --                     'old', '{}'::json,
    --                     'new', jsonb_build_object(
    --                         'orderId', NEW.id                        
    --                     )
    --                 )
    --             )
    --         );
    -- END IF;
    -- IF TG_OP != 'DELETE' AND OLD."isRejected" != NEW."isRejected" THEN
    --     INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
    --         brandCustomerId,
    --         cart."subscriptionOccurenceId",
    --         cart."customerKeycloakId",
    --         cart.id,
    --         'Order',
    --         NEW."lastUpdatedBy",
    --         jsonb_build_object(
    --             'message', (CASE WHEN NEW."isRejected" = true THEN 'Order has been rejected.' ELSE 'Order has been unrejected' END),
    --             'fields', jsonb_build_object(
    --                 'old', jsonb_build_object(
    --                   'isRejected', OLD."isRejected",
    --                 'updated_at', OLD."updated_at"
    --                 ),
    --                 'new', jsonb_build_object(
    --                   'isRejected', NEW."isRejected",
    --                     'updated_at', NEW."updated_at"
    --                 )
    --             )
    --         )
    --     );
    -- END IF;
    -- IF TG_OP != 'DELETE' AND OLD."isAccepted" != NEW."isAccepted" THEN
    --     INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
    --         brandCustomerId,
    --         cart."subscriptionOccurenceId",
    --         cart."customerKeycloakId",
    --         cart.id,
    --         'Order',
    --         NEW."lastUpdatedBy",
    --         jsonb_build_object(
    --             'message', (CASE WHEN NEW."isAccepted" = true THEN 'Order has been accepted.' ELSE 'Order has been unaccepted.' END),
    --             'fields', jsonb_build_object(
    --                 'old', jsonb_build_object(
    --                   'isAccepted', OLD."isAccepted",
    --                 'updated_at', OLD."updated_at"
    --                 ),
    --                 'new', jsonb_build_object(
    --                   'isAccepted', NEW."isAccepted",
    --                     'updated_at', NEW."updated_at"
    --                 )
    --             )
    --         )
    --     );
    -- END IF;
    -- IF TG_OP != 'DELETE' AND OLD."isArchived" != NEW."isArchived" THEN
    --     INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
    --         brandCustomerId,
    --         cart."subscriptionOccurenceId",
    --         cart."customerKeycloakId",
    --         cart.id,
    --         'Order',
    --         NEW."lastUpdatedBy",
    --         jsonb_build_object(
    --             'message', (CASE WHEN NEW."isArchived" = true THEN 'Order has been archived.' ELSE 'Order has been unacrchived.' END),
    --             'fields', jsonb_build_object(
    --                 'old', jsonb_build_object(
    --                   'isArchived', OLD."isArchived",
    --                 'updated_at', OLD."updated_at"
    --                 ),
    --                 'new', jsonb_build_object(
    --                   'isArchived', NEW."isArchived",
    --                     'updated_at', NEW."updated_at"
    --                 )
    --             )
    --         )
    --     );
    -- END IF;
    -- IF TG_OP != 'DELETE' AND OLD."deliveryPartnershipId" != NEW."deliveryPartnershipId" THEN
    --     INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
    --         brandCustomerId,
    --         cart."subscriptionOccurenceId",
    --         cart."customerKeycloakId",
    --         cart.id,
    --         'Order',
    --         NEW."lastUpdatedBy",
    --         jsonb_build_object(
    --             'message', (CASE WHEN NEW."deliveryPartnershipId" IS NOT NULL THEN 'Delivery service has been selected.' ELSE 'Delivery service has been deselected.' END),
    --             'fields', jsonb_build_object(
    --                 'old', jsonb_build_object(
    --                   'deliveryPartnershipId', OLD."deliveryPartnershipId",
    --                 'updated_at', OLD."updated_at"
    --                 ),
    --                 'new', jsonb_build_object(
    --                   'deliveryPartnershipId', NEW."deliveryPartnershipId",
    --                     'updated_at', NEW."updated_at"
    --                 )
    --             )
    --         )
    --     );
    -- END IF;
    -- IF TG_OP = 'DELETE' THEN
    --     INSERT INTO settings."activityLogs"("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) VALUES (
    --         brandCustomerId,
    --         cart."subscriptionOccurenceId",
    --         cart."customerKeycloakId",
    --         cart.id,
    --         'Order',
    --         '{}'::json,
    --         jsonb_build_object(
    --             'message', 'Order has been deleted.',
    --             'fields', '{}'::json
    --         )
    --     );
    -- END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."handle_paymentStatus_on_cartPayment"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 rec record;
 experienceBookingId int;
BEGIN
    UPDATE "order"."cart" SET "amount" = (SELECT "amount" FROM "order"."cart" WHERE "id" = New."cartId") + New."amount" WHERE "id" = New."cartId";
  RETURN New;
END;
$$;
CREATE FUNCTION "order"."handle_reset_activeCartPayment"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 rec record;
 experienceBookingId int;
BEGIN
    IF (TG_OP = 'UPDATE') OR NEW."paymentRetryAttempt" > OLD."paymentRetryAttempt" THEN
        NEW."activeCartPaymentId" := null;
        RETURN NEW;
    END IF;
    IF (TG_OP = 'UPDATE') OR NEW."paymentStatus" = 'SUCCEEDED' THEN
        RETURN NULL;
    END IF;
  RETURN New;
END;
$$;
CREATE FUNCTION "order".handlecartitemfields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ DECLARE p record;
inventorySachet "products"."inventoryProductBundleSachet";
sachet "simpleRecipe"."simpleRecipeYield_ingredientSachet";
counter int;
modifierOption record;
path text;
level int;
levelType text default null;
count int default 0;
productId int;
productOptionId int;
simpleRecipeYieldId int;
comboProductComponentId int;
customizableProductComponentId int;
sachetItemId int;
subRecipeYieldId int;
modifierOptionId int;
ingredientSachetId int;
cartItemType text;
inventoryProductBundleId int;
displayImage jsonb;
displayBulkDensity numeric;
orderMode text;
productOptionType text;
ingredientId int;
ingredientProcessingId int;
displayServing numeric;
bulkItemId int;
supplierItemId int;
parentCartId int;
BEGIN
select 
  * into p 
from 
  "order"."cartItem" 
where 
  id = New."parentCartItemId";
IF NEW."productId" is not null OR NEW."experienceClassTypeId" is not null then 
productId := NEW."productId";
NEW."parentCartId" := (select "parentCartId" from "order"."cart" where id = NEW."cartId");
path := (New.Id):: text;
level := 1;
New."rootCartItemId" := NEW.id;
else path := (
  (
    (
      (p.path):: text || '->' :: text
    ) || New.id
  )
):: text;
level := (p.level + 1);
NEW."rootCartItemId" := p."rootCartItemId";
productId := coalesce(new."productId", p."productId");
productOptionId := COALESCE(
  new."productOptionId", p."productOptionId"
);
comboProductComponentId := COALESCE(
  New."comboProductComponentId", p."comboProductComponentId"
);
customizableProductComponentId := COALESCE(
  New."customizableProductComponentId", 
  p."customizableProductComponentId"
);
simpleRecipeYieldId := COALESCE(
  New."simpleRecipeYieldId", p."simpleRecipeYieldId"
);
sachetItemId := COALESCE(
  New."sachetItemId", p."sachetItemId"
);
subRecipeYieldId := COALESCE(
  New."subRecipeYieldId", p."subRecipeYieldId"
);
modifierOptionId := COALESCE(
  New."modifierOptionId", p."modifierOptionId"
);
ingredientSachetId := COALESCE(
  New."ingredientSachetId", p."ingredientSachetId"
);
inventoryProductBundleId := COALESCE(
  NEW."inventoryProductBundleId", 
  p."inventoryProductBundleId"
);
end if;
IF New."cartId" is null then new."cartId" := p."cartId";
end if;
IF New."parentCartId" is null then 
NEW."parentCartId" := p."parentCartId";
end if;
NEW."productId" := productId;
NEW."productOptionId" := productOptionId;
NEW."simpleRecipeYieldId" := simpleRecipeYieldId;
NEW."comboProductComponentId" := comboProductComponentId;
NEW."customizableProductComponentId" := customizableProductComponentId;
NEW."sachetItemId" := sachetItemId;
NEW."subRecipeYieldId" := subRecipeYieldId;
NEW."level" := level;
NEW."path" := path;
productOptionType := (
  CASE WHEN (NEW."productOptionId" IS NOT NULL) THEN (
    SELECT 
      "productOption".type 
    FROM 
      products."productOption" 
    WHERE 
      (
        "productOption".id = NEW."productOptionId"
      )
  ) WHEN (p."productOptionId" IS NOT NULL) THEN (
    SELECT 
      "productOption".type 
    FROM 
      products."productOption" 
    WHERE 
      (
        "productOption".id = p."productOptionId"
      )
  ) ELSE NULL :: text END
);
NEW."modifierOptionId" := COALESCE(
  NEW."modifierOptionId", p."modifierOptionId"
);
IF (level = 1) THEN levelType := 'productItem' :: text;
ELSIF (level = 2) THEN 
select 
  'productItemComponent' :: text into levelType;
ELSIF (level = 3) THEN 
select 
  'orderItem' :: text into levelType;
ELSIF (level = 4) THEN 
select 
  'orderItemSachet' :: text into levelType;
ELSIF (level > 4) THEN 
select 
  'orderItemSachetComponent' :: text into levelType;
END IF;
NEW."displayName" := btrim(
  COALESCE(
    concat(
      (
        SELECT 
          product.name 
        FROM 
          products.product 
        WHERE 
          (product.id = productId)
      ), 
      (
        SELECT 
          (
            ' -> ' :: text || "productOptionView"."displayName"
          ) 
        FROM 
          products."productOptionView" 
        WHERE 
          (
            "productOptionView".id = productOptionId
          )
      ), 
      (
        SELECT 
          (
            ' -> ' :: text || "comboProductComponent".label
          ) 
        FROM 
          products."comboProductComponent" 
        WHERE 
          (
            "comboProductComponent".id = comboProductComponentId
          )
      ), 
      (
        SELECT 
          (
            ' -> ' :: text || "simpleRecipeYieldView"."displayName"
          ) 
        FROM 
          "simpleRecipe"."simpleRecipeYieldView" 
        WHERE 
          (
            "simpleRecipeYieldView".id = simpleRecipeYieldId
          )
      ), 
      (
        SELECT 
          (
            (' -> ' :: text || '(MOD) -' :: text) || "modifierCategoryOptionView"."displayName"
          ) 
        FROM 
          "onDemand"."modifierCategoryOptionView" 
        WHERE 
          (
            "modifierCategoryOptionView".id = modifierOptionId
          )
      ), 
      CASE WHEN (
        NEW."inventoryProductBundleId" IS NOT NULL
      ) THEN (
        SELECT 
          (
            ' -> ' :: text || "productOptionView"."displayName"
          ) 
        FROM 
          products."productOptionView" 
        WHERE 
          (
            "productOptionView".id = (
              SELECT 
                "cartItem"."productOptionId" 
              FROM 
                "order"."cartItem" 
              WHERE 
                (
                  "cartItem".id = NEW."parentCartItemId"
                )
            )
          )
      ) ELSE '' :: text END, 
      (
        SELECT 
          (
            ' -> ' :: text || "ingredientSachetView"."displayName"
          ) 
        FROM 
          ingredient."ingredientSachetView" 
        WHERE 
          (
            "ingredientSachetView".id = ingredientSachetId
          )
      ), 
      (
        SELECT 
          (
            ' -> ' :: text || "sachetItemView"."supplierItemName"
          ) 
        FROM 
          inventory."sachetItemView" 
        WHERE 
          (
            "sachetItemView".id = sachetItemId
          )
      )
    ), 
    'N/A' :: text
  )
);
NEW."processingName" := COALESCE(
  (
    SELECT 
      "ingredientProcessing"."processingName" 
    FROM 
      ingredient."ingredientProcessing" 
    WHERE 
      (
        "ingredientProcessing".id = (
          SELECT 
            "ingredientSachet"."ingredientProcessingId" 
          FROM 
            ingredient."ingredientSachet" 
          WHERE 
            (
              "ingredientSachet".id = ingredientSachetId
            )
        )
      )
  ), 
  (
    SELECT 
      "sachetItemView"."processingName" 
    FROM 
      inventory."sachetItemView" 
    WHERE 
      (
        "sachetItemView".id = sachetItemId
      )
  ), 
  'N/A' :: text
);
NEW."operationConfigId" := COALESCE(
  (
    SELECT 
      "modeOfFulfillment"."operationConfigId" 
    FROM 
      ingredient."modeOfFulfillment" 
    WHERE 
      (
        "modeOfFulfillment".id = (
          SELECT 
            "ingredientSachet"."liveMOF" 
          FROM 
            ingredient."ingredientSachet" 
          WHERE 
            (
              "ingredientSachet".id = ingredientSachetId
            )
        )
      )
  ), 
  (
    SELECT 
      "productOption"."operationConfigId" 
    FROM 
      products."productOption" 
    WHERE 
      (
        "productOption".id = productOptionId
      )
  ), 
  NULL :: integer
);
NEW."displayUnit" := COALESCE(
  (
    SELECT 
      "ingredientSachet".unit 
    FROM 
      ingredient."ingredientSachet" 
    WHERE 
      (
        "ingredientSachet".id = ingredientSachetId
      )
  ), 
  (
    SELECT 
      "sachetItemView".unit 
    FROM 
      inventory."sachetItemView" 
    WHERE 
      (
        "sachetItemView".id = sachetItemId
      )
  ), 
  (
    SELECT 
      "simpleRecipeYield".unit 
    FROM 
      "simpleRecipe"."simpleRecipeYield" 
    WHERE 
      (
        "simpleRecipeYield".id = subRecipeYieldId
      )
  ), 
  NULL :: text
);
NEW."displayUnitQuantity" := COALESCE(
  (
    SELECT 
      "ingredientSachet".quantity 
    FROM 
      ingredient."ingredientSachet" 
    WHERE 
      (
        "ingredientSachet".id = ingredientSachetId
      )
  ), 
  (
    SELECT 
      "sachetItemView"."unitSize" 
    FROM 
      inventory."sachetItemView" 
    WHERE 
      (
        "sachetItemView".id = sachetItemId
      )
  ), 
  (
    SELECT 
      "simpleRecipeYield".quantity 
    FROM 
      "simpleRecipe"."simpleRecipeYield" 
    WHERE 
      (
        "simpleRecipeYield".id = subRecipeYieldId
      )
  ), 
  NULL :: numeric
);
IF (subRecipeYieldId IS NOT NULL) THEN 
select 
  'subRecipeYield' :: text into cartItemType;
ELSIF (ingredientSachetId IS NOT NULL) THEN 
select 
  'ingredientSachet' :: text into cartItemType;
ELSIF (sachetItemId IS NOT NULL) THEN 
select 
  'sachetItem' :: text into cartItemType;
ELSIF (simpleRecipeYieldId IS NOT NULL) THEN 
select 
  'simpleRecipeYield' :: text into cartItemType;
ELSIF (
  inventoryProductBundleId IS NOT NULL
) THEN 
select 
  'inventoryProductBundle' :: text into cartItemType;
ELSIF (productOptionId IS NOT NULL) THEN 
select 
  'productComponent' :: text into cartItemType;
ELSIF (productId IS NOT NULL) THEN 
select 
  'product' :: text into cartItemType;
ELSE 
select 
  NULL :: text into cartItemType;
END IF;
IF (productId IS NOT NULL) THEN 
SELECT 
  (
    product.assets -> 'images' -> 0
  ) 
FROM 
  products.product 
WHERE 
  (product.id = productId) into displayImage;
ELSIF (productOptionId IS NOT NULL) then 
SELECT 
  "productOptionView"."displayImage" 
FROM 
  products."productOptionView" 
WHERE 
  (
    "productOptionView".id = p."productOptionId"
  ) into displayImage;
ELSIF (simpleRecipeYieldId IS NOT NULL) THEN 
SELECT 
  "productOptionView"."displayImage" 
FROM 
  products."productOptionView" 
WHERE 
  (
    "productOptionView".id = (
      SELECT 
        "cartItem"."productOptionId" 
      FROM 
        "order"."cartItem" 
      WHERE 
        (
          "cartItem".id = p."parentCartItemId"
        )
    )
  ) into displayImage;
ELSE 
select 
  NULL :: jsonb into displayImage;
END IF;
IF (sachetItemId IS NOT NULL) THEN 
SELECT 
  "sachetItemView"."bulkDensity" 
FROM 
  inventory."sachetItemView" 
WHERE 
  (
    "sachetItemView".id = sachetItemId
  ) into displayBulkDensity;
ELSE 
select 
  NULL :: numeric into displayBulkDensity;
END IF;
orderMode := COALESCE(
  (
    SELECT 
      "simpleRecipeComponent_productOptionType"."orderMode" 
    FROM 
      "simpleRecipe"."simpleRecipeComponent_productOptionType" 
    WHERE 
      (
        (
          "simpleRecipeComponent_productOptionType"."productOptionType" = productOptionType
        ) 
        AND (
          "simpleRecipeComponent_productOptionType"."simpleRecipeComponentId" = (
            SELECT 
              "simpleRecipeYield_ingredientSachet"."simpleRecipeIngredientProcessingId" 
            FROM 
              "simpleRecipe"."simpleRecipeYield_ingredientSachet" 
            WHERE 
              (
                (
                  "simpleRecipeYield_ingredientSachet"."recipeYieldId" = simpleRecipeYieldId
                ) 
                AND (
                  (
                    "simpleRecipeYield_ingredientSachet"."ingredientSachetId" = ingredientSachetId
                  ) 
                  OR (
                    "simpleRecipeYield_ingredientSachet"."subRecipeYieldId" = subRecipeYieldId
                  )
                )
              ) 
            LIMIT 
              1
          )
        )
      ) 
    LIMIT 
      1
  ), (
    SELECT 
      "simpleRecipe_productOptionType"."orderMode" 
    FROM 
      "simpleRecipe"."simpleRecipe_productOptionType" 
    WHERE 
      (
        "simpleRecipe_productOptionType"."simpleRecipeId" = (
          SELECT 
            "simpleRecipeYield"."simpleRecipeId" 
          FROM 
            "simpleRecipe"."simpleRecipeYield" 
          WHERE 
            (
              "simpleRecipeYield".id = simpleRecipeYieldId
            )
        )
      )
  ), 
  (
    SELECT 
      "productOptionType"."orderMode" 
    FROM 
      products."productOptionType" 
    WHERE 
      (
        "productOptionType".title = productOptionType
      )
  ), 
  'undefined' :: text
);
displayServing := COALESCE(
  (
    SELECT 
      "simpleRecipeYield".serving 
    FROM 
      "simpleRecipe"."simpleRecipeYield" 
    WHERE 
      (
        "simpleRecipeYield".id = subRecipeYieldId
      )
  ), 
  (
    SELECT 
      "simpleRecipeYield".serving 
    FROM 
      "simpleRecipe"."simpleRecipeYield" 
    WHERE 
      (
        "simpleRecipeYield".id = simpleRecipeYieldId
      )
  ), 
  NULL :: numeric
):: numeric;
IF ingredientSachetId IS NOT NULL THEN 
SELECT 
  "ingredientSachet"."ingredientId" into ingredientId 
FROM 
  ingredient."ingredientSachet" 
WHERE 
  "ingredientSachet".id = ingredientSachetId;
ELSE 
select 
  NULL into ingredientId;
END IF;
IF ingredientSachetId IS NOT NULL THEN 
SELECT 
  "ingredientSachet"."ingredientProcessingId" into ingredientProcessingId 
FROM 
  ingredient."ingredientSachet" 
WHERE 
  "ingredientSachet".id = ingredientSachetId;
ELSE 
select 
  NULL into ingredientProcessingId;
END IF;
IF sachetItemId IS NOT NULL THEN 
SELECT 
  "sachetItem"."bulkItemId" into bulkItemId 
FROM 
  inventory."sachetItem" 
WHERE 
  "sachetItem".id = p."sachetItemId";
ELSE 
select 
  NULL :: integer into bulkItemId;
END IF;
If sachetItemId IS NOT NULL THEN 
SELECT 
  "bulkItem"."supplierItemId" into supplierItemId 
FROM 
  inventory."bulkItem" 
WHERE 
  (
    "bulkItem".id = (
      SELECT 
        "sachetItem"."bulkItemId" 
      FROM 
        inventory."sachetItem" 
      WHERE 
        "sachetItem".id = p."sachetItemId"
    )
  );
ELSE 
select 
  NULL :: integer into supplierItemId;
END IF;
NEW."orderMode" := orderMode;
NEW."displayBulkDensity" := displayBulkDensity;
NEW."cartItemType" := cartItemType;
NEW."displayImage" := displayImage;
NEW."productOptionType" := productOptionType;
NEW."displayServing" := displayServing;
NEW."ingredientId" := ingredientId;
NEW."ingredientProcessingId" := ingredientProcessingId;
NEW."bulkItemId" := bulkItemId;
NEW."supplierItemId" := supplierItemId;
NEW."levelType" := levelType;
RETURN NEW;
END;
$$;
CREATE FUNCTION "order".hasura_scheduled_event_on_order_confirmation() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 brand_touchpoint record;
 brand_customerId int;
 customer_email text;
 eventid text;
BEGIN
    SELECT "id" INTO brand_customerId FROM "crm"."brand_customer" WHERE "brandId" = NEW."brandId" AND "keycloakId" = NEW."keycloakId";
    SELECT "email" INTO customer_email FROM "crm"."customer" WHERE "sourceBrandId" = NEW."brandId" AND "keycloakId" = NEW."keycloakId";
    SELECT * INTO brand_touchpoint FROM "notifications"."brand_touchpoint" WHERE "touchpointIdentifier" = 'tpi_orderConfirmation';    
    IF brand_touchpoint."isActive" is true then
        SELECT datahub_schema."createHasuraScheduledEventForEmailTouchPoint"((select now() + INTERVAL '1 min'*coalesce(brand_touchpoint."timeIntervalInMins", 5)), jsonb_build_object('emailTriggerTitle', brand_touchpoint."configuredEmailTriggerTitle", 'email',customer_email, 'brandId', NEW."brandId", 'includeHeader',true, 'includeFooter', true,'brand_customerId',brand_customerId, 'orderId', NEW."id")) into eventid;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION "order"."isCartValid"(cart "order".cart) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $_$
DECLARE
    totalPrice numeric := 0;
    res jsonb;
    productsCount int := 0;
    validStatus record;
    brandCustomerId int;
BEGIN
    SELECT "order"."totalPrice"(cart.*) INTO totalPrice;
    SELECT count(*) INTO productsCount FROM "order"."cartItem" WHERE "cartId" = cart.id;
    IF productsCount = 0
        THEN res := json_build_object('status', false, 'error', 'No items in cart!');
    ELSIF cart."customerInfo" IS NULL OR cart."customerInfo"->>'customerFirstName' IS NULL OR cart."customerInfo"->>'customerPhone' IS NULL 
        THEN res := json_build_object('status', false, 'error', 'Basic customer details missing!');
    ELSIF cart."fulfillmentInfo" IS NULL
        THEN res := json_build_object('status', false, 'error', 'No fulfillment mode selected!');
    ELSIF cart."fulfillmentInfo" IS NOT NULL AND cart.status = 'PENDING'
        THEN SELECT "order"."validateFulfillmentInfo"(cart."fulfillmentInfo", cart."brandId") INTO res;
        IF (res->>'status')::boolean = false THEN
            PERFORM "order"."clearFulfillmentInfo"(cart.id);
        END IF;
    ELSIF cart."address" IS NULL AND cart."fulfillmentInfo"::json->>'type' LIKE '%DELIVERY' 
        THEN res := json_build_object('status', false, 'error', 'No address selected for delivery!');
    ELSIF totalPrice > 0 AND totalPrice <= 0.5
        THEN res := json_build_object('status', false, 'error', 'Transaction amount should be greater than $0.5!');
    ELSE
        res := jsonb_build_object('status', true, 'error', '');
    END IF;
    IF cart.source = 'subscription' THEN
        SELECT id FROM crm.brand_customer WHERE "brandId" = cart."brandId" AND "keycloakId" = cart."customerKeycloakId" INTO brandCustomerId;
        SELECT subscription."isCartValid"("subscriptionOccurence_customer".*) FROM subscription."subscriptionOccurence_customer" WHERE 
            "subscriptionOccurenceId" = cart."subscriptionOccurenceId" AND
            "keycloakId" = cart."customerKeycloakId" AND
            "brand_customerId" = brandCustomerId INTO validStatus;
        res := res || jsonb_build_object(
            'validStatus', validStatus
        );
    END IF;
    RETURN res;
END
$_$;
CREATE FUNCTION "order"."isHostCart"(cartdata "order".cart, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    hostKeycloakId text;
BEGIN
    IF cartdata."parentCartId" IS NOT NULL AND cartdata."customerKeycloakId" IS NOT NULL THEN
        SELECT "customerKeycloakId" INTO hostKeycloakId FROM "order"."cart" WHERE "id" = cartdata."parentCartId";
        IF hostKeycloakId = cartdata."customerKeycloakId" THEN
            RETURN TRUE;
        END IF;
    END IF;
    RETURN FALSE;
END;
$$;
CREATE FUNCTION "order"."isHostParticipant"(cartdata "order".cart) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    rec record;
BEGIN
    IF cartdata."parentCartId" IS NULL THEN
        FOR rec IN SELECT * FROM "order"."cart" WHERE "parentCartId" = cartdata.id ORDER BY "id" ASC LOOP
            IF rec."customerKeycloakId" = cartdata."customerKeycloakId" THEN
              RETURN TRUE;
            END IF;
        END LOOP;
    END IF;
    RETURN FALSE;
END;
$$;
CREATE FUNCTION "order"."isTaxIncluded"(cart "order".cart) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionId int;
    itemCountId int;
    taxIncluded boolean;
BEGIN
    IF cart."subscriptionOccurenceId" IS NOT NULL THEN
        SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = cart."subscriptionOccurenceId";
        SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
        SELECT "isTaxIncluded" INTO taxIncluded FROM subscription."subscriptionItemCount" WHERE id = itemCountId;
        RETURN taxIncluded;
    END IF;
    RETURN false;
END;
$$;
CREATE FUNCTION "order"."itemTotal"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   total numeric;
BEGIN
    SELECT SUM("unitPrice") INTO total FROM "order"."cartItem" WHERE "cartId" = cart."id";
    RETURN COALESCE(total, 0);
END;
$$;
CREATE FUNCTION "order"."itemTotal2"(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   total numeric := 0 ;
   parentShare numeric;
   childShare numeric;
   rec record;
BEGIN
    FOR rec IN SELECT * FROM "order"."cartItem" WHERE "cartId" = cart.id LOOP
        parentShare := rec."parentShare" / 100 ;
        childShare  := 1 - parentShare; 
        IF (params->>'shareFor')::text != '' OR  (params->>'shareFor')::text IS NOT NULL THEN
            IF (params->>'shareFor')::text = 'parent' THEN 
                total := total + (rec."unitPrice" * parentShare);
            ELSIF (params->>'shareFor')::text = 'child' THEN
                total := total + (rec."unitPrice" * childShare);
            ELSE
                total := total + rec."unitPrice";
            END IF;
        ELSE
            total := total + rec."unitPrice";
        END IF;
    END LOOP;
    RETURN COALESCE(total, 0);
END;
$$;
CREATE FUNCTION "order"."loyaltyPointsUsable"(cart "order".cart) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   setting record;
   temp record;
   itemTotal numeric;
   deliveryPrice numeric;
   tax numeric;
   discount numeric;
   totalPrice numeric;
   amount numeric;
   rate numeric;
   pointsUsable int := 0;
   balance int;
BEGIN
    SELECT * FROM brands."storeSetting" WHERE "identifier" = 'Loyalty Points Usage' AND "type" = 'rewards' INTO setting;
    SELECT * FROM brands."brand_storeSetting" WHERE "storeSettingId" = setting.id AND "brandId" = cart."brandId" INTO temp;
    IF temp IS NOT NULL THEN
        setting := temp;
    END IF;
    IF setting IS NULL THEN
        RETURN pointsUsable;
    END IF;
    SELECT "order"."totalPrice"(cart.*) into totalPrice;
    totalPrice := ROUND(totalPrice - cart."walletAmountUsed", 2);
    amount := ROUND(totalPrice * ((setting.value->>'percentage')::float / 100));
    IF amount > (setting.value->>'max')::int THEN
        amount := (setting.value->>'max')::int;
    END IF;
    SELECT crm."getLoyaltyPointsConversionRate"(cart."brandId") INTO rate;
    pointsUsable = ROUND(amount / rate);
    SELECT points FROM crm."loyaltyPoint" WHERE "keycloakId" = cart."customerKeycloakId" AND "brandId" = cart."brandId" INTO balance;
    IF pointsUsable > balance THEN
        pointsUsable := balance;
    END IF;
    -- if usable changes after cart update, then update used points
    IF cart."loyaltyPointsUsed" > pointsUsable THEN
        PERFORM crm."setLoyaltyPointsUsedInCart"(cart.id, pointsUsable);
    END IF;
    RETURN totalPrice;
END;
$$;
CREATE FUNCTION "order"."onCartPaymentStatusUpdate"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 rec record;
 experienceBookingId int;
BEGIN
    UPDATE "order"."cart" SET "amount" = (SELECT "amount" FROM "order"."cart" WHERE "id" = New."cartId") + New."amount" WHERE "id" = New."cartId";
  RETURN New;
END;
$$;
CREATE FUNCTION "order"."onPaymentSuccess"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    cart "order"."cart";
    tax numeric := 0;
    itemTotal numeric := 0;
    deliveryPrice numeric := 0;
    totalPrice numeric := 0;
    discount numeric := 0;
    cartOwnerBilling jsonb;
BEGIN
    IF (SELECT COUNT(*) FROM "order"."order" WHERE "cartId" = NEW."id") > 0 OR NEW."parentCartId" is not null THEN
        RETURN NULL;
    END IF;
    IF NEW."paymentStatus" != 'PENDING' THEN
    select "cartFunctions"."cartOwnerBilling"(NEW) into cartOwnerBilling;
    itemTotal := (cartOwnerBilling->>'itemTotal')::numeric;
        discount := (cartOwnerBilling->>'totalDiscount')::numeric;
            totalPrice := (cartOwnerBilling->>'totalToPay')::numeric;
        tax := (cartOwnerBilling->>'itemTotalTaxExluded')::numeric;
            deliveryPrice := (cartOwnerBilling->>'deliveryPrice')::numeric;
        INSERT INTO "order"."order"(
        "cartId",
        "tip", 
        "tax",
        "itemTotal",
        "deliveryPrice",
        "fulfillmentType",
        "amountPaid",
        "keycloakId", 
        "brandId", 
        "discount",
        "fulfillmentTimestamp"
        )
            VALUES (
            NEW.id,
            NEW.tip,
            tax, 
            itemTotal,
            deliveryPrice,
            NEW."fulfillmentInfo"->>'type',
            totalPrice,
      NEW."customerKeycloakId",
            NEW."brandId", 
            discount,
            (NEW."fulfillmentInfo"->'slot'->>'from')::timestamp
            );
        UPDATE "order"."cart" 
            SET 
                "orderId" = (SELECT id FROM "order"."order" WHERE "cartId" = NEW.id),
                status = 'ORDER_PENDING'
        WHERE id = NEW.id;
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order".on_cart_item_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    totalReady integer := 0;
    totalPacked integer := 0;
    totalItems integer := 0;
BEGIN
    IF NEW.status = OLD.status THEN
        RETURN NULL;
    END IF;
    -- mark children packed if parent ready/packed
    IF NEW.status = 'READY' OR NEW.status = 'PACKED' THEN
        UPDATE "order"."cartItem" SET status = 'PACKED' WHERE "parentCartItemId" = NEW.id;
    END IF;
    IF NEW.status = 'READY_FOR_PACKING' OR NEW.status = 'READY' THEN
        IF NEW."parentCartItemId" IS NULL THEN
            UPDATE "order"."cartItem" SET status = 'PACKED' WHERE id = NEW.id; -- product
        ELSEIF (SELECT "parentCartItemId" FROM "order"."cartItem" WHERE id = NEW."parentCartItemId") IS NULL THEN
            UPDATE "order"."cartItem" SET status = 'PACKED' WHERE id = NEW.id; -- productComponent
        END IF;
    END IF;
    IF NEW.status = 'READY' THEN
        SELECT COUNT(*) INTO totalReady FROM "order"."cartItem" WHERE "parentCartItemId" = NEW."parentCartItemId" AND status = 'READY';
        SELECT COUNT(*) INTO totalItems FROM "order"."cartItem" WHERE "parentCartItemId" = NEW."parentCartItemId";
        IF totalReady = totalItems THEN
            UPDATE "order"."cartItem" SET status = 'READY_FOR_PACKING' WHERE id = NEW."parentCartItemId";
        END IF;
    END IF;
    IF NEW.status = 'PACKED' THEN
        SELECT COUNT(*) INTO totalPacked FROM "order"."cartItem" WHERE "parentCartItemId" = NEW."parentCartItemId" AND status = 'PACKED';
        SELECT COUNT(*) INTO totalItems FROM "order"."cartItem" WHERE "parentCartItemId" = NEW."parentCartItemId";
        IF totalPacked = totalItems THEN
            UPDATE "order"."cartItem" SET status = 'READY' WHERE id = NEW."parentCartItemId" AND status = 'PENDING';
        END IF;
    END IF;
    -- check order item status
    IF (SELECT status FROM "order".cart WHERE id = NEW."cartId") = 'ORDER_PENDING' THEN
        UPDATE "order".cart SET status = 'ORDER_UNDER_PROCESSING' WHERE id = NEW."cartId";
    END IF;
    IF NEW."parentCartItemId" IS NOT NULL THEN
        RETURN NULL;
    END IF;
    SELECT COUNT(*) INTO totalReady FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW."cartId" AND status = 'READY';
    SELECT COUNT(*) INTO totalPacked FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW."cartId" AND status = 'PACKED';
    SELECT COUNT(*) INTO totalItems FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW."cartId";
    IF totalReady = totalItems THEN
        UPDATE "order".cart SET status = 'ORDER_READY_TO_ASSEMBLE' WHERE id = NEW."cartId";
    ELSEIF totalPacked = totalItems THEN
        UPDATE "order".cart SET status = 'ORDER_READY_TO_DISPATCH' WHERE id = NEW."cartId";
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order".on_cart_status_change() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    item "order"."cartItem";
    packedCount integer := 0;
    readyCount integer := 0;
BEGIN
    IF OLD.status = NEW.status THEN
        RETURN NULL;
    END IF;
    IF NEW.status = 'ORDER_READY_TO_ASSEMBLE' THEN
        FOR item IN SELECT * FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW.id LOOP
            UPDATE "order"."cartItem" SET status = 'READY' WHERE id = item.id;
        END LOOP;
    ELSEIF NEW.status = 'ORDER_READY_FOR_DISPATCH' THEN
        FOR item IN SELECT * FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW.id LOOP
            UPDATE "order"."cartItem" SET status = 'PACKED' WHERE id = item.id;
        END LOOP;
    ELSEIF NEW.status = 'ORDER_OUT_FOR_DELIVERY' OR NEW.status = 'ORDER_DELIVERED' THEN
        FOR item IN SELECT * FROM "order"."cartItem" WHERE "parentCartItemId" IS NULL AND "cartId" = NEW.id LOOP
            UPDATE "order"."cartItem" SET status = 'PACKED' WHERE id = item.id;
        END LOOP;
    END IF;
    RETURN NULL;
END;
$$;
CREATE TABLE "order"."order" (
    id oid DEFAULT public.defaultid('order'::text, 'order'::text, 'id'::text) NOT NULL,
    "deliveryInfo" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    tax double precision,
    discount numeric DEFAULT 0 NOT NULL,
    "itemTotal" numeric,
    "deliveryPrice" numeric,
    currency text DEFAULT 'usd'::text,
    updated_at timestamp with time zone DEFAULT now(),
    tip numeric,
    "amountPaid" numeric,
    "fulfillmentType" text,
    "deliveryPartnershipId" integer,
    "cartId" integer,
    "isRejected" boolean,
    "isAccepted" boolean,
    "thirdPartyOrderId" integer,
    "readyByTimestamp" timestamp with time zone,
    "fulfillmentTimestamp" timestamp with time zone,
    "keycloakId" text,
    "brandId" integer,
    "isArchived" boolean DEFAULT false NOT NULL,
    "lastUpdatedBy" jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at_hour integer GENERATED ALWAYS AS (public.extracthourfromdate(created_at)) STORED,
    created_at_day integer GENERATED ALWAYS AS (public.extractdayfromdate(created_at)) STORED,
    created_at_date date GENERATED ALWAYS AS (public.extractdatefromdate(created_at)) STORED,
    created_at_week integer GENERATED ALWAYS AS (public.extractweekfromdate(created_at)) STORED,
    created_at_dow integer GENERATED ALWAYS AS (public.extractdowfromdate(created_at)) STORED,
    created_at_month integer GENERATED ALWAYS AS (public.extractmonthfromdate(created_at)) STORED,
    created_at_quarter integer GENERATED ALWAYS AS (public.extractquarterfromdate(created_at)) STORED,
    created_at_year integer GENERATED ALWAYS AS (public.extractyearfromdate(created_at)) STORED
);
COMMENT ON TABLE "order"."order" IS 'This lists records of all the orders.';
CREATE FUNCTION "order".ordersummary(order_row "order"."order") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counts jsonb;
    amounts jsonb;
BEGIN
    SELECT json_object_agg(each."orderStatus", each."count") FROM (
        SELECT "orderStatus", COUNT (*) FROM "order"."order" GROUP BY "orderStatus"
    ) AS each into counts;
    SELECT json_object_agg(each."orderStatus", each."total") FROM (
        SELECT "orderStatus", SUM ("itemTotal") as total FROM "order"."order" GROUP BY "orderStatus"
    ) AS each into amounts;
	RETURN json_build_object('count', counts, 'amount', amounts);
END
$$;
CREATE FUNCTION "order".set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION "order"."subTotal"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    amount numeric := 0;
    discount numeric := 0;
    itemTotal numeric;
    deliveryPrice numeric;
BEGIN
    SELECT "order"."itemTotal"(cart.*) into itemTotal;
    SELECT "order"."deliveryPrice"(cart.*) into deliveryPrice;
    SELECT "order".discount(cart.*) into discount;
    amount := itemTotal + deliveryPrice + cart.tip - discount;
    RETURN amount;
END
$$;
CREATE FUNCTION "order"."subTotal2"(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    amount numeric := 0;
    discount numeric := 0;
    itemTotal numeric := 0;
    deliveryPrice numeric := 0;
    experiencePrice numeric := 0;
BEGIN
    SELECT "order"."itemTotal2"(cart.*, params) into itemTotal;
    SELECT "order"."totalExperiencePrice2"(cart.*, params) into experiencePrice;
    SELECT "order"."deliveryPrice2"(cart.*, params) into deliveryPrice;
    SELECT "order"."discount2"(cart.*,params) into discount;
    amount := itemTotal + experiencePrice + deliveryPrice + cart.tip - discount;
    RETURN amount;
END
$$;
CREATE FUNCTION "order".tax(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   taxAmount numeric := 0;
   amount numeric := 0;
   tax numeric;
   isTaxIncluded boolean;
BEGIN
    SELECT "order"."isTaxIncluded"(cart.*) INTO isTaxIncluded;
    SELECT "order"."subTotal"(cart.*) into amount;
    SELECT "order"."taxPercent"(cart.*) into tax;
    IF isTaxIncluded = true THEN
        RETURN ROUND((tax * amount)/(100 + tax), 2);
    END IF;
    RETURN COALESCE(ROUND(amount * (tax / 100), 2),0);
END;
$$;
CREATE FUNCTION "order".tax2(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   taxAmount numeric := 0;
   amount numeric := 0;
   tax numeric :=0;
   isTaxIncluded boolean;
BEGIN
    SELECT "order"."isTaxIncluded"(cart.*) INTO isTaxIncluded;
    SELECT "order"."subTotal2"(cart.*, params) into amount;
    SELECT "order"."taxPercent"(cart.*) into tax;
    IF isTaxIncluded = true THEN
        RETURN ROUND((tax * amount)/(100 + tax), 2);
    END IF;
    RETURN ROUND(amount * (tax / 100), 2);
END;
$$;
CREATE FUNCTION "order"."taxPercent"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    taxPercent numeric := 0;
    percentage jsonb;
    subscriptionId int;
    itemCountId int;
BEGIN
    IF cart."subscriptionOccurenceId" IS NOT NULL THEN
        SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = cart."subscriptionOccurenceId";
        SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
        SELECT "tax" INTO taxPercent FROM subscription."subscriptionItemCount" WHERE id = itemCountId;
        RETURN taxPercent;
    ELSEIF cart."subscriptionOccurenceId" IS NULL THEN
        SELECT value FROM brands."brand_storeSetting" WHERE "brandId" = cart."brandId" AND "storeSettingId" = (SELECT id FROM brands."storeSetting" WHERE identifier = 'Tax Percentage') INTO percentage;
        RETURN COALESCE((percentage->>'value')::numeric, 0);
    ELSE
        RETURN 0;
    END IF;
END;
$$;
CREATE FUNCTION "order"."toPayByParent"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   toPayByParent numeric := 0;
   tax numeric := 0;
   rate numeric;
   loyaltyPointsAmount numeric := 0;
   subTotal numeric := 0;
   isTaxIncluded boolean;
   params jsonb;
   rec record;
BEGIN
    -- FOR rec IN SELECT * FROM "order"."cart" WHERE "parentCartId" = cart.id LOOP
        -- params := JSONB_BUILD_OBJECT('args',('params',('shareFor',"parent")));
        -- SELECT "order"."subTotal2"(cart.*, params) INTO subTotal;
    -- END LOOP;
        toPayByParent := 12;
    RETURN toPayByParent;
END
$$;
CREATE FUNCTION "order"."toPayByParent2"(cartdata "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
  toPayByParent numeric := 0;
  childCartTotalPrice numeric := 0;
  subTotal numeric := 0;
  params jsonb;
  cartRecord "order"."cart";
BEGIN
    params := JSONB_BUILD_OBJECT('shareFor','parent');
    SELECT "order"."subTotal2"(cartData, params) into subTotal;
    toPayByParent := toPayByParent + subTotal;
    FOR cartRecord IN SELECT * FROM "order"."cart" WHERE "parentCartId" = cartData.id LOOP
        SELECT "order"."totalPrice2"(cartRecord, params) INTO childCartTotalPrice;
        toPayByParent := toPayByParent + childCartTotalPrice ;
    END LOOP;
    RETURN toPayByParent;
END
$$;
CREATE FUNCTION "order"."totalExperiencePrice"(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    amount numeric := 0;
    experiencePriceRecord jsonb;
    paramsForExperiencePriceFunc jsonb;
    rec record;
BEGIN
    FOR rec IN SELECT * FROM "order"."cartItem" WHERE "cartId" = cart.id AND "experienceClassId" = cart."experienceClassId" AND "productId" IS NULL LOOP
        paramsForExperiencePriceFunc := JSONB_BUILD_OBJECT('cartId',rec."cartId",'experienceClassId',rec."experienceClassId", 'experienceClassTypeId',rec."experienceClassTypeId",'parentShare',rec."parentShare", 'shareFor',(params->>'shareFor')::text);
        SELECT "order"."experiencePriceFunc"(paramsForExperiencePriceFunc) INTO experiencePriceRecord;
        amount := amount + (experiencePriceRecord->>'averagePrice')::numeric;
    END LOOP;
    RETURN amount;
END
$$;
CREATE FUNCTION "order"."totalExperiencePrice2"(cartdata "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    amount numeric := 0;
    experiencePriceRecord jsonb;
    paramsForExperiencePriceFunc jsonb;
    rec record;
    cartItemRecord record;
BEGIN
    IF (params->>'shareFor')::text = 'parent' THEN 
        FOR rec IN SELECT * FROM "order"."cart" WHERE "parentCartId" = cartData."id" LOOP
            FOR cartItemRecord IN SELECT * FROM "order"."cartItem" WHERE "cartId" = rec.id AND "experienceClassId" = rec."experienceClassId" AND "productId" IS NULL LOOP
                paramsForExperiencePriceFunc := JSONB_BUILD_OBJECT('cartId',cartItemRecord."cartId",'experienceClassId',cartItemRecord."experienceClassId", 'experienceClassTypeId',cartItemRecord."experienceClassTypeId",'parentShare',cartItemRecord."parentShare", 'shareFor',(params->>'shareFor')::text);
                SELECT "order"."experiencePriceFunc"(paramsForExperiencePriceFunc) INTO experiencePriceRecord;
                amount := amount + (experiencePriceRecord->>'averagePrice')::numeric;
            END LOOP;
        END LOOP;
    ELSE
        FOR rec IN SELECT * FROM "order"."cartItem" WHERE "cartId" = cartData.id AND "experienceClassId" = cartData."experienceClassId" AND "productId" IS NULL LOOP
            paramsForExperiencePriceFunc := JSONB_BUILD_OBJECT('cartId',rec."cartId",'experienceClassId',rec."experienceClassId", 'experienceClassTypeId',rec."experienceClassTypeId",'parentShare',rec."parentShare", 'shareFor',(params->>'shareFor')::text);
            SELECT "order"."experiencePriceFunc"(paramsForExperiencePriceFunc) INTO experiencePriceRecord;
            amount := amount + (experiencePriceRecord->>'averagePrice')::numeric;
        END LOOP;
    END IF;
    RETURN amount;
END
$$;
CREATE FUNCTION "order"."totalKit"(cartdata "order".cart) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    totalKitCount integer;
BEGIN
    totalKitCount := (SELECT coalesce((SELECT COUNT(*) FROM "order"."cartItem" WHERE "cartId" = cartdata."id" AND "experienceClassId" IS NULL AND "level" = 1),0)); 
    totalKitCount := totalKitCount + (SELECT coalesce((SELECT COUNT(*) FROM "order"."cartItem" WHERE "parentCartId" = cartdata."id" AND "experienceClassId" IS NULL AND "level" = 1),0)); 
    RETURN totalKitCount;
END;
$$;
CREATE FUNCTION "order"."totalKitPrice"(cartdata "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    hostCartId int ;
    amount numeric := 0;
    isCartWithProduct boolean := false;
    rec  "order"."cart";
BEGIN
    amount := (SELECT coalesce((SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "cartId" = cartdata."id" AND "experienceClassId" IS NULL AND "level" = 1),0)); 
    amount := amount + (SELECT coalesce((SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "parentCartId" = cartdata."id" AND "experienceClassId" IS NULL AND "level" = 1),0)); 
    RETURN amount;
END
$$;
CREATE FUNCTION "order"."totalParticipants"(cartdata "order".cart) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    totalCount integer;
BEGIN
    SELECT COUNT(*) INTO totalCount FROM "order"."cart" WHERE "parentCartId" = cartdata.id AND "experienceClassId" = cartdata."experienceClassId";
    RETURN totalCount;
END;
$$;
CREATE FUNCTION "order"."totalParticipantsFunc"(params jsonb) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    totalCount integer;
BEGIN
    SELECT COUNT(*) INTO totalCount FROM "order"."cart" WHERE "parentCartId" = (params->>'cartId')::int AND "experienceClassId" = (params->>'experienceClassId')::int ;
    RETURN totalCount;
END;
$$;
CREATE FUNCTION "order"."totalPrice"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   totalPrice numeric;
   tax numeric;
   rate numeric;
   loyaltyPointsAmount numeric := 0;
   subTotal numeric;
   isTaxIncluded boolean;
BEGIN
    SELECT "order"."subTotal"(cart.*) INTO subTotal;
    SELECT "order".tax(cart.*) into tax;
    SELECT "order"."isTaxIncluded"(cart.*) INTO isTaxIncluded;
    IF cart."loyaltyPointsUsed" > 0 THEN
        SELECT crm."getLoyaltyPointsConversionRate"(cart."brandId") INTO rate;
        loyaltyPointsAmount := ROUND(rate * cart."loyaltyPointsUsed", 2);
    END IF;
    IF isTaxIncluded = true THEN
        totalPrice := ROUND(subTotal - COALESCE(cart."walletAmountUsed", 0) - loyaltyPointsAmount, 2);
    ELSE
        totalPrice := ROUND(subTotal - COALESCE(cart."walletAmountUsed", 0) - loyaltyPointsAmount  + tax, 2);
    END IF;
    RETURN totalPrice;
END
$$;
CREATE FUNCTION "order"."totalPrice2"(cart "order".cart, params jsonb) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   totalPrice numeric :=0;
   toPayByParent numeric :=0;
   tax numeric := 0;
   rate numeric;
   loyaltyPointsAmount numeric := 0;
   subTotal numeric :=0;
   isTaxIncluded boolean;
BEGIN
    SELECT "order"."subTotal2"(cart,params) INTO subTotal;
    -- SELECT "order"."toPayByParent2"(cart) INTO toPayByParent;
    SELECT "order"."tax2"(cart, params) into tax;
    IF tax IS NULL THEN
        tax := 0;
    END IF;
    SELECT "order"."isTaxIncluded"(cart.*) INTO isTaxIncluded;
    IF cart."loyaltyPointsUsed" > 0 THEN
        SELECT cart."getLoyaltyPointsConversionRate"(cart."brandId") INTO rate;
        loyaltyPointsAmount := ROUND(rate * cart."loyaltyPointsUsed", 2);
    END IF;
    IF isTaxIncluded = true THEN
        totalPrice := ROUND(subTotal + toPayByParent - COALESCE(cart."walletAmountUsed", 0) - loyaltyPointsAmount, 2);
    ELSE
        totalPrice := ROUND(subTotal + toPayByParent - COALESCE(cart."walletAmountUsed", 0) - loyaltyPointsAmount  + tax, 2);
    END IF;
    RETURN totalPrice;
END
$$;
CREATE FUNCTION "order"."updateExperienceClassBookingStatus"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
 rec record;
 experienceBookingId int;
BEGIN
  IF NEW."paymentStatus" = 'SUCCEEDED' THEN
    SELECT * INTO rec FROM "order"."cart" WHERE "id" = NEW."cartId";
    SELECT "id" INTO experienceBookingId FROM "experiences"."experienceBooking" 
    WHERE "experienceClassId" = rec."experienceClassId" AND "hostKeycloakId" = rec."customerKeycloakId";
    IF experienceBookingId IS NOT NULL THEN 
    -- updating the experience with experienceBookingId to make it completly booked for others
        UPDATE "experiences"."experienceClass" SET "experienceBookingId" = experienceBookingId, "isBooked" = true 
        WHERE "id" = rec."experienceClassId";
    END IF;
  ELSE
    RETURN NEW;
  END IF;
  RETURN New;
END;
$$;
CREATE FUNCTION "order"."updateStatementDescriptor"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
setting jsonb;
statementDescriptor text := 'food order';
BEGIN
    IF NEW.source = 'a-la-carte' then
        SELECT "value" from "brands"."brand_storeSetting" where "brandId" = NEW."brandId" and "storeSettingId" = (select id from "brands"."storeSetting" where "identifier" = 'Statement Descriptor') into setting;
    ELSIF NEW.source = 'subscription' then
        SELECT "value" from "brands"."brand_subscriptionStoreSetting" where "brandId" = NEW."brandId" and "subscriptionStoreSettingId" = (select id from "brands"."subscriptionStoreSetting" where "identifier" = 'Statement Descriptor') into setting;
    END IF;
    UPDATE "order"."cart" SET "statementDescriptor" = setting->>'value' where id = NEW.id;
    RETURN NULL;
END;
$$;
CREATE FUNCTION "order"."validateFulfillmentInfo"(f jsonb, brandidparam integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res jsonb;
    recurrence record;
    timeslot record;
    slotFrom time;
    slotUpto time;
    slotDate timestamp;
    isValid boolean;
    err text := '';
BEGIN
    IF (f->'slot'->>'from')::timestamp > NOW()::timestamp THEN
        IF f->>'type' = 'ONDEMAND_DELIVERY' THEN
            -- FOR recurrence IN SELECT * FROM fulfilment.recurrence WHERE "type" = 'ONDEMAND_DELIVERY' LOOP
            --     IF recurrence.psql_rrule::_rrule.rruleset @> NOW()::TIMESTAMP WITHOUT TIME ZONE THEN
            --         FOR timeslot IN SELECT * FROM fulfilment."timeSlot" WHERE "recurrenceId" = recurrence.id LOOP
            --             IF timeslot."from" < CURRENT_TIME AND timeslot."to" > CURRENT_TIME THEN
            --                 res := json_build_object('status', true, 'error', 'Valid date and time!');
            --             ELSE
            --                 res := json_build_object('status', false, 'error', 'Invalid time!');
            --             END IF;
            --         END LOOP;
            --     ELSE
            --         res := json_build_object('status', false, 'error', 'Invalid date!');    
            --     END IF;
            -- END LOOP;
            SELECT * FROM fulfilment."timeSlot" WHERE id = (SELECT "timeSlotId" FROM fulfilment."mileRange" WHERE id = (f->'slot'->>'mileRangeId')::int AND "isActive" = true) AND "isActive" = true INTO timeslot;
            IF timeslot."from" < CURRENT_TIME AND timeslot."to" > CURRENT_TIME THEN
                SELECT * FROM fulfilment.recurrence WHERE id = timeslot."recurrenceId" AND "isActive" = true INTO recurrence;
                IF recurrence IS NOT NULL AND recurrence.psql_rrule::_rrule.rruleset @> NOW()::TIMESTAMP WITHOUT TIME ZONE THEN
                    res := json_build_object('status', true, 'error', 'Valid date and time!');
                ELSE
                    res := json_build_object('status', false, 'error', 'Invalid date!');
                END IF;
            ELSE
                res := json_build_object('status', false, 'error', 'Invalid time!');
            END IF;      
        ELSIF f->>'type' = 'PREORDER_DELIVERY' THEN
            slotFrom := substring(f->'slot'->>'from', 12, 8)::time;
            slotUpto := substring(f->'slot'->>'to', 12, 8)::time;
            slotDate := substring(f->'slot'->>'from', 0, 11)::timestamp;
                SELECT * FROM fulfilment."timeSlot" WHERE id = (SELECT "timeSlotId" FROM fulfilment."mileRange" WHERE id = (f->'slot'->>'mileRangeId')::int AND "isActive" = true) AND "isActive" = true INTO timeslot;
                IF timeslot."from" < slotFrom AND timeslot."to" > slotFrom THEN -- lead time is already included in the slot (front-end)
                    SELECT * FROM fulfilment.recurrence WHERE id = timeslot."recurrenceId" AND "isActive" = true INTO recurrence;
                    IF recurrence IS NOT NULL AND recurrence.psql_rrule::_rrule.rruleset @> slotDate THEN
                        res := json_build_object('status', true, 'error', 'Valid date and time!');
                    ELSE
                        res := json_build_object('status', false, 'error', 'Invalid date!');
                    END IF;
                ELSE
                    res := json_build_object('status', false, 'error', 'Invalid time!');
                END IF;
        ELSIF f->>'type' = 'ONDEMAND_PICKUP' THEN
            slotFrom := substring(f->'slot'->>'from', 12, 8)::time;
            slotUpto := substring(f->'slot'->>'to', 12, 8)::time;
            slotDate := substring(f->'slot'->>'from', 0, 11)::timestamp;
            isValid := false;
            FOR recurrence IN SELECT * FROM fulfilment.recurrence WHERE "type" = 'ONDEMAND_PICKUP' AND "isActive" = true AND id IN (SELECT "recurrenceId" FROM fulfilment.brand_recurrence WHERE "brandId" = brandIdParam) LOOP
                IF recurrence.psql_rrule::_rrule.rruleset @> NOW()::TIMESTAMP WITHOUT TIME ZONE THEN
                    FOR timeslot IN SELECT * FROM fulfilment."timeSlot" WHERE "recurrenceId" = recurrence.id AND "isActive" = true LOOP
                        IF timeslot."from" < slotFrom AND timeslot."to" > slotFrom THEN 
                            isValid := true;
                            EXIT;
                        END IF;
                    END LOOP;
                    IF isValid = false THEN
                        err := 'No time slot available!';
                    END IF;
                END IF; 
            END LOOP;
            res := json_build_object('status', isValid, 'error', err);
        ELSE
            slotFrom := substring(f->'slot'->>'from', 12, 8)::time;
            slotUpto := substring(f->'slot'->>'to', 12, 8)::time;
            slotDate := substring(f->'slot'->>'from', 0, 11)::timestamp;
            isValid := false;
            FOR recurrence IN SELECT * FROM fulfilment.recurrence WHERE "type" = 'PREORDER_PICKUP' AND "isActive" = true AND id IN (SELECT "recurrenceId" FROM fulfilment.brand_recurrence WHERE "brandId" = brandIdParam) LOOP
                IF recurrence.psql_rrule::_rrule.rruleset @> slotDate THEN
                    FOR timeslot IN SELECT * FROM fulfilment."timeSlot" WHERE "recurrenceId" = recurrence.id AND "isActive" = true LOOP
                        IF timeslot."from" < slotFrom AND timeslot."to" > slotFrom THEN 
                            isValid := true;
                            EXIT;
                        END IF;
                    END LOOP;
                    IF isValid = false THEN
                        err := 'No time slot available!';
                    END IF;
                END IF; 
            END LOOP;
            res := json_build_object('status', isValid, 'error', err);
        END IF;
    ELSE
        res := jsonb_build_object('status', false, 'error', 'Slot expired!');
    END IF;
    res := res || jsonb_build_object('type', 'fulfillment');
    RETURN res;
END
$$;
CREATE FUNCTION "order"."walletAmountUsable"(cart "order".cart) RETURNS numeric
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   setting record;
   temp record;
   itemTotal numeric;
   deliveryPrice numeric;
   tax numeric;
   discount numeric;
   totalPrice numeric;
   rate numeric;
   pointsAmount numeric := 0;
   amountUsable numeric := 0;
   balance numeric;
BEGIN
    SELECT * FROM brands."storeSetting" WHERE "identifier" = 'Loyalty Points Usage' AND "type" = 'rewards' INTO setting;
    SELECT * FROM brands."brand_storeSetting" WHERE "storeSettingId" = setting.id AND "brandId" = cart."brandId" INTO temp;
    IF temp IS NOT NULL THEN
        setting := temp;
    END IF;
    SELECT "order"."totalPrice"(cart.*) into totalPrice;
    amountUsable := totalPrice;
    -- if loyalty points are used
    IF cart."loyaltyPointsUsed" > 0 THEN
        SELECT crm."getLoyaltyPointsConversionRate"(cart."brandId") INTO rate;
        pointsAmount := rate * cart."loyaltyPointsUsed";
        amountUsable := amountUsable - pointsAmount;
    END IF;
    SELECT amount FROM crm."wallet" WHERE "keycloakId" = cart."customerKeycloakId" AND "brandId" = cart."brandId" INTO balance;
    IF amountUsable > balance THEN
        amountUsable := balance;
    END IF;
    -- if usable changes after cart update, then update used amount
    IF cart."walletAmountUsed" > amountUsable THEN
        PERFORM crm."setWalletAmountUsedInCart"(cart.id, amountUsable);
    END IF;
    RETURN amountUsable;
END;
$$;
CREATE FUNCTION packaging.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION "paymentHub".set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE platform.customer (
    "firstName" text,
    "lastName" text,
    email text,
    "phoneNumber" text,
    "keycloakId" text DEFAULT public.gen_random_uuid() NOT NULL,
    "paymentCustomerId" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    password text,
    avatar text,
    "defaultPaymentMethodId" text,
    "defaultCustomerAddressId" uuid,
    birthday date,
    anniversary date
);
COMMENT ON TABLE platform.customer IS 'This lists records of all the customers.';
CREATE FUNCTION platform.full_name(customer platform.customer) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN TRIM(UPPER(CONCAT(customer."firstName", ' ', customer."lastName")));
END
$$;
CREATE FUNCTION platform.gen_otp() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    otp integer;
BEGIN
    SELECT num FROM GENERATE_SERIES (100000, 999999) AS s(num) order by random() LIMIT 1 INTO otp;
    RETURN otp;
END;
$$;
CREATE TABLE platform.otp_transaction (
    "phoneNumber" text NOT NULL,
    code numeric DEFAULT platform.gen_otp() NOT NULL,
    "resendAttempts" integer DEFAULT 0 NOT NULL,
    "validTill" integer DEFAULT 300 NOT NULL,
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE platform.otp_transaction IS 'This contains the OTP transaction taking place.';
CREATE FUNCTION platform."isOtpResendAllowed"(r platform.otp_transaction) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    diff int;
BEGIN
    SELECT EXTRACT(EPOCH FROM (now() - r.updated_at)) INTO diff;
    IF diff > 120 AND diff < r."validTill" AND r."resendAttempts" < 3 THEN
        return true;
    ELSE
        return false;
    END IF;
END;
$$;
CREATE FUNCTION platform."isOtpValid"(r platform.otp_transaction) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    diff int;
BEGIN
    SELECT EXTRACT(EPOCH FROM (now() - r.updated_at)) INTO diff;
    IF r."validTill" > diff THEN
        return true;
    ELSE
        return false;
    END IF;
END;
$$;
CREATE FUNCTION platform.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE products."customizableProductComponent" (
    id integer DEFAULT public.defaultid('products'::text, 'customizableProductComponent'::text, 'id'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    "position" numeric,
    "productId" integer,
    "linkedProductId" integer
);
CREATE VIEW products."customizableComponentOptions" AS
 SELECT t.id AS "customizableComponentId",
    t."linkedProductId",
    ((option.value ->> 'optionId'::text))::integer AS "productOptionId",
    ((option.value ->> 'price'::text))::numeric AS price,
    ((option.value ->> 'discount'::text))::numeric AS discount,
    t."productId"
   FROM products."customizableProductComponent" t,
    LATERAL jsonb_array_elements(t.options) option(value);
CREATE FUNCTION products."comboProductComponentCustomizableCartItem"(componentoption products."customizableComponentOptions") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counter int;
    items jsonb[] := '{}';
    product record;
    option record;
BEGIN
    SELECT * FROM products.product WHERE id = componentOption."productId" INTO product;
    SELECT * FROM products."productOption" WHERE id = componentOption."productOptionId" INTO option;
    counter := option.quantity;
    IF option."simpleRecipeYieldId" IS NOT NULL THEN 
        WHILE counter >= 1 LOOP
            items := items || json_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId")::jsonb;
            counter := counter - 1;
        END LOOP;
    ELSEIF option."inventoryProductBundleId" IS NOT NULL THEN
        WHILE counter >= 1 LOOP
            items := items || json_build_object('inventoryProductBundleId', option."inventoryProductBundleId")::jsonb;
            counter := counter - 1;
        END LOOP;
    END IF;
    RETURN jsonb_build_object(
        'customizableProductComponentId', componentOption."customizableComponentId",
        'productOptionId', componentOption."productOptionId",
        'unitPrice', componentOption.price,
        'discount', (componentOption.price * (componentOption.discount / 100)),
        'childs', json_build_object(
            'data', items
        )
    );
END;
$$;
CREATE TABLE products."comboProductComponent" (
    id integer DEFAULT public.defaultid('products'::text, 'comboProductComponent'::text, 'id'::text) NOT NULL,
    label text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL,
    options jsonb DEFAULT '[]'::jsonb NOT NULL,
    "position" numeric,
    "productId" integer,
    "linkedProductId" integer
);
CREATE FUNCTION products."comboProductComponentFullName"(component products."comboProductComponent") RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    productName text;
    childProductName text;
BEGIN
    SELECT name FROM products.product WHERE id = component."productId" INTO productName;
    SELECT name FROM products.product WHERE id = component."linkedProductId" INTO childProductName;
    RETURN productName || ' - ' || childProductName || '(' || component.label || ')';
END;
$$;
CREATE VIEW products."comboComponentOptions" AS
 SELECT t.id AS "comboComponentId",
    t."linkedProductId",
    ((option.value ->> 'optionId'::text))::integer AS "productOptionId",
    ((option.value ->> 'price'::text))::numeric AS price,
    ((option.value ->> 'discount'::text))::numeric AS discount,
    t."productId"
   FROM products."comboProductComponent" t,
    LATERAL jsonb_array_elements(t.options) option(value);
COMMENT ON VIEW products."comboComponentOptions" IS 'This show the all the combo component items for a particular combo.';
CREATE FUNCTION products."comboProductComponentOptionCartItem"(componentoption products."comboComponentOptions") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counter int;
    items jsonb[] := '{}';
    product record;
    option record;
BEGIN
    SELECT * FROM products.product WHERE id = componentOption."productId" INTO product;
    SELECT * FROM products."productOption" WHERE id = componentOption."productOptionId" INTO option;
    counter := option.quantity;
    IF option."simpleRecipeYieldId" IS NOT NULL THEN 
        WHILE counter >= 1 LOOP
            items := items || json_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId")::jsonb;
            counter := counter - 1;
        END LOOP;
    ELSEIF option."inventoryProductBundleId" IS NOT NULL THEN
        WHILE counter >= 1 LOOP
            items := items || json_build_object('inventoryProductBundleId', option."inventoryProductBundleId")::jsonb;
            counter := counter - 1;
        END LOOP;
    END IF;
    RETURN jsonb_build_object(
        'comboProductComponentId', componentOption."comboComponentId",
        'productOptionId', componentOption."productOptionId",
        'unitPrice', componentOption.price,
        'discount', (componentOption.price * (componentOption.discount / 100)),
        'childs', json_build_object(
            'data', items
        )
    );
END;
$$;
CREATE FUNCTION products."customizableProductComponentFullName"(component products."customizableProductComponent") RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    productName text;
    childProductName text;
BEGIN
    SELECT name FROM products.product WHERE id = component."productId" INTO productName;
    SELECT name FROM products.product WHERE id = component."linkedProductId" INTO childProductName;
    RETURN productName || ' - ' || childProductName;
END;
$$;
CREATE FUNCTION products."customizableProductComponentOptionCartItem"(componentoption products."customizableComponentOptions") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counter int;
    items jsonb[] := '{}';
    product record;
    option record;
BEGIN
    SELECT * FROM products.product WHERE id = componentOption."productId" INTO product;
    SELECT * FROM products."productOption" WHERE id = componentOption."productOptionId" INTO option;
    counter := option.quantity;
    IF option."simpleRecipeYieldId" IS NOT NULL THEN 
        WHILE counter >= 1 LOOP
            items := items || json_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId")::jsonb;
            counter := counter - 1;
        END LOOP;
    ELSEIF option."inventoryProductBundleId" IS NOT NULL THEN
        WHILE counter >= 1 LOOP
            items := items || json_build_object('inventoryProductBundleId', option."inventoryProductBundleId")::jsonb;
            counter := counter - 1;
        END LOOP;
    END IF;
    RETURN jsonb_build_object(
            'productId', product.id,
            'unitPrice', product.price,
            'discount', (product.price * (product.discount / 100)),
            'childs', jsonb_build_object(
                'data', json_build_array(
                    json_build_object (
                        'customizableProductComponentId', componentOption."customizableComponentId",
                        'productOptionId', componentOption."productOptionId",
                        'unitPrice', componentOption.price,
                        'discount', (componentOption.price * (componentOption.discount / 100)),
                        'childs', json_build_object(
                            'data', items
                        )
                    )
                )
            )
        );
END;
$$;
CREATE TABLE products.product (
    id integer DEFAULT public.defaultid('products'::text, 'product'::text, 'id'::text) NOT NULL,
    name text,
    "additionalText" text,
    description text,
    assets jsonb DEFAULT jsonb_build_object('images', '[]'::jsonb, 'videos', '[]'::jsonb) NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    "isPopupAllowed" boolean DEFAULT true NOT NULL,
    "defaultProductOptionId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    tags jsonb,
    "isArchived" boolean DEFAULT false NOT NULL,
    type text DEFAULT 'simple'::text NOT NULL,
    price numeric DEFAULT 0 NOT NULL,
    discount numeric DEFAULT 0 NOT NULL,
    "importHistoryId" integer,
    "addedBy" integer,
    "updatedBy" integer,
    "addedByApiKey" text,
    "updatedByApiKey" text,
    "VegNonVegType" text,
    "productionOptionSelectionStatement" text DEFAULT 'Choose your Options'::text,
    "nutritionId" integer
);
COMMENT ON TABLE products.product IS 'This lists records of all the products across all the brands.';
CREATE FUNCTION products."defaultCartItem"(product products.product) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    cartItem jsonb = jsonb_build_object('productId', product.id);
    yield record;
    counter int := 0;
BEGIN   
    IF product."defaultProductOptionId" IS NOT NULL THEN
        SELECT products."productOptionCartItem"("productOption".*) FROM products."productOption" WHERE id = product."defaultProductOptionId" INTO cartItem;
    ELSE
        SELECT products."productOptionCartItem"("productOption".*) FROM products."productOption" WHERE "productId" = product.id AND "isArchived" = false ORDER BY position DESC NULLS LAST, price ASC LIMIT 1 INTO cartItem;
    END IF;
    RETURN cartItem;
END
$$;
CREATE FUNCTION products."getProductType"(pid integer) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    productOption record;
    comboComponentsCount int;
    customizableOptionsCount int;
BEGIN
    SELECT * FROM products."productOption" WHERE id = pId INTO productOption LIMIT 1;
    SELECT COUNT(*) FROM products."customizableProductOption" WHERE "productId" = pId INTO customizableOptionsCount;
    SELECT COUNT(*) FROM products."comboProductComponent" WHERE "productId" = pId INTO comboComponentsCount;
    IF productOption."sachetItemId" IS NOT NULL OR productOption."supplierItemId" IS NOT NULL THEN
        RETURN 'inventoryProduct';
    ELSIF productOption."simpleRecipeYieldId" IS NOT NULL THEN
        RETURN 'simpleRecipeProduct';
    ELSEIF customizableOptionsCount > 0 THEN
        RETURN 'customizableProduct';
    ELSEIF comboComponentsCount > 0 THEN
        RETURN 'comboProduct';
    ELSE
        RETURN 'none';
    END IF;
END;
$$;
CREATE FUNCTION products."inventoryBundleSachetTriggerFunction"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  sachetItem record;
  supplierItem record;
  bulkItem record;
  sachetItemIdToStore int;
BEGIN
    IF NEW."supplierItemId" IS NOT NULL THEN
        SELECT * FROM inventory."supplierItem" WHERE id = NEW."supplierItemId" INTO supplierItem;
        SELECT * FROM inventory."sachetItem" WHERE "unitSize" = supplierItem."unitSize" AND unit = supplierItem.unit AND "bulkItemId" = supplierItem."bulkItemAsShippedId" INTO sachetItem;  
        IF sachetItem IS NULL THEN
            INSERT INTO inventory."sachetItem"("unitSize", "unit", "bulkItemId")
            VALUES(supplierItem."unitSize", supplierItem."unit", supplierItem."bulkItemAsShippedId") RETURNING id INTO sachetItemIdToStore;
        ELSE
            sachetItemIdToStore := sachetItem.id;
        END IF;
        UPDATE products."inventoryProductBundleSachet"
        SET "sachetItemId" = sachetItemIdToStore
        WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    IF NEW."bulkItemId" IS NOT NULL AND NEW."bulkItemQuantity" IS NOT NULL THEN
        SELECT * FROM inventory."bulkItem" WHERE id = NEW."bulkItemId" INTO bulkItem;
        SELECT * FROM inventory."sachetItem" WHERE "unitSize" = NEW."bulkItemQuantity" AND unit = bulkItem.unit AND "bulkItemId" = bulkItem.id INTO sachetItem;  
        IF sachetItem IS NULL THEN
            INSERT INTO inventory."sachetItem"("unitSize", "unit", "bulkItemId")
            VALUES(NEW."bulkItemQuantity", bulkItem."unit", bulkItem.id) RETURNING id INTO sachetItemIdToStore;
        ELSE
            sachetItemIdToStore := sachetItem.id;
        END IF;
        UPDATE products."inventoryProductBundleSachet"
        SET "sachetItemId" = sachetItemIdToStore
        WHERE id = NEW.id;
        RETURN NULL;
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION products."isProductValid"(product products.product) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    component record;
    isValid boolean := true;
    message text := '';
    counter int := 0;
BEGIN   
    RETURN jsonb_build_object('status', isValid, 'error', message);
END
$$;
CREATE FUNCTION products."productCartItemById"(optionid integer) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counter int;
    items jsonb[] := '{}';
    option products."productOption";
    product products."product";
BEGIN
    SELECT * INTO option FROM products."productOption" WHERE id = optionId;
    SELECT * FROM products.product WHERE id = option."productId" INTO product;
    counter := option.quantity;
    IF option."simpleRecipeYieldId" IS NOT NULL THEN 
        WHILE counter >= 1 LOOP
            items := items || json_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId")::jsonb;
            counter := counter - 1;
        END LOOP;
    ELSEIF option."inventoryProductBundleId" IS NOT NULL THEN
        WHILE counter >= 1 LOOP
            items := items || json_build_object('inventoryProductBundleId', option."inventoryProductBundleId")::jsonb;
            counter := counter - 1;
        END LOOP;
    END IF;
    RETURN json_build_object(
        'productId', product.id,
        'childs', jsonb_build_object(
            'data', json_build_array(
                json_build_object (
                    'productOptionId', option.id,
                    'unitPrice', 0,
                    'childs', json_build_object(
                        'data', items
                    )
                )
            )
        )
    );
END
$$;
CREATE TABLE products."productOption" (
    id integer DEFAULT public.defaultid('products'::text, 'productOption'::text, 'id'::text) NOT NULL,
    "productId" integer NOT NULL,
    label text DEFAULT 'Basic'::text NOT NULL,
    "modifierId" integer,
    "operationConfigId" integer,
    "simpleRecipeYieldId" integer,
    "supplierItemId" integer,
    "sachetItemId" integer,
    "position" numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    price numeric DEFAULT 0 NOT NULL,
    discount numeric DEFAULT 0 NOT NULL,
    quantity integer DEFAULT 1 NOT NULL,
    type text,
    "isArchived" boolean DEFAULT false NOT NULL,
    "inventoryProductBundleId" integer,
    "nutritionId" integer,
    "nutritionalInfoSameAs" boolean
);
COMMENT ON TABLE products."productOption" IS 'This shows the product size.';
COMMENT ON COLUMN products."productOption"."nutritionalInfoSameAs" IS 'possible values product, recipe or inventoryBundle';
CREATE FUNCTION products."productOptionCartItem"(option products."productOption") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    counter int;
    items jsonb[] := '{}';
    product products."product";
BEGIN
    SELECT * FROM products.product WHERE id = option."productId" INTO product;
    counter := option.quantity;
    IF option."simpleRecipeYieldId" IS NOT NULL THEN 
        WHILE counter >= 1 LOOP
            items := items || json_build_object('simpleRecipeYieldId', option."simpleRecipeYieldId")::jsonb;
            counter := counter - 1;
        END LOOP;
    ELSEIF option."inventoryProductBundleId" IS NOT NULL THEN
        WHILE counter >= 1 LOOP
            items := items || json_build_object('inventoryProductBundleId', option."inventoryProductBundleId")::jsonb;
            counter := counter - 1;
        END LOOP;
    END IF;
    RETURN json_build_object(
        'productId', product.id,
        'unitPrice', product.price,
        'discount', (product.price * (product.discount / 100)),
        'childs', jsonb_build_object(
            'data', json_build_array(
                json_build_object (
                    'productOptionId', option.id,
                    'discount', (option.price * (option.discount / 100)),
                    'unitPrice', option.price,
                    'childs', json_build_object(
                        'data', items
                    )
                )
            )
        )
    );
END;
$$;
CREATE FUNCTION products."productOptionFullName"(option products."productOption") RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    productName text;
BEGIN
    SELECT name FROM products.product WHERE id = option."productId" INTO productName;
    RETURN option.label || ' - ' || productName;
END;
$$;
CREATE FUNCTION products."productOrderCount"(productdata products.product) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
result int :=0;
BEGIN
  SELECT products."productOrderCountFunc"(JSONB_BUILD_OBJECT('id',productdata."id"::int)) INTO result;
   RETURN result;
END;
$$;
CREATE FUNCTION products."productOrderCountFunc"(params jsonb) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    rec record;
    count int := 0;
BEGIN
    -- FOR rec in SELECT * from "order"."cartItem" WHERE "productId" = (params->>'id')::int LOOP
    --     IF (SELECT EXISTS (SELECT 1 FROM "order"."cart" WHERE "id" = rec."cartId" AND "paymentStatus" = 'SUCCEEDED')) THEN
    --         count := count+1;
    --     END IF;
    -- END LOOP; 
     return COUNT(id) from "order"."cartItem" where "productId" = (params->>'id')::int and "level" = 1 and "cartId" in (select id from "order"."cart" where "paymentStatus"='SUCCEEDED'); 
    --  RETURN count;
END;
$$;
CREATE FUNCTION products.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION products."unpublishProduct"(producttype text, productid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    query text;
BEGIN
    query := 'UPDATE products.' || '"' || productType || '"' || ' SET "isPublished" = false WHERE id = ' || productId;
    EXECUTE query;
END
$$;
CREATE FUNCTION public.array_distinct(anyarray, boolean DEFAULT false) RETURNS anyarray
    LANGUAGE sql IMMUTABLE
    AS $_$
      SELECT array_agg(DISTINCT x) 
      FROM unnest($1) t(x) 
      WHERE CASE WHEN $2 THEN x IS NOT NULL ELSE true END;
$_$;
CREATE FUNCTION public.call(text) RETURNS jsonb
    LANGUAGE plpgsql
    AS $_$ 
DECLARE
    res jsonb;
BEGIN 
    EXECUTE $1 INTO res; 
    RETURN res; 
END;
$_$;
CREATE FUNCTION public."concatenateArrayColumn"(schemaname text, tablename text, columnname text, appendvalue jsonb, prependvalue jsonb, arrayofids text) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
SQLstatement text;
success boolean default false;
BEGIN
if(schemaName, tableName, columnName, arrayOfIds) IS NOT NULL
    AND (
        prependValue IS NOT NULL
        OR appendValue IS NOT NULL
    )  THEN 
    SQLstatement := 'UPDATE ' 
|| 
'"' 
|| 
schemaName 
|| 
'"."' 
|| 
tableName 
|| 
'" ' 
|| 
'SET "' 
|| 
columnName 
|| 
'" = ''' 
|| 
prependValue 
||
 ''' || "' 
||
columnName 
||
'" || ''' 
||
appendValue 
||
''' where id in ' 
||
arrayOfIds
||
';';
SELECT executeUpdate(SQLstatement) into success;
    RETURN QUERY
SELECT
  success,
  SQLstatement AS message;
    END IF ;
RETURN QUERY
SELECT
  false AS success,
  'invaild' AS message;
END;
$$;
CREATE FUNCTION public."concatenateColumn"(schemaname text, tablename text, columnname text, appendvalue text, prependvalue text, arrayofids text) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
SQLstatement text;
success boolean default false;
BEGIN
if(schemaName, tableName, columnName, arrayOfIds) IS NOT NULL
    AND (
        prependValue IS NOT NULL
        OR appendValue IS NOT NULL
    )  THEN 
    SQLstatement := 'UPDATE ' 
|| 
'"' 
|| 
schemaName 
|| 
'"."' 
|| 
tableName 
|| 
'" ' 
|| 
'SET "' 
|| 
columnName 
|| 
'" = concat(''' 
|| 
prependValue 
||
 ''', "' 
||
columnName 
||
'" ,''' 
||
appendValue 
||
''') where id in ' 
||
arrayOfIds
||
';';
SELECT executeUpdate(SQLstatement) into success;
RETURN QUERY
SELECT
 success,
  SQLstatement AS message;
    END IF ;
RETURN QUERY
SELECT
  false AS success,
  'invaild' AS message;
END;
$$;
CREATE FUNCTION public."concatenateField"(params jsonb) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
message text := string 'fields updated';
BEGIN
    RETURN QUERY SELECT true AS success, message AS message;
END;
$$;
CREATE FUNCTION public."concatenateTimeStamp"(schemaname text, tablename text, columnname text, intervalincrementvalue text, intervaldecrementvalue text, arrayofids text) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$ 
DECLARE 
SQLstatement text;
success boolean default false;
BEGIN
if(schemaName, tableName, columnName, arrayOfIds) IS NOT NULL
    AND (
        intervalincrementvalue IS NOT NULL
        OR intervaldecrementvalue IS NOT NULL
    )  THEN 
    SQLstatement := 'UPDATE ' 
|| 
'"' 
|| 
schemaName 
|| 
'"."' 
|| 
tableName 
|| 
'" ' 
|| 
'SET "' 
|| 
columnName 
|| 
'" = "' || columnName || '" + INTERVAL '''
|| 
coalesce(intervalincrementvalue, '0 day')
|| ''' - INTERVAL '''
||
coalesce(intervaldecrementvalue, '0 day')
||
''' where id in ' 
||
arrayOfIds
||
';';
SELECT executeUpdate(SQLstatement) into success;
RETURN QUERY
SELECT
 success,
  SQLstatement AS message;
ELSE 
RETURN QUERY
SELECT
  false AS success,
  'invaild' AS message;
END IF ;
END;
$$;
CREATE FUNCTION public.exec(text) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$ 
DECLARE
    res boolean;
BEGIN 
    EXECUTE $1 INTO res; 
    RETURN res; 
END;
$_$;
CREATE FUNCTION public.executeupdate(text) RETURNS boolean
    LANGUAGE plpgsql
    AS $_$ 
DECLARE
BEGIN 
    EXECUTE $1;
    RETURN true; 
END;
$_$;
CREATE FUNCTION public."extractMonth"(record record, columnname text) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
sql text;
month int;
BEGIN
select 'select extract (month from record.' || columnName || 'into month;' into sql;
EXECUTE sql;
  return month;
END
$$;
CREATE FUNCTION public."handleDeleteProtection"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF 
        (TG_TABLE_NAME in ('fulfillmentType'))
        OR (TG_TABLE_NAME in ('brandSetting') AND OLD."isDeleteProtected" = true ) 
            OR ( TG_TABLE_NAME in ('brand') and OLD."isDefault" = true)
        THEN
    Raise Exception 'cannot delete this row ';
    END IF;
    RETURN OLD;
END
$$;
CREATE FUNCTION public."handleDeleteProtectionOfDeleteProtectedRow"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF 
    (TG_TABLE_NAME in ('brandSetting') AND OLD."isDeleteProtected" = true ) 
        THEN
    Raise Exception 'cannot delete this row ';
    END IF;
    RETURN OLD;
END
$$;
CREATE FUNCTION public."handleDeleteProtectionOfEveryRow"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF 
        (TG_TABLE_NAME in ('fulfillmentType'))
        THEN
    Raise Exception 'cannot delete this row ';
    END IF;
    RETURN OLD;
END
$$;
CREATE FUNCTION public."handleDeleteProtectionOfIsDefault"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
    IF 
        ( TG_TABLE_NAME in ('brand') and OLD."isDefault" = true)
        THEN
    Raise Exception 'cannot delete this row ';
    END IF;
    RETURN OLD;
END
$$;
CREATE FUNCTION public.json_array_castint(json) RETURNS integer[]
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT array_agg(x)::int[] || ARRAY[]::int[] FROM json_array_elements_text($1) t(x);
$_$;
CREATE FUNCTION public.json_array_casttext(json) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT array_agg(x) || ARRAY[]::text[] FROM json_array_elements_text($1) t(x);
$_$;
CREATE FUNCTION public.json_to_array(json) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $_$
SELECT coalesce(array_agg(x),
                CASE
                    WHEN $1 is null THEN null
                    ELSE ARRAY[]::text[]
                END)
FROM json_array_elements_text($1) t(x); $_$;
CREATE FUNCTION public.jsonb_array_castint(jsonb) RETURNS integer[]
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT array_agg(x)::int[] || ARRAY[]::int[] FROM jsonb_array_elements_text($1) t(x);
$_$;
CREATE FUNCTION public.jsonb_array_casttext(jsonb) RETURNS text[]
    LANGUAGE sql IMMUTABLE
    AS $_$
    SELECT array_agg(x) || ARRAY[]::text[] FROM jsonb_array_elements_text($1) t(x);
$_$;
CREATE FUNCTION public.now2(count integer) RETURNS timestamp with time zone
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
  return now();
END
$$;
CREATE FUNCTION public.random_string(length integer) RETURNS text
    LANGUAGE plpgsql
    AS $$
declare
  chars text[] := '{0,1,2,3,4,5,6,7,8,9,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,a,b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u,v,w,x,y,z}';
  result text := '';
  i integer := 0;
begin
  if length < 0 then
    raise exception 'Given length cannot be less than 0';
  end if;
  for i in 1..length loop
    result := result || chars[1+random()*(array_length(chars, 1)-1)];
  end loop;
  return result;
end;
$$;
CREATE FUNCTION public."returnNow"(op text, count integer, _interval text) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
sql text;
result timestamptz;
BEGIN
select 'select (now() ' || op || ' interval ''' || count || ' ' || _interval || '''' || ' )::timestamptz into result;' into sql;
EXECUTE sql;
  return result;
END
$$;
CREATE FUNCTION public."setFullName"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
NEW."fullName" := concat(NEW."firstName", NEW."lastName");
RETURN NEW;
END;
$$;
CREATE FUNCTION public.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE TABLE rules.facts (
    id integer DEFAULT public.defaultid('rules'::text, 'facts'::text, 'id'::text) NOT NULL,
    query text
);
CREATE FUNCTION rules."appVisited"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."appVisitedFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."appVisitedFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'appVisited', 'fact', 'appVisited', 'title', 'Visited App', 'value', '{ "type" : "text" }'::json,'argument','', 'operators', operators);
    ELSE
        RETURN jsonb_build_object('value', (params->>'appVisited')::text, 'valueType','text','argument','');
    END IF;
END;
$$;
CREATE FUNCTION rules."assertFact"(condition jsonb, params jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
    x jsonb;
    factValue jsonb;
    values jsonb;
    res boolean;
BEGIN
    x := condition || params;
   SELECT rules."getFactValue"(condition->>'fact', x) INTO factValue;
   SELECT jsonb_build_object('condition', condition->'value', 'fact', factValue->'value') INTO values;
   SELECT rules."runWithOperator"(condition->>'operator', values) INTO res;
   RETURN res;
END;
$$;
CREATE FUNCTION rules."budgetFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    typeof text ;
    total numeric := 0;
    campaignRecord record;
    campIds integer array DEFAULT '{}';
    queryParams jsonb default '{}'::jsonb ;
    endDate timestamp without time zone;
    startDate timestamp without time zone ;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
    query text :='';
BEGIN
    IF params->'read'
        THEN RETURN jsonb_build_object('id', 'budget', 'fact', 'budget', 'title', 'Budget', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{ comboProducts { id title: name } }" }'::json, 'argument','couponId', 'operators', operators);
    END IF;
    query := query || 'SELECT ' || (params->>'type')::text || '(' || '"'|| (params->>'rewardType')::text || '"' || ')' || ' FROM crm."rewardHistory" WHERE ';
    IF (params->'perCustomer')::boolean = true THEN
        query := query || '"keycloakId" = ' || '''' || (params->>'keycloakId')::text|| '''' || ' AND ';
    END IF;
    IF params->>'coverage' = 'Only This' THEN
        IF params->>'couponId' IS NOT NULL THEN
            query := query || ' "couponId" = ' || (params->>'couponId')::text ||'AND';
        ELSIF params->>'campaignId' IS NOT NULL THEN
            query := query || ' "campaignId" = ' || (params->>'campaignId')::text||'AND';
        ELSE
            query := query;
        END IF;
     ELSEIF params->>'coverage'='Sign Up' OR params->>'coverage'='Post Order' OR params->>'coverage'='Referral' THEN
        FOR campaignRecord IN
            SELECT * FROM crm."campaign" WHERE "type" = (params->>'coverage')::text
        LOOP
            campIds := campIds || (campaignRecord."id")::int;
        END LOOP;
            query := query || ' "campaignId" IN ' || '(' || array_to_string(campIds, ',') || ')'  ||'AND';
    ELSEIF params->>'coverage' = 'coupons' THEN
        query := query || ' "couponId" IS NOT NULL AND';
    ELSEIF params->>'coverage' = 'campaigns' THEN
        query := query || ' "campaignId" IS NOT NULL AND';
    ELSE
        query := query;
    END IF;
    IF (params->>'duration')::interval IS NOT NULL THEN
        endDate := now()::timestamp without time zone;
        startDate := endDate - (params->>'duration')::interval;
        query := query || ' "created_at" > ' || '''' || startDate || '''' || 'AND "created_at" < ' || '''' || endDate::timestamp without time zone ||'''' ;
    ELSE
        query :=query;
    END IF;
    EXECUTE query INTO total;
    RETURN jsonb_build_object((params->>'type')::text, total, 'query', query);
END;
$$;
CREATE FUNCTION rules."cartComboProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartComboProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartComboProductComponent"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartComboProductComponentFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartComboProductComponentFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartComboProductComponent', 'fact', 'cartComboProductComponent', 'title', 'Cart Contains Combo Product Component', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{  comboProductComponents { id title: fullName } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartProduct"."productId" into productType;
            IF productType = 'combo'
             THEN SELECT "comboProductComponentId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartComboProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartItem" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartComboProduct', 'fact', 'cartComboProduct', 'title', 'Cart Contains Combo Product', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{ products(where: {type: {_eq: \"combo\"}}) { id title: name } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartItem" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartItem"."productId" into productType;
            IF productType = 'combo'
             THEN SELECT "cartItem"."productId" INTO productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartContainsAddOnProducts"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartContainsAddOnProductsFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartContainsAddOnProductsFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    addedAddOnProductsCount int;
    operators text[] := ARRAY['equal', 'notEqual'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('fact', 'cartContainsAddOnProducts', 'title', 'Cart Contains AddOn Products','value', '{ "type" : "text" }'::json,'argument','cartId', 'operators', operators);
    ELSE
     Select COUNT(*) INTO addedAddOnProductsCount FROM "order"."cartItem" WHERE "cartId" = (params->>'cartId')::integer AND "isAddOn" = true AND "parentCartItemId" IS NULL;
    if addedAddOnProductsCount > 0 then
    RETURN jsonb_build_object('value', 'true', 'valueType','boolean','argument','cartid');
       else RETURN jsonb_build_object('value', 'false', 'valueType','boolean','argument','cartid');
       end if;
    END IF;
END;
$$;
CREATE FUNCTION rules."cartCustomizableProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartCustomizableProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartCustomizableProductComponent"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartCustomizableProductComponentFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartCustomizableProductComponentFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartCustomizableProductComponent', 'fact', 'cartCustomizableProductComponent', 'title', 'Cart Contains Customizable Product Component', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{  customizableProductComponents { id title: fullName } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartProduct"."productId" into productType;
            IF productType = 'combo'
             THEN SELECT "CustomizableProductComponentId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartCustomizableProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartItem" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartCustomizableProduct', 'fact', 'cartCustomizableProduct', 'title', 'Cart Contains Customizable Product', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{ products(where: {type: {_eq: \"customizable\"}}) { id title: name } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartItem" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartItem"."productId" into productType;
            IF productType = 'customizable'
             THEN SELECT "cartItem"."productId" INTO productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartInventoryProductOption"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartInventoryProductOptionFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartInventoryProductOptionFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartInventoryProductOption', 'fact', 'cartInventoryProductOption', 'title', 'Cart Contains Inventory Product Option', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{  productOptions (where: {type: {_eq: \"inventory\"}}) { id, title: fullName } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'inventory' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productOptionIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartItemTotal"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartItemTotalFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartItemTotalFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total numeric;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'cartItemTotal', 'fact', 'cartItemTotal', 'title', 'Cart Item Total', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        SELECT COALESCE((SELECT SUM("unitPrice") FROM "order"."cartItem" WHERE "cartId" = (params->>'cartId')::integer), 0) INTO total;
        RETURN json_build_object('value', total, 'valueType','numeric','arguments','cartId');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartMealKitProductOption"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartMealKitProductOptionFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartMealKitProductOptionFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartMealKitProductOption', 'fact', 'cartMealKitProductOption', 'title', 'Cart Contains Meal Kit Product Option', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{  productOptions (where: {type: {_eq: \"mealKit\"}}) { id, title: fullName } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'mealKit' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productOptionIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartReadyToEatProductOption"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartReadyToEatProductOptionFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartReadyToEatProductOptionFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartReadyToEatProductOption', 'fact', 'cartReadyToEatProductOption', 'title', 'Cart Contains Ready to Eat Product Option', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{  productOptions (where: {type: {_eq: \"readyToEat\"}}) { id, title: fullName } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'readyToEat' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productOptionIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartSimpleProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartSimpleProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartSimpleProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartItem" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['in','notIn'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'cartSimpleProduct', 'fact', 'cartSimpleProduct', 'title', 'Cart Contains Simple Product', 'value', '{ "type" : "select", "select" : "id", "datapoint" : "query", "query" : "{ products(where: {type: {_eq: \"simple\"}}) { id title: name } }" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartItem" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartItem"."productId" into productType;
            IF productType = 'simple'
             THEN SELECT "cartItem"."productId" INTO productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN jsonb_build_object('value', productIdArray, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionItemCount"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartSubscriptionItemCountFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionItemCountFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionItemCount int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('fact', 'cartSubscriptionItemCount', 'title', 'Cart Subscription Item Count','value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        select "subscriptionItemCount" into subscriptionItemCount from "subscription"."view_subscription" 
        where id = (select "subscriptionId" from "subscription"."subscriptionOccurence" 
        where id = (select "subscriptionOccurenceId" from "order"."cart" where id = (params->>'cartId')::integer));
        RETURN jsonb_build_object('value', subscriptionItemCount, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionServingSize"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartSubscriptionServingSizeFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionServingSizeFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionServingSize int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('fact', 'cartSubscriptionServingSize', 'title', 'Subscription Serving Size','value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        select "subscriptionServingSize" into subscriptionServingSize from "subscription"."view_subscription" 
        where id = (select "subscriptionId" from "subscription"."subscriptionOccurence" 
        where id = (select "subscriptionOccurenceId" from "order"."cart" where id = (params->>'cartId')::integer));
        RETURN jsonb_build_object('value', subscriptionServingSize, 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionTitle"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."cartSubscriptionTitleFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."cartSubscriptionTitleFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionTitle text;
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'cartSubscriptionTitle', 'fact', 'cartSubscriptionTitle', 'title', 'Subscription Title', 'value', '{ "type" : "text" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        select "title" into subscriptionTitle from "subscription"."view_subscription" 
        where id = (select "subscriptionId" from "subscription"."subscriptionOccurence" 
        where id = (select "subscriptionOccurenceId" from "order"."cart" where id = (params->>'cartId')::integer));
        RETURN jsonb_build_object('value', subscriptionTitle, 'valueType','text','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."checkAllConditions"(conditionarray jsonb, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    condition jsonb;
    res1 boolean := true;
    res2 boolean := true;
    res3 boolean := true;
    tmp boolean := true;
BEGIN
   FOR condition IN SELECT  * FROM jsonb_array_elements(conditionArray) LOOP
       IF condition->'all' IS NOT NULL
          THEN SELECT rules."checkAllConditions"(condition->'all', params) INTO res2;
      ELSIF condition->'any' IS NOT NULL
          THEN SELECT rules."checkAnyConditions"(condition->'any', params) INTO res2;
      ELSIF condition->'fact' IS NOT NULL
          THEN 
            SELECT rules."assertFact"(condition::jsonb, params) INTO tmp;
            SELECT res3 AND tmp INTO res3;
      ELSE
          SELECT true INTO tmp;
          SELECT res3 AND tmp INTO res3;
      END IF;
   END LOOP;
  RETURN res1 AND res2 AND res3;
END;
$$;
CREATE FUNCTION rules."checkAnyConditions"(conditionarray jsonb, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    condition jsonb;
    res1 boolean := false;
    res2 boolean := false;
    res3 boolean := false;
    tmp boolean := false;
BEGIN
    FOR condition IN SELECT * FROM jsonb_array_elements(conditionArray) LOOP
        IF condition->'all' IS NOT NULL
            THEN SELECT rules."checkAllConditions"(condition->'all', params) INTO res2;
        ELSIF condition->'any' IS NOT NULL
          THEN SELECT rules."checkAnyConditions"(condition->'any', params) INTO res2;
        ELSIF condition->'fact' IS NOT NULL
          THEN 
            SELECT rules."assertFact"(condition::jsonb, params) INTO tmp;
            SELECT res3 OR tmp INTO res3;
        ELSE
          SELECT true INTO tmp;
          SELECT res3 OR tmp INTO res3;
      END IF;
   END LOOP;
  RETURN res1 OR res2 OR res3;
END;
$$;
CREATE FUNCTION rules."countOfOrderEmailsToAdmin"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
total int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'countOfOrderEmailsToAdmin', 'fact', 'countOfOrderEmailsToAdmin', 'title', 'Count Of Order Emails To Admin', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
select coalesce((Select count(*) from "notifications"."emailConfig" where "typeId" = (select id from "notifications"."type" where "name" = 'Order_Created') ), 0) into total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."countOfOrderEmailsToAdmin"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."countOfOrderEmailsToAdmin"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."countOfOrderSMSToAdmin"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
total int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'countOfOrderSMSToAdmin', 'fact', 'countOfOrderSMSToAdmin', 'title', 'Count Of Order SMS To Admin', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
select coalesce((Select count(*) from "notifications"."smsConfig" where "typeId" = (select id from "notifications"."type" where "name" = 'Order_Created') ), 0) into total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."countOfOrderSMSToAdmin"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."countOfOrderSMSToAdmin"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."couponCountWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."couponCountWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."couponCountWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    ord record;
    currentCart record;
    couponCode text;
    tempCode text;
    dateArray timestamp[];
    d text := params->>'duration';
    usedCouponArray text[];
    usedCoupon text;
    orderCount integer := 0;
    endDate timestamp := current_timestamp;
    startDate timestamp := endDate - CAST(d AS INTERVAL);
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'couponCountWithDuration','fact', 'couponCountWithDuration', 'title', 'Coupon Count Within Duration', 'value', '{ "type" : "int", "duration" : true}'::json,'argument','cartId', 'operators', operators);
    ELSE
        IF startDate IS NOT NULL THEN
            SELECT * from "order"."cart" WHERE id = (params->>'cartId')::integer INTO currentCart;
            SELECT code FROM crm."coupon" WHERE id = (SELECT "couponId" FROM crm."reward" WHERE id = (SELECT "rewardId" from "order"."cart_rewards" WHERE "cartId" = currentCart.id)) INTO couponCode;
            FOR ord IN SELECT * FROM "order"."order" WHERE "keycloakId" = currentCart."customerKeycloakId" AND "created_at" < endDate AND "created_at" >= startDate LOOP
                SELECT code FROM crm."coupon" WHERE id = (SELECT "couponId" FROM crm."reward" WHERE id = (SELECT "rewardId" from "order"."cart_rewards" WHERE "cartId" = ord."cartId")) INTO tempCode;
                IF tempCode = couponCode THEN  
                    orderCount := orderCount + 1;
                END IF;
            END LOOP;
        END IF;
        RETURN json_build_object('value',orderCount,'valueType','integer','argument','cartId');
    END IF;
END;
$$;
CREATE FUNCTION rules."customerEmail"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."customerEmailFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."customerEmailFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    customerEmail text;
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
    IF params->'read'
        THEN RETURN jsonb_build_object('id', 'customerEmail', 'fact', 'customerEmail', 'title', 'Customer Email', 'value', '{ "type" : "text" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
        SELECT email FROM crm."customer" WHERE "keycloakId" = (params->>'keycloakId')::text INTO customerEmail;
        RETURN jsonb_build_object('value', customerEmail, 'valueType','text','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."customerReferralCodeFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referralCode text ;
     operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'customerReferralCode', 'fact', 'customerReferralCode', 'title', 'Customer Referral Code', 'value', '{ "type" : "text" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT "referralCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referralCode;
          RETURN json_build_object('value', referralCode , 'valueType','text','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."customerReferredByCode"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."customerReferredByCodeFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."customerReferredByCodeFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    code text ;
    operators text[] := ARRAY['equal', 'notEqual'];
BEGIN
    IF (params->'read')::boolean = true
        THEN RETURN json_build_object('id', 'customerReferredByCode', 'fact', 'customerReferredByCode', 'title', 'Customer is Referred', 'value', '{ "type" : "text" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
        SELECT "referredByCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text AND "brandId" = (params->>'brandId')::int INTO code;
        IF code IS NULL THEN
          RETURN json_build_object('value', 'false' , 'valueType','text','argument','keycloakId, brandId');
        ELSE
          RETURN json_build_object('value', 'true' , 'valueType','text','argument','keycloakId, brandId');
        END IF;
    END IF;
END;
$$;
CREATE FUNCTION rules."customerReferrerCode"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."customerReferrerCodeFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."customerReferrerCodeFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referredByCode text ;
     operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'customerReferrerCode', 'fact', 'customerReferrerCode', 'title', 'Customer Referrer Code', 'value', '{ "type" : "text" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT "referredByCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referredByCode;
          RETURN json_build_object('value', referredByCode , 'valueType','text','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."customerSubscriptionSkipCountWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."customerSubscriptionSkipCountWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."customerSubscriptionSkipCountWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionSkipCount integer := 0;
    enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'customerSubscriptionSkipCountWithDuration', 'fact', 'orderCountWithDuration', 'title', 'Order Count With Duration', 'value', '{ "type" : "int", "duration" : true }'::json ,'argument','keycloakId', 'operators', operators);
    ELSE
    select count(*) into subscriptionSkipCount from "subscription"."subscriptionOccurence_customer" where "keycloakId" = (params->>'keycloakId')::text and "isSkipped" = true and ("subscriptionOccurenceId" in (select "id" from "subscription"."subscriptionOccurence" where "fulfillmentDate" > startdate and "fulfillmentDate" < enddate ));
          RETURN json_build_object('value',subscriptionSkipCount,'valueType','integer','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."entityNameFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    entityId int := (params->>'entityId')::int;
     entityVisited text := (params->>'entityVisited')::text;
     entityName text;
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual', 'in'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'entityName', 'fact', 'entityName', 'title', 'Visited Entity Name', 'value', '{ "type" : "text" }'::json,'argument','', 'operators', operators);
    ELSE
    IF entityVisited = 'recipes' then
    select "name" from "simpleRecipe"."simpleRecipe" where id = entityId into entityName;
    ELSIF
    entityVisited = 'products' then
     select "name" from "products"."product" where id = entityId into entityName;
     ELSIF
    entityVisited = 'ingredients' then
     select "name" from "ingredient"."ingredient" where id = entityId into entityName;
         ELSIF
    entityVisited = 'suppliers' then
     select "name" from "inventory"."supplier" where id = entityId into entityName;
          ELSIF
    entityVisited = 'items' then
     select "name" from "inventory"."supplierItem" where id = entityId into entityName;
    else
    select null into entityName;
    END IF;
        RETURN jsonb_build_object('value', entityName, 'valueType','text','argument','entityId');
    END IF;
END;
$$;
CREATE FUNCTION rules."entityVisitedFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual', 'in'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'entityVisited', 'fact', 'entityVisited', 'title', 'Visited Entity', 'value', '{ "type" : "text" }'::json,'argument','', 'operators', operators);
    ELSE
        RETURN jsonb_build_object('value', (params->>'entityVisited')::text, 'valueType','text','argument','');
    END IF;
END;
$$;
CREATE FUNCTION rules."getConditionDisplay"(conditionid integer, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res jsonb := ('Following are the conditions');
    condition record;
BEGIN
    SELECT * FROM rules.conditions WHERE id = conditionId INTO condition;
    IF condition.condition->'all' IS NOT NULL
        THEN SELECT rules."getAllConditionsDisplay"(condition.condition->'all', params) || res;
    ELSIF condition.condition->'any' IS NOT NULL
        THEN SELECT rules."getAnyConditionsDisplay"(condition.condition->'any', params) || res;
    END IF;
    RETURN res;
END;
$$;
CREATE FUNCTION rules."getDivIdFileShownCount"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."getDivIdFileShownCountFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."getDivIdFileShownCountFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    fileId int := (params->>'fileId')::int;
    divId text := (params->>'divId')::text;
     userEmail text := (params->>'userEmail')::text;
    shownCount int;
     operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'getDivIdFileShownCountFunc', 'fact', 'getDivIdFileShownCountFunc', 'title', 'Get DivId File Shown Count', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
     select  coalesce((select "shownCount" from ux."user_dailyosDivIdFile" where "fileId" = fileId and "divId" = divId  and "userEmail" = userEmail)) into shownCount;
          RETURN json_build_object('value', shownCount , 'valueType','int','argument','');
    END IF;
END;
$$;
CREATE FUNCTION rules."getFactTitle"(fact text) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE readFact jsonb;
BEGIN
    select call('SELECT rules."' || fact || 'Func"' || '({"read": true})') into readFact;
    return (readFact->'title')::text;
END;
$$;
CREATE FUNCTION rules."getFactTitle"(fact text, params jsonb) RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE readFact jsonb;
BEGIN
    select call('SELECT rules."' || fact || 'Func"' || '(' || '''' || params || '''' || ')') into readFact;
    return (readFact->'title')::text;
END;
$$;
CREATE FUNCTION rules."getFactValue"(fact text, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN call('SELECT rules."' || fact || 'Func"' || '(' || '''' || params || '''' || ')');
END;
$$;
CREATE FUNCTION rules."getUserCreatedSince"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."getUserCreatedSinceFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."getUserCreatedSinceFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    createdAt timestamptz;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
    userCreatedSince int; 
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'userCreatedSince', 'fact', 'userCreatedSince', 'title', 'User Created Since', 'value', '{ "type" : "text" }'::json,'argument','userEmail','operators', operators);
    ELSE
          SELECT "created_at" FROM settings.user WHERE "email" = (params->>'userEmail')::text INTO createdAt;
          SELECT date_part('day', age(now(), createdAt)) into userCreatedSince; 
          RETURN json_build_object('value', userCreatedSince , 'valueType','text','argument','userEmail');
    END IF;
END;
$$;
CREATE FUNCTION rules."getUserRoles"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."getUserRolesFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."getUserRolesFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    userEmail text := (params->>'userEmail')::text;
    userRoles text;
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'getUserRolesFunc', 'fact', 'getUserRolesFunc', 'title', 'Get User Roles', 'value', '{ "type" : "text" }'::json,'argument','userEmail', 'operators', operators);
    ELSE
     select STRING_AGG(title,',') from "settings"."role" where id in (select "roleId" from "settings"."user_role" where "userId" = (select "keycloakId" from "settings"."user" where "email" = userEmail) ) into userRoles;
        RETURN jsonb_build_object('value', userRoles, 'valueType','text','argument','userEmail');
    END IF;
END;
$$;
CREATE FUNCTION rules."isCartSubscription"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."isCartSubscriptionFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."isCartSubscriptionFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    cartSource text;
    isSubscription text;
    operators text[] := ARRAY['equal', 'notEqual'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('fact', 'isCartSubscription', 'title', 'is Cart from subscription', 'value', '{ "type" : "text" }'::json,'argument','cartId','operators', operators);
    ELSE
        select "source" into cartSource from "order"."cart" where id = (params->>'cartId')::integer;
        if cartSource = 'subscription' then 
        isSubscription := 'true' ; 
        else 
        isSubscription := 'false' ; 
        end if;
        RETURN jsonb_build_object('value', isSubscription, 'valueType','boolean','argument','cartid');
    END IF;
END;
$$;
CREATE TABLE rules.conditions (
    id integer DEFAULT public.defaultid('rules'::text, 'conditions'::text, 'id'::text) NOT NULL,
    condition jsonb,
    app text,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
CREATE FUNCTION rules."isConditionValid"(condition rules.conditions, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res boolean;
    x int;
    y text;
BEGIN
    SELECT id FROM crm.reward WHERE "conditionId" = condition.id INTO x;
    IF x IS NOT NULL THEN
        params := params || jsonb_build_object('rewardId', x);
    END IF;
    IF x IS NULL THEN
        SELECT id FROM crm.campaign WHERE "conditionId" = condition.id INTO x;
        IF x IS NOT NULL THEN
            params := params || jsonb_build_object('campaignId', x);
        END IF;
    END IF;
    IF x IS NULL THEN
        SELECT id FROM crm.coupon WHERE "visibleConditionId" = condition.id INTO x;
        IF x IS NOT NULL THEN
            params := params || jsonb_build_object('couponId', x);
        END IF;
    END IF;
     IF x IS NULL THEN
        SELECT "fileId","divId" into x,y FROM ux."dailyosDivIdFiles" WHERE "conditionId" = condition.id;
        IF x IS NOT NULL THEN
            params := params || jsonb_build_object('fileId', x, 'divId', y);
        END IF;
    END IF;
    SELECT rules."isConditionValidFunc"(condition.id, params) INTO res;
    RETURN res;
END;
$$;
CREATE FUNCTION rules."isConditionValidFunc"(conditionid integer, params jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res boolean;
    condition record;
BEGIN
    SELECT * FROM rules.conditions WHERE id = conditionId INTO condition;
    IF condition.condition->'all' IS NOT NULL
        THEN SELECT rules."checkAllConditions"(condition.condition->'all', params) INTO res;
    ELSIF condition.condition->'any' IS NOT NULL
        THEN SELECT rules."checkAnyConditions"(condition.condition->'any', params) INTO res;
    ELSE
        SELECT true INTO res;
    END IF;
    RETURN res;
END;
$$;
CREATE FUNCTION rules."isCustomerReferred"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."isCustomerReferredFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."isCustomerReferredFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referredByCode text ;
    value text := 'false';
     operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'isCustomerReferred', 'fact', 'isCustomerReferred', 'title', 'Is Customer Referred', 'value', '{ "type" : "text" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT "referredByCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referredByCode;
          IF referredByCode is not null then 
            value := 'true';
          end if;
          RETURN json_build_object('value', value , 'valueType','text','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."numberOfCustomerReferred"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."numberOfCustomerReferredFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."numberOfCustomerReferredFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referralCode text ;
    referredCount int;
    value boolean := false;
     operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'numberOfCustomerReferred', 'fact', 'numberOfCustomerReferred', 'title', 'Number Of Customer Referred', 'value', '{ "type" : "int" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT "referralCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referralCode;
          select count(*) from crm."customerReferral" WHERE "referredByCode" = referralCode INTO referredCount;
          RETURN json_build_object('value', referredCount , 'valueType','number','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."numberOfSubscriptionAddOnProducts"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."numberOfSubscriptionAddOnProductsFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."numberOfSubscriptionAddOnProductsFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    addedAddOnProductsCount int := 0;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
      IF params->'read' THEN 
    RETURN json_build_object('fact', 'cartContainsAddOnProducts', 'title', 'Cart Contains AddOn Products', 'operators', operators);
    ELSE
    Select coalesce(COUNT(*), 0) INTO addedAddOnProductsCount FROM "order"."cartItem" WHERE "cartId" = (params->>'cartId')::integer AND "isAddOn" = true AND "parentCartItemId" IS NULL;
    RETURN jsonb_build_object('value', addedAddOnProductsCount, 'valueType', 'integer', 'argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."numberOfSuccessfulCustomerReferred"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."numberOfSuccessfulCustomerReferredFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."numberOfSuccessfulCustomerReferredFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referralCode text ;
    referredCount int;
    value boolean := false;
     operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
IF params->'read'
        THEN RETURN json_build_object('id', 'numberOfSuccessfulCustomerReferred', 'fact', 'numberOfSuccessfulCustomerReferred', 'title', 'Number Of Customer Successfully Referred', 'value', '{ "type" : "int" }'::json,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT "referralCode" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referralCode;
          select count(*) from crm."customerReferral" WHERE "referredByCode" = referralCode and "referralStatus" = 'COMPLETED' INTO referredCount;
          RETURN json_build_object('value', referredCount , 'valueType','number','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."orderCountWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."orderCountWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."orderCountWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    dateArray timestamp[];
    dateArr timestamp;
    orderCount integer := 0;
    enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'orderCountWithDuration', 'fact', 'orderCountWithDuration', 'title', 'Order Count With Duration', 'value', '{ "type" : "int", "duration" : true }'::json ,'argument','keycloakId', 'operators', operators);
    ELSE
          SELECT COUNT(*) FROM "order"."cart" WHERE "customerKeycloakId" = (params->>'keycloakId')::text AND "paymentStatus" = 'SUCCEEDED' AND "created_at" > startdate AND "created_at" <  enddate INTO orderCount;
          RETURN json_build_object('value',orderCount,'valueType','integer','argument','keycloakId');
    END IF;
END;
$$;
CREATE FUNCTION rules."referralStatus"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT crm."referralStatusFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."referralStatusFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    referralStatus text ;
BEGIN
  SELECT "status" FROM crm."customerReferral" WHERE "keycloakId" = (params->>'keycloakId')::text INTO referralStatus;
  RETURN json_build_object('value', referralStatus, 'valueType','text','argument','keycloakId');
END;
$$;
CREATE FUNCTION rules."rruleHasDateFunc"(rrule _rrule.rruleset, d timestamp without time zone) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res boolean;
BEGIN
  SELECT rrule @> d into res;
  RETURN res;
END;
$$;
CREATE FUNCTION rules."runWithOperator"(operator text, vals jsonb) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res boolean := false;
BEGIN
    -- IF vals->>'fact' IS NOT NULL THEN
        IF operator = 'rruleHasDate'
            THEN SELECT rules."rruleHasDateFunc"((vals->'condition')::text::jsonb::_rrule.rruleset, (vals->'fact')::text::timestamp) INTO res;
        ELSIF operator = 'equal'
            THEN SELECT (vals->'fact')::text = (vals->'condition')::text INTO res;
        ELSIF operator = 'notEqual'
            THEN SELECT (vals->'fact')::text != (vals->'condition')::text INTO res;
        ELSIF operator = 'greaterThan'
            THEN SELECT (vals->>'fact')::numeric > (vals->>'condition')::numeric INTO res;
        ELSIF operator = 'greaterThanInclusive'
            THEN SELECT (vals->>'fact')::numeric >= (vals->>'condition')::numeric INTO res;
        ELSIF operator = 'lessThan'
            THEN SELECT (vals->>'fact')::numeric < (vals->>'condition')::numeric INTO res;
        ELSIF operator = 'lessThanInclusive'
            THEN SELECT (vals->>'fact')::numeric <= (vals->>'condition')::numeric INTO res;
        ELSIF operator = 'contains'
            THEN SELECT vals->>'fact' LIKE CONCAT('%', vals->>'condition', '%') INTO res;
        ELSIF operator = 'doesNotContain'
            THEN SELECT vals->>'fact' NOT LIKE CONCAT('%', vals->>'condition', '%') INTO res;
        ELSIF operator = 'in'
            THEN SELECT vals->>'condition' = ANY(ARRAY(SELECT jsonb_array_elements_text(vals->'fact'))) INTO res;
        ELSIF operator = 'notIn'
            THEN SELECT vals->>'condition' != ALL(ARRAY(SELECT jsonb_array_elements_text(vals->'fact'))) INTO res;
        ELSE
            SELECT false INTO res;
        END IF;
    -- END IF;
    RETURN res;
END;
$$;
CREATE FUNCTION rules.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION rules."totalNumberOfAllergensWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfAllergensWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfAllergensWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfAllergensWithDuration', 'fact', 'totalNumberOfAllergensWithDuration', 'title', 'Total Number Of Allergens With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "master"."allergenName" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfBrandsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfBrandsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfBrandsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfBrandsWithDuration', 'fact', 'totalNumberOfBrandsWithDuration', 'title', 'Total Number Of Brands With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "brands"."brand" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartComboProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCartComboProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartComboProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartItem" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalNumberOfCartComboProduct', 'fact', 'totalNumberOfCartComboProduct', 'title', 'Total Number Of Combo Products (with Quantity)', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartItem" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartItem"."productId" into productType;
            IF productType = 'combo'
             THEN SELECT "cartItem"."productId" INTO productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN json_build_object('value', coalesce(array_length(productIdArray, 1), 0) , 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartCustomizableProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCartCustomizableProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartCustomizableProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartItem" record;
    productType text;
    productIdArray integer array DEFAULT '{}';
    productId integer;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalNumberOfCartCustomizableProduct', 'fact', 'totalNumberOfCartCustomizableProduct', 'title', 'Total Number Of Customizable Products (with Quantity)', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartItem" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        Select "type" from "products"."product" where "id" = "cartItem"."productId" into productType;
            IF productType = 'customizable'
             THEN SELECT "cartItem"."productId" INTO productId;
              productIdArray = productIdArray || productId;
            END IF;
        END LOOP;
        RETURN json_build_object('value', coalesce(array_length(productIdArray, 1), 0) , 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartInventoryProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCartInventoryProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartInventoryProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalNumberOfCartInventoryProduct', 'fact', 'totalNumberOfCartInventoryProduct', 'title', 'Total Number Of Inventory Products (with Quantity)', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'inventory' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN json_build_object('value', coalesce(array_length(productOptionIdArray, 1), 0) , 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartMealKitProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCartMealKitProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartMealKitProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalNumberOfCartMealKitProduct', 'fact', 'totalNumberOfCartMealKitProduct', 'title', 'Total Number Of Meal Kit Products (with Quantity)', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'mealKit' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN json_build_object('value', coalesce(array_length(productOptionIdArray, 1), 0) , 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartReadyToEatProduct"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCartReadyToEatProductFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCartReadyToEatProductFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    "cartProduct" record;
    productOptionType text;
    productOptionIdArray integer array DEFAULT '{}';
    productOptionId integer;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalNumberOfCartReadyToEatProduct', 'fact', 'totalNumberOfCartReadyToEatProduct', 'title', 'Total Number Of Ready To Eat Products (with Quantity)', 'value', '{ "type" : "int" }'::json,'argument','cartId', 'operators', operators);
    ELSE
        FOR "cartProduct" IN SELECT * from "order"."cartItem" where "cartId" = (params->>'cartId')::integer LOOP
        select "productOptionId" from "order"."cartItem" where "parentCartItemId" = "cartProduct"."id" into productOptionId;
            SELECT "type" from "products"."productOption" where "id" = productOptionId into productOptionType;
            IF productOptionType = 'readyToEat' then
              productOptionIdArray = productOptionIdArray || productOptionId;
            END IF;
        END LOOP;
        RETURN json_build_object('value', coalesce(array_length(productOptionIdArray, 1), 0) , 'valueType','integer','argument','cartid');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCuisinesWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCuisinesWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCuisinesWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfCuisinesWithDuration', 'fact', 'totalNumberOfCuisinesWithDuration', 'title', 'Total Number Of Cuisines With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "master"."cuisineName" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCustomersWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfCustomersWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfCustomersWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfCustomersWithDuration', 'fact', 'totalNumberOfCustomersWithDuration', 'title', 'Total Number Of Customers With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "crm"."customer" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionDeliveryDaysWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfDistinctSubscriptionDeliveryDaysWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionDeliveryDaysWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfDistinctSubscriptionDeliveryDaysWithDuration', 'fact', 'totalNumberOfDistinctSubscriptionDeliveryDaysWithDuration', 'title', 'Total Number Of Distinct Subscription Delivery Days With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(Distinct("rrule")) from "subscription"."subscription" where "isDemo" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionItemCountsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfDistinctSubscriptionItemCountsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionItemCountsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfDistinctSubscriptionItemCountsWithDuration', 'fact', 'totalNumberOfDistinctSubscriptionItemCountsWithDuration', 'title', 'Total Number Of Distinct Subscription Item Counts With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(Distinct("count")) from "subscription"."subscriptionItemCount" where "isDemo" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionServingsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfDistinctSubscriptionServingsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfDistinctSubscriptionServingsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfDistinctSubscriptionServingsWithDuration', 'fact', 'totalNumberOfDistinctSubscriptionServingsWithDuration', 'title', 'Total Number Of Distinct Subscription Servings With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(Distinct("servingSize")) from "subscription"."subscriptionServing" where "isDemo" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfIngredientCategoryWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfIngredientCategoryWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfIngredientCategoryWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfIngredientCategoryWithDuration', 'fact', 'totalNumberOfIngredientCategoryWithDuration', 'title', 'Total Number Of Ingredient Category With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "master"."ingredientCategory" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfIngredientsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfIngredientsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfIngredientsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfIngredientsWithDuration', 'fact', 'totalNumberOfIngredientsWithDuration', 'title', 'Total Number Of Ingredients With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "ingredient"."ingredient" where "isArchived" = false and "createdAt" > startDate AND "createdAt" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterProcessingWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfMasterProcessingWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterProcessingWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfMasterProcessingWithDuration', 'fact', 'totalNumberOfMasterProcessingWithDuration', 'title', 'Total Number Of Master Processing With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "master"."processingName" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterUnitConversionssWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfMasterUnitConversionssWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterUnitConversionssWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfMasterUnitConversionssWithDuration', 'fact', 'totalNumberOfMasterUnitConversionssWithDuration', 'title', 'Total Number Of Master Unit Conversions With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "master"."unitConversion" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterUnitsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfMasterUnitsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfMasterUnitsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfMasterUnitsWithDuration', 'fact', 'totalNumberOfMasterUnitsWithDuration', 'title', 'Total Number Of Master Units With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "master"."unit" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfModifiersWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfModifiersWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfModifiersWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfModifiersWithDuration', 'fact', 'totalNumberOfModifiersWithDuration', 'title', 'Total Number Of Modifiers With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "onDemand"."modifier" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfOrdersWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfOrdersWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfOrdersWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfOrdersWithDuration', 'fact', 'totalNumberOfOrdersWithDuration', 'title', 'Total Number Of Orders With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "order"."order" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfPackagingWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfPackagingWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfPackagingWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfPackagingWithDuration', 'fact', 'totalNumberOfPackagingWithDuration', 'title', 'Total Number Of Packaging With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "packaging"."packaging" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductCategoryWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfProductCategoryWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductCategoryWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfProductCategoryWithDuration', 'fact', 'totalNumberOfProductCategoryWithDuration', 'title', 'Total Number Of Product Category With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "master"."productCategory" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductCollectionssWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfProductCollectionssWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductCollectionssWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfProductCollectionssWithDuration', 'fact', 'totalNumberOfProductCollectionssWithDuration', 'title', 'Total Number Of Product Collections With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "onDemand"."collection" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProducts"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfProductsFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductsFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfProducts', 'fact', 'totalNumberOfProducts', 'title', 'Total Number Of Products', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "products"."product" WHERE "isArchived" = false) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfProductsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfProductsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfProductsWithDuration', 'fact', 'totalNumberOfProductsWithDuration', 'title', 'Total Number Of Products With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "products"."product" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfRecipes"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfRecipesFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfRecipesFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfRecipes', 'fact', 'totalNumberOfRecipes', 'title', 'Total Number Of Recipes', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "simpleRecipe"."simpleRecipe" where "isArchived" = false) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfRecipesWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfRecipesWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfRecipesWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfRecipesWithDuration', 'fact', 'totalNumberOfRecipesWithDuration', 'title', 'Total Number Of Recipes With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "simpleRecipe"."simpleRecipe" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSubscribersWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfSubscribersWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSubscribersWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfSubscribersWithDuration', 'fact', 'totalNumberOfSubscribersWithDuration', 'title', 'Total Number Of Subscribers With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "crm"."brand_customer" where "isSubscriber" = true and "isSubscriberTimeStamp" > startDate AND "isSubscriberTimeStamp" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSubscriptionTitlesWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfSubscriptionTitlesWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSubscriptionTitlesWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfSubscriptionTitlesWithDuration', 'fact', 'totalNumberOfSubscriptionTitlesWithDuration', 'title', 'Total Number Of Subscription Titles With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(*) from "subscription"."subscriptionTitle" where "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSupplierItemsWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfSupplierItemsWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSupplierItemsWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfSupplierItemsWithDuration', 'fact', 'totalNumberOfSupplierItemsWithDuration', 'title', 'Total Number Of Supplier Items With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "inventory"."supplierItem" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSuppliersWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfSuppliersWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfSuppliersWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfSuppliersWithDuration', 'fact', 'totalNumberOfSuppliersWithDuration', 'title', 'Total Number Of Suppliers With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "inventory"."supplier" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalNumberOfpackagingWithDuration"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalNumberOfpackagingWithDurationFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalNumberOfpackagingWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total int;
     enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalNumberOfpackagingWithDuration', 'fact', 'totalNumberOfpackagingWithDuration', 'title', 'Total Number Of packaging With Duration', 'value', '{ "type" : "int", "duration" : true }'::json,'argument','', 'operators', operators);
    ELSE
    SELECT COALESCE((SELECT COUNT(id) from "packaging"."packaging" where "isArchived" = false and "created_at" > startDate AND "created_at" <  enddate) ,0)INTO total;
        RETURN json_build_object('value', total, 'valueType','int','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalRevenue"(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."totalRevenueFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."totalRevenueFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    total numeric;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF (params->>'read')::boolean = true
        THEN RETURN json_build_object('id', 'totalRevenue', 'fact', 'totalRevenue', 'title', 'Total Revenue', 'value', '{ "type" : "int" }'::json,'argument','', 'operators', operators);
    ELSE
        SELECT sum("amountPaid") from "order"."order" into total;
        RETURN json_build_object('value', total, 'valueType','numeric','arguments','');
    END IF;
END;
$$;
CREATE FUNCTION rules."totalRevenueWithDurationFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    orderRevenue numeric := 0;
    enddate timestamp := current_timestamp;
    startdate timestamp := enddate - (params->>'duration')::interval;
    operators text[] := ARRAY['equal', 'greaterThan', 'greaterThanInclusive', 'lessThan', 'lessThanInclusive'];
BEGIN
    IF params->'read'
        THEN RETURN json_build_object('id', 'totalRevenueWithDuration', 'fact', 'totalRevenueWithDuration', 'title', 'Total Revenue With Duration', 'value', '{ "type" : "numeric", "duration" : true }'::json ,'argument','', 'operators', operators);
    ELSE
     select coalesce((SELECT sum("amountPaid") FROM "order"."order" WHERE "created_at" > startdate AND "created_at" <  enddate), 0)  INTO orderRevenue;
          RETURN json_build_object('value',orderRevenue,'valueType','numeric','argument','');
    END IF;
END;
$$;
CREATE FUNCTION rules."urlVisitedFunc"(params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    operators text[] := ARRAY['contains', 'doesNotContain', 'equal', 'notEqual', 'in'];
BEGIN
    IF (params->>'read')::boolean = true THEN
        RETURN jsonb_build_object('id', 'urlVisited', 'fact', 'urlVisited', 'title', 'Visited Url', 'value', '{ "type" : "text" }'::json,'argument','', 'operators', operators);
    ELSE
        RETURN jsonb_build_object('value', (params->>'urlVisited')::text, 'valueType','text','argument','');
    END IF;
END;
$$;
CREATE FUNCTION rules.urlisited(fact rules.facts, params jsonb) RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    result jsonb;
BEGIN
  SELECT rules."urlVisitedFunc"(params) INTO result;
  RETURN result;
END;
$$;
CREATE FUNCTION rules."writeParamsLogs"(params jsonb) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
        Insert into public.test2 (params, value) values (params, 1);
        return null;
END;
$$;
CREATE FUNCTION safety.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION segmentation.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION settings.define_owner_role() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
role_Id int;
BEGIN
    IF NEW."isOwner" = true AND NEW."keycloakId" is not null THEN
    select "id" into role_Id from "settings"."role" where "title" = 'admin';
    insert into "settings"."user_role" ("userId", "roleId") values (
    NEW."keycloakId", role_Id
    );
    END IF;
    RETURN NULL;
END;
$$;
CREATE TABLE settings."operationConfig" (
    id integer DEFAULT public.defaultid('settings'::text, 'operationConfig'::text, 'id'::text) NOT NULL,
    "stationId" integer,
    "labelTemplateId" integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "packagingId" integer
);
CREATE FUNCTION settings."operationConfigName"(opconfig settings."operationConfig") RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    station text;
    template text;
BEGIN
    SELECT name FROM "deviceHub"."labelTemplate" WHERE id = opConfig."labelTemplateId" INTO template;
    SELECT name FROM settings."station" WHERE id = opConfig."stationId" INTO station;
    RETURN station || ' - ' || template;
END;
$$;
CREATE FUNCTION settings.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION "simpleRecipe"."createRecipeYieldSachetRecord"(yieldid integer, sachetid integer, isvisible boolean, slipname text, ingprocessingid integer, simplerecipeid integer) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO "simpleRecipe"."simpleRecipeYield_ingredientSachet"("recipeYieldId", "ingredientSachetId", "isVisible", "slipName", "simpleRecipeIngredientProcessingId", "simpleRecipeId")
    VALUES(yieldId, sachetId, isVisible, slipName, ingProcessingId, simpleRecipeId);
END;
$$;
CREATE FUNCTION "simpleRecipe"."deriveIngredientSachets"(sourceyieldid integer, targetyieldid integer) RETURNS SETOF public.response
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    scaleBy numeric;
    rec record;
    sourceIngredientProcessingRecord record;
    targetYieldSachetRecord record;
    sourceSachet record;
    targetSachet record;
    targetSachetId int;
    message text := 'Sachet generation skipped!';
BEGIN
    -- calc scale
    SELECT (SELECT (yield->>'serving')::numeric FROM "simpleRecipe"."simpleRecipeYield" WHERE id = targetYieldId) / (SELECT (yield->>'serving')::numeric FROM "simpleRecipe"."simpleRecipeYield" WHERE id = sourceYieldId) INTO scaleBy;
    -- loop over all the sachets linked in source yield
    FOR rec IN SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = sourceYieldId AND "isArchived" = false LOOP
        SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "simpleRecipeIngredientProcessingId" = rec."simpleRecipeIngredientProcessingId" AND "recipeYieldId" = targetYieldId INTO targetYieldSachetRecord;
        -- check if sachet already linked in target
        IF targetYieldSachetRecord IS NULL THEN
            -- SELECT * FROM "simpleRecipe"."simpleRecipe_ingredient_processing" WHERE id = rec."simpleRecipeIngredientProcessingId" INTO  sourceIngredientProcessingRecord;
            message := 'Target found!';
            -- fetch source sachet
            SELECT * FROM "ingredient"."ingredientSachet" WHERE id = rec."ingredientSachetId" INTO sourceSachet;
            message := 'Source: ' || (sourceSachet.id)::text;
            -- IF sourceSachet IS NOT NULL THEN
            message := 'Source Inside: ' || (sourceSachet.id)::text;
                -- look for scaled sachet
                SELECT * FROM "ingredient"."ingredientSachet" WHERE quantity = (sourceSachet.quantity * scaleBy)::numeric AND unit = sourceSachet.unit AND "ingredientProcessingId" = sourceSachet."ingredientProcessingId" INTO targetSachet;
                message := 'Target: ' || (targetSachet.id)::text;
                IF targetSachet IS NULL THEN
                    SELECT "ingredient"."createSachet"((sourceSachet.quantity * scaleBy)::numeric, sourceSachet.unit, sourceSachet."ingredientProcessingId", sourceSachet."ingredientId", sourceSachet."tracking", true) INTO targetSachetId; 
                ELSE
                    targetSachetId := targetSachet.id;
                END IF;
                -- create link record
                PERFORM "simpleRecipe"."createRecipeYieldSachetRecord"(targetYieldId, targetSachetId, rec."isVisible", rec."slipName", rec."simpleRecipeIngredientProcessingId", rec."simpleRecipeId");
                message := 'Sachets generated!';
            -- END IF;
        END IF;
    END LOOP;
    RETURN QUERY SELECT true AS success, message AS message;
END;
$$;
CREATE FUNCTION "simpleRecipe"."getRecipeRichResult"(recipe "simpleRecipe"."simpleRecipe") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    res jsonb := '{ "@context": "https://schema.org/", "@type": "Recipe" }';
    yield record;
    sachet record;
    ingredients text[];
    steps jsonb[];
    proc jsonb;
    step jsonb;
BEGIN
    res := res || jsonb_build_object('name', recipe.name, 'image', COALESCE(recipe.image, ''), 'keywords', recipe.name, 'recipeCuisine', recipe.cuisine);
    IF recipe.description IS NOT NULL THEN
        res := res || jsonb_build_object('description', recipe.description);
    END IF;
    IF recipe.author IS NOT NULL THEN
        res := res || jsonb_build_object('author', jsonb_build_object('@type', 'Person', 'name', recipe.author));
    END IF;
    IF recipe."cookingTime" IS NOT NULL THEN
        res := res || jsonb_build_object('cookTime', 'PT' || recipe."cookingTime" || 'M');
    END IF;
    IF recipe."showIngredients" = true THEN
        SELECT * FROM "simpleRecipe"."simpleRecipeYield" WHERE "simpleRecipeId" = recipe.id ORDER BY yield DESC LIMIT 1 INTO yield; 
        IF yield IS NOT NULL THEN
            res := res || jsonb_build_object('recipeYield', yield.yield->>'serving');
            FOR sachet IN SELECT * FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = yield.id LOOP
                SELECT array_append(ingredients, sachet."slipName") INTO ingredients;
            END LOOP;
            res := res || jsonb_build_object('recipeIngredient', ingredients);
        END IF;
    END IF;
    IF recipe."showProcedures" = true AND recipe."procedures" IS NOT NULL THEN
        FOR proc IN SELECT * FROM jsonb_array_elements(recipe."procedures") LOOP
            FOR step IN SELECT * FROM jsonb_array_elements(proc->'steps') LOOP
                SELECT array_append(steps, jsonb_build_object('@type', 'HowToStep', 'name', step->>'title', 'text', step->>'description', 'image', step->'assets'->'images'->0->>'url')) INTO steps;
            END LOOP;
        END LOOP;
        res := res || jsonb_build_object('recipeInstructions', steps);
    END IF;
    return res;
END;
$$;
CREATE TABLE "simpleRecipe"."simpleRecipeYield" (
    id integer DEFAULT public.defaultid('simpleRecipe'::text, 'simpleRecipeYield'::text, 'id'::text) NOT NULL,
    "simpleRecipeId" integer NOT NULL,
    yield jsonb NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    quantity numeric,
    unit text,
    serving numeric,
    "baseYieldId" integer,
    "nutritionId" integer,
    "nutritionSetting" text DEFAULT 'auto'::text,
    "userDefinedNutritionInfo" jsonb,
    label text
);
CREATE FUNCTION "simpleRecipe"."isUserDefinedNutritionInfo"(yield "simpleRecipe"."simpleRecipeYield") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
IF yield."userDefinedNutritionInfo" is not null then
return true;
else return false;
end if;
END
$$;
CREATE FUNCTION "simpleRecipe".issimplerecipevalid(recipe "simpleRecipe"."simpleRecipe") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    ingredientsCount int;
    instructionSetsCount int;
BEGIN
    SELECT count(*) FROM "simpleRecipe"."simpleRecipe_ingredient_processing" WHERE "simpleRecipeId" = recipe.id AND "isArchived" = false INTO ingredientsCount;
    SELECT count(*) FROM "instructions"."instructionSet" WHERE "simpleRecipeId" = recipe.id INTO instructionSetsCount;
    IF recipe.utensils IS NULL OR jsonb_array_length(recipe.utensils) = 0
        THEN return json_build_object('status', false, 'error', 'Recipe should have untensils associated!');
    ELSEIF ingredientsCount = 0
        THEN return json_build_object('status', false, 'error', 'Recipe should have ingredients!');
    ELSEIF instructionSetsCount = 0
        THEN return json_build_object('status', false, 'error', 'Recipe should have cooking steps!');
    ELSEIF recipe.assets IS NULL OR JSONB_ARRAY_LENGTH(recipe.assets->'images') = 0
        THEN return json_build_object('status', false, 'error', 'At least one image should be provided!');
    ELSE
        return json_build_object('status', true, 'error', '');
    END IF;
END
$$;
CREATE FUNCTION "simpleRecipe"."setSimpleRecipeYieldColumns"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    serving numeric := NEW."yield"->>'serving';
    label text := NEW."yield"->>'label';
    jsonunit text :=  NEW."yield"->'quantity'->>'unit';
    quantity numeric :=  NEW."yield"->'quantity'->>'value';
BEGIN
    -- SELECT NEW."yield"->>'serving'::numeric INTO serving;
    IF serving is not NULL THEN
    NEW."serving" := serving;
    END IF;
    IF label is not NULL THEN
    NEW."label" := label;
    END IF;
    IF (jsonunit is not NULL) 
    AND (quantity is not NULL) 
    THEN
    IF (SELECT COUNT("name") FROM "master"."unit" WHERE "name" = jsonunit) = 0 THEN
    INSERT INTO "master"."unit" ("name") VALUES (jsonunit);
    END IF;
    NEW."unit" := jsonunit;
    NEW."quantity" := quantity;
    END IF;
    RETURN NEW;
END;
$$;
CREATE FUNCTION "simpleRecipe".set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION "simpleRecipe"."updateSimpleRecipeYield_ingredientSachet"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
   update "simpleRecipe"."simpleRecipeYield_ingredientSachet"
   SET "simpleRecipeId" = (select "simpleRecipeId" from "simpleRecipe"."simpleRecipeYield" where id = NEW."recipeYieldId");
    RETURN NULL;
END;
$$;
CREATE FUNCTION "simpleRecipe"."yieldAllergens"(yield "simpleRecipe"."simpleRecipeYield") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    arr jsonb;
    temp jsonb;
    data jsonb := '[]';
    mode record;
BEGIN
    FOR mode IN SELECT * FROM ingredient."modeOfFulfillment" WHERE "ingredientSachetId" = ANY(SELECT "ingredientSachetId" FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = yield.id) LOOP
        IF mode."bulkItemId" IS NOT NULL THEN
            SELECT allergens FROM inventory."bulkItem" WHERE id = mode."bulkItemId" INTO arr;
            FOR temp IN SELECT * FROM jsonb_array_elements(arr) LOOP
                data := data || temp;
            END LOOP;
        ELSIF mode."sachetItemId" IS NOT NULL THEN
            SELECT allergens FROM inventory."bulkItem" WHERE id = (SELECT "bulkItemId" FROM inventory."sachetItem" WHERE id = mode."sachetItemId") INTO arr;
            FOR temp IN SELECT * FROM jsonb_array_elements(arr) LOOP
                data := data || temp;
            END LOOP;
        ELSE
            CONTINUE;
        END IF;
    END LOOP;
    RETURN data;
END;
$$;
CREATE FUNCTION "simpleRecipe"."yieldCost"(yield "simpleRecipe"."simpleRecipeYield") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    bridge record;
    cost numeric;
    finalCost numeric := 0;
BEGIN
    FOR bridge IN SELECT "ingredientSachetId" FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = yield.id LOOP
        SELECT ingredient."sachetCost"(bridge."ingredientSachetId") into cost;
        IF cost IS NOT NULL
            THEN finalCost = finalCost + cost;
        END IF;
    END LOOP;
    RETURN finalCost;
END
$$;
CREATE FUNCTION "simpleRecipe"."yieldNutritionalInfo"(yield "simpleRecipe"."simpleRecipeYield") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    bridge record;
    info jsonb;
    infoArr jsonb[];
    finalInfo jsonb ;
    excludedIngredients text[] [];
BEGIN
IF yield."userDefinedNutritionInfo" is not null then return yield."userDefinedNutritionInfo";
else
    FOR bridge IN SELECT "ingredientSachetId" FROM "simpleRecipe"."simpleRecipeYield_ingredientSachet" WHERE "recipeYieldId" = yield.id and "isArchived" = false LOOP
        SELECT ingredient."sachetNutritionalInfo"(bridge."ingredientSachetId") into info;
        IF info IS NOT NULL
            THEN SELECT jsonb_build_object(
                        'iron', COALESCE((coalesce(CAST(finalInfo->>'iron'AS decimal),0) + CAST(info->>'iron' AS decimal)), 0),
                        'sodium', COALESCE((coalesce(CAST(finalInfo->>'sodium' AS decimal),0) + CAST(info->>'sodium' AS decimal)), 0),
                        'sugars', COALESCE((coalesce(CAST(finalInfo->>'sugars' AS decimal),0) + CAST(info->>'sugars' AS decimal)), 0),
                        'calcium', COALESCE((coalesce(CAST(finalInfo->>'calcium' AS decimal),0) + CAST(info->>'calcium' AS decimal)), 0),
                        'protein', COALESCE((coalesce(CAST(finalInfo->>'protein' AS decimal),0) + CAST(info->>'protein' AS decimal)), 0),
                        'calories', COALESCE((coalesce(CAST(finalInfo->>'calories' AS decimal),0) + CAST(info->>'calories' AS decimal)), 0),
                        'totalFat', COALESCE((coalesce(CAST(finalInfo->>'totalFat' AS decimal),0) + CAST(info->>'totalFat' AS decimal)), 0),
                        'transFat', COALESCE((coalesce(CAST(finalInfo->>'transFat' AS decimal),0) + CAST(info->>'transFat' AS decimal)), 0),
                        'vitaminA', COALESCE((coalesce(CAST(finalInfo->>'vitaminA' AS decimal),0) + CAST(info->>'vitaminA' AS decimal)), 0),
                        'vitaminC', COALESCE((coalesce(CAST(finalInfo->>'vitaminC' AS decimal),0) + CAST(info->>'vitaminC' AS decimal)), 0),
                        'cholesterol', COALESCE((coalesce(CAST(finalInfo->>'cholesterol' AS decimal),0) + CAST(info->>'cholesterol' AS decimal)), 0),
                        'dietaryFibre', COALESCE((coalesce(CAST(finalInfo->>'dietaryFibre' AS decimal),0) + CAST(info->>'dietaryFibre' AS decimal)), 0),
                        'saturatedFat', COALESCE((coalesce(CAST(finalInfo->>'saturatedFat' AS decimal),0) + CAST(info->>'saturatedFat' AS decimal)), 0),
                        'totalCarbohydrates', COALESCE((coalesce(CAST(finalInfo->>'totalCarbohydrates' AS decimal),0) + CAST(info->>'totalCarbohydrates' AS decimal)), 0),
                        'allergens', array_distinct(array(select jsonb_array_elements_text(((coalesce((finalInfo->'allergens'), '[]') || coalesce((info->'allergens'), '[]')))) ), true),
                        'excludes', ((coalesce((finalInfo->'excludes'), '[]') || coalesce((info->'excludes'), '[]')))
                    ) into finalInfo;
        ELSE
        SELECT array_distinct(((
        concat(
         (select "processingName" from "ingredient"."ingredientProcessing" 
        where id = 
        (select "ingredientProcessingId" from "ingredient"."ingredientSachet" 
        where id = bridge."ingredientSachetId")), '-',
        (select "name" from "ingredient"."ingredient" 
        where id = 
        (select "ingredientId" from "ingredient"."ingredientSachet" 
        where id = bridge."ingredientSachetId")),
        '-',
        (select concat (round("quantity", 2), ' ',  "unit") from "ingredient"."ingredientSachet" 
        where id = bridge."ingredientSachetId")
        )
        ) || excludedIngredients), true) into excludedIngredients;
        END IF;
    END LOOP;
    select finalInfo || jsonb_build_object('excludes', array_distinct(array(select jsonb_array_elements_text((finalInfo->'excludes' || to_jsonb(excludedIngredients)))), true), 'per', coalesce(yield."yield"->>'label', yield."yield"->>'serving') ) into finalInfo;
    RETURN 
    finalInfo;
END IF;
END
$$;
CREATE FUNCTION "simpleRecipe"."yieldNutritionalInfoIsSync"(yield "simpleRecipe"."simpleRecipeYield") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
CFNI jsonb;
RNI record;
BEGIN
select "simpleRecipe"."yieldNutritionalInfo"(yield) into CFNI;
select * from "products"."nutritionInfo" where id = yield."nutritionId" into RNI;
IF (CFNI->'calories')::numeric != RNI."calories" OR RNI."calories" is null
then return false;
ELSIF 
(CFNI->>'iron')::numeric != RNI."iron" OR RNI."iron" is null
then return false;
ELSIF 
(CFNI->>'sodium')::numeric != RNI."sodium" OR RNI."sodium" is null
then return false;
ELSIF 
(CFNI->>'sugars')::numeric != RNI."sugars" OR RNI."sugars" is null
then return false;
ELSIF 
(CFNI->>'calcium')::numeric != RNI."calcium" OR RNI."calcium" is null
then return false;
ELSIF 
(CFNI->>'protein')::numeric != RNI."protein" OR RNI."protein" is null
then return false;
ELSIF 
(CFNI->>'totalFat')::numeric != RNI."totalFat" OR RNI."totalFat" is null
then return false;
ELSIF 
(CFNI->>'transFat')::numeric != RNI."transFat" OR RNI."transFat" is null
then return false;
ELSIF 
(CFNI->>'vitaminA')::numeric != RNI."vitaminA" OR RNI."vitaminA" is null
then return false;
ELSIF 
(CFNI->>'vitaminC')::numeric != RNI."vitaminC" OR RNI."vitaminC" is null
then return false;
ELSIF 
(CFNI->>'cholesterol')::numeric != RNI."cholesterol" OR RNI."cholesterol" is null
then return false;
ELSIF 
(CFNI->>'dietaryFibre')::numeric != RNI."dietaryFibre" OR RNI."dietaryFibre" is null
then return false;
ELSIF 
(CFNI->>'saturatedFat')::numeric != RNI."saturatedFat" OR RNI."saturatedFat" is null
then return false;
ELSIF 
(CFNI->>'totalCarbohydrates')::numeric != RNI."totalCarbohydrates" OR RNI."totalCarbohydrates" is null
then return false;
ELSIF 
(CFNI->>'excludes')::jsonb != RNI."excludes"
then return false;
ELSIF 
(CFNI->>'allergens')::jsonb != RNI."allergens"
then return false;
ELSIF 
(CFNI->>'per')::text != RNI."per" OR RNI."per" is null
then return false;
else return true;
END IF;
return true;
END
$$;
CREATE FUNCTION sqldemo."demoItemDiscountTotal"() RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
discountTotal int;
BEGIN
RETURN 1;
END;
$$;
CREATE FUNCTION sqldemo."handle_bookPrice_discount_validation"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
IF NEW."discountType" = 'PERCENTAGE' THEN
IF NEW."discount" > 100 then
raise exception 'Discount can not be greater than 100';
END IF;
ELSIF NEW."discountType" = 'FIXED' THEN
IF NEW."bookPrice" < NEW."discount" then
raise exception 'Discount can not be greater than bookPrice';
END IF;
END IF;
NEW."priceHistory" := NEW."priceHistory" || jsonb_build_object(now(), jsonb_build_object('oldBookPrice', OLD."bookPrice", 'oldDiscount', OLD."discount"));
RETURN NEW;
END
$$;
CREATE FUNCTION sqldemo.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION sqldemo."totalBookInventoryValue"(includediscount boolean) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
book "sqldemo"."book";
inventoryValue numeric := 0;
BEGIN
IF includeDiscount = false or includeDiscount is NULL THEN
FOR book in (select * from "sqldemo"."book") LOOP
inventoryValue := inventoryValue + coalesce((book."bookPrice"*book."inStock"),0);
END LOOP;
ELSIF includeDiscount = true then
FOR book in (select * from "sqldemo"."book") LOOP
IF book."discountType" = 'PERCENTAGE' then
inventoryValue := inventoryValue + coalesce(
((book."bookPrice"- (book."bookPrice"*coalesce(book."discount",0)/100))
*
book."inStock"
),0);
ELSIF  book."discountType" = 'FIXED' then
inventoryValue := inventoryValue + coalesce(
((book."bookPrice"- coalesce(book."discount",0))
*
book."inStock"
),0);
END IF;
END LOOP;
END IF;
RETURN round(inventoryValue,2);
END;
$$;
CREATE FUNCTION sqldemo."totalBookInventoryValueByAuthor"(includediscount boolean, authorid integer) RETURNS numeric
    LANGUAGE plpgsql
    AS $$
DECLARE
book "sqldemo"."book";
inventoryValue numeric := 0;
BEGIN
IF includeDiscount = false or includeDiscount is NULL THEN
FOR book in (select * from "sqldemo"."book" where "authorId" = authorId) LOOP
inventoryValue := inventoryValue + coalesce((book."bookPrice"*book."inStock"),0);
END LOOP;
ELSIF includeDiscount = true then
FOR book in (select * from "sqldemo"."book" where "authorId" = authorId) LOOP
IF book."discountType" = 'PERCENTAGE' then
inventoryValue := inventoryValue + coalesce(
((book."bookPrice"- (book."bookPrice"*coalesce(book."discount",0)/100))
*
book."inStock"
),0);
ELSIF  book."discountType" = 'FIXED' then
inventoryValue := inventoryValue + coalesce(
((book."bookPrice"- coalesce(book."discount",0))
*
book."inStock"
),0);
END IF;
END LOOP;
END IF;
RETURN round(inventoryValue,2);
END;
$$;
CREATE TABLE subscription."subscriptionOccurence_addOn" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionOccurence_addOn'::text, 'id'::text) NOT NULL,
    "subscriptionOccurenceId" integer,
    "unitPrice" numeric NOT NULL,
    "productCategory" text,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "isSingleSelect" boolean DEFAULT false NOT NULL,
    "subscriptionId" integer,
    "productOptionId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE FUNCTION subscription."addOnCartItem"(x subscription."subscriptionOccurence_addOn") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    item jsonb;
BEGIN
    SELECT products."productCartItemById"(x."productOptionId") INTO item;
    item:=item || jsonb_build_object('isAddOn', true);
    item:=item || jsonb_build_object('unitPrice', x."unitPrice");
    item:=item || jsonb_build_object('subscriptionOccurenceAddOnProductId', x.id);
    RETURN item;
END
$$;
CREATE FUNCTION subscription."assignWeekNumberToSubscriptionOccurence"("subscriptionOccurenceId" integer) RETURNS integer
    LANGUAGE plpgsql
    AS $$
DECLARE
    fulfillmentDate timestamp;
    now timestamp := now();
    datediff integer;
BEGIN
   select "fulfillmentDate" from subscription."subscriptionOccurence" where id = "subscriptionOccurenceId" into fulfillmentDate;
   select (fulfillmentDate::date - now::date)/7 into datediff;
    RETURN datediff;
END
$$;
CREATE TABLE subscription."subscriptionOccurence_customer" (
    "subscriptionOccurenceId" integer NOT NULL,
    "keycloakId" text NOT NULL,
    "cartId" integer,
    "isSkipped" boolean DEFAULT false NOT NULL,
    "isAuto" boolean,
    "brand_customerId" integer NOT NULL,
    "subscriptionId" integer,
    logs jsonb DEFAULT '[]'::jsonb,
    "isPaused" boolean,
    "lastUpdatedBy" jsonb DEFAULT '{}'::jsonb,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false
);
CREATE FUNCTION subscription."betweenPause"(record subscription."subscriptionOccurence_customer") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    pausePeriod jsonb;
    startDate timestamp;
    endDate timestamp;
    fulfillmentDate timestamp;
BEGIN
  SELECT "pausePeriod" FROM "crm"."brand_customer" WHERE id = record."brand_customerId" INTO pausePeriod;
  IF pausePeriod->'startDate' IS NULL THEN
    RETURN false;
  END IF;
  SELECT "fulfillmentDate" FROM subscription."subscriptionOccurence" WHERE id = record."subscriptionOccurenceId"  INTO fulfillmentDate;
  SELECT (pausePeriod->>'startDate')::timestamp INTO startDate;
  SELECT (pausePeriod->>'endDate')::timestamp INTO endDate;
  IF fulfillmentDate > startDate AND fulfillmentDate < endDate THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;
CREATE FUNCTION subscription."betweenPauseFunc"("subscriptionOccurenceId" integer, "brand_customerId" integer) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    pausePeriod jsonb;
    startDate timestamp;
    endDate timestamp;
    fulfillmentDate timestamp;
BEGIN
  SELECT "pausePeriod" FROM "crm"."brand_customer" WHERE id = "brand_customerId" INTO pausePeriod;
  IF pausePeriod->'startDate' IS NULL THEN
    RETURN false;
  END IF;
  SELECT "fulfillmentDate" FROM subscription."subscriptionOccurence" WHERE id = "subscriptionOccurenceId"  INTO fulfillmentDate;
  SELECT (pausePeriod->>'startDate')::timestamp INTO startDate;
  SELECT (pausePeriod->>'endDate')::timestamp INTO endDate;
  IF fulfillmentDate > startDate AND fulfillmentDate < endDate THEN
    RETURN true;
  END IF;
  RETURN false;
END;
$$;
CREATE TABLE subscription."subscriptionOccurence" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionOccurence'::text, 'id'::text) NOT NULL,
    "fulfillmentDate" date NOT NULL,
    "cutoffTimeStamp" timestamp without time zone NOT NULL,
    "subscriptionId" integer NOT NULL,
    "startTimeStamp" timestamp without time zone,
    assets jsonb,
    "subscriptionAutoSelectOption" text,
    "subscriptionItemCountId" integer,
    "subscriptionServingId" integer,
    "subscriptionTitleId" integer,
    logs jsonb DEFAULT '[]'::jsonb,
    settings jsonb DEFAULT '{"isAutoSelect": true, "isReminderEmail": true, "isManageOccurence": true}'::jsonb
);
COMMENT ON TABLE subscription."subscriptionOccurence" IS 'This shows the subscription occurence.';
CREATE FUNCTION subscription."calculateIsValid"(occurence subscription."subscriptionOccurence") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    currentTime timestamp;
    cutoffTime timestamp;
BEGIN
    SELECT NOW() into currentTime;
    SELECT occurence."cutoffTimeStamp" into cutoffTime;
RETURN
    currentTime < cutoffTime;
END
$$;
CREATE FUNCTION subscription."calculateIsVisible"(occurence subscription."subscriptionOccurence") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    currentTime timestamp;
    startTime timestamp;
BEGIN
    SELECT NOW() into currentTime ;
    SELECT occurence."startTimeStamp" into startTime;
RETURN
    currentTime > startTime;
END
$$;
CREATE TABLE subscription."subscriptionOccurence_product" (
    "subscriptionOccurenceId" integer,
    "addOnPrice" numeric DEFAULT 0,
    "addOnLabel" text,
    "productCategory" text,
    "isAvailable" boolean DEFAULT true,
    "isVisible" boolean DEFAULT true,
    "isSingleSelect" boolean DEFAULT true NOT NULL,
    "subscriptionId" integer,
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionOccurence_product'::text, 'id'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isAutoSelectable" boolean DEFAULT true NOT NULL,
    "productOptionId" integer NOT NULL,
    "modifierId" integer
);
CREATE FUNCTION subscription."cartItem"(x subscription."subscriptionOccurence_product") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    item jsonb;
    productType text;
    subscriptionId int;
    itemCountId int;
    itemCount int;
    itemCountPrice numeric;
    unitPrice numeric;
BEGIN
    IF x."subscriptionOccurenceId" IS NOT NULL THEN
        SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = x."subscriptionOccurenceId";
    ELSE 
        subscriptionId := x."subscriptionId";
    END IF;
    SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
    SELECT price, count INTO itemCountPrice, itemCount FROM subscription."subscriptionItemCount" WHERE id = itemCountId;
    SELECT products."productCartItemById"(x."productOptionId") INTO item;
    item:=item || jsonb_build_object('addOnLabel',x."addOnLabel", 'addOnPrice',x."addOnPrice");
    unitPrice := (itemCountPrice / itemCount) + COALESCE(x."addOnPrice", 0);
    item:=item || jsonb_build_object('isAddOn', false);
    item:=item || jsonb_build_object('unitPrice', unitPrice);
    item:=item || jsonb_build_object('subscriptionOccurenceProductId', x.id);
    RETURN item;
END
$$;
CREATE FUNCTION subscription."customerSubscriptionReport"(brand_customerid integer, status text) RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
   subscriptionId int;
   total int := 0;
BEGIN
    select "subscriptionId" from "crm"."brand_customer" where id = brand_customerId into subscriptionId;
    IF subscriptionId is NOT NULL then
    IF status = 'All' THEN
    select count(*) from subscription."subscriptionOccurence_customer" where "brand_customerId" = brand_customerId and "subscriptionId" = subscriptionId into total;
   ELSIF
   status = 'Skipped' THEN 
    select count(*) from subscription."subscriptionOccurence_customer" where "brand_customerId" = brand_customerId and "subscriptionId" = subscriptionId and "isSkipped" = true into total;
   END IF;
   END IF;
    return total;
END;
$$;
CREATE FUNCTION subscription."fetchSubscriptionTitle"(subscriptiontitleid integer) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
subtitle text;
BEGIN
 select "title" from "subscription"."subscriptionTitle" where id = subscriptionTitleId into subtitle;
 return subtitle;
END
$$;
CREATE FUNCTION subscription."handle_subscriptionOccurence_customer_event_logging"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    message text:=NULL;
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                NEW."brand_customerId",
                NEW."subscriptionOccurenceId",
                NEW."keycloakId",
                NEW."cartId",
                'Occurence Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Occurence customer has been created',
                    'fields', '{}'::json
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isSkipped" != NEW."isSkipped" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                NEW."brand_customerId",
                NEW."subscriptionOccurenceId",
                NEW."keycloakId",
                NEW."cartId",
                'Occurence Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN NEW."isSkipped" = true THEN 'Occurence customer has been skipped' ELSE 'Occurence customer has been un-skipped' END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                        'isSkipped', OLD."isSkipped",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                        'isSkipped', NEW."isSkipped",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isPaused" != NEW."isPaused" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                NEW."brand_customerId",
                NEW."subscriptionOccurenceId",
                NEW."keycloakId",
                NEW."cartId",
                'Occurence Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', (CASE WHEN NEW."isPaused" = true THEN 'Occurence customer has been paused' ELSE 'Occurence customer has been un-paused' END),
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                        'isPaused', OLD."isPaused",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                        'isPaused', NEW."isPaused",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'UPDATE' AND OLD."isArchived" != NEW."isArchived" THEN
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                NEW."brand_customerId",
                NEW."subscriptionOccurenceId",
                NEW."keycloakId",
                NEW."cartId",
                'Occurence Customer',
                NEW."lastUpdatedBy",
                jsonb_build_object(
                    'message', 'Subscription occurence has been archived.',
                    'fields', jsonb_build_object(
                        'old', jsonb_build_object(
                        'isArchived', OLD."isArchived",
                            'updated_at', OLD.updated_at
                        ),
                        'new', jsonb_build_object(
                        'isArchived', NEW."isArchived",
                            'updated_at', NEW.updated_at
                        )
                    )
                )
            );
    END IF;
    IF TG_OP = 'DELETE' THEN
        IF (SELECT "isSubscriber" FROM crm.brand_customer WHERE id = OLD."brand_customerId") = false THEN
            message:= 'Deleted occurence customer since customer is not a subscriber yet.';
        ELSIF (SELECT "isSubscriptionCancelled" FROM crm.brand_customer WHERE id = OLD."brand_customerId") THEN
            message:= 'Deleted occurence customer due to cancelled subscription';
        ELSIF (SELECT "subscriptionId" FROM crm.brand_customer WHERE id = OLD."brand_customerId") != (SELECT "subscriptionId" FROM subscription."subscriptionOccurence" WHERE id = OLD."subscriptionOccurenceId") THEN
            message:= 'Deleted occurence customer due to changed subscription plan.';
        END IF;
        INSERT INTO settings."activityLogs"
            ("brand_customerId","subscriptionOccurenceId", "keycloakId", "cartId", type, updated_by, log) 
            VALUES (
                OLD."brand_customerId",
                OLD."subscriptionOccurenceId",
                OLD."keycloakId",
                OLD."cartId",
                'Occurence Customer',
                OLD."lastUpdatedBy",
                jsonb_build_object(
                    'message', COALESCE(message, 'Occurence customer has been deleted.'),
                    'fields', '{}'::json
                )
            );
    END IF;
    RETURN NULL;
END;
$$;
CREATE FUNCTION subscription."isCartValid"(record subscription."subscriptionOccurence_customer") RETURNS jsonb
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionId int;
    itemCountId int;
    itemCount int;
    addedProductsCount int := 0;
    pendingProductsCount int := 0;
    result jsonb := '{}';
    betweenPause boolean;
BEGIN
    Select "subscription"."betweenPause"(record) into betweenPause;
    IF record."cartId" IS NULL THEN
        result := result || jsonb_build_object('hasCart', false);
    ELSIF record."cartId" IS NOT NULL THEN
        result := result || jsonb_build_object('hasCart', true);
    END IF;
    SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = record."subscriptionOccurenceId";
    SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
    SELECT count FROM subscription."subscriptionItemCount" WHERE id = itemCountId INTO itemCount;
    SELECT COALESCE(COUNT(*), 0) INTO addedProductsCount FROM "order"."cartItem" WHERE "cartId" = record."cartId" AND "isAddOn" = false AND "parentCartItemId" IS NULL;
    result := result || jsonb_build_object('addedProductsCount', addedProductsCount);
    pendingProductsCount := itemCount - addedProductsCount;
    result := result || jsonb_build_object('pendingProductsCount', pendingProductsCount);
    IF itemCount = addedProductsCount THEN
        result := result || jsonb_build_object('itemCountValid', true, 'itemCountValidComment', 'You' || '''' || 're all set!');
    ELSIF itemCount < addedProductsCount THEN
        result := result || jsonb_build_object('itemCountValid', false, 'itemCountValidComment', 'Your cart is overflowing!');
    ELSIF itemCount > addedProductsCount THEN
        result := result || jsonb_build_object('itemCountValid', false, 'itemCountValidComment', 'Add more products!');
    END IF;
    IF record."isSkipped" = true then
    result := result || jsonb_build_object('itemCountValidComment', 'This week is Skipped!');
    END IF;
     IF betweenPause = true then
    result := result || jsonb_build_object('itemCountValidComment', 'This week is Paused!');
    END IF;
    return result;
END;
$$;
CREATE FUNCTION subscription."isSubCartItemCountValidFunc"(subscriptionoccurenceid integer, cartid integer) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionId int;
    itemCountId int;
    itemCount int;
    addedProductsCount int := 0;
    pendingProductsCount int := 0;
    result jsonb := '{}';
BEGIN
    IF cartId IS NULL THEN
        return false;
    END IF;
    SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = subscriptionOccurenceId;
    SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
    SELECT count FROM subscription."subscriptionItemCount" WHERE id = itemCountId INTO itemCount;
    SELECT COALESCE(COUNT(*), 0) INTO addedProductsCount FROM "order"."cartItem" WHERE "cartItem"."cartId" = cartId AND "isAddOn" = false AND "parentCartItemId" IS NULL;
    result := result || jsonb_build_object('addedProductsCount', addedProductsCount);
    pendingProductsCount := itemCount - addedProductsCount;
    result := result || jsonb_build_object('pendingProductsCount', pendingProductsCount);
    IF itemCount = addedProductsCount THEN
       return true;
       END IF;
    return false;
END;
$$;
CREATE FUNCTION subscription."isSubscriptionCartItemCountValidFunc"("subscriptionOccurenceId" integer, "cartId" integer) RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    subscriptionId int;
    itemCountId int;
    itemCount int;
    addedProductsCount int := 0;
    pendingProductsCount int := 0;
    result jsonb := '{}';
BEGIN
    IF "cartId" IS NULL THEN
        return false;
    END IF;
    SELECT "subscriptionId" INTO subscriptionId FROM subscription."subscriptionOccurence" WHERE id = "subscriptionOccurenceId";
    SELECT "subscriptionItemCountId" INTO itemCountId FROM subscription.subscription WHERE id = subscriptionId;
    SELECT count FROM subscription."subscriptionItemCount" WHERE id = itemCountId INTO itemCount;
    SELECT COALESCE(COUNT(*), 0) INTO addedProductsCount FROM "order"."cartItem" WHERE "cartItem"."cartId" = "cartId" AND "isAddOn" = false AND "parentCartItemId" IS NULL;
    result := result || jsonb_build_object('addedProductsCount', addedProductsCount);
    pendingProductsCount := itemCount - addedProductsCount;
    result := result || jsonb_build_object('pendingProductsCount', pendingProductsCount);
    IF itemCount = addedProductsCount THEN
       return true;
       END IF;
    return false;
END;
$$;
CREATE TABLE subscription."subscriptionItemCount" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionItemCount'::text, 'id'::text) NOT NULL,
    "subscriptionServingId" integer NOT NULL,
    count integer NOT NULL,
    "metaDetails" jsonb,
    price numeric,
    "isActive" boolean DEFAULT false,
    tax numeric DEFAULT 0 NOT NULL,
    "isTaxIncluded" boolean DEFAULT false NOT NULL,
    "subscriptionTitleId" integer,
    "targetedProductSelectionRatio" integer DEFAULT 3,
    "isDemo" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE subscription."subscriptionItemCount" IS 'This table contains no of items available for a particular subscription.';
CREATE FUNCTION subscription."isSubscriptionItemCountValid"(itemcount subscription."subscriptionItemCount") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    count int;
BEGIN
    SELECT * FROM subscription.subscription where "subscriptionItemCountId" = itemCount.id LIMIT 1 into count;
    IF count > 0 THEN
        return true;
    ELSE
        return false;
    END IF;
END;
$$;
CREATE TABLE subscription."subscriptionServing" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionServing'::text, 'id'::text) NOT NULL,
    "subscriptionTitleId" integer NOT NULL,
    "servingSize" integer NOT NULL,
    "metaDetails" jsonb,
    "defaultSubscriptionItemCountId" integer,
    "isActive" boolean DEFAULT false NOT NULL,
    "isDemo" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE subscription."subscriptionServing" IS 'This shows the list of servings which is available for that subscription.';
CREATE FUNCTION subscription."isSubscriptionServingValid"(serving subscription."subscriptionServing") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    count int;
BEGIN
    SELECT * FROM subscription."subscriptionItemCount" where "subscriptionServingId" = serving.id AND "isActive" = true LIMIT 1 into count;
    IF count > 0 THEN
        return true;
    ELSE
        PERFORM subscription."toggleServingState"(serving.id, false);
        return false;
    END IF;
END;
$$;
CREATE TABLE subscription."subscriptionTitle" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionTitle'::text, 'id'::text) NOT NULL,
    title text NOT NULL,
    "metaDetails" jsonb,
    "defaultSubscriptionServingId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isActive" boolean DEFAULT false NOT NULL,
    "isDemo" boolean DEFAULT false NOT NULL
);
CREATE FUNCTION subscription."isSubscriptionTitleValid"(title subscription."subscriptionTitle") RETURNS boolean
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
    count int;
BEGIN
    SELECT * FROM subscription."subscriptionServing" where "subscriptionTitleId" = title.id AND "isActive" = true LIMIT 1 into count;
    IF count > 0 THEN
        return true;
    ELSE
        PERFORM subscription."toggleTitleState"(title.id, false);
        return false;
    END IF;
END;
$$;
CREATE FUNCTION subscription.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE FUNCTION subscription."subscriptionOccurenceWeekRank"(record subscription."subscriptionOccurence") RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
    RETURN "subscription"."assignWeekNumberToSubscriptionOccurence"(record.id);
END
$$;
CREATE FUNCTION subscription."toggleServingState"(servingid integer, state boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE subscription."subscriptionServing"
    SET "isActive" = state
    WHERE "id" = servingId;
END;
$$;
CREATE FUNCTION subscription."toggleTitleState"(titleid integer, state boolean) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE subscription."subscriptionTitle"
    SET "isActive" = state
    WHERE "id" = titleId;
END;
$$;
CREATE FUNCTION subscription."updateSubscription"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   UPDATE "subscription"."subscription"
SET "subscriptionTitleId" = (select "subscriptionTitleId" from "subscription"."subscriptionItemCount" where id = NEW."subscriptionItemCountId"),
"subscriptionServingId" = (select "subscriptionServingId" from "subscription"."subscriptionItemCount" where id = NEW."subscriptionItemCountId")
WHERE id = NEW.id;
    RETURN null;
END;
$$;
CREATE FUNCTION subscription."updateSubscriptionItemCount"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  UPDATE "subscription"."subscriptionItemCount"
SET "subscriptionTitleId" = (select "subscriptionTitleId" from "subscription"."subscriptionServing" where id = NEW."subscriptionServingId")
WHERE id = NEW.id;
    RETURN null;
END;
$$;
CREATE FUNCTION subscription."updateSubscriptionOccurence"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
BEGIN
   UPDATE "subscription"."subscriptionOccurence"
SET "subscriptionTitleId" = (select "subscriptionTitleId" from "subscription"."subscription" where id = NEW."subscriptionId"),
"subscriptionServingId" = (select "subscriptionServingId" from "subscription"."subscription" where id = NEW."subscriptionId"),
"subscriptionItemCountId" = (select "subscriptionItemCountId" from "subscription"."subscription" where id = NEW."subscriptionId")
WHERE id = NEW.id;
    RETURN null;
END;
$$;
CREATE FUNCTION subscription."updateSubscriptionOccurence_customer"() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    subs_id integer;
    _new record;
BEGIN
select "subscriptionId" INTO subs_id from "subscription"."subscriptionOccurence" where id = NEW."subscriptionOccurenceId";
    _new := NEW;
  _new."subscriptionId" = subs_id;
  RETURN _new;
END;
$$;
CREATE TABLE website."websitePage" (
    id integer DEFAULT public.defaultid('website'::text, 'websitePage'::text, 'id'::text) NOT NULL,
    "websiteId" integer NOT NULL,
    route text NOT NULL,
    "internalPageName" text NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "navigationMenuId" integer
);
COMMENT ON TABLE website."websitePage" IS 'website page contains all the information about brand.';
CREATE FUNCTION website."getValidNavigationMenu"(websitepage website."websitePage") RETURNS integer
    LANGUAGE plpgsql STABLE
    AS $$
DECLARE
BEGIN
return coalesce (websitePage."navigationMenuId", (select "navigationMenuId" from "website"."website" where id = websitePage."websiteId") );
END;
$$;
CREATE FUNCTION website.handlenavigationmenuitemfields() RETURNS trigger
    LANGUAGE plpgsql
    AS $$ DECLARE 
p record;
path text;
level int;
navigationMenuId int;
BEGIN
select 
  * into p 
from 
  "website"."navigationMenuItem" 
where 
  id = New."parentNavigationMenuItemId";
if NEW."parentNavigationMenuItemId" is null then
path := (New.Id):: text;
level := 1;
else path := (
  (
    (
      (p.path):: text || '->' :: text
    ) || New.id
  )
):: text;
level := (p.level + 1);
navigationMenuId := p."navigationMenuId";
NEW."navigationMenuId" := navigationMenuId;
end if;
NEW."level" := level;
NEW."path" := path;
RETURN NEW;
END;
$$;
CREATE FUNCTION website.set_current_timestamp_updated_at() RETURNS trigger
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
CREATE OPERATOR public.< (
    FUNCTION = _rrule.rruleset_array_has_before_timestamp,
    LEFTARG = _rrule.rruleset[],
    RIGHTARG = timestamp without time zone
);
CREATE OPERATOR public.< (
    FUNCTION = _rrule.rruleset_has_before_timestamp,
    LEFTARG = _rrule.rruleset,
    RIGHTARG = timestamp without time zone
);
CREATE OPERATOR public.<> (
    FUNCTION = _rrule.compare_not_equal,
    LEFTARG = _rrule.rrule,
    RIGHTARG = _rrule.rrule,
    COMMUTATOR = OPERATOR(public.<>),
    NEGATOR = OPERATOR(public.=)
);
CREATE OPERATOR public.<@ (
    FUNCTION = _rrule.contained_by,
    LEFTARG = _rrule.rrule,
    RIGHTARG = _rrule.rrule,
    COMMUTATOR = OPERATOR(public.@>)
);
CREATE OPERATOR public.= (
    FUNCTION = _rrule.compare_equal,
    LEFTARG = _rrule.rrule,
    RIGHTARG = _rrule.rrule,
    COMMUTATOR = OPERATOR(public.=),
    NEGATOR = OPERATOR(public.<>)
);
CREATE OPERATOR public.> (
    FUNCTION = _rrule.rruleset_array_has_after_timestamp,
    LEFTARG = _rrule.rruleset[],
    RIGHTARG = timestamp without time zone
);
CREATE OPERATOR public.> (
    FUNCTION = _rrule.rruleset_has_after_timestamp,
    LEFTARG = _rrule.rruleset,
    RIGHTARG = timestamp without time zone
);
CREATE OPERATOR public.@> (
    FUNCTION = _rrule.contains,
    LEFTARG = _rrule.rrule,
    RIGHTARG = _rrule.rrule,
    COMMUTATOR = OPERATOR(public.<@)
);
CREATE OPERATOR public.@> (
    FUNCTION = _rrule.contains_timestamp,
    LEFTARG = _rrule.rruleset,
    RIGHTARG = timestamp without time zone
);
CREATE OPERATOR public.@> (
    FUNCTION = _rrule.rruleset_array_contains_timestamp,
    LEFTARG = _rrule.rruleset[],
    RIGHTARG = timestamp without time zone
);
CREATE CAST (jsonb AS _rrule.rrule) WITH FUNCTION _rrule.jsonb_to_rrule(jsonb) AS IMPLICIT;
CREATE CAST (jsonb AS _rrule.rruleset) WITH FUNCTION _rrule.jsonb_to_rruleset(jsonb) AS IMPLICIT;
CREATE CAST (_rrule.rrule AS jsonb) WITH FUNCTION _rrule.rrule_to_jsonb(_rrule.rrule) AS IMPLICIT;
CREATE CAST (text AS _rrule.rrule) WITH FUNCTION _rrule.rrule(text) AS IMPLICIT;
CREATE CAST (text AS _rrule.rruleset) WITH FUNCTION _rrule.rruleset(text) AS IMPLICIT;
CREATE CAST (timestamp without time zone AS _rrule.day) WITH FUNCTION _rrule.timestamp_to_day(timestamp without time zone) AS IMPLICIT;
CREATE TABLE aws.ses (
    id integer DEFAULT public.defaultid('aws'::text, 'ses'::text, 'id'::text) NOT NULL,
    domain text NOT NULL,
    "isVerified" boolean DEFAULT false NOT NULL,
    "txtRecord" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "keySelector" text,
    "privateKey" text,
    "publicKey" text,
    "dkimRecord" jsonb,
    "sslCertPrivateKey" text,
    "sslCertChain" text,
    "sslCertHash" text,
    "sslCert" text,
    "cnameRecords" jsonb,
    "isCnameVerified" boolean DEFAULT false NOT NULL,
    "isSslAdded" boolean DEFAULT false NOT NULL,
    "isNginxAdded" boolean DEFAULT false NOT NULL,
    "isDkimVerified" boolean DEFAULT false NOT NULL
);
CREATE SEQUENCE aws.ses_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE aws.ses_id_seq OWNED BY aws.ses.id;
CREATE TABLE brands."availableOrderInterface" (
    label text NOT NULL,
    "isLocationKioskIdMandatory" boolean,
    "isStaffUserIdMandatory" boolean
);
COMMENT ON TABLE brands."availableOrderInterface" IS 'This table contains all the available order interface(Kiosk, QR,Website,POS) in the instance.';
CREATE TABLE brands."availablePaymentOption" (
    label text NOT NULL
);
CREATE TABLE brands.brand (
    id integer DEFAULT public.defaultid('brands'::text, 'brand'::text, 'id'::text) NOT NULL,
    domain text,
    "isDefault" boolean DEFAULT false NOT NULL,
    title text,
    "isPublished" boolean DEFAULT true NOT NULL,
    "onDemandRequested" boolean DEFAULT false NOT NULL,
    "subscriptionRequested" boolean DEFAULT false NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL,
    "parseurMailBoxId" integer,
    "importHistoryId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "navigationMenuId" integer
);
COMMENT ON TABLE brands.brand IS 'This table contains all the brands available in this instance.';
COMMENT ON COLUMN brands.brand.id IS 'Unique id of brand';
COMMENT ON COLUMN brands.brand.domain IS 'Domain at which this particular brand would be operating at.';
COMMENT ON COLUMN brands.brand."isDefault" IS 'This brand would be chosen incase any url is entered that does not correspond to any other brand';
COMMENT ON COLUMN brands.brand.title IS 'This is the title of the brand for internal purpose.';
COMMENT ON COLUMN brands.brand."isPublished" IS 'Whether the brand is published or not';
COMMENT ON COLUMN brands.brand."onDemandRequested" IS 'If this brand would be operating an ondemand store. If false, then opening /store link would redirect.';
COMMENT ON COLUMN brands.brand."subscriptionRequested" IS 'If this brand would be operating an subscription store. If false, then opening /subscription link would redirect.';
COMMENT ON COLUMN brands.brand."isArchived" IS 'if True, means that this brand is no longer active and user attempted to delete it.';
COMMENT ON COLUMN brands.brand."parseurMailBoxId" IS 'This is for parseur mailbox functionality.';
CREATE TABLE brands."brandMenu" (
    id integer NOT NULL,
    label text
);
COMMENT ON TABLE brands."brandMenu" IS 'This table contains the menu of a partiular brand.';
CREATE TABLE brands."brandMenuCategory" (
    id integer NOT NULL,
    label text,
    "brandMenuId" integer,
    "parentBrandMenuCategoryId" integer
);
COMMENT ON TABLE brands."brandMenuCategory" IS 'It shows the Brand category which contains list of items.';
CREATE TABLE brands."brandPageModule" (
    id integer DEFAULT public.defaultid('brands'::text, 'navigationMenu'::text, 'id'::text) NOT NULL,
    "brandPageId" integer NOT NULL,
    config jsonb,
    "moduleType" text,
    "fileId" integer,
    "internalModuleIdentifier" text,
    "templateId" integer,
    "position" numeric,
    "visibilityConditionId" integer,
    name text,
    "isHidden" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE brands."brandPageModule" IS 'This table contains all the details of the particular brand.';
CREATE TABLE brands."brandPageSetting" (
    id integer NOT NULL,
    identifier text NOT NULL,
    type text NOT NULL,
    "displayName" text,
    description text,
    assets jsonb DEFAULT '{"icon": "", "cover": ""}'::jsonb NOT NULL,
    category text,
    "configTemplate" jsonb
);
COMMENT ON TABLE brands."brandPageSetting" IS 'Here, we can access all the settings of the brand.';
CREATE TABLE brands."brandPage_brandPageSetting" (
    "brandPageId" integer NOT NULL,
    "brandPageSettingId" integer NOT NULL,
    value jsonb NOT NULL
);
COMMENT ON TABLE brands."brandPage_brandPageSetting" IS 'Here, we can map settings with respective brands.';
CREATE TABLE brands."brandSetting" (
    id integer NOT NULL,
    identifier text NOT NULL,
    type text NOT NULL,
    "configTemplate" jsonb,
    "isDeleteProtected" boolean DEFAULT true NOT NULL,
    "isDynamicForm" boolean DEFAULT false
);
COMMENT ON TABLE brands."brandSetting" IS 'This lists all the available settings for brand.';
CREATE SEQUENCE brands."brandSetting_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."brandSetting_id_seq" OWNED BY brands."brandSetting".id;
CREATE TABLE brands."brand_brandSetting" (
    "brandId" integer NOT NULL,
    "brandSettingId" integer NOT NULL,
    value jsonb
);
CREATE SEQUENCE brands.brand_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands.brand_id_seq OWNED BY brands.brand.id;
CREATE TABLE brands.brand_location (
    "brandId" integer NOT NULL,
    "locationId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    id integer NOT NULL,
    "brandMenuId" integer,
    "orderExperienceId" integer,
    "doesDeliver" boolean DEFAULT true NOT NULL,
    "doesPickup" boolean DEFAULT true NOT NULL,
    "doesDinein" boolean DEFAULT true NOT NULL,
    "locationClusterId" integer,
    "doesDeliverOutsideCity" boolean DEFAULT false NOT NULL,
    "doesDeliverOutsideState" boolean DEFAULT false NOT NULL,
    "orderExperienceOptionType" text DEFAULT 'GLOBAL'::text NOT NULL
);
COMMENT ON TABLE brands.brand_location IS 'This table represents which brands are operating at which location.';
COMMENT ON COLUMN brands.brand_location."brandId" IS 'This is the ID of the Brand.';
COMMENT ON COLUMN brands.brand_location."locationId" IS 'This is the location ID of the organization.';
COMMENT ON COLUMN brands.brand_location."isActive" IS 'It represents the active status of this brand  on this particular location.';
COMMENT ON COLUMN brands.brand_location."locationClusterId" IS 'This ID references to location cluster table representing the location cluster of this particular location that it falls under.';
COMMENT ON COLUMN brands.brand_location."orderExperienceOptionType" IS 'Possible values GLOBAL or LOCATION';
CREATE TABLE brands."brand_location_orderExperienceOption" (
    "brand_locationId" integer NOT NULL,
    "orderExperienceOptionId" integer NOT NULL,
    "isActive" boolean,
    id integer NOT NULL
);
CREATE TABLE brands."brand_paymentPartnership" (
    "brandId" integer NOT NULL,
    "paymentPartnershipId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE brands."brand_paymentPartnership" IS 'This is a many to many table for maintaining the different payment options available for each brand.';
COMMENT ON COLUMN brands."brand_paymentPartnership"."brandId" IS 'Id of the brand from the brand table.';
COMMENT ON COLUMN brands."brand_paymentPartnership"."paymentPartnershipId" IS 'id of the paymentPartnership from the dailycloak database table of paymentPartnership. This id represents which payment company and what are payment conditions to be used.';
COMMENT ON COLUMN brands."brand_paymentPartnership"."isActive" IS 'Whether this payment partnership is active or not.';
CREATE TABLE brands."brand_storeSetting" (
    "brandId" integer NOT NULL,
    "storeSettingId" integer NOT NULL,
    value jsonb NOT NULL,
    "importHistoryId" integer
);
COMMENT ON TABLE brands."brand_storeSetting" IS 'This is a many to many table maintaining Ondemand Store setting for available brands.';
COMMENT ON COLUMN brands."brand_storeSetting"."brandId" IS 'This is the brand id from brand table.';
COMMENT ON COLUMN brands."brand_storeSetting"."storeSettingId" IS 'This is the id from the list of settings available for ondemand.';
COMMENT ON COLUMN brands."brand_storeSetting".value IS 'This is the value of the particular setting for the particular brand.';
CREATE TABLE brands."brand_subscriptionStoreSetting" (
    "brandId" integer NOT NULL,
    "subscriptionStoreSettingId" integer NOT NULL,
    value jsonb
);
COMMENT ON TABLE brands."brand_subscriptionStoreSetting" IS 'This table maintains list of settings for subscription store for brands.';
COMMENT ON COLUMN brands."brand_subscriptionStoreSetting"."brandId" IS 'This is the brand id from the brand table.';
COMMENT ON COLUMN brands."brand_subscriptionStoreSetting"."subscriptionStoreSettingId" IS 'This is the id from the list of settings available for subscription store.';
COMMENT ON COLUMN brands."brand_subscriptionStoreSetting".value IS 'This is the value of the particular setting for the particular brand.';
CREATE TABLE brands."jsCssFileLinks" (
    "htmlFileId" integer,
    "brandPageId" integer,
    "brandPageModuleId" integer,
    "brandId" integer,
    type text NOT NULL,
    "linkedFileId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    "position" integer,
    id integer NOT NULL
);
CREATE SEQUENCE brands."jsCssFileLinks_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."jsCssFileLinks_id_seq" OWNED BY brands."jsCssFileLinks".id;
CREATE TABLE brands.location (
    id integer DEFAULT public.defaultid('brands'::text, 'location'::text, 'id'::text) NOT NULL,
    label text,
    "locationAddress" jsonb NOT NULL,
    zipcode text,
    city text,
    country text,
    state text,
    lat text,
    lng text
);
COMMENT ON TABLE brands.location IS 'Location is an individual unique physical space of an organization. ';
COMMENT ON COLUMN brands.location.id IS 'This is the Unique ID of each Location.';
COMMENT ON COLUMN brands.location.label IS 'Name of location for internal purpose.';
COMMENT ON COLUMN brands.location."locationAddress" IS 'This is the location address containing latitude and longitude.';
CREATE TABLE brands."locationCluster" (
    id integer NOT NULL,
    label text NOT NULL,
    "parentLocationClusterId" integer
);
COMMENT ON TABLE brands."locationCluster" IS 'Location cluster is simply a way to organize locations into a downward tree hierarchy.';
COMMENT ON COLUMN brands."locationCluster".id IS 'This is the ID of location cluster.';
COMMENT ON COLUMN brands."locationCluster".label IS 'Name of location cluster.';
COMMENT ON COLUMN brands."locationCluster"."parentLocationClusterId" IS 'This ID references to the same table and represents the parent Location cluster of  this location cluster. This means this location cluster falls under the parent location cluster and thus acts as child of it.';
CREATE TABLE brands."locationKiosk" (
    id integer NOT NULL,
    "internalLocationKioskLabel" text NOT NULL,
    "isActive" boolean NOT NULL,
    "locationId" integer NOT NULL,
    "accessUrl" text,
    "accessPassword" text,
    "kioskModuleConfig" jsonb
);
COMMENT ON TABLE brands."locationKiosk" IS 'Location Kiosk is simply a way to organize Kiosk locations into a downward tree hierarchy';
CREATE SEQUENCE brands."locationKiosk_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."locationKiosk_id_seq" OWNED BY brands."locationKiosk".id;
CREATE TABLE brands."locationTable" (
    id integer NOT NULL,
    "internalTableLabel" text NOT NULL,
    "seatCover" integer NOT NULL,
    "locationId" integer NOT NULL,
    "isActive" boolean DEFAULT true
);
COMMENT ON TABLE brands."locationTable" IS 'This shows the location of the restaurant table.';
CREATE SEQUENCE brands."locationTable_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."locationTable_id_seq" OWNED BY brands."locationTable".id;
CREATE SEQUENCE brands.location_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands.location_id_seq OWNED BY brands.location.id;
CREATE TABLE brands."navigationMenu" (
    id integer DEFAULT public.defaultid('brands'::text, 'navigationMenu'::text, 'id'::text) NOT NULL,
    title text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE brands."navigationMenu" IS 'This table contains the status of the menu.';
CREATE TABLE brands."navigationMenuItem" (
    id integer DEFAULT public.defaultid('website'::text, 'navigationMenuItem'::text, 'id'::text) NOT NULL,
    label text NOT NULL,
    "navigationMenuId" integer,
    "parentNavigationMenuItemId" integer,
    url text,
    "position" numeric,
    "openInNewTab" boolean DEFAULT false NOT NULL,
    "actionId" integer,
    level integer,
    path text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE brands."navigationMenuItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."navigationMenuItem_id_seq" OWNED BY brands."navigationMenuItem".id;
CREATE SEQUENCE brands."navigationMenu_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."navigationMenu_id_seq" OWNED BY brands."navigationMenu".id;
CREATE TABLE brands."orderTab" (
    id integer NOT NULL,
    label text NOT NULL,
    "availableOrderInterfaceLabel" text NOT NULL,
    "orderFulfillmentTypeLabel" text NOT NULL,
    "brandId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "orderType" text
);
COMMENT ON TABLE brands."orderTab" IS 'This table contains type of order(Take Away,Delivery)from the available order interface.';
CREATE SEQUENCE brands."orderExperienceOption_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."orderExperienceOption_id_seq" OWNED BY brands."orderTab".id;
CREATE TABLE brands."orderType" (
    label text NOT NULL
);
COMMENT ON TABLE brands."orderType" IS 'This table shows the type of order.';
CREATE TABLE brands."pagesLinkedFiles" (
    id integer NOT NULL,
    "pageId" integer NOT NULL,
    "fileId" integer NOT NULL,
    "fileType" text NOT NULL,
    "position" integer
);
COMMENT ON TABLE brands."pagesLinkedFiles" IS 'This table will list all the CSS and JS file linked on page level';
CREATE SEQUENCE brands."pagesLinkedFiles_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."pagesLinkedFiles_id_seq" OWNED BY brands."pagesLinkedFiles".id;
CREATE TABLE brands."storeSetting" (
    id integer DEFAULT public.defaultid('brands'::text, 'storeSetting'::text, 'id'::text) NOT NULL,
    identifier text NOT NULL,
    value jsonb,
    type text
);
COMMENT ON TABLE brands."storeSetting" IS 'This lists all the available settings for ondemand store.';
COMMENT ON COLUMN brands."storeSetting".id IS 'This is autogenerated id of the setting representation available for ondemand.';
COMMENT ON COLUMN brands."storeSetting".identifier IS 'This is a unique identifier of the individual setting type.';
COMMENT ON COLUMN brands."storeSetting".value IS 'This is a jsonb data type storing default value for the setting. If no brand specific setting is available, then this setting value would be used.';
COMMENT ON COLUMN brands."storeSetting".type IS 'Type of setting to segment or categorize according to different use-cases.';
CREATE SEQUENCE brands."storeSetting_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE brands."storeSetting_id_seq" OWNED BY brands."storeSetting".id;
CREATE TABLE brands."subscriptionStoreSetting" (
    id integer DEFAULT public.defaultid('brands'::text, 'storeSetting'::text, 'id'::text) NOT NULL,
    identifier text NOT NULL,
    value jsonb,
    type text
);
COMMENT ON TABLE brands."subscriptionStoreSetting" IS 'This lists all the available settings for ondemand store.';
COMMENT ON COLUMN brands."subscriptionStoreSetting".id IS 'This is autogenerated id of the setting representation available for subscripton.';
COMMENT ON COLUMN brands."subscriptionStoreSetting".identifier IS 'This is a unique identifier of the individual setting type.';
COMMENT ON COLUMN brands."subscriptionStoreSetting".value IS 'This is a jsonb data type storing default value for the setting. If no brand specific setting is available, then this setting value would be used.';
COMMENT ON COLUMN brands."subscriptionStoreSetting".type IS 'Type of setting to segment or categorize according to different use-cases.';
CREATE TABLE brands."systemModule" (
    identifier text NOT NULL,
    description text,
    "configTemplate" jsonb
);
COMMENT ON TABLE brands."systemModule" IS 'This is for listing all the system defined component. (eg. Plans, Register)';
CREATE TABLE content."experienceDivId" (
    id text NOT NULL,
    "brandPageId" integer NOT NULL,
    "experienceId" integer,
    "expertId" integer,
    "experienceCategoryTitle" text
);
CREATE TABLE content.identifier (
    title text NOT NULL,
    "pageTitle" text NOT NULL
);
CREATE TABLE content.page (
    title text NOT NULL,
    description text
);
COMMENT ON TABLE content.page IS 'This shows the Home page of the website.';
CREATE TABLE content."subscriptionDivIds" (
    id text NOT NULL,
    "fileId" integer
);
COMMENT ON TABLE content."subscriptionDivIds" IS 'This table contains subscripton plan and menu details.';
CREATE TABLE content.template (
    id uuid NOT NULL
);
CREATE TABLE crm.brand_campaign (
    "brandId" integer NOT NULL,
    "campaignId" integer NOT NULL,
    "isActive" boolean DEFAULT true
);
COMMENT ON TABLE crm.brand_campaign IS 'This is a many to many table maintaining relationship between brand and campaigns.';
COMMENT ON COLUMN crm.brand_campaign."brandId" IS 'This is the brandId from the brand table.';
COMMENT ON COLUMN crm.brand_campaign."campaignId" IS 'This is campaign id from campaign table.';
COMMENT ON COLUMN crm.brand_campaign."isActive" IS 'Whether this particular campaign is active or not for this brand.';
CREATE TABLE crm.brand_coupon (
    "brandId" integer NOT NULL,
    "couponId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE crm.brand_coupon IS 'This is a many to many table maintaining relationship between brand and coupons.';
COMMENT ON COLUMN crm.brand_coupon."brandId" IS 'This is the brandId from the brand table.';
COMMENT ON COLUMN crm.brand_coupon."couponId" IS 'This is coupon id from coupon table.';
COMMENT ON COLUMN crm.brand_coupon."isActive" IS 'Whether this particular coupon is active or not for this brand.';
CREATE TABLE crm.brand_customer (
    id integer DEFAULT public.defaultid('crm'::text, 'brand_customer'::text, 'id'::text) NOT NULL,
    "keycloakId" text NOT NULL,
    "brandId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isSubscriber" boolean DEFAULT false,
    "subscriptionId" integer,
    "subscriptionAddressId" text,
    "subscriptionPaymentMethodId" text,
    "isAutoSelectOptOut" boolean DEFAULT false NOT NULL,
    "isSubscriberTimeStamp" timestamp without time zone,
    "subscriptionServingId" integer,
    "subscriptionItemCountId" integer,
    "subscriptionTitleId" integer,
    "subscriptionOnboardStatus" text DEFAULT 'REGISTER'::text NOT NULL,
    "isSubscriptionCancelled" boolean DEFAULT false NOT NULL,
    "subscriptionCancellationReason" text DEFAULT 'Not Provided'::text,
    "pausePeriod" jsonb DEFAULT jsonb_build_object(),
    "lastUpdatedBy" jsonb DEFAULT '{}'::jsonb,
    "isDemo" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE crm.brand_customer IS 'This table maintains a list of all the customers who have signed into this particular brand atleast once.';
COMMENT ON COLUMN crm.brand_customer.id IS 'Auto-generated id.';
COMMENT ON COLUMN crm.brand_customer."keycloakId" IS 'This is the unique id of customer given by keycloak.';
COMMENT ON COLUMN crm.brand_customer."brandId" IS 'This is the brandId from brand table.';
COMMENT ON COLUMN crm.brand_customer."isSubscriber" IS 'If this customer has subscribed to any plan on subscription store for this particular brand.';
COMMENT ON COLUMN crm.brand_customer."subscriptionId" IS 'This is the id of the subscription plan chosen by this customer.';
COMMENT ON COLUMN crm.brand_customer."subscriptionAddressId" IS 'This is the id of address from Dailykey database at which this plan would be delivering the weekly box to.';
COMMENT ON COLUMN crm.brand_customer."subscriptionPaymentMethodId" IS 'This is the id of payment method from Dailykey database defining which particular payment method would be used for auto deduction of weekly amount.';
CREATE SEQUENCE crm.brand_customer_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.brand_customer_id_seq OWNED BY crm.brand_customer.id;
CREATE TABLE crm."campaignType" (
    id integer DEFAULT public.defaultid('crm'::text, 'campaignType'::text, 'id'::text) NOT NULL,
    value text NOT NULL
);
COMMENT ON TABLE crm."campaignType" IS 'This table contains the type of campaigns across the system.';
CREATE SEQUENCE crm.campaign_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.campaign_id_seq OWNED BY crm.campaign.id;
CREATE SEQUENCE crm.coupon_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.coupon_id_seq OWNED BY crm.coupon.id;
CREATE TABLE crm.customer (
    id integer DEFAULT public.defaultid('crm'::text, 'customer'::text, 'id'::text) NOT NULL,
    source text,
    email text,
    "keycloakId" text NOT NULL,
    "clientId" text,
    "isSubscriber" boolean DEFAULT false NOT NULL,
    "subscriptionId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isTest" boolean DEFAULT true NOT NULL,
    "sourceBrandId" integer NOT NULL,
    "isArchived" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE crm.customer IS 'This lists records of all the unique customers across all the brands.';
COMMENT ON COLUMN crm.customer.id IS 'Auto-generated id of the customer';
COMMENT ON COLUMN crm.customer.source IS 'From which source this customer was first created. If subscription or ondemand.';
COMMENT ON COLUMN crm.customer.email IS 'Unique email of the customer.';
COMMENT ON COLUMN crm.customer."keycloakId" IS 'This is the unique id of customer given by keycloak.';
COMMENT ON COLUMN crm.customer."isSubscriber" IS 'If this customer has subscribed to any plan on subscription store for any of the brand.';
COMMENT ON COLUMN crm.customer."isTest" IS 'If true, all the carts for this customer would bypass the payment.';
COMMENT ON COLUMN crm.customer."sourceBrandId" IS 'From which brand was this customer first signed up in the system.';
COMMENT ON COLUMN crm.customer."isArchived" IS 'Marks the deletion of customer if user attempts to delete it';
CREATE TABLE crm."customerReferral" (
    id integer DEFAULT public.defaultid('crm'::text, 'customerReferral'::text, 'id'::text) NOT NULL,
    "keycloakId" text NOT NULL,
    "referralCode" text DEFAULT public.gen_random_uuid() NOT NULL,
    "referredByCode" text,
    "referralStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "referralCampaignId" integer,
    "signupCampaignId" integer,
    "signupStatus" text DEFAULT 'PENDING'::text NOT NULL,
    "brandId" integer DEFAULT 1 NOT NULL
);
COMMENT ON TABLE crm."customerReferral" IS 'This table maintains a record of all the customer and brand''s referral codes.';
COMMENT ON COLUMN crm."customerReferral".id IS 'Auto-generated id for the row.';
COMMENT ON COLUMN crm."customerReferral"."keycloakId" IS 'This is the unique id of customer given by keycloak.';
COMMENT ON COLUMN crm."customerReferral"."referralCode" IS 'This is auto generated UUID code created for each customer to share with others for referral.';
COMMENT ON COLUMN crm."customerReferral"."referredByCode" IS 'This is the referral code that was used by the customer for signing up';
COMMENT ON COLUMN crm."customerReferral"."referralStatus" IS 'This denotes the status if the customer who referred was awarded something according to the referral campaign id.';
COMMENT ON COLUMN crm."customerReferral"."referralCampaignId" IS 'The id of the campaign to be used to award the referrer.';
COMMENT ON COLUMN crm."customerReferral"."signupCampaignId" IS 'The id of the campaign to be used to reward this customer who signed up.';
COMMENT ON COLUMN crm."customerReferral"."signupStatus" IS 'This denotes the status if the signed up customer was awarded something according to the  signup campaign id.';
COMMENT ON COLUMN crm."customerReferral"."brandId" IS 'This is the brandId from the brand table.';
CREATE SEQUENCE crm."customerReferral_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."customerReferral_id_seq" OWNED BY crm."customerReferral".id;
CREATE TABLE crm."customerReview" (
    id integer DEFAULT public.defaultid('crm'::text, 'customerReview'::text, 'id'::text) NOT NULL,
    review text,
    rating numeric,
    assets jsonb,
    "productId" integer,
    "cartId" integer,
    "experienceId" integer,
    "customerEmail" text,
    "isShown" boolean DEFAULT false NOT NULL,
    "isGlobal" boolean DEFAULT false NOT NULL,
    "brandId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE crm."customerReview" IS 'This table shows that the customer review like(Loyalty points,email)';
CREATE SEQUENCE crm."customerReview_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."customerReview_id_seq" OWNED BY crm."customerReview".id;
CREATE TABLE crm."customer_experienceTags" (
    "keycloakId" text NOT NULL,
    tags jsonb NOT NULL
);
COMMENT ON TABLE crm."customer_experienceTags" IS 'This table contains relationship between customers and tag.';
CREATE SEQUENCE crm.customer_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.customer_id_seq OWNED BY crm.customer.id;
CREATE TABLE crm."customer_savedEntities" (
    id integer DEFAULT public.defaultid('crm'::text, 'customer_savedEntities'::text, 'id'::text) NOT NULL,
    "keycloakId" text,
    "experienceId" integer,
    "productId" integer,
    "simpleRecipeId" integer
);
CREATE SEQUENCE crm."customer_savedEntities_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."customer_savedEntities_id_seq" OWNED BY crm."customer_savedEntities".id;
CREATE TABLE crm."loyaltyPoint" (
    id integer DEFAULT public.defaultid('crm'::text, 'loyaltyPoint'::text, 'id'::text) NOT NULL,
    "keycloakId" text NOT NULL,
    points integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "brandId" integer DEFAULT 1 NOT NULL
);
COMMENT ON TABLE crm."loyaltyPoint" IS 'This table maintains record of all the loyalty point references of all customers across all brands.';
COMMENT ON COLUMN crm."loyaltyPoint"."keycloakId" IS 'Customer keycloak Id referencing the customer for this row.';
COMMENT ON COLUMN crm."loyaltyPoint".points IS 'Available loyalty points for this customer across the referenced brand in the row.';
COMMENT ON COLUMN crm."loyaltyPoint"."isActive" IS 'If loyalty points for this customer is active.';
COMMENT ON COLUMN crm."loyaltyPoint"."brandId" IS 'Id of the brand for which this loyalty point is created and maintained.';
CREATE TABLE crm."loyaltyPointTransaction" (
    id integer DEFAULT public.defaultid('crm'::text, 'loyaltyPointTransaction'::text, 'id'::text) NOT NULL,
    "loyaltyPointId" integer NOT NULL,
    points integer NOT NULL,
    "orderCartId" integer,
    type text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "amountRedeemed" numeric,
    "customerReferralId" integer
);
COMMENT ON TABLE crm."loyaltyPointTransaction" IS 'This table lists all the loyalty point transactions taking place.';
CREATE SEQUENCE crm."loyaltyPointTransaction_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."loyaltyPointTransaction_id_seq" OWNED BY crm."loyaltyPointTransaction".id;
CREATE SEQUENCE crm."loyaltyPoint_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."loyaltyPoint_id_seq" OWNED BY crm."loyaltyPoint".id;
CREATE TABLE crm.reward (
    id integer DEFAULT public.defaultid('crm'::text, 'reward'::text, 'id'::text) NOT NULL,
    type text NOT NULL,
    "couponId" integer,
    "conditionId" integer,
    "position" numeric,
    "campaignId" integer,
    "rewardValue" jsonb
);
COMMENT ON TABLE crm.reward IS 'This table maintains record of all the reward point references of all customers across all brands.';
CREATE TABLE crm."rewardHistory" (
    id integer DEFAULT public.defaultid('crm'::text, 'rewardHistory'::text, 'id'::text) NOT NULL,
    "rewardId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "couponId" integer,
    "campaignId" integer,
    "keycloakId" text NOT NULL,
    "orderCartId" integer,
    "orderId" integer,
    discount numeric,
    "loyaltyPointTransactionId" integer,
    "loyaltyPoints" integer,
    "walletAmount" numeric,
    "walletTransactionId" integer,
    "brandId" integer DEFAULT 1 NOT NULL
);
COMMENT ON TABLE crm."rewardHistory" IS 'This table contains the reward history of the customer.';
CREATE SEQUENCE crm."rewardHistory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."rewardHistory_id_seq" OWNED BY crm."rewardHistory".id;
CREATE TABLE crm."rewardType" (
    id integer DEFAULT public.defaultid('crm'::text, 'rewardType'::text, 'id'::text) NOT NULL,
    value text NOT NULL,
    "useForCoupon" boolean NOT NULL,
    handler text NOT NULL
);
COMMENT ON TABLE crm."rewardType" IS 'It shows the type of reward.';
CREATE TABLE crm."rewardType_campaignType" (
    "rewardTypeId" integer NOT NULL,
    "campaignTypeId" integer NOT NULL
);
COMMENT ON TABLE crm."rewardType_campaignType" IS 'This is a many to many table maintaining relationship between reward and campaign.';
CREATE SEQUENCE crm.reward_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.reward_id_seq OWNED BY crm.reward.id;
CREATE VIEW crm.view_brand_customer AS
 SELECT brand_customer.id,
    brand_customer."keycloakId",
    brand_customer."brandId",
    brand_customer.created_at,
    brand_customer.updated_at,
    brand_customer."isSubscriber",
    brand_customer."subscriptionId",
    brand_customer."subscriptionAddressId",
    brand_customer."subscriptionPaymentMethodId",
    brand_customer."isAutoSelectOptOut",
    brand_customer."isSubscriberTimeStamp",
    brand_customer."subscriptionServingId",
    brand_customer."subscriptionItemCountId",
    brand_customer."subscriptionTitleId",
    ( SELECT subscription."customerSubscriptionReport"(brand_customer.id, 'All'::text) AS "customerSubscriptionReport") AS "allSubscriptionOccurences",
    ( SELECT subscription."customerSubscriptionReport"(brand_customer.id, 'Skipped'::text) AS "customerSubscriptionReport") AS "skippedSubscriptionOccurences"
   FROM crm.brand_customer;
COMMENT ON VIEW crm.view_brand_customer IS 'This lists records of all the brand customer.';
CREATE TABLE crm.vocher (
    "couponId" integer NOT NULL,
    "brandCustomerId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE crm.vocher IS 'This shows the relationship between customer and voucher.';
CREATE TABLE crm.wallet (
    id integer DEFAULT public.defaultid('crm'::text, 'wallet'::text, 'id'::text) NOT NULL,
    "keycloakId" text,
    amount numeric DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "brandId" integer DEFAULT 1 NOT NULL
);
COMMENT ON TABLE crm.wallet IS 'This table maintains record of all the wallet amount references of all customers across all brands.';
CREATE TABLE crm."walletTransaction" (
    id integer DEFAULT public.defaultid('crm'::text, 'walletTransaction'::text, 'id'::text) NOT NULL,
    "walletId" integer NOT NULL,
    amount numeric NOT NULL,
    type text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "orderCartId" integer,
    "customerReferralId" integer
);
COMMENT ON TABLE crm."walletTransaction" IS 'This table lists all the wallet transactions taking place.';
CREATE SEQUENCE crm."walletTransaction_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm."walletTransaction_id_seq" OWNED BY crm."walletTransaction".id;
CREATE SEQUENCE crm.wallet_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE crm.wallet_id_seq OWNED BY crm.wallet.id;
CREATE VIEW datahub_schema.columns AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"."', columns.column_name, '"') AS concat) AS column_reference,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.columns_privileges AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"."', columns.column_name, '"') AS concat) AS column_reference,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.constraint_column_usage AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"."', columns.column_name, '"') AS concat) AS column_reference,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.constraint_table_usage AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE TABLE hdb_catalog.event_invocation_logs (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp without time zone DEFAULT now()
);
CREATE VIEW datahub_schema.event_invocation_logs AS
 SELECT event_invocation_logs.id,
    event_invocation_logs.event_id,
    event_invocation_logs.status,
    event_invocation_logs.request,
    event_invocation_logs.response,
    event_invocation_logs.created_at
   FROM hdb_catalog.event_invocation_logs;
CREATE TABLE hdb_catalog.event_log (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    trigger_name text NOT NULL,
    payload jsonb NOT NULL,
    delivered boolean DEFAULT false NOT NULL,
    error boolean DEFAULT false NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    locked boolean DEFAULT false NOT NULL,
    next_retry_at timestamp without time zone,
    archived boolean DEFAULT false NOT NULL
);
CREATE VIEW datahub_schema.event_log AS
 SELECT event_log.id,
    event_log.schema_name,
    event_log.table_name,
    event_log.trigger_name,
    event_log.payload,
    event_log.delivered,
    event_log.error,
    event_log.tries,
    event_log.created_at,
    event_log.locked,
    event_log.next_retry_at,
    event_log.archived
   FROM hdb_catalog.event_log;
CREATE TABLE hdb_catalog.event_triggers (
    name text NOT NULL,
    type text NOT NULL,
    schema_name text NOT NULL,
    table_name text NOT NULL,
    configuration json,
    comment text
);
CREATE VIEW datahub_schema.event_triggers AS
 SELECT event_triggers.name,
    event_triggers.type,
    event_triggers.schema_name,
    event_triggers.table_name,
    event_triggers.configuration,
    event_triggers.comment
   FROM hdb_catalog.event_triggers;
CREATE TABLE hdb_catalog.hdb_action (
    action_name text NOT NULL,
    action_defn jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false
);
CREATE VIEW datahub_schema.hdb_action AS
 SELECT hdb_action.action_name,
    hdb_action.action_defn,
    hdb_action.comment,
    hdb_action.is_system_defined
   FROM hdb_catalog.hdb_action;
CREATE TABLE hdb_catalog.hdb_action_log (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    action_name text,
    input_payload jsonb NOT NULL,
    request_headers jsonb NOT NULL,
    session_variables jsonb NOT NULL,
    response_payload jsonb,
    errors jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    response_received_at timestamp with time zone,
    status text NOT NULL,
    CONSTRAINT hdb_action_log_status_check CHECK ((status = ANY (ARRAY['created'::text, 'processing'::text, 'completed'::text, 'error'::text])))
);
CREATE VIEW datahub_schema.hdb_action_log AS
 SELECT hdb_action_log.id,
    hdb_action_log.action_name,
    hdb_action_log.input_payload,
    hdb_action_log.request_headers,
    hdb_action_log.session_variables,
    hdb_action_log.response_payload,
    hdb_action_log.errors,
    hdb_action_log.created_at,
    hdb_action_log.response_received_at,
    hdb_action_log.status
   FROM hdb_catalog.hdb_action_log;
CREATE TABLE hdb_catalog.hdb_action_permission (
    action_name text NOT NULL,
    role_name text NOT NULL,
    definition jsonb DEFAULT '{}'::jsonb NOT NULL,
    comment text
);
CREATE VIEW datahub_schema.hdb_action_permission AS
 SELECT hdb_action_permission.action_name,
    hdb_action_permission.role_name,
    hdb_action_permission.definition,
    hdb_action_permission.comment
   FROM hdb_catalog.hdb_action_permission;
CREATE TABLE hdb_catalog.hdb_computed_field (
    table_schema text NOT NULL,
    table_name text NOT NULL,
    computed_field_name text NOT NULL,
    definition jsonb NOT NULL,
    comment text
);
CREATE VIEW datahub_schema.hdb_computed_field AS
 SELECT hdb_computed_field.table_schema,
    hdb_computed_field.table_name,
    hdb_computed_field.computed_field_name,
    hdb_computed_field.definition,
    hdb_computed_field.comment
   FROM hdb_catalog.hdb_computed_field;
CREATE TABLE hdb_catalog.hdb_cron_event_invocation_logs (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp with time zone DEFAULT now()
);
CREATE VIEW datahub_schema.hdb_cron_event_invocation_logs AS
 SELECT hdb_cron_event_invocation_logs.id,
    hdb_cron_event_invocation_logs.event_id,
    hdb_cron_event_invocation_logs.status,
    hdb_cron_event_invocation_logs.request,
    hdb_cron_event_invocation_logs.response,
    hdb_cron_event_invocation_logs.created_at
   FROM hdb_catalog.hdb_cron_event_invocation_logs;
CREATE TABLE hdb_catalog.hdb_cron_events (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    trigger_name text NOT NULL,
    scheduled_time timestamp with time zone NOT NULL,
    status text DEFAULT 'scheduled'::text NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    next_retry_at timestamp with time zone,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
CREATE VIEW datahub_schema.hdb_cron_events AS
 SELECT hdb_cron_events.id,
    hdb_cron_events.trigger_name,
    hdb_cron_events.scheduled_time,
    hdb_cron_events.status,
    hdb_cron_events.tries,
    hdb_cron_events.created_at,
    hdb_cron_events.next_retry_at
   FROM hdb_catalog.hdb_cron_events;
CREATE TABLE hdb_catalog.hdb_cron_triggers (
    name text NOT NULL,
    webhook_conf json NOT NULL,
    cron_schedule text NOT NULL,
    payload json,
    retry_conf json,
    header_conf json,
    include_in_metadata boolean DEFAULT false NOT NULL,
    comment text
);
CREATE VIEW datahub_schema.hdb_cron_triggers AS
 SELECT hdb_cron_triggers.name,
    hdb_cron_triggers.webhook_conf,
    hdb_cron_triggers.cron_schedule,
    hdb_cron_triggers.payload,
    hdb_cron_triggers.retry_conf,
    hdb_cron_triggers.header_conf,
    hdb_cron_triggers.include_in_metadata,
    hdb_cron_triggers.comment
   FROM hdb_catalog.hdb_cron_triggers;
CREATE TABLE hdb_catalog.hdb_custom_types (
    custom_types jsonb NOT NULL
);
CREATE VIEW datahub_schema.hdb_custom_types AS
 SELECT hdb_custom_types.custom_types
   FROM hdb_catalog.hdb_custom_types;
CREATE TABLE hdb_catalog.hdb_function (
    function_schema text NOT NULL,
    function_name text NOT NULL,
    configuration jsonb DEFAULT '{}'::jsonb NOT NULL,
    is_system_defined boolean DEFAULT false
);
CREATE VIEW datahub_schema.hdb_function AS
 SELECT hdb_function.function_schema,
    hdb_function.function_name,
    hdb_function.configuration,
    hdb_function.is_system_defined
   FROM hdb_catalog.hdb_function;
CREATE TABLE hdb_catalog.hdb_permission (
    table_schema name NOT NULL,
    table_name name NOT NULL,
    role_name text NOT NULL,
    perm_type text NOT NULL,
    perm_def jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false,
    CONSTRAINT hdb_permission_perm_type_check CHECK ((perm_type = ANY (ARRAY['insert'::text, 'select'::text, 'update'::text, 'delete'::text])))
);
CREATE VIEW datahub_schema.hdb_permission AS
 SELECT hdb_permission.table_schema,
    hdb_permission.table_name,
    hdb_permission.role_name,
    hdb_permission.perm_type,
    hdb_permission.perm_def,
    hdb_permission.comment,
    hdb_permission.is_system_defined
   FROM hdb_catalog.hdb_permission;
CREATE TABLE hdb_catalog.hdb_relationship (
    table_schema name NOT NULL,
    table_name name NOT NULL,
    rel_name text NOT NULL,
    rel_type text,
    rel_def jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false,
    CONSTRAINT hdb_relationship_rel_type_check CHECK ((rel_type = ANY (ARRAY['object'::text, 'array'::text])))
);
CREATE VIEW datahub_schema.hdb_relationship AS
 SELECT hdb_relationship.table_schema,
    hdb_relationship.table_name,
    hdb_relationship.rel_name,
    hdb_relationship.rel_type,
    hdb_relationship.rel_def,
    hdb_relationship.comment,
    hdb_relationship.is_system_defined
   FROM hdb_catalog.hdb_relationship;
CREATE TABLE hdb_catalog.hdb_remote_relationship (
    remote_relationship_name text NOT NULL,
    table_schema name NOT NULL,
    table_name name NOT NULL,
    definition jsonb NOT NULL
);
CREATE VIEW datahub_schema.hdb_remote_relationship AS
 SELECT hdb_remote_relationship.remote_relationship_name,
    hdb_remote_relationship.table_schema,
    hdb_remote_relationship.table_name,
    hdb_remote_relationship.definition
   FROM hdb_catalog.hdb_remote_relationship;
CREATE TABLE hdb_catalog.hdb_scheduled_event_invocation_logs (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    event_id text,
    status integer,
    request json,
    response json,
    created_at timestamp with time zone DEFAULT now()
);
CREATE VIEW datahub_schema.hdb_scheduled_event_invocation_logs AS
 SELECT hdb_scheduled_event_invocation_logs.id,
    hdb_scheduled_event_invocation_logs.event_id,
    hdb_scheduled_event_invocation_logs.status,
    hdb_scheduled_event_invocation_logs.request,
    hdb_scheduled_event_invocation_logs.response,
    hdb_scheduled_event_invocation_logs.created_at
   FROM hdb_catalog.hdb_scheduled_event_invocation_logs;
CREATE TABLE hdb_catalog.hdb_scheduled_events (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    webhook_conf json NOT NULL,
    scheduled_time timestamp with time zone NOT NULL,
    retry_conf json,
    payload json,
    header_conf json,
    status text DEFAULT 'scheduled'::text NOT NULL,
    tries integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    next_retry_at timestamp with time zone,
    comment text,
    CONSTRAINT valid_status CHECK ((status = ANY (ARRAY['scheduled'::text, 'locked'::text, 'delivered'::text, 'error'::text, 'dead'::text])))
);
CREATE VIEW datahub_schema.hdb_scheduled_events AS
 SELECT hdb_scheduled_events.id,
    hdb_scheduled_events.webhook_conf,
    hdb_scheduled_events.scheduled_time,
    hdb_scheduled_events.retry_conf,
    hdb_scheduled_events.payload,
    hdb_scheduled_events.header_conf,
    hdb_scheduled_events.status,
    hdb_scheduled_events.tries,
    hdb_scheduled_events.created_at,
    hdb_scheduled_events.next_retry_at,
    hdb_scheduled_events.comment
   FROM hdb_catalog.hdb_scheduled_events;
CREATE TABLE hdb_catalog.hdb_table (
    table_schema name NOT NULL,
    table_name name NOT NULL,
    configuration jsonb,
    is_system_defined boolean DEFAULT false,
    is_enum boolean DEFAULT false NOT NULL
);
CREATE VIEW datahub_schema.hdb_table AS
 SELECT hdb_table.table_schema,
    hdb_table.table_name,
    hdb_table.configuration,
    hdb_table.is_system_defined,
    hdb_table.is_enum,
    ( SELECT concat('"', hdb_table.table_schema, '"."', hdb_table.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', hdb_table.table_schema, '"') AS concat) AS schema_reference
   FROM hdb_catalog.hdb_table;
CREATE VIEW datahub_schema.key_column_usage AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"."', columns.column_name, '"') AS concat) AS column_reference,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.referential_constraints AS
 SELECT referential_constraints.constraint_catalog,
    referential_constraints.constraint_schema,
    referential_constraints.constraint_name,
    referential_constraints.unique_constraint_catalog,
    referential_constraints.unique_constraint_schema,
    referential_constraints.unique_constraint_name,
    referential_constraints.match_option,
    referential_constraints.update_rule,
    referential_constraints.delete_rule,
    ( SELECT concat('"', referential_constraints.constraint_schema, '"."', referential_constraints.constraint_name, '"') AS concat) AS constraint_reference,
    ( SELECT concat('"', referential_constraints.constraint_schema, '"') AS concat) AS constraint_schema_reference
   FROM information_schema.referential_constraints
  WHERE ((referential_constraints.unique_constraint_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE TABLE hdb_catalog.remote_schemas (
    id bigint NOT NULL,
    name text,
    definition json,
    comment text
);
CREATE VIEW datahub_schema.remote_schemas AS
 SELECT remote_schemas.id,
    remote_schemas.name,
    remote_schemas.definition,
    remote_schemas.comment
   FROM hdb_catalog.remote_schemas;
CREATE VIEW datahub_schema.role_column_grant AS
 SELECT columns.table_catalog,
    columns.table_schema,
    columns.table_name,
    columns.column_name,
    columns.ordinal_position,
    columns.column_default,
    columns.is_nullable,
    columns.data_type,
    columns.character_maximum_length,
    columns.character_octet_length,
    columns.numeric_precision,
    columns.numeric_precision_radix,
    columns.numeric_scale,
    columns.datetime_precision,
    columns.interval_type,
    columns.interval_precision,
    columns.character_set_catalog,
    columns.character_set_schema,
    columns.character_set_name,
    columns.collation_catalog,
    columns.collation_schema,
    columns.collation_name,
    columns.domain_catalog,
    columns.domain_schema,
    columns.domain_name,
    columns.udt_catalog,
    columns.udt_schema,
    columns.udt_name,
    columns.scope_catalog,
    columns.scope_schema,
    columns.scope_name,
    columns.maximum_cardinality,
    columns.dtd_identifier,
    columns.is_self_referencing,
    columns.is_identity,
    columns.identity_generation,
    columns.identity_start,
    columns.identity_increment,
    columns.identity_maximum,
    columns.identity_minimum,
    columns.identity_cycle,
    columns.is_generated,
    columns.generation_expression,
    columns.is_updatable,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"."', columns.column_name, '"') AS concat) AS column_reference,
    ( SELECT concat('"', columns.table_schema, '"."', columns.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', columns.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.columns
  WHERE ((columns.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.routines AS
 SELECT routines.specific_catalog,
    routines.specific_schema,
    routines.specific_name,
    routines.routine_catalog,
    routines.routine_schema,
    routines.routine_name,
    routines.routine_type,
    routines.module_catalog,
    routines.module_schema,
    routines.module_name,
    routines.udt_catalog,
    routines.udt_schema,
    routines.udt_name,
    routines.data_type,
    routines.character_maximum_length,
    routines.character_octet_length,
    routines.character_set_catalog,
    routines.character_set_schema,
    routines.character_set_name,
    routines.collation_catalog,
    routines.collation_schema,
    routines.collation_name,
    routines.numeric_precision,
    routines.numeric_precision_radix,
    routines.numeric_scale,
    routines.datetime_precision,
    routines.interval_type,
    routines.interval_precision,
    routines.type_udt_catalog,
    routines.type_udt_schema,
    routines.type_udt_name,
    routines.scope_catalog,
    routines.scope_schema,
    routines.scope_name,
    routines.maximum_cardinality,
    routines.dtd_identifier,
    routines.routine_body,
    routines.routine_definition,
    routines.external_name,
    routines.external_language,
    routines.parameter_style,
    routines.is_deterministic,
    routines.sql_data_access,
    routines.is_null_call,
    routines.sql_path,
    routines.schema_level_routine,
    routines.max_dynamic_result_sets,
    routines.is_user_defined_cast,
    routines.is_implicitly_invocable,
    routines.security_type,
    routines.to_sql_specific_catalog,
    routines.to_sql_specific_schema,
    routines.to_sql_specific_name,
    routines.as_locator,
    routines.created,
    routines.last_altered,
    routines.new_savepoint_level,
    routines.is_udt_dependent,
    routines.result_cast_from_data_type,
    routines.result_cast_as_locator,
    routines.result_cast_char_max_length,
    routines.result_cast_char_octet_length,
    routines.result_cast_char_set_catalog,
    routines.result_cast_char_set_schema,
    routines.result_cast_char_set_name,
    routines.result_cast_collation_catalog,
    routines.result_cast_collation_schema,
    routines.result_cast_collation_name,
    routines.result_cast_numeric_precision,
    routines.result_cast_numeric_precision_radix,
    routines.result_cast_numeric_scale,
    routines.result_cast_datetime_precision,
    routines.result_cast_interval_type,
    routines.result_cast_interval_precision,
    routines.result_cast_type_udt_catalog,
    routines.result_cast_type_udt_schema,
    routines.result_cast_type_udt_name,
    routines.result_cast_scope_catalog,
    routines.result_cast_scope_schema,
    routines.result_cast_scope_name,
    routines.result_cast_maximum_cardinality,
    routines.result_cast_dtd_identifier,
    ( SELECT concat('"', routines.routine_schema, '"."', routines.routine_name, '"') AS concat) AS routine_reference,
    ( SELECT concat('"', routines.routine_schema, '"') AS concat) AS routine_schema_reference
   FROM information_schema.routines
  WHERE ((routines.specific_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.schemata AS
 SELECT schemata.catalog_name,
    schemata.schema_name,
    schemata.schema_owner,
    schemata.default_character_set_catalog,
    schemata.default_character_set_schema,
    schemata.default_character_set_name,
    schemata.sql_path,
    ( SELECT concat('"', schemata.schema_name, '"') AS concat) AS schema_reference
   FROM information_schema.schemata;
CREATE VIEW datahub_schema.sequences AS
 SELECT sequences.sequence_catalog,
    sequences.sequence_schema,
    sequences.sequence_name,
    sequences.data_type,
    sequences.numeric_precision,
    sequences.numeric_precision_radix,
    sequences.numeric_scale,
    sequences.start_value,
    sequences.minimum_value,
    sequences.maximum_value,
    sequences.increment,
    sequences.cycle_option,
    sequences.sequence_schema AS schema_reference
   FROM information_schema.sequences
  WHERE ((sequences.sequence_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.table_constraints AS
 SELECT table_constraints.constraint_catalog,
    table_constraints.constraint_schema,
    table_constraints.constraint_name,
    table_constraints.table_catalog,
    table_constraints.table_schema,
    table_constraints.table_name,
    table_constraints.constraint_type,
    table_constraints.is_deferrable,
    table_constraints.initially_deferred,
    table_constraints.enforced,
    ( SELECT concat('"', table_constraints.table_schema, '"."', table_constraints.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', table_constraints.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.table_constraints
  WHERE ((table_constraints.constraint_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.table_privileges AS
 SELECT table_privileges.grantor,
    table_privileges.grantee,
    table_privileges.table_catalog,
    table_privileges.table_schema,
    table_privileges.table_name,
    table_privileges.privilege_type,
    table_privileges.is_grantable,
    table_privileges.with_hierarchy,
    ( SELECT concat('"', table_privileges.table_schema, '"."', table_privileges.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', table_privileges.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.table_privileges
  WHERE ((table_privileges.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.tables AS
 SELECT tables.table_catalog,
    tables.table_schema,
    tables.table_name,
    tables.table_type,
    tables.self_referencing_column_name,
    tables.reference_generation,
    tables.user_defined_type_catalog,
    tables.user_defined_type_schema,
    tables.user_defined_type_name,
    tables.is_insertable_into,
    tables.is_typed,
    tables.commit_action,
    ( SELECT concat('"', tables.table_schema, '"."', tables.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', tables.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.tables
  WHERE ((tables.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.triggered_update_column AS
 SELECT triggers.trigger_catalog,
    triggers.trigger_schema,
    triggers.trigger_name,
    triggers.event_manipulation,
    triggers.event_object_catalog,
    triggers.event_object_schema,
    triggers.event_object_table,
    triggers.action_order,
    triggers.action_condition,
    triggers.action_statement,
    triggers.action_orientation,
    triggers.action_timing,
    triggers.action_reference_old_table,
    triggers.action_reference_new_table,
    triggers.action_reference_old_row,
    triggers.action_reference_new_row,
    triggers.created,
    ( SELECT concat('"', triggers.trigger_schema, '"."', triggers.trigger_name, '"') AS concat) AS trigger_reference,
    ( SELECT concat('"', triggers.trigger_schema, '"') AS concat) AS schema_reference
   FROM information_schema.triggers
  WHERE ((triggers.trigger_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.triggers AS
 SELECT triggers.trigger_catalog,
    triggers.trigger_schema,
    triggers.trigger_name,
    triggers.event_manipulation,
    triggers.event_object_catalog,
    triggers.event_object_schema,
    triggers.event_object_table,
    triggers.action_order,
    triggers.action_condition,
    triggers.action_statement,
    triggers.action_orientation,
    triggers.action_timing,
    triggers.action_reference_old_table,
    triggers.action_reference_new_table,
    triggers.action_reference_old_row,
    triggers.action_reference_new_row,
    triggers.created,
    ( SELECT concat('"', triggers.trigger_schema, '"."', triggers.trigger_name, '"') AS concat) AS trigger_reference,
    ( SELECT concat('"', triggers.trigger_schema, '"') AS concat) AS schema_reference
   FROM information_schema.triggers
  WHERE ((triggers.trigger_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.view_column_usage AS
 SELECT view_column_usage.view_catalog,
    view_column_usage.view_schema,
    view_column_usage.view_name,
    view_column_usage.table_catalog,
    view_column_usage.table_schema,
    view_column_usage.table_name,
    view_column_usage.column_name,
    ( SELECT concat('"', view_column_usage.view_schema, '"."', view_column_usage.view_name, '"') AS concat) AS view_reference,
    ( SELECT concat('"', view_column_usage.table_schema, '"."', view_column_usage.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', view_column_usage.view_schema, '"') AS concat) AS view_schema_reference,
    ( SELECT concat('"', view_column_usage.table_schema, '"') AS concat) AS table_schema_reference
   FROM information_schema.view_column_usage
  WHERE ((view_column_usage.view_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.view_routine_usage AS
 SELECT view_routine_usage.table_catalog,
    view_routine_usage.table_schema,
    view_routine_usage.table_name,
    view_routine_usage.specific_catalog,
    view_routine_usage.specific_schema,
    view_routine_usage.specific_name,
    ( SELECT concat('"', view_routine_usage.table_schema, '"."', view_routine_usage.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', view_routine_usage.table_schema, '"') AS concat) AS table_schema_reference
   FROM information_schema.view_routine_usage
  WHERE ((view_routine_usage.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.view_table_usage AS
 SELECT view_table_usage.view_catalog,
    view_table_usage.view_schema,
    view_table_usage.view_name,
    view_table_usage.table_catalog,
    view_table_usage.table_schema,
    view_table_usage.table_name,
    ( SELECT concat('"', view_table_usage.view_schema, '"."', view_table_usage.view_name, '"') AS concat) AS view_reference,
    ( SELECT concat('"', view_table_usage.table_schema, '"."', view_table_usage.table_name, '"') AS concat) AS table_reference,
    ( SELECT concat('"', view_table_usage.view_schema, '"') AS concat) AS view_schema_reference,
    ( SELECT concat('"', view_table_usage.table_schema, '"') AS concat) AS table_schema_reference
   FROM information_schema.view_table_usage
  WHERE ((view_table_usage.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE VIEW datahub_schema.views AS
 SELECT views.table_catalog,
    views.table_schema,
    views.table_name,
    views.view_definition,
    views.check_option,
    views.is_updatable,
    views.is_insertable_into,
    views.is_trigger_updatable,
    views.is_trigger_deletable,
    views.is_trigger_insertable_into,
    ( SELECT concat('"', views.table_schema, '"."', views.table_name, '"') AS concat) AS view_reference,
    ( SELECT concat('"', views.table_schema, '"') AS concat) AS schema_reference
   FROM information_schema.views
  WHERE ((views.table_schema)::name <> ALL (ARRAY['pg_catalog'::name, 'information_schema'::name]));
CREATE TABLE developer."apiKey" (
    "apiKey" text DEFAULT public.gen_random_uuid() NOT NULL,
    "isDeactivated" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "createdBy" integer,
    "canAddProducts" boolean DEFAULT false,
    label text,
    "canUpdateProducts" boolean DEFAULT false
);
CREATE TABLE developer."availableWebhookEvent" (
    id integer NOT NULL,
    label text NOT NULL,
    description text NOT NULL,
    "samplePayload" jsonb NOT NULL,
    type text,
    "isActive" boolean DEFAULT false,
    "tableName" text NOT NULL,
    "schemaName" text,
    "hasuraEventRowData" jsonb
);
COMMENT ON COLUMN developer."availableWebhookEvent"."isActive" IS 'Will be set true if there''s atleast one entry for this in webhookUrl_events table';
CREATE TABLE developer."processedWebhookEvents" (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    payload jsonb,
    "availableWebhookEventId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE developer."processedWebhookEventsByUrl" (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    "webhookUrl_eventsId" integer NOT NULL,
    status text,
    "statusCode" integer,
    response jsonb,
    "attemptedTime" integer DEFAULT 0 NOT NULL,
    "processedWebhookEventsId" text NOT NULL,
    "urlEndPoint" text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE developer."webhookUrl" (
    id integer DEFAULT public.defaultid('developer'::text, 'webhookUrl'::text, 'id'::text) NOT NULL,
    "urlEndpoint" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE developer."webhookUrl_EventsLog" (
    id text DEFAULT public.gen_random_uuid() NOT NULL,
    "webhookUrl_EventsId" integer NOT NULL,
    "PayloadSent" jsonb,
    "Response" jsonb,
    "processedWebhookEventsByUrlId" text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE developer."webhookUrl_events" (
    "webhookUrlId" integer NOT NULL,
    "availableWebhookEventId" integer NOT NULL,
    id integer NOT NULL,
    "advanceConfig" jsonb DEFAULT '{"timeOut": 60, "retryInterval": 10, "numberOfRetries": 0}'::jsonb NOT NULL,
    headers jsonb DEFAULT '{}'::jsonb
);
CREATE SEQUENCE developer."webhookUrl_events_Id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE developer."webhookUrl_events_Id_seq" OWNED BY developer."webhookUrl_events".id;
CREATE SEQUENCE developer."webhookUrl_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE developer."webhookUrl_id_seq" OWNED BY developer."webhookUrl".id;
CREATE TABLE "deviceHub".computer (
    "printNodeId" integer NOT NULL,
    name text,
    inet text,
    inet6 text,
    hostname text,
    jre text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    state text,
    version text
);
COMMENT ON TABLE "deviceHub".computer IS 'This shows the configuration of the system.';
CREATE TABLE "deviceHub".config (
    id integer DEFAULT public.defaultid('deviceHub'::text, 'config'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    value jsonb NOT NULL
);
CREATE TABLE "deviceHub"."labelTemplate" (
    id integer DEFAULT public.defaultid('deviceHub'::text, 'labelTemplate'::text, 'id'::text) NOT NULL,
    name text NOT NULL
);
COMMENT ON TABLE "deviceHub"."labelTemplate" IS 'This lists records of all the print templates.';
CREATE TABLE "deviceHub".printer (
    "printNodeId" integer NOT NULL,
    "computerId" integer NOT NULL,
    name text NOT NULL,
    description text,
    state text NOT NULL,
    bins jsonb,
    "collate" boolean,
    copies integer,
    color boolean,
    dpis jsonb,
    extent jsonb,
    medias jsonb,
    nup jsonb,
    papers jsonb,
    printrate jsonb,
    supports_custom_paper_size boolean,
    duplex boolean,
    "printerType" text
);
COMMENT ON TABLE "deviceHub".printer IS 'This lists records of all the printer configured in the brand.';
CREATE TABLE "deviceHub"."printerType" (
    type text NOT NULL
);
COMMENT ON TABLE "deviceHub"."printerType" IS 'It shows the printer type.';
CREATE TABLE "deviceHub".scale (
    "deviceName" text NOT NULL,
    "deviceNum" integer NOT NULL,
    "computerId" integer NOT NULL,
    vendor text,
    "vendorId" integer,
    "productId" integer,
    port text,
    count integer,
    measurement jsonb,
    "ntpOffset" integer,
    "ageOfData" integer,
    "stationId" integer,
    active boolean DEFAULT true,
    id integer DEFAULT public.defaultid('deviceHub'::text, 'scale'::text, 'id'::text) NOT NULL
);
CREATE TABLE editor.block (
    id integer DEFAULT public.defaultid('editor'::text, 'block'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    path text NOT NULL,
    assets jsonb,
    "fileId" integer NOT NULL,
    category text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
CREATE SEQUENCE editor.block_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE editor.block_id_seq OWNED BY editor.block.id;
CREATE TABLE editor."cssFileLinks" (
    "guiFileId" integer NOT NULL,
    "cssFileId" integer NOT NULL,
    "position" bigint,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    id integer DEFAULT public.defaultid('editor'::text, 'cssFileLinks'::text, 'id'::text) NOT NULL
);
CREATE SEQUENCE editor."cssFileLinks_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE editor."cssFileLinks_id_seq" OWNED BY editor."cssFileLinks".id;
CREATE TABLE editor.file (
    id integer DEFAULT public.defaultid('editor'::text, 'file'::text, 'id'::text) NOT NULL,
    path text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "fileType" text,
    commits jsonb,
    "lastSaved" timestamp with time zone,
    "fileName" text,
    "isTemplate" boolean,
    "isBlock" boolean
);
CREATE SEQUENCE editor.file_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE editor.file_id_seq OWNED BY editor.file.id;
CREATE TABLE editor."jsFileLinks" (
    "guiFileId" integer NOT NULL,
    "jsFileId" integer NOT NULL,
    "position" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    id integer DEFAULT public.defaultid('editor'::text, 'jsFileLinks'::text, 'id'::text) NOT NULL
);
CREATE SEQUENCE editor."jsFileLinks_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE editor."jsFileLinks_id_seq" OWNED BY editor."jsFileLinks".id;
CREATE TABLE editor."linkedFiles" (
    id integer NOT NULL,
    records jsonb
);
CREATE TABLE editor."systemComponent" (
    identifier text NOT NULL,
    "configTemplate" jsonb NOT NULL
);
CREATE TABLE editor.template (
    id integer DEFAULT public.defaultid('editor'::text, 'template'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    route text NOT NULL,
    type text,
    thumbnail text
);
CREATE TABLE experiences."experienceBooking" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceBooking'::text, 'id'::text) NOT NULL,
    "experienceClassId" integer,
    "hostKeycloakId" text,
    "cutoffTime" timestamp without time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "cartId" integer,
    "isPublicUrlActive" boolean DEFAULT true,
    "experienceId" integer,
    "isCancelled" boolean DEFAULT false NOT NULL
);
COMMENT ON COLUMN experiences."experienceBooking"."isPublicUrlActive" IS 'this field makes the public url active or inactive';
CREATE TABLE experiences."experienceBookingOption" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceBookingOption'::text, 'id'::text) NOT NULL,
    "experienceClassId" integer NOT NULL,
    "experienceBookingId" integer NOT NULL
);
CREATE SEQUENCE experiences."experienceBookingOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceBookingOption_id_seq" OWNED BY experiences."experienceBookingOption".id;
CREATE TABLE experiences."experienceBookingParticipant" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceBookingParticipant'::text, 'id'::text) NOT NULL,
    "experienceBookingId" integer,
    email text,
    phone text,
    "keycloakId" text,
    "isArchived" boolean DEFAULT false,
    "cartId" integer,
    rsvp boolean DEFAULT false,
    "ohyay_userId" text
);
CREATE TABLE experiences."experienceBookingParticipantChoice" (
    "experienceBookingOptionId" integer NOT NULL,
    "experienceBookingParticipantId" integer NOT NULL
);
CREATE SEQUENCE experiences."experienceBookingParticipant_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceBookingParticipant_id_seq" OWNED BY experiences."experienceBookingParticipant".id;
CREATE SEQUENCE experiences."experienceBooking_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceBooking_id_seq" OWNED BY experiences."experienceBooking".id;
CREATE TABLE experiences."experienceCategory" (
    title text NOT NULL,
    assets jsonb,
    description text
);
CREATE TABLE experiences."experienceClass" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceClass'::text, 'id'::text) NOT NULL,
    "experienceId" integer NOT NULL,
    "startTimeStamp" timestamp without time zone NOT NULL,
    duration interval NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isBooked" boolean DEFAULT false NOT NULL,
    "expertId" integer,
    "privateExperienceClassTypeId" integer,
    "publicExperienceClassTypeId" integer,
    ohyay_wsid text,
    "experienceBookingId" integer,
    updated_at timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now()
);
CREATE TABLE experiences."experienceClassOption" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceClassOption'::text, 'id'::text) NOT NULL,
    "experiencePriceLevelId" integer NOT NULL,
    "experienceClassType" text NOT NULL,
    "experienceClassId" integer NOT NULL
);
CREATE SEQUENCE experiences."experienceClassOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceClassOption_id_seq" OWNED BY experiences."experienceClassOption".id;
CREATE TABLE experiences."experienceClassType_experiencePriceLevel" (
    "experienceClassTypeId" integer NOT NULL,
    "experiencePriceLevelId" integer NOT NULL
);
CREATE SEQUENCE experiences."experienceClassType_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceClassType_id_seq" OWNED BY experiences."experienceClassType".id;
CREATE SEQUENCE experiences."experienceClass_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceClass_id_seq" OWNED BY experiences."experienceClass".id;
CREATE TABLE experiences."experienceFaq" (
    id integer NOT NULL
);
CREATE TABLE experiences."experiencePriceLevel" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experiencePriceLevel'::text, 'id'::text) NOT NULL,
    "from" integer NOT NULL,
    "to" integer NOT NULL,
    price numeric NOT NULL
);
CREATE SEQUENCE experiences."experiencePriceLevel_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experiencePriceLevel_id_seq" OWNED BY experiences."experiencePriceLevel".id;
CREATE TABLE experiences."experienceTags" (
    id integer DEFAULT public.defaultid('experiences'::text, 'experienceTags'::text, 'id'::text) NOT NULL,
    title text NOT NULL
);
CREATE SEQUENCE experiences."experienceTags_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences."experienceTags_id_seq" OWNED BY experiences."experienceTags".id;
CREATE TABLE experiences."experience_experienceCategory" (
    "experienceId" integer NOT NULL,
    "experienceCategoryTitle" text NOT NULL
);
CREATE TABLE experiences."experience_experienceTags" (
    "experienceId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "experienceTagId" integer NOT NULL
);
CREATE TABLE experiences.experience_expert (
    "expertId" integer NOT NULL,
    "experienceId" integer NOT NULL,
    "isHost" boolean DEFAULT true,
    "isAdmin" boolean
);
CREATE TABLE experiences.experience_headers (
    id integer DEFAULT public.defaultid('experiences'::text, 'experience_headers'::text, 'id'::text) NOT NULL,
    "experienceId" integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    "position" numeric
);
CREATE SEQUENCE experiences.experience_headers_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences.experience_headers_id_seq OWNED BY experiences.experience_headers.id;
CREATE SEQUENCE experiences.experience_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experiences.experience_id_seq OWNED BY experiences.experience.id;
CREATE TABLE experiences.experience_products (
    "experienceId" integer NOT NULL,
    "productId" integer NOT NULL
);
CREATE VIEW experiences."expertsByCategory" AS
 SELECT DISTINCT a."expertId",
    b."experienceCategoryTitle"
   FROM (experiences.experience_expert a
     FULL JOIN experiences."experience_experienceCategory" b ON ((a."experienceId" = b."experienceId")));
CREATE TABLE experiences."inviteType" (
    id integer NOT NULL,
    "deliveryParentShare" numeric DEFAULT 100 NOT NULL,
    "kitParentShare" numeric DEFAULT 100 NOT NULL,
    "bookingParentShare" numeric DEFAULT 100 NOT NULL,
    label text NOT NULL
);
CREATE VIEW experiences."privateExperienceClassPrices" AS
 SELECT a."experienceId",
    a.id AS "experienceClassId",
    b."experienceClassTypeId",
    b."experiencePriceLevelId",
    c."from",
    c."to",
    c.price,
    d."minimumBookingAmount",
    d."minimumParticipant",
    d."maximumParticipant"
   FROM (((experiences."experienceClass" a
     FULL JOIN experiences."experienceClassType_experiencePriceLevel" b ON ((a."privateExperienceClassTypeId" = b."experienceClassTypeId")))
     FULL JOIN experiences."experiencePriceLevel" c ON ((b."experiencePriceLevelId" = c.id)))
     FULL JOIN experiences."experienceClassType" d ON ((b."experienceClassTypeId" = d.id)))
  WHERE (a."privateExperienceClassTypeId" IS NOT NULL);
CREATE VIEW experiences."publicExperienceClassPrices" AS
 SELECT a."experienceId",
    a.id AS "experienceClassId",
    b."experienceClassTypeId",
    b."experiencePriceLevelId",
    c."from",
    c."to",
    c.price,
    d."minimumBookingAmount",
    d."minimumParticipant",
    d."maximumParticipant"
   FROM (((experiences."experienceClass" a
     FULL JOIN experiences."experienceClassType_experiencePriceLevel" b ON ((a."publicExperienceClassTypeId" = b."experienceClassTypeId")))
     FULL JOIN experiences."experiencePriceLevel" c ON ((b."experiencePriceLevelId" = c.id)))
     FULL JOIN experiences."experienceClassType" d ON ((b."experienceClassTypeId" = d.id)))
  WHERE (a."publicExperienceClassTypeId" IS NOT NULL);
CREATE TABLE experiences."workspaceMetaData" (
    id integer DEFAULT public.defaultid('experiences'::text, 'workspaceMetaData'::text, 'id'::text) NOT NULL,
    "ohyay_userId" text,
    "experienceClassId" integer,
    emoji text,
    "emojiCount" integer,
    "emojiTimestamp" timestamp with time zone,
    created_at timestamp with time zone DEFAULT now()
);
CREATE SEQUENCE experts.expert_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE experts.expert_id_seq OWNED BY experts.expert.id;
CREATE TABLE fulfilment.brand_recurrence (
    "brandId" integer NOT NULL,
    "recurrenceId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "brandLocationId" integer
);
COMMENT ON TABLE fulfilment.brand_recurrence IS 'This lists records of all the order recurrence across all the brands.';
CREATE TABLE fulfilment.charge (
    id integer DEFAULT public.defaultid('fulfilment'::text, 'charge'::text, 'id'::text) NOT NULL,
    "orderValueFrom" numeric NOT NULL,
    "orderValueUpto" numeric NOT NULL,
    charge numeric NOT NULL,
    "mileRangeId" integer,
    "autoDeliverySelection" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE fulfilment.charge IS 'This table contains the charge limit.';
CREATE TABLE fulfilment."deliveryPreferenceByCharge" (
    "chargeId" integer NOT NULL,
    "clauseId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    priority integer NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE fulfilment."deliveryPreferenceByCharge" IS 'This table shows the relationship between delivery and charge.';
CREATE TABLE fulfilment."deliveryService" (
    id integer DEFAULT public.defaultid('fulfilment'::text, 'deliveryService'::text, 'id'::text) NOT NULL,
    "partnershipId" integer,
    "isThirdParty" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT false,
    "companyName" text NOT NULL,
    logo text
);
COMMENT ON TABLE fulfilment."deliveryService" IS 'This lists all the records of delivery partner.';
CREATE TABLE fulfilment."fulfillmentType" (
    value text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "isStorePickupAddressMandatory" boolean,
    "isCustomerDeliveryAddressMandatory" boolean,
    "isStoreLocationTableIdMandatory" boolean
);
CREATE SEQUENCE fulfilment."mileRange_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE fulfilment."mileRange_id_seq" OWNED BY fulfilment."mileRange".id;
CREATE TABLE fulfilment.recurrence (
    id integer DEFAULT public.defaultid('fulfilment'::text, 'recurrence'::text, 'id'::text) NOT NULL,
    rrule text NOT NULL,
    type text DEFAULT 'PREORDER_DELIVERY'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    psql_rrule jsonb
);
CREATE SEQUENCE fulfilment.recurrence_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE fulfilment.recurrence_id_seq OWNED BY fulfilment.recurrence.id;
CREATE SEQUENCE fulfilment."timeSlot_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE fulfilment."timeSlot_id_seq" OWNED BY fulfilment."timeSlot".id;
CREATE TABLE hdb_catalog.hdb_allowlist (
    collection_name text
);
CREATE VIEW hdb_catalog.hdb_check_constraint AS
 SELECT (n.nspname)::text AS table_schema,
    (ct.relname)::text AS table_name,
    (r.conname)::text AS constraint_name,
    pg_get_constraintdef(r.oid, true) AS "check"
   FROM ((pg_constraint r
     JOIN pg_class ct ON ((r.conrelid = ct.oid)))
     JOIN pg_namespace n ON ((ct.relnamespace = n.oid)))
  WHERE (r.contype = 'c'::"char");
CREATE VIEW hdb_catalog.hdb_computed_field_function AS
 SELECT hdb_computed_field.table_schema,
    hdb_computed_field.table_name,
    hdb_computed_field.computed_field_name,
        CASE
            WHEN (((hdb_computed_field.definition -> 'function'::text) ->> 'name'::text) IS NULL) THEN (hdb_computed_field.definition ->> 'function'::text)
            ELSE ((hdb_computed_field.definition -> 'function'::text) ->> 'name'::text)
        END AS function_name,
        CASE
            WHEN (((hdb_computed_field.definition -> 'function'::text) ->> 'schema'::text) IS NULL) THEN 'public'::text
            ELSE ((hdb_computed_field.definition -> 'function'::text) ->> 'schema'::text)
        END AS function_schema
   FROM hdb_catalog.hdb_computed_field;
CREATE VIEW hdb_catalog.hdb_cron_events_stats AS
 SELECT ct.name,
    COALESCE(ce.upcoming_events_count, (0)::bigint) AS upcoming_events_count,
    COALESCE(ce.max_scheduled_time, now()) AS max_scheduled_time
   FROM (hdb_catalog.hdb_cron_triggers ct
     LEFT JOIN ( SELECT hdb_cron_events.trigger_name,
            count(*) AS upcoming_events_count,
            max(hdb_cron_events.scheduled_time) AS max_scheduled_time
           FROM hdb_catalog.hdb_cron_events
          WHERE ((hdb_cron_events.tries = 0) AND (hdb_cron_events.status = 'scheduled'::text))
          GROUP BY hdb_cron_events.trigger_name) ce ON ((ct.name = ce.trigger_name)));
CREATE VIEW hdb_catalog.hdb_foreign_key_constraint AS
 SELECT (q.table_schema)::text AS table_schema,
    (q.table_name)::text AS table_name,
    (q.constraint_name)::text AS constraint_name,
    (min(q.constraint_oid))::integer AS constraint_oid,
    min((q.ref_table_table_schema)::text) AS ref_table_table_schema,
    min((q.ref_table)::text) AS ref_table,
    json_object_agg(ac.attname, afc.attname) AS column_mapping,
    min((q.confupdtype)::text) AS on_update,
    min((q.confdeltype)::text) AS on_delete,
    json_agg(ac.attname) AS columns,
    json_agg(afc.attname) AS ref_columns
   FROM ((( SELECT ctn.nspname AS table_schema,
            ct.relname AS table_name,
            r.conrelid AS table_id,
            r.conname AS constraint_name,
            r.oid AS constraint_oid,
            cftn.nspname AS ref_table_table_schema,
            cft.relname AS ref_table,
            r.confrelid AS ref_table_id,
            r.confupdtype,
            r.confdeltype,
            unnest(r.conkey) AS column_id,
            unnest(r.confkey) AS ref_column_id
           FROM ((((pg_constraint r
             JOIN pg_class ct ON ((r.conrelid = ct.oid)))
             JOIN pg_namespace ctn ON ((ct.relnamespace = ctn.oid)))
             JOIN pg_class cft ON ((r.confrelid = cft.oid)))
             JOIN pg_namespace cftn ON ((cft.relnamespace = cftn.oid)))
          WHERE (r.contype = 'f'::"char")) q
     JOIN pg_attribute ac ON (((q.column_id = ac.attnum) AND (q.table_id = ac.attrelid))))
     JOIN pg_attribute afc ON (((q.ref_column_id = afc.attnum) AND (q.ref_table_id = afc.attrelid))))
  GROUP BY q.table_schema, q.table_name, q.constraint_name;
CREATE VIEW hdb_catalog.hdb_function_agg AS
 SELECT (p.proname)::text AS function_name,
    (pn.nspname)::text AS function_schema,
    pd.description,
        CASE
            WHEN (p.provariadic = (0)::oid) THEN false
            ELSE true
        END AS has_variadic,
        CASE
            WHEN ((p.provolatile)::text = ('i'::character(1))::text) THEN 'IMMUTABLE'::text
            WHEN ((p.provolatile)::text = ('s'::character(1))::text) THEN 'STABLE'::text
            WHEN ((p.provolatile)::text = ('v'::character(1))::text) THEN 'VOLATILE'::text
            ELSE NULL::text
        END AS function_type,
    pg_get_functiondef(p.oid) AS function_definition,
    (rtn.nspname)::text AS return_type_schema,
    (rt.typname)::text AS return_type_name,
    (rt.typtype)::text AS return_type_type,
    p.proretset AS returns_set,
    ( SELECT COALESCE(json_agg(json_build_object('schema', q.schema, 'name', q.name, 'type', q.type)), '[]'::json) AS "coalesce"
           FROM ( SELECT pt.typname AS name,
                    pns.nspname AS schema,
                    pt.typtype AS type,
                    pat.ordinality
                   FROM ((unnest(COALESCE(p.proallargtypes, (p.proargtypes)::oid[])) WITH ORDINALITY pat(oid, ordinality)
                     LEFT JOIN pg_type pt ON ((pt.oid = pat.oid)))
                     LEFT JOIN pg_namespace pns ON ((pt.typnamespace = pns.oid)))
                  ORDER BY pat.ordinality) q) AS input_arg_types,
    to_json(COALESCE(p.proargnames, ARRAY[]::text[])) AS input_arg_names,
    p.pronargdefaults AS default_args,
    (p.oid)::integer AS function_oid
   FROM ((((pg_proc p
     JOIN pg_namespace pn ON ((pn.oid = p.pronamespace)))
     JOIN pg_type rt ON ((rt.oid = p.prorettype)))
     JOIN pg_namespace rtn ON ((rtn.oid = rt.typnamespace)))
     LEFT JOIN pg_description pd ON ((p.oid = pd.objoid)))
  WHERE (((pn.nspname)::text !~~ 'pg_%'::text) AND ((pn.nspname)::text <> ALL (ARRAY['information_schema'::text, 'hdb_catalog'::text, 'hdb_views'::text])) AND (NOT (EXISTS ( SELECT 1
           FROM pg_aggregate
          WHERE ((pg_aggregate.aggfnoid)::oid = p.oid)))));
CREATE VIEW hdb_catalog.hdb_function_info_agg AS
 SELECT hdb_function_agg.function_name,
    hdb_function_agg.function_schema,
    row_to_json(( SELECT e.*::record AS e
           FROM ( SELECT hdb_function_agg.description,
                    hdb_function_agg.has_variadic,
                    hdb_function_agg.function_type,
                    hdb_function_agg.return_type_schema,
                    hdb_function_agg.return_type_name,
                    hdb_function_agg.return_type_type,
                    hdb_function_agg.returns_set,
                    hdb_function_agg.input_arg_types,
                    hdb_function_agg.input_arg_names,
                    hdb_function_agg.default_args,
                    ((EXISTS ( SELECT 1
                           FROM information_schema.tables
                          WHERE (((tables.table_schema)::name = hdb_function_agg.return_type_schema) AND ((tables.table_name)::name = hdb_function_agg.return_type_name)))) OR (EXISTS ( SELECT 1
                           FROM pg_matviews
                          WHERE ((pg_matviews.schemaname = hdb_function_agg.return_type_schema) AND (pg_matviews.matviewname = hdb_function_agg.return_type_name))))) AS returns_table) e)) AS function_info
   FROM hdb_catalog.hdb_function_agg;
CREATE VIEW hdb_catalog.hdb_permission_agg AS
 SELECT hdb_permission.table_schema,
    hdb_permission.table_name,
    hdb_permission.role_name,
    json_object_agg(hdb_permission.perm_type, hdb_permission.perm_def) AS permissions
   FROM hdb_catalog.hdb_permission
  GROUP BY hdb_permission.table_schema, hdb_permission.table_name, hdb_permission.role_name;
CREATE VIEW hdb_catalog.hdb_primary_key AS
 SELECT tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    json_agg(constraint_column_usage.column_name) AS columns
   FROM (information_schema.table_constraints tc
     JOIN ( SELECT x.tblschema AS table_schema,
            x.tblname AS table_name,
            x.colname AS column_name,
            x.cstrname AS constraint_name
           FROM ( SELECT DISTINCT nr.nspname,
                    r.relname,
                    a.attname,
                    c.conname
                   FROM pg_namespace nr,
                    pg_class r,
                    pg_attribute a,
                    pg_depend d,
                    pg_namespace nc,
                    pg_constraint c
                  WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (d.refclassid = ('pg_class'::regclass)::oid) AND (d.refobjid = r.oid) AND (d.refobjsubid = a.attnum) AND (d.classid = ('pg_constraint'::regclass)::oid) AND (d.objid = c.oid) AND (c.connamespace = nc.oid) AND (c.contype = 'c'::"char") AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"])) AND (NOT a.attisdropped))
                UNION ALL
                 SELECT nr.nspname,
                    r.relname,
                    a.attname,
                    c.conname
                   FROM pg_namespace nr,
                    pg_class r,
                    pg_attribute a,
                    pg_namespace nc,
                    pg_constraint c
                  WHERE ((nr.oid = r.relnamespace) AND (r.oid = a.attrelid) AND (nc.oid = c.connamespace) AND (r.oid =
                        CASE c.contype
                            WHEN 'f'::"char" THEN c.confrelid
                            ELSE c.conrelid
                        END) AND (a.attnum = ANY (
                        CASE c.contype
                            WHEN 'f'::"char" THEN c.confkey
                            ELSE c.conkey
                        END)) AND (NOT a.attisdropped) AND (c.contype = ANY (ARRAY['p'::"char", 'u'::"char", 'f'::"char"])) AND (r.relkind = ANY (ARRAY['r'::"char", 'p'::"char"])))) x(tblschema, tblname, colname, cstrname)) constraint_column_usage ON ((((tc.constraint_name)::text = (constraint_column_usage.constraint_name)::text) AND ((tc.table_schema)::text = (constraint_column_usage.table_schema)::text) AND ((tc.table_name)::text = (constraint_column_usage.table_name)::text))))
  WHERE ((tc.constraint_type)::text = 'PRIMARY KEY'::text)
  GROUP BY tc.table_schema, tc.table_name, tc.constraint_name;
CREATE TABLE hdb_catalog.hdb_query_collection (
    collection_name text NOT NULL,
    collection_defn jsonb NOT NULL,
    comment text,
    is_system_defined boolean DEFAULT false
);
CREATE VIEW hdb_catalog.hdb_role AS
 SELECT DISTINCT q.role_name
   FROM ( SELECT hdb_permission.role_name
           FROM hdb_catalog.hdb_permission
        UNION ALL
         SELECT hdb_action_permission.role_name
           FROM hdb_catalog.hdb_action_permission) q;
CREATE TABLE hdb_catalog.hdb_schema_update_event (
    instance_id uuid NOT NULL,
    occurred_at timestamp with time zone DEFAULT now() NOT NULL,
    invalidations json NOT NULL
);
CREATE VIEW hdb_catalog.hdb_table_info_agg AS
 SELECT schema.nspname AS table_schema,
    "table".relname AS table_name,
    jsonb_build_object('oid', ("table".oid)::integer, 'columns', COALESCE(columns.info, '[]'::jsonb), 'primary_key', primary_key.info, 'unique_constraints', COALESCE(unique_constraints.info, '[]'::jsonb), 'foreign_keys', COALESCE(foreign_key_constraints.info, '[]'::jsonb), 'view_info',
        CASE "table".relkind
            WHEN 'v'::"char" THEN jsonb_build_object('is_updatable', ((pg_relation_is_updatable(("table".oid)::regclass, true) & 4) = 4), 'is_insertable', ((pg_relation_is_updatable(("table".oid)::regclass, true) & 8) = 8), 'is_deletable', ((pg_relation_is_updatable(("table".oid)::regclass, true) & 16) = 16))
            ELSE NULL::jsonb
        END, 'description', description.description) AS info
   FROM ((((((pg_class "table"
     JOIN pg_namespace schema ON ((schema.oid = "table".relnamespace)))
     LEFT JOIN pg_description description ON (((description.classoid = ('pg_class'::regclass)::oid) AND (description.objoid = "table".oid) AND (description.objsubid = 0))))
     LEFT JOIN LATERAL ( SELECT jsonb_agg(jsonb_build_object('name', "column".attname, 'position', "column".attnum, 'type', COALESCE(base_type.typname, type.typname), 'is_nullable', (NOT "column".attnotnull), 'description', col_description("table".oid, ("column".attnum)::integer))) AS info
           FROM ((pg_attribute "column"
             LEFT JOIN pg_type type ON ((type.oid = "column".atttypid)))
             LEFT JOIN pg_type base_type ON (((type.typtype = 'd'::"char") AND (base_type.oid = type.typbasetype))))
          WHERE (("column".attrelid = "table".oid) AND ("column".attnum > 0) AND (NOT "column".attisdropped))) columns ON (true))
     LEFT JOIN LATERAL ( SELECT jsonb_build_object('constraint', jsonb_build_object('name', class.relname, 'oid', (class.oid)::integer), 'columns', COALESCE(columns_1.info, '[]'::jsonb)) AS info
           FROM ((pg_index index
             JOIN pg_class class ON ((class.oid = index.indexrelid)))
             LEFT JOIN LATERAL ( SELECT jsonb_agg("column".attname) AS info
                   FROM pg_attribute "column"
                  WHERE (("column".attrelid = "table".oid) AND ("column".attnum = ANY ((index.indkey)::smallint[])))) columns_1 ON (true))
          WHERE ((index.indrelid = "table".oid) AND index.indisprimary)) primary_key ON (true))
     LEFT JOIN LATERAL ( SELECT jsonb_agg(jsonb_build_object('name', class.relname, 'oid', (class.oid)::integer)) AS info
           FROM (pg_index index
             JOIN pg_class class ON ((class.oid = index.indexrelid)))
          WHERE ((index.indrelid = "table".oid) AND index.indisunique AND (NOT index.indisprimary))) unique_constraints ON (true))
     LEFT JOIN LATERAL ( SELECT jsonb_agg(jsonb_build_object('constraint', jsonb_build_object('name', foreign_key.constraint_name, 'oid', foreign_key.constraint_oid), 'columns', foreign_key.columns, 'foreign_table', jsonb_build_object('schema', foreign_key.ref_table_table_schema, 'name', foreign_key.ref_table), 'foreign_columns', foreign_key.ref_columns)) AS info
           FROM hdb_catalog.hdb_foreign_key_constraint foreign_key
          WHERE ((foreign_key.table_schema = schema.nspname) AND (foreign_key.table_name = "table".relname))) foreign_key_constraints ON (true))
  WHERE ("table".relkind = ANY (ARRAY['r'::"char", 't'::"char", 'v'::"char", 'm'::"char", 'f'::"char", 'p'::"char"]));
CREATE VIEW hdb_catalog.hdb_unique_constraint AS
 SELECT tc.table_name,
    tc.constraint_schema AS table_schema,
    tc.constraint_name,
    json_agg(kcu.column_name) AS columns
   FROM (information_schema.table_constraints tc
     JOIN information_schema.key_column_usage kcu USING (constraint_schema, constraint_name))
  WHERE ((tc.constraint_type)::text = 'UNIQUE'::text)
  GROUP BY tc.table_name, tc.constraint_schema, tc.constraint_name;
CREATE TABLE hdb_catalog.hdb_version (
    hasura_uuid uuid DEFAULT public.gen_random_uuid() NOT NULL,
    version text NOT NULL,
    upgraded_on timestamp with time zone NOT NULL,
    cli_state jsonb DEFAULT '{}'::jsonb NOT NULL,
    console_state jsonb DEFAULT '{}'::jsonb NOT NULL
);
CREATE TABLE hdb_catalog.migration_settings (
    setting text NOT NULL,
    value text NOT NULL
);
CREATE SEQUENCE hdb_catalog.remote_schemas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE hdb_catalog.remote_schemas_id_seq OWNED BY hdb_catalog.remote_schemas.id;
CREATE TABLE hdb_catalog.schema_migrations (
    version bigint NOT NULL,
    dirty boolean NOT NULL
);
CREATE TABLE imports.import (
    id integer DEFAULT public.defaultid('imports'::text, 'import'::text, 'id'::text) NOT NULL,
    entity text NOT NULL,
    file text NOT NULL,
    "importType" text NOT NULL,
    confirm boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    status text
);
COMMENT ON TABLE imports.import IS 'Using this table we can import data from any of vendor, supplier.';
CREATE TABLE imports."importHistory" (
    id integer DEFAULT public.defaultid('imports'::text, 'importHistory'::text, 'id'::text) NOT NULL,
    "importId" integer,
    "importFrom" text
);
COMMENT ON TABLE imports."importHistory" IS 'This shows the imported file history.';
CREATE TABLE ingredient."ingredientProcessing" (
    id integer DEFAULT public.defaultid('ingredient'::text, 'ingredientProcessing'::text, 'id'::text) NOT NULL,
    "processingName" text NOT NULL,
    "ingredientId" integer NOT NULL,
    "nutritionalInfo" jsonb,
    cost jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false NOT NULL,
    "nutritionId" integer
);
COMMENT ON TABLE ingredient."ingredientProcessing" IS 'This lists records of all the ingredient processing across all the brands.';
CREATE VIEW ingredient."ingredientProcessingView" AS
 SELECT "ingredientProcessing".id,
    "ingredientProcessing"."processingName",
    "ingredientProcessing"."ingredientId",
    "ingredientProcessing"."nutritionalInfo",
    "ingredientProcessing".cost,
    "ingredientProcessing".created_at,
    "ingredientProcessing".updated_at,
    "ingredientProcessing"."isArchived",
    concat(( SELECT ingredient.name
           FROM ingredient.ingredient
          WHERE (ingredient.id = "ingredientProcessing"."ingredientId")), ' - ', "ingredientProcessing"."processingName") AS "displayName"
   FROM ingredient."ingredientProcessing";
COMMENT ON VIEW ingredient."ingredientProcessingView" IS 'This shows the detailed information of ingredient processing.';
CREATE SEQUENCE ingredient."ingredientProcessing_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ingredient."ingredientProcessing_id_seq" OWNED BY ingredient."ingredientProcessing".id;
CREATE TABLE ingredient."ingredientSacahet_recipeHubSachet" (
    "ingredientSachetId" integer NOT NULL,
    "recipeHubSachetId" uuid NOT NULL
);
COMMENT ON TABLE ingredient."ingredientSacahet_recipeHubSachet" IS 'This shows the relationship between sachet and recipe.';
CREATE VIEW ingredient."ingredientSachetView" AS
 SELECT "ingredientSachet".id,
    "ingredientSachet".quantity,
    "ingredientSachet"."ingredientProcessingId",
    "ingredientSachet"."ingredientId",
    "ingredientSachet"."createdAt",
    "ingredientSachet"."updatedAt",
    "ingredientSachet".tracking,
    "ingredientSachet".unit,
    "ingredientSachet".visibility,
    "ingredientSachet"."liveMOF",
    "ingredientSachet"."isArchived",
    concat(( SELECT "ingredientProcessingView"."displayName"
           FROM ingredient."ingredientProcessingView"
          WHERE ("ingredientProcessingView".id = "ingredientSachet"."ingredientProcessingId")), ' - ', "ingredientSachet".quantity, "ingredientSachet".unit) AS "displayName"
   FROM ingredient."ingredientSachet";
COMMENT ON VIEW ingredient."ingredientSachetView" IS 'This shows the detailed information of ingredient sachet.';
CREATE SEQUENCE ingredient."ingredientSachet_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ingredient."ingredientSachet_id_seq" OWNED BY ingredient."ingredientSachet".id;
CREATE TABLE ingredient."ingredientSachet_unitConversion" (
    id integer NOT NULL,
    "entityId" integer NOT NULL,
    "unitConversionId" integer NOT NULL
);
COMMENT ON TABLE ingredient."ingredientSachet_unitConversion" IS 'This table shows the link between sachet and unit conversion.';
CREATE SEQUENCE ingredient."ingredientSachet_unitConversion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ingredient."ingredientSachet_unitConversion_id_seq" OWNED BY ingredient."ingredientSachet_unitConversion".id;
CREATE SEQUENCE ingredient.ingredient_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ingredient.ingredient_id_seq OWNED BY ingredient.ingredient.id;
CREATE TABLE ingredient."modeOfFulfillmentEnum" (
    value text NOT NULL,
    description text
);
CREATE SEQUENCE ingredient."modeOfFulfillment_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ingredient."modeOfFulfillment_id_seq" OWNED BY ingredient."modeOfFulfillment".id;
CREATE SEQUENCE insights.analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE insights.analytics_id_seq OWNED BY insights.analytics.id;
CREATE TABLE insights.app_module_insight (
    "appTitle" text NOT NULL,
    "moduleTitle" text NOT NULL,
    "insightIdentifier" text NOT NULL
);
CREATE TABLE insights.chart (
    id integer DEFAULT public.defaultid('insights'::text, 'chart'::text, 'id'::text) NOT NULL,
    "layoutType" text DEFAULT 'HERO'::text,
    config jsonb,
    "insightIdentifier" text NOT NULL
);
CREATE TABLE insights.date (
    date date NOT NULL,
    day text
);
CREATE TABLE insights.day (
    "dayName" text NOT NULL,
    "dayNumber" integer
);
CREATE TABLE insights.hour (
    hour integer NOT NULL
);
CREATE TABLE insights.insights (
    query text NOT NULL,
    "availableOptions" jsonb NOT NULL,
    switches jsonb NOT NULL,
    "isActive" boolean DEFAULT false,
    "defaultOptions" jsonb,
    identifier text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    filters jsonb,
    config jsonb,
    "schemaVariables" jsonb
);
COMMENT ON COLUMN insights.insights.filters IS 'same as availableOptions, will be used to render individual options like date range in insights.';
CREATE TABLE insights.month (
    number integer NOT NULL,
    name text NOT NULL
);
CREATE TABLE instructions."instructionSet" (
    id integer DEFAULT public.defaultid('instructions'::text, 'instructionSet'::text, 'id'::text) NOT NULL,
    title text,
    "position" integer,
    "simpleRecipeId" integer,
    "productOptionId" integer
);
CREATE SEQUENCE instructions."instructionSet_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE instructions."instructionSet_id_seq" OWNED BY instructions."instructionSet".id;
CREATE TABLE instructions."instructionStep" (
    id integer DEFAULT public.defaultid('instructions'::text, 'instructionStep'::text, 'id'::text) NOT NULL,
    title text,
    description text,
    assets jsonb DEFAULT jsonb_build_object('images', '[]'::jsonb, 'videos', '[]'::jsonb) NOT NULL,
    "position" integer,
    "instructionSetId" integer NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE instructions."instructionStep_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE instructions."instructionStep_id_seq" OWNED BY instructions."instructionStep".id;
CREATE TABLE inventory."bulkItemHistory" (
    id integer DEFAULT public.defaultid('inventory'::text, 'bulkItemHistory'::text, 'id'::text) NOT NULL,
    "bulkItemId" integer NOT NULL,
    quantity numeric NOT NULL,
    comment jsonb,
    "purchaseOrderItemId" integer,
    "bulkWorkOrderId" integer,
    status text NOT NULL,
    unit text,
    "orderSachetId" integer,
    "sachetWorkOrderId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isResolved" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE inventory."bulkItemHistory" IS 'This table shows all the bulk item history.';
CREATE SEQUENCE inventory."bulkItemHistory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."bulkItemHistory_id_seq" OWNED BY inventory."bulkItemHistory".id;
CREATE VIEW inventory."bulkItemView" AS
 SELECT "bulkItem"."supplierItemId",
    "bulkItem"."processingName",
    ( SELECT "supplierItem".name
           FROM inventory."supplierItem"
          WHERE ("supplierItem".id = "bulkItem"."supplierItemId")) AS "supplierItemName",
    ( SELECT "supplierItem"."supplierId"
           FROM inventory."supplierItem"
          WHERE ("supplierItem".id = "bulkItem"."supplierItemId")) AS "supplierId",
    "bulkItem".id,
    "bulkItem"."bulkDensity"
   FROM inventory."bulkItem";
COMMENT ON VIEW inventory."bulkItemView" IS 'This shows the relationship between item and supplier.';
CREATE SEQUENCE inventory."bulkItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."bulkItem_id_seq" OWNED BY inventory."bulkItem".id;
CREATE TABLE inventory."bulkItem_unitConversion" (
    id integer DEFAULT public.defaultid('inventory'::text, 'bulkItem_unitConversion'::text, 'id'::text) NOT NULL,
    "entityId" integer NOT NULL,
    "unitConversionId" integer NOT NULL
);
COMMENT ON TABLE inventory."bulkItem_unitConversion" IS 'This table shows that the relationship between item and unit .';
CREATE SEQUENCE inventory."bulkItem_unitConversion_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."bulkItem_unitConversion_id_seq" OWNED BY inventory."bulkItem_unitConversion".id;
CREATE TABLE inventory."bulkWorkOrder" (
    id integer DEFAULT public.defaultid('inventory'::text, 'bulkWorkOrder'::text, 'id'::text) NOT NULL,
    "inputBulkItemId" integer,
    "outputBulkItemId" integer,
    "outputQuantity" numeric DEFAULT 0 NOT NULL,
    "userId" integer,
    "scheduledOn" timestamp with time zone,
    "inputQuantity" numeric,
    status text DEFAULT 'UNPUBLISHED'::text,
    "stationId" integer,
    "inputQuantityUnit" text,
    "supplierItemId" integer,
    "isPublished" boolean DEFAULT false NOT NULL,
    name text,
    "outputYield" numeric
);
COMMENT ON TABLE inventory."bulkWorkOrder" IS 'This lists records of all the bulk orders.';
CREATE SEQUENCE inventory."bulkWorkOrder_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."bulkWorkOrder_id_seq" OWNED BY inventory."bulkWorkOrder".id;
CREATE TABLE inventory."packagingHistory" (
    id integer DEFAULT public.defaultid('inventory'::text, 'packagingHistory'::text, 'id'::text) NOT NULL,
    "packagingId" integer NOT NULL,
    quantity numeric NOT NULL,
    "purchaseOrderItemId" integer NOT NULL,
    status text DEFAULT 'PENDING'::text NOT NULL,
    unit text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE inventory."packagingHistory" IS 'This table contains the packaging records across all the brands.';
CREATE SEQUENCE inventory."packagingHistory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."packagingHistory_id_seq" OWNED BY inventory."packagingHistory".id;
CREATE TABLE inventory."purchaseOrderItem" (
    id integer DEFAULT public.defaultid('inventory'::text, 'purchaseOrderItem'::text, 'id'::text) NOT NULL,
    "bulkItemId" integer,
    "supplierItemId" integer,
    "orderQuantity" numeric DEFAULT 0,
    status text DEFAULT 'UNPUBLISHED'::text NOT NULL,
    details jsonb,
    unit text,
    "supplierId" integer,
    price numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "packagingId" integer,
    "mandiPurchaseOrderItemId" integer,
    type text DEFAULT 'PACKAGING'::text NOT NULL
);
COMMENT ON TABLE inventory."purchaseOrderItem" IS 'This lists records of all the purchase order across all the suppliers.';
CREATE SEQUENCE inventory."purchaseOrderItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."purchaseOrderItem_id_seq" OWNED BY inventory."purchaseOrderItem".id;
CREATE TABLE inventory."sachetItemHistory" (
    id integer DEFAULT public.defaultid('inventory'::text, 'sachetItemHistory'::text, 'id'::text) NOT NULL,
    "sachetItemId" integer NOT NULL,
    "sachetWorkOrderId" integer,
    quantity numeric NOT NULL,
    comment jsonb,
    status text NOT NULL,
    "orderSachetId" integer,
    unit text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isResolved" boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE inventory."sachetItemHistory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."sachetItemHistory_id_seq" OWNED BY inventory."sachetItemHistory".id;
CREATE VIEW inventory."sachetItemView" AS
 SELECT "sachetItem".id,
    "sachetItem"."unitSize",
    "sachetItem"."bulkItemId",
    ( SELECT "bulkItemView"."supplierItemName"
           FROM inventory."bulkItemView"
          WHERE ("bulkItemView".id = "sachetItem"."bulkItemId")) AS "supplierItemName",
    ( SELECT "bulkItemView"."processingName"
           FROM inventory."bulkItemView"
          WHERE ("bulkItemView".id = "sachetItem"."bulkItemId")) AS "processingName",
    ( SELECT "bulkItemView"."supplierId"
           FROM inventory."bulkItemView"
          WHERE ("bulkItemView".id = "sachetItem"."bulkItemId")) AS "supplierId",
    "sachetItem".unit,
    ( SELECT "bulkItem"."bulkDensity"
           FROM inventory."bulkItem"
          WHERE ("bulkItem".id = "sachetItem"."bulkItemId")) AS "bulkDensity"
   FROM inventory."sachetItem";
CREATE SEQUENCE inventory."sachetItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."sachetItem_id_seq" OWNED BY inventory."sachetItem".id;
CREATE TABLE inventory."sachetItem_unitConversion" (
    id integer NOT NULL,
    "entityId" integer NOT NULL,
    "unitConversionId" integer NOT NULL
);
COMMENT ON TABLE inventory."sachetItem_unitConversion" IS 'This shows the relationship between sachet item and unit.';
CREATE SEQUENCE inventory."sachetItem_unitConversion_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."sachetItem_unitConversion_id_seq" OWNED BY inventory."sachetItem_unitConversion".id;
CREATE TABLE inventory."sachetWorkOrder" (
    id integer DEFAULT public.defaultid('inventory'::text, 'sachetWorkOrder'::text, 'id'::text) NOT NULL,
    "inputBulkItemId" integer,
    "outputSachetItemId" integer,
    "outputQuantity" numeric DEFAULT 0 NOT NULL,
    "inputQuantity" numeric,
    "packagingId" integer,
    label jsonb,
    "stationId" integer,
    "userId" integer,
    "scheduledOn" timestamp with time zone,
    status text DEFAULT 'UNPUBLISHED'::text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    name text,
    "supplierItemId" integer,
    "isPublished" boolean DEFAULT false NOT NULL,
    "inputQuantityUnit" text
);
CREATE SEQUENCE inventory."sachetWorkOrder_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."sachetWorkOrder_id_seq" OWNED BY inventory."sachetWorkOrder".id;
CREATE TABLE inventory.supplier (
    id integer DEFAULT public.defaultid('inventory'::text, 'supplier'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "contactPerson" jsonb,
    address jsonb,
    "shippingTerms" jsonb,
    "paymentTerms" jsonb,
    available boolean DEFAULT true NOT NULL,
    "importId" integer,
    "mandiSupplierId" integer,
    logo jsonb,
    "isArchived" boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE inventory.supplier IS 'This lists records of all the supplier across all the brand.';
CREATE VIEW inventory."supplierItemView" AS
 SELECT "supplierItem"."supplierId",
    "supplierItem".name AS "supplierItemName",
    "supplierItem"."unitSize",
    "supplierItem".unit,
    ( SELECT "bulkItemView"."processingName"
           FROM inventory."bulkItemView"
          WHERE ("bulkItemView".id = "supplierItem"."bulkItemAsShippedId")) AS "processingName",
    "supplierItem".id,
    ( SELECT "bulkItem"."bulkDensity"
           FROM inventory."bulkItem"
          WHERE ("bulkItem".id = "supplierItem"."bulkItemAsShippedId")) AS "bulkDensity"
   FROM inventory."supplierItem";
CREATE SEQUENCE inventory."supplierItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."supplierItem_id_seq" OWNED BY inventory."supplierItem".id;
CREATE TABLE inventory."supplierItem_unitConversion" (
    id integer DEFAULT public.defaultid('inventory'::text, 'supplierItem_unitConversion'::text, 'id'::text) NOT NULL,
    "entityId" integer NOT NULL,
    "unitConversionId" integer NOT NULL
);
COMMENT ON TABLE inventory."supplierItem_unitConversion" IS 'This shows the relationship between supplier item and unit.';
CREATE SEQUENCE inventory."supplierItem_unitConversion_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory."supplierItem_unitConversion_id_seq" OWNED BY inventory."supplierItem_unitConversion".id;
CREATE SEQUENCE inventory.supplier_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE inventory.supplier_id_seq OWNED BY inventory.supplier.id;
CREATE TABLE inventory."unitConversionByBulkItem" (
    "bulkItemId" integer NOT NULL,
    "unitConversionId" integer NOT NULL,
    "customConversionFactor" numeric NOT NULL,
    id integer DEFAULT public.defaultid('inventory'::text, 'unitConversionByBulkItem'::text, 'id'::text) NOT NULL
);
CREATE TABLE master."accompanimentType" (
    id integer DEFAULT public.defaultid('master'::text, 'accompanimentType'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."accompanimentType" IS 'This lists records of all the type of accompaniment across all the brand.';
CREATE SEQUENCE master."accompanimentType_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master."accompanimentType_id_seq" OWNED BY master."accompanimentType".id;
CREATE TABLE master."allergenName" (
    id integer DEFAULT public.defaultid('master'::text, 'allergenName'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."allergenName" IS 'This lists records of all the allergens items.';
CREATE SEQUENCE master."allergenName_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master."allergenName_id_seq" OWNED BY master."allergenName".id;
CREATE TABLE master."cuisineName" (
    name text NOT NULL,
    id integer DEFAULT public.defaultid('master'::text, 'cuisineName'::text, 'id'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."cuisineName" IS 'This lists records of all the cuisine.';
CREATE SEQUENCE master."cuisineName_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master."cuisineName_id_seq" OWNED BY master."cuisineName".id;
CREATE TABLE master."ingredientCategory" (
    name text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."ingredientCategory" IS 'This contains all the records of ingredient category.';
CREATE TABLE master."processingName" (
    id integer DEFAULT public.defaultid('master'::text, 'processingName'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."processingName" IS 'This shows all the processing name across all the brand.';
CREATE SEQUENCE master."processingName_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master."processingName_id_seq" OWNED BY master."processingName".id;
CREATE TABLE master."productCategory" (
    name text NOT NULL,
    "imageUrl" text,
    "iconUrl" text,
    "metaDetails" jsonb,
    "importHistoryId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."productCategory" IS 'It shows the product category.';
CREATE TABLE master."recipeComponent" (
    label text NOT NULL
);
CREATE TABLE master.unit (
    id integer DEFAULT public.defaultid('master'::text, 'unit'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "isStandard" boolean DEFAULT true NOT NULL,
    type text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master.unit IS 'This lists records of all the units.';
CREATE TABLE master."unitConversion" (
    id integer DEFAULT public.defaultid('master'::text, 'unitConversion'::text, 'id'::text) NOT NULL,
    "inputUnitName" text NOT NULL,
    "outputUnitName" text NOT NULL,
    "conversionFactor" numeric NOT NULL,
    "bulkDensity" numeric,
    "isCanonical" boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE master."unitConversion" IS 'This shows the unit conversion.';
COMMENT ON COLUMN master."unitConversion"."bulkDensity" IS 'kg/l';
COMMENT ON COLUMN master."unitConversion"."isCanonical" IS 'is standard?';
CREATE SEQUENCE master."unitConversion_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master."unitConversion_id_seq" OWNED BY master."unitConversion".id;
CREATE SEQUENCE master.unit_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE master.unit_id_seq OWNED BY master.unit.id;
CREATE TABLE master."vegNonvegType" (
    label text NOT NULL,
    icon text,
    description text
);
COMMENT ON TABLE master."vegNonvegType" IS 'This table contains the item identity either veg or nonveg.';
CREATE TABLE notifications.brand_touchpoint (
    "touchpointIdentifier" text NOT NULL,
    "brandId" integer NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    "timeIntervalInMins" integer,
    "configuredEmailTriggerTitle" text NOT NULL
);
CREATE TABLE notifications."displayNotification" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "typeId" uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    content jsonb NOT NULL,
    seen boolean DEFAULT false NOT NULL
);
CREATE TABLE notifications."emailConfig" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "typeId" uuid NOT NULL,
    template jsonb,
    email text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
CREATE TABLE notifications."emailTriggers" (
    id integer DEFAULT public.defaultid('notifications'::text, 'emailTriggers'::text, 'id'::text) NOT NULL,
    title text,
    description text NOT NULL,
    var jsonb,
    "emailTemplateFileId" integer,
    "functionFileId" integer,
    "subjectLineTemplate" text,
    "fromEmail" text
);
CREATE SEQUENCE notifications."emailTriggers_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE notifications."emailTriggers_id_seq" OWNED BY notifications."emailTriggers".id;
CREATE TABLE notifications."printConfig" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "printerPrintNodeId" integer,
    "typeId" uuid NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    template jsonb NOT NULL
);
CREATE TABLE notifications."smsConfig" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "typeId" uuid NOT NULL,
    template jsonb,
    "phoneNo" text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
CREATE TABLE notifications.touchpoints (
    identifier text NOT NULL
);
CREATE TABLE notifications.type (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    name text NOT NULL,
    description text,
    app text NOT NULL,
    "table" text NOT NULL,
    schema text NOT NULL,
    op text NOT NULL,
    fields jsonb NOT NULL,
    "isActive" boolean DEFAULT false NOT NULL,
    template jsonb NOT NULL,
    "isLocal" boolean DEFAULT true NOT NULL,
    "isGlobal" boolean DEFAULT true NOT NULL,
    "playAudio" boolean DEFAULT false,
    "audioUrl" text,
    "webhookEnv" text DEFAULT 'WEBHOOK_DEFAULT_NOTIFICATION_HANDLER'::text,
    "emailFrom" jsonb DEFAULT '{"name": "", "email": ""}'::jsonb
);
CREATE TABLE "onDemand".brand_collection (
    "brandId" integer NOT NULL,
    "collectionId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "importHistoryId" integer
);
COMMENT ON TABLE "onDemand".brand_collection IS 'This lists records of all the collection across all the brand .';
CREATE TABLE "onDemand".category (
    name text NOT NULL,
    id integer DEFAULT public.defaultid('onDemand'::text, 'category'::text, 'id'::text) NOT NULL
);
COMMENT ON TABLE "onDemand".category IS 'This lists records of all the categories.';
CREATE TABLE "onDemand".collection (
    id integer DEFAULT public.defaultid('onDemand'::text, 'collection'::text, 'id'::text) NOT NULL,
    name text,
    "startTime" time without time zone,
    "endTime" time without time zone,
    rrule jsonb,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "importHistoryId" integer
);
COMMENT ON TABLE "onDemand".collection IS 'This table shows the collection name and timing.';
CREATE VIEW "onDemand"."collectionDetails" AS
 SELECT collection.id,
    collection.name,
    collection."startTime",
    collection."endTime",
    collection.rrule,
    "onDemand"."numberOfCategories"(collection.id) AS "categoriesCount",
    "onDemand"."numberOfProducts"(collection.id) AS "productsCount",
    collection.created_at,
    collection.updated_at
   FROM "onDemand".collection;
COMMENT ON VIEW "onDemand"."collectionDetails" IS 'This shows the detailed information of collection.';
CREATE SEQUENCE "onDemand".collection_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand".collection_id_seq OWNED BY "onDemand".collection.id;
CREATE TABLE "onDemand"."collection_productCategory" (
    id integer DEFAULT public.defaultid('onDemand'::text, 'collection_productCategory'::text, 'id'::text) NOT NULL,
    "collectionId" integer NOT NULL,
    "productCategoryName" text NOT NULL,
    "position" numeric,
    "importHistoryId" integer
);
COMMENT ON TABLE "onDemand"."collection_productCategory" IS 'This shows the relationship between collection and product category.';
CREATE SEQUENCE "onDemand"."collection_productCategory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand"."collection_productCategory_id_seq" OWNED BY "onDemand"."collection_productCategory".id;
CREATE SEQUENCE "onDemand"."collection_productCategory_product_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand"."collection_productCategory_product_id_seq" OWNED BY "onDemand"."collection_productCategory_product".id;
CREATE TABLE "onDemand"."linkedModifier" (
    "parentModifierId" integer NOT NULL,
    "linkedModifierId" integer NOT NULL,
    id integer NOT NULL
);
COMMENT ON TABLE "onDemand"."linkedModifier" IS 'This lists records of all the modifier across all the items.';
CREATE SEQUENCE "onDemand"."linkedModifier_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand"."linkedModifier_id_seq" OWNED BY "onDemand"."linkedModifier".id;
CREATE TABLE "onDemand".modifier (
    id integer DEFAULT public.defaultid('onDemand'::text, 'modifier'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "importHistoryId" integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE "onDemand".modifier IS 'This lists records of all the modifier.';
CREATE TABLE "onDemand"."modifierCategory" (
    id integer DEFAULT public.defaultid('onDemand'::text, 'modifierCategory'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    type text DEFAULT 'single'::text NOT NULL,
    "isVisible" boolean DEFAULT true NOT NULL,
    "isRequired" boolean DEFAULT true NOT NULL,
    limits jsonb DEFAULT '{"max": null, "min": 1}'::jsonb,
    "modifierTemplateId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE "onDemand"."modifierCategory" IS 'This shows all the modifier category.';
CREATE VIEW "onDemand"."modifierCategoryOptionView" AS
 SELECT "modifierCategoryOption".id,
    "modifierCategoryOption".name,
    "modifierCategoryOption"."originalName",
    "modifierCategoryOption".price,
    "modifierCategoryOption".discount,
    "modifierCategoryOption".quantity,
    "modifierCategoryOption".image,
    "modifierCategoryOption"."isActive",
    "modifierCategoryOption"."isVisible",
    "modifierCategoryOption"."operationConfigId",
    "modifierCategoryOption"."modifierCategoryId",
    "modifierCategoryOption"."sachetItemId",
    "modifierCategoryOption"."ingredientSachetId",
    "modifierCategoryOption"."simpleRecipeYieldId",
    "modifierCategoryOption".created_at,
    "modifierCategoryOption".updated_at,
    concat(( SELECT "modifierCategory".name
           FROM "onDemand"."modifierCategory"
          WHERE ("modifierCategory".id = "modifierCategoryOption"."modifierCategoryId")), ' - ', "modifierCategoryOption".name) AS "displayName"
   FROM "onDemand"."modifierCategoryOption";
CREATE SEQUENCE "onDemand"."modifierCategoryOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand"."modifierCategoryOption_id_seq" OWNED BY "onDemand"."modifierCategoryOption".id;
CREATE SEQUENCE "onDemand"."modifierCategory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand"."modifierCategory_id_seq" OWNED BY "onDemand"."modifierCategory".id;
CREATE SEQUENCE "onDemand".modifier_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "onDemand".modifier_id_seq OWNED BY "onDemand".modifier.id;
CREATE SEQUENCE "order"."cartItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order"."cartItem_id_seq" OWNED BY "order"."cartItem".id;
CREATE TABLE "order"."cartPayment" (
    id integer DEFAULT public.defaultid('order'::text, 'cartPayment'::text, 'id'::text) NOT NULL,
    "cartId" integer NOT NULL,
    "paymentStatus" text DEFAULT '"PENDING"'::text NOT NULL,
    "paymentRetryAttempt" integer DEFAULT 0 NOT NULL,
    "stripeInvoiceId" text,
    "paymentMethodId" text,
    "transactionId" text,
    "paymentCustomerId" text,
    "paymentUpdatedAt" timestamp with time zone,
    "paymentRequestInfo" jsonb,
    "transactionRemark" jsonb,
    "stripeInvoiceDetails" jsonb,
    "statementDescriptor" text,
    amount numeric,
    "isTest" boolean DEFAULT true,
    "cancelAttempt" integer DEFAULT 0,
    "requires3dSecure" boolean DEFAULT false NOT NULL,
    "paymentType" text DEFAULT 'stripe'::text
);
COMMENT ON TABLE "order"."cartPayment" IS 'This table shows the payment status of order.';
CREATE SEQUENCE "order"."cartPayment_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order"."cartPayment_id_seq" OWNED BY "order"."cartPayment".id;
CREATE SEQUENCE "order".cart_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order".cart_id_seq OWNED BY "order".cart.id;
CREATE TABLE "order".cart_rewards (
    id integer DEFAULT public.defaultid('order'::text, 'cart_rewards'::text, 'id'::text) NOT NULL,
    "cartId" integer NOT NULL,
    "rewardId" integer NOT NULL
);
COMMENT ON TABLE "order".cart_rewards IS 'It shows the reward point of a particular customer.';
CREATE SEQUENCE "order".cart_rewards_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order".cart_rewards_id_seq OWNED BY "order".cart_rewards.id;
CREATE TABLE "order"."orderMode" (
    title text NOT NULL,
    description text,
    assets jsonb,
    "validWhen" text
);
COMMENT ON TABLE "order"."orderMode" IS 'This describes the order mode.';
CREATE TABLE "order"."orderStatusEnum" (
    value text NOT NULL,
    description text NOT NULL,
    index integer,
    title text
);
CREATE SEQUENCE "order".order_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order".order_id_seq OWNED BY "order"."order".id;
CREATE VIEW "order"."ordersAggregate" AS
 SELECT "orderStatusEnum".title,
    "orderStatusEnum".value,
    "orderStatusEnum".index,
    ( SELECT COALESCE(sum("order"."amountPaid"), (0)::numeric) AS "coalesce"
           FROM ("order"."order"
             JOIN "order".cart ON (("order"."cartId" = cart.id)))
          WHERE ((("order"."isRejected" IS NULL) OR ("order"."isRejected" = false)) AND (cart.status = "orderStatusEnum".value) AND ("order"."isArchived" = false))) AS "totalOrderSum",
    ( SELECT COALESCE(avg("order"."amountPaid"), (0)::numeric) AS "coalesce"
           FROM ("order"."order"
             JOIN "order".cart ON (("order"."cartId" = cart.id)))
          WHERE ((("order"."isRejected" IS NULL) OR ("order"."isRejected" = false)) AND (cart.status = "orderStatusEnum".value) AND ("order"."isArchived" = false))) AS "totalOrderAverage",
    ( SELECT count(*) AS count
           FROM ("order"."order"
             JOIN "order".cart ON (("order"."cartId" = cart.id)))
          WHERE ((("order"."isRejected" IS NULL) OR ("order"."isRejected" = false)) AND (cart.status = "orderStatusEnum".value) AND ("order"."isArchived" = false))) AS "totalOrders"
   FROM "order"."orderStatusEnum"
  ORDER BY "orderStatusEnum".index;
CREATE TABLE "order"."stripePaymentHistory" (
    id integer DEFAULT public.defaultid('order'::text, 'stripePaymentHistory'::text, 'id'::text) NOT NULL,
    "transactionId" text,
    "stripeInvoiceId" text,
    "transactionRemark" jsonb DEFAULT '{}'::jsonb,
    "stripeInvoiceDetails" jsonb DEFAULT '{}'::jsonb,
    type text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "cartId" integer,
    status text,
    "customerPaymentIntentId" uuid,
    "cartPaymentId" integer
);
COMMENT ON TABLE "order"."stripePaymentHistory" IS 'This shows the payment history which is handled by stripe.';
CREATE SEQUENCE "order"."stripePaymentHistory_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "order"."stripePaymentHistory_id_seq" OWNED BY "order"."stripePaymentHistory".id;
CREATE TABLE "order"."thirdPartyOrder" (
    source text NOT NULL,
    "thirdPartyOrderId" text NOT NULL,
    "parsedData" jsonb DEFAULT '{}'::jsonb,
    id integer DEFAULT public.defaultid('order'::text, 'thirdPartyOrder'::text, 'id'::text) NOT NULL
);
COMMENT ON TABLE "order"."thirdPartyOrder" IS 'This table represents our Aggregator order.';
CREATE TABLE packaging.packaging (
    id integer DEFAULT public.defaultid('packaging'::text, 'packaging'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "packagingSku" text,
    "supplierId" integer,
    "unitPrice" numeric,
    "parLevel" integer,
    "maxLevel" integer,
    "onHand" integer DEFAULT 0 NOT NULL,
    "unitQuantity" numeric,
    "caseQuantity" numeric,
    "minOrderValue" numeric,
    "leadTime" jsonb,
    "isAvailable" boolean DEFAULT false NOT NULL,
    type text,
    awaiting numeric DEFAULT 0 NOT NULL,
    committed numeric DEFAULT 0 NOT NULL,
    consumed numeric DEFAULT 0 NOT NULL,
    assets jsonb,
    "mandiPackagingId" integer,
    length numeric,
    width numeric,
    height numeric,
    gusset numeric,
    thickness numeric,
    "LWHUnit" text DEFAULT 'mm'::text,
    "loadCapacity" numeric,
    "loadVolume" numeric,
    "packagingSpecificationsId" integer NOT NULL,
    weight numeric,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false
);
COMMENT ON TABLE packaging.packaging IS 'This contains all the packaging containers across all the suppliers.';
CREATE TABLE packaging."packagingSpecifications" (
    id integer DEFAULT public.defaultid('packaging'::text, 'packagingSpecifications'::text, 'id'::text) NOT NULL,
    "innerWaterResistant" boolean,
    "outerWaterResistant" boolean,
    "innerGreaseResistant" boolean,
    "outerGreaseResistant" boolean,
    microwaveable boolean,
    "maxTemperatureInFahrenheit" boolean,
    recyclable boolean,
    compostable boolean,
    recycled boolean,
    "fdaCompliant" boolean,
    compressibility boolean,
    opacity text,
    "mandiPackagingId" integer,
    "packagingMaterial" text
);
CREATE SEQUENCE packaging."packagingSpecifications_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE packaging."packagingSpecifications_id_seq" OWNED BY packaging."packagingSpecifications".id;
CREATE SEQUENCE packaging.packaging_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE packaging.packaging_id_seq OWNED BY packaging.packaging.id;
CREATE TABLE "paymentHub".commission_ (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "paymentId" uuid NOT NULL
);
CREATE TABLE "paymentHub".company_ (
    id integer NOT NULL,
    name text NOT NULL,
    logo text,
    identifier uuid DEFAULT public.gen_random_uuid() NOT NULL,
    type text
);
CREATE SEQUENCE "paymentHub".company__id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "paymentHub".company__id_seq OWNED BY "paymentHub".company_.id;
CREATE TABLE "paymentHub".country_company_ (
    country text NOT NULL,
    "companyId" integer NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL
);
CREATE TABLE "paymentHub"."paymentPartnership_" (
    id integer NOT NULL,
    "organizationId" integer NOT NULL,
    "paymentCompanyId" integer NOT NULL,
    "secretConfig" jsonb,
    "isActive" boolean DEFAULT false,
    "isPayoutRequired" boolean NOT NULL,
    "payoutDetails" jsonb,
    pricing jsonb,
    currency text,
    "publishableConfig" jsonb,
    "metaInfo" jsonb DEFAULT jsonb_build_object() NOT NULL
);
CREATE SEQUENCE "paymentHub"."paymentPartnership__id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "paymentHub"."paymentPartnership__id_seq" OWNED BY "paymentHub"."paymentPartnership_".id;
CREATE TABLE "paymentHub".payment_ (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "paymentPartnershipId" integer NOT NULL,
    "orderCartId" integer,
    "customerKeycloakId" text NOT NULL,
    amount numeric NOT NULL,
    "paymentRequestId" text,
    "paymentTransactionInfo" jsonb,
    "paymentTransactionId" text,
    "paymentStatus" text,
    "paymentRequestInfo" jsonb,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "paymentLinkId" text,
    version text,
    "isAutoCancelled" boolean DEFAULT false
);
CREATE TABLE "paymentHub".payout_ (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "paymentId" uuid NOT NULL
);
CREATE TABLE platform."customerAddress" (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "keycloakId" text NOT NULL,
    line1 text NOT NULL,
    line2 text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    country text NOT NULL,
    zipcode text NOT NULL,
    notes text,
    label text,
    lat text,
    lng text,
    "additionalInfo" jsonb,
    landmark text,
    searched text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE platform."customerAddress" IS 'this shows the detailed customer address.';
CREATE TABLE platform."customerPaymentMethod" (
    "paymentMethodId" text NOT NULL,
    "keycloakId" text NOT NULL,
    last4 integer NOT NULL,
    "expMonth" integer NOT NULL,
    "expYear" integer NOT NULL,
    country text NOT NULL,
    brand text NOT NULL,
    funding text,
    "cvcCheck" text,
    "cardHolderName" text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "paymentCustomerId" text NOT NULL
);
COMMENT ON TABLE platform."customerPaymentMethod" IS 'This contains all the customer payment method.';
CREATE TABLE platform.provider_customer (
    id uuid DEFAULT public.gen_random_uuid() NOT NULL,
    "providerType" text,
    "providerAccountId" text,
    "customerId" text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    provider text
);
CREATE SEQUENCE products."comboProductComponent_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."comboProductComponent_id_seq" OWNED BY products."comboProductComponent".id;
CREATE SEQUENCE products."customizableProductComponent_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."customizableProductComponent_id_seq" OWNED BY products."customizableProductComponent".id;
CREATE TABLE products."inventoryProductBundle" (
    id integer DEFAULT public.defaultid('products'::text, 'inventoryProductBundle'::text, 'id'::text) NOT NULL,
    label text NOT NULL
);
CREATE TABLE products."inventoryProductBundleSachet" (
    id integer DEFAULT public.defaultid('products'::text, 'inventoryProductBundleSachet'::text, 'id'::text) NOT NULL,
    "inventoryProductBundleId" integer NOT NULL,
    "supplierItemId" integer,
    "sachetItemId" integer,
    "bulkItemId" integer,
    "bulkItemQuantity" numeric
);
CREATE SEQUENCE products."inventoryProductBundleSachet_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."inventoryProductBundleSachet_id_seq" OWNED BY products."inventoryProductBundleSachet".id;
CREATE SEQUENCE products."inventoryProductBundle_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."inventoryProductBundle_id_seq" OWNED BY products."inventoryProductBundle".id;
CREATE TABLE products."nutritionInfo" (
    calories numeric,
    "totalFat" numeric,
    "saturatedFat" numeric,
    "transFat" numeric,
    cholesterol numeric,
    sodium numeric,
    "totalCarbohydrates" numeric,
    "dietaryFibre" numeric,
    sugars numeric,
    protein numeric,
    "vitaminA" numeric,
    "vitaminC" numeric,
    calcium numeric,
    iron numeric,
    excludes jsonb DEFAULT jsonb_build_array(),
    id integer NOT NULL,
    "isDynamic" boolean DEFAULT false,
    allergens jsonb DEFAULT jsonb_build_array(),
    per text
);
CREATE SEQUENCE products."nutritionInfo_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."nutritionInfo_id_seq" OWNED BY products."nutritionInfo".id;
CREATE TABLE products."productOptionType" (
    title text NOT NULL,
    description text,
    "orderMode" text NOT NULL
);
COMMENT ON TABLE products."productOptionType" IS 'It shows the type of product option.(inventory, meal kit or Ready to eat)';
CREATE VIEW products."productOptionView" AS
 SELECT "productOption".id,
    "productOption"."productId",
    "productOption".label,
    "productOption"."modifierId",
    "productOption"."operationConfigId",
    "productOption"."simpleRecipeYieldId",
    "productOption"."supplierItemId",
    "productOption"."sachetItemId",
    "productOption"."position",
    "productOption".created_at,
    "productOption".updated_at,
    "productOption".price,
    "productOption".discount,
    "productOption".quantity,
    "productOption".type,
    "productOption"."isArchived",
    "productOption"."inventoryProductBundleId",
    btrim(concat(( SELECT product.name
           FROM products.product
          WHERE (product.id = "productOption"."productId")), ' - ', "productOption".label)) AS "displayName",
    ( SELECT ((product.assets -> 'images'::text) -> 0)
           FROM products.product
          WHERE (product.id = "productOption"."productId")) AS "displayImage"
   FROM products."productOption";
CREATE SEQUENCE products."productOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products."productOption_id_seq" OWNED BY products."productOption".id;
CREATE TABLE products."productPrice_brand_location" (
    "brand_locationId" integer,
    "ProductId" integer,
    "productOptionId" integer,
    "locationSpecificPrice" numeric,
    "locationSpecificDiscount" numeric,
    "markupOnStandardPriceInPercentage" numeric,
    "brandId" integer,
    "locationId" integer,
    id integer NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    "isPublished" boolean DEFAULT true NOT NULL,
    "brandMenuCategoryId" integer
);
COMMENT ON TABLE products."productPrice_brand_location" IS 'This shows the product price across all the brand location.';
COMMENT ON COLUMN products."productPrice_brand_location"."brandMenuCategoryId" IS 'This brandMenuCategoryId references rows from brandMenuCategory table but only those whose brandMenuId is the id linked brand_location table.';
CREATE TABLE products."productType" (
    title text NOT NULL,
    "displayName" text NOT NULL
);
COMMENT ON TABLE products."productType" IS 'This hsows the product type.(Like simple, combo or customizable)';
CREATE TABLE products.product_category (
    id integer NOT NULL
);
CREATE SEQUENCE products.product_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE products.product_id_seq OWNED BY products.product.id;
CREATE TABLE public._exec (
    _ text
);
CREATE TABLE public.author (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text NOT NULL,
    "fullName" text
);
CREATE SEQUENCE public.author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE public.author_id_seq OWNED BY public.author.id;
CREATE TABLE public.brand_customer_id (
    id integer
);
CREATE TABLE public.brand_touchpoint (
    "touchpointIdentifier" text,
    "brandId" integer,
    "isActive" boolean,
    "timeIntervalInMins" integer,
    "configuredEmailTriggerTitle" text
);
CREATE TABLE public.experiencebookingid (
    id integer
);
CREATE TABLE public.rec (
    id integer,
    "paidPrice" numeric,
    "customerId" integer,
    "paymentStatus" text,
    status text,
    "paymentMethodId" text,
    "transactionId" text,
    "paymentCustomerId" text,
    "fulfillmentInfo" jsonb,
    tip numeric,
    address jsonb,
    "customerInfo" jsonb,
    source text,
    "subscriptionOccurenceId" integer,
    "walletAmountUsed" numeric,
    "isTest" boolean,
    "brandId" integer,
    "couponDiscount" numeric,
    "loyaltyPointsUsed" integer,
    "paymentId" uuid,
    "paymentUpdatedAt" timestamp with time zone,
    "paymentRequestInfo" jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    "customerKeycloakId" text,
    "orderId" integer,
    amount numeric,
    "transactionRemark" jsonb,
    "stripeInvoiceId" text,
    "stripeInvoiceDetails" jsonb,
    "statementDescriptor" text,
    "paymentRetryAttempt" integer,
    "lastUpdatedBy" jsonb,
    "isArchived" boolean,
    created_at_month integer,
    created_at_day integer,
    created_at_week integer,
    created_at_year integer,
    created_at_hour integer,
    created_at_dow integer,
    created_at_quarter integer,
    created_at_date date,
    "experienceClassId" integer,
    "parentCartId" integer,
    "deliveryParentShare" numeric,
    "experienceClassTypeId" integer,
    "retryPaymentMethod" text
);
CREATE TABLE public.t_e (
    docs text
);
CREATE SEQUENCE rules.conditions_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE rules.conditions_id_seq OWNED BY rules.conditions.id;
CREATE TABLE safety."safetyCheck" (
    id integer DEFAULT public.defaultid('safety'::text, 'safetyCheck'::text, 'id'::text) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "isVisibleOnStore" boolean NOT NULL
);
CREATE TABLE safety."safetyCheckPerUser" (
    id integer DEFAULT public.defaultid('safety'::text, 'safetyCheckPerUser'::text, 'id'::text) NOT NULL,
    "SafetyCheckId" integer NOT NULL,
    "userId" integer NOT NULL,
    "usesMask" boolean NOT NULL,
    "usesSanitizer" boolean NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    temperature numeric
);
CREATE SEQUENCE safety."safetyCheckPerUser_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE safety."safetyCheckPerUser_id_seq" OWNED BY safety."safetyCheckPerUser".id;
CREATE SEQUENCE safety."safetyCheck_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE safety."safetyCheck_id_seq" OWNED BY safety."safetyCheck".id;
CREATE TABLE segmentation."ActionType" (
    title text NOT NULL,
    "requiredVar" jsonb DEFAULT '{}'::jsonb
);
CREATE TABLE segmentation.list (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "conditionId" integer,
    "listType" text NOT NULL,
    "isActive" boolean NOT NULL
);
CREATE TABLE segmentation."listAction" (
    id integer NOT NULL,
    "listId" integer NOT NULL,
    "actionType" text NOT NULL,
    var jsonb DEFAULT '{}'::jsonb NOT NULL,
    "scheduledAt" timestamp with time zone,
    "isCancelled" boolean DEFAULT false,
    "workflowId" integer,
    priority numeric,
    delay interval
);
CREATE TABLE segmentation."listActionByType" (
    "actionTitle" text NOT NULL,
    "listType" text NOT NULL
);
CREATE TABLE segmentation."listAction_list_linkedRecord" (
    "listActionId" integer NOT NULL,
    "list_linkedRecordId" integer NOT NULL,
    "isCompleted" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "isCancelled" boolean DEFAULT false NOT NULL,
    var jsonb,
    "scheduledAt" timestamp with time zone
);
CREATE TABLE segmentation."listType" (
    title text NOT NULL
);
CREATE TABLE segmentation."list_linkedRecord" (
    "listId" integer NOT NULL,
    "brand_customerId" integer,
    "simpleRecipeId" integer,
    "productId" integer,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "isArchived" boolean DEFAULT false,
    id integer NOT NULL
);
CREATE TABLE segmentation.workflow (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    "workflowTriggerType" text
);
CREATE TABLE segmentation."workflowTriggerType" (
    title text NOT NULL
);
CREATE TABLE settings."activityLogs" (
    id integer DEFAULT public.defaultid('settings'::text, 'activityLogs'::text, 'id'::text) NOT NULL,
    "brand_customerId" integer,
    "subscriptionOccurenceId" integer,
    "cartId" integer,
    type text NOT NULL,
    log jsonb DEFAULT '{}'::jsonb NOT NULL,
    "keycloakId" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by jsonb DEFAULT '{}'::jsonb
);
COMMENT ON TABLE settings."activityLogs" IS 'This lists records of all the activity logs of account.';
CREATE SEQUENCE settings."activityLogs_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings."activityLogs_id_seq" OWNED BY settings."activityLogs".id;
CREATE TABLE settings.app (
    id integer DEFAULT public.defaultid('settings'::text, 'app'::text, 'id'::text) NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    icon text,
    route text
);
COMMENT ON TABLE settings.app IS 'This shows all the app which are available in your account.';
CREATE TABLE settings."appPermission" (
    id integer DEFAULT public.defaultid('settings'::text, 'appPermission'::text, 'id'::text) NOT NULL,
    "appId" integer NOT NULL,
    route text NOT NULL,
    title text NOT NULL,
    "fallbackMessage" text
);
COMMENT ON TABLE settings."appPermission" IS 'This shows the app permission userwise.';
CREATE TABLE settings."appSettings" (
    id integer DEFAULT public.defaultid('settings'::text, 'appSettings'::text, 'id'::text) NOT NULL,
    app text NOT NULL,
    type text NOT NULL,
    identifier text NOT NULL,
    value jsonb NOT NULL
);
CREATE SEQUENCE settings.app_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings.app_id_seq OWNED BY settings.app.id;
CREATE TABLE settings.app_module (
    "appTitle" text NOT NULL,
    "moduleTitle" text NOT NULL
);
CREATE TABLE settings."authProvider" (
    title text NOT NULL,
    value jsonb NOT NULL
);
CREATE TABLE settings.env (
    title text NOT NULL,
    value text NOT NULL,
    "belongsTo" text NOT NULL,
    id integer NOT NULL,
    "isDeleteProtected" boolean DEFAULT true NOT NULL
);
CREATE SEQUENCE settings.env_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings.env_id_seq OWNED BY settings.env.id;
CREATE TABLE settings.location (
    id integer NOT NULL,
    "parentLocationId" integer,
    label text NOT NULL,
    address jsonb NOT NULL
);
CREATE SEQUENCE settings."operationConfig_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings."operationConfig_id_seq" OWNED BY settings."operationConfig".id;
CREATE TABLE settings."organizationSettings" (
    title text NOT NULL,
    value text NOT NULL
);
CREATE TABLE settings.role (
    id integer DEFAULT public.defaultid('settings'::text, 'role'::text, 'id'::text) NOT NULL,
    title text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE settings.role IS 'This contains all the permission which is assigned for a particular role.';
CREATE TABLE settings.role_app (
    id integer DEFAULT public.defaultid('settings'::text, 'role_app'::text, 'id'::text) NOT NULL,
    "roleId" integer NOT NULL,
    "appId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE TABLE settings."role_appPermission" (
    "appPermissionId" integer NOT NULL,
    "role_appId" integer NOT NULL,
    value boolean NOT NULL
);
CREATE TABLE settings.station (
    id integer DEFAULT public.defaultid('settings'::text, 'station'::text, 'id'::text) NOT NULL,
    name text NOT NULL,
    "defaultLabelPrinterId" integer,
    "defaultKotPrinterId" integer,
    "defaultScaleId" integer,
    "isArchived" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE settings.station IS 'This lists records of all the station across all the brands.';
CREATE SEQUENCE settings.station_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings.station_id_seq OWNED BY settings.station.id;
CREATE TABLE settings.station_kot_printer (
    "stationId" integer NOT NULL,
    "printNodeId" integer NOT NULL,
    active boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE settings.station_kot_printer IS 'This shows all the KOT printer assigned for the respective station.';
CREATE TABLE settings.station_label_printer (
    "stationId" integer NOT NULL,
    "printNodeId" integer NOT NULL,
    active boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE settings.station_label_printer IS 'This shows the label printer linked with station.';
CREATE TABLE settings.station_user (
    "userKeycloakId" text NOT NULL,
    "stationId" integer NOT NULL,
    active boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE settings.station_user IS 'This shows the relationship between user and station.';
CREATE TABLE settings."user" (
    id integer DEFAULT public.defaultid('settings'::text, 'user'::text, 'id'::text) NOT NULL,
    "firstName" text,
    "lastName" text,
    email text,
    "tempPassword" text,
    "phoneNo" text,
    "keycloakId" text,
    "isOwner" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE settings."user" IS 'This lists records of all the users across all the brands.';
COMMENT ON COLUMN settings."user"."isOwner" IS 'This determines if the user is owner of the organization.';
CREATE SEQUENCE settings.user_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE settings.user_id_seq OWNED BY settings."user".id;
CREATE TABLE settings.user_location (
    "userId" integer NOT NULL,
    "locationId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE settings.user_location IS 'This shows the relationship between user and location.';
CREATE TABLE settings.user_role (
    id integer DEFAULT public.defaultid('settings'::text, 'user_role'::text, 'id'::text) NOT NULL,
    "userId" text NOT NULL,
    "roleId" integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
COMMENT ON TABLE settings.user_role IS 'This shows the relationship between user and role.';
CREATE VIEW settings."view_activityLogs" AS
 SELECT "activityLogs".id,
    "activityLogs"."brand_customerId",
    "activityLogs"."subscriptionOccurenceId",
    "activityLogs"."keycloakId",
    "activityLogs".type,
    "activityLogs".log,
    ("activityLogs".updated_by ->> 'staffId'::text) AS "updateByStaffId",
    ("activityLogs".updated_by ->> 'userId'::text) AS "updateByUserId",
    ("activityLogs".updated_by ->> 'message'::text) AS "updateByMessage",
        CASE
            WHEN ("activityLogs"."subscriptionOccurenceId" IS NULL) THEN NULL::text
            ELSE concat(( SELECT "subscriptionTitle".title
               FROM subscription."subscriptionTitle"
              WHERE ("subscriptionTitle".id = ( SELECT "subscriptionOccurence"."subscriptionTitleId"
                       FROM subscription."subscriptionOccurence"
                      WHERE ("subscriptionOccurence".id = "activityLogs"."subscriptionOccurenceId")))), ', serves ', ( SELECT "subscriptionServing"."servingSize"
               FROM subscription."subscriptionServing"
              WHERE ("subscriptionServing".id = ( SELECT "subscriptionOccurence"."subscriptionServingId"
                       FROM subscription."subscriptionOccurence"
                      WHERE ("subscriptionOccurence".id = "activityLogs"."subscriptionOccurenceId")))), ', count ', ( SELECT "subscriptionItemCount".count
               FROM subscription."subscriptionItemCount"
              WHERE ("subscriptionItemCount".id = ( SELECT "subscriptionOccurence"."subscriptionItemCountId"
                       FROM subscription."subscriptionOccurence"
                      WHERE ("subscriptionOccurence".id = "activityLogs"."subscriptionOccurenceId")))))
        END AS plan,
    ("activityLogs".updated_by ->> 'type'::text) AS "updateType",
    "activityLogs"."cartId",
    "activityLogs".created_at,
    "activityLogs".updated_at
   FROM settings."activityLogs";
CREATE TABLE "simpleRecipe"."simpleRecipeComponent_productOptionType" (
    "simpleRecipeComponentId" integer NOT NULL,
    "productOptionType" text NOT NULL,
    "orderMode" text NOT NULL
);
CREATE VIEW "simpleRecipe"."simpleRecipeYieldNutritionalSyncView" AS
 SELECT "simpleRecipeYield".id,
    ( SELECT "simpleRecipe"."yieldNutritionalInfoIsSync"("simpleRecipeYield".*) AS "yieldNutritionalInfoIsSync") AS "yieldNutritionalInfoIsSync",
    ( SELECT "simpleRecipe"."yieldNutritionalInfo"("simpleRecipeYield".*) AS "yieldNutritionalInfo") AS "yieldNutritionalInfo"
   FROM "simpleRecipe"."simpleRecipeYield";
CREATE VIEW "simpleRecipe"."simpleRecipeYieldView" AS
 SELECT "simpleRecipeYield".id,
    "simpleRecipeYield"."simpleRecipeId",
    "simpleRecipeYield".yield,
    "simpleRecipeYield"."isArchived",
    (( SELECT "simpleRecipe".name
           FROM "simpleRecipe"."simpleRecipe"
          WHERE ("simpleRecipe".id = "simpleRecipeYield"."simpleRecipeId")))::text AS "displayName",
    (("simpleRecipeYield".yield -> 'serving'::text))::integer AS serving
   FROM "simpleRecipe"."simpleRecipeYield";
CREATE SEQUENCE "simpleRecipe"."simpleRecipeYield_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "simpleRecipe"."simpleRecipeYield_id_seq" OWNED BY "simpleRecipe"."simpleRecipeYield".id;
CREATE TABLE "simpleRecipe"."simpleRecipeYield_ingredientSachet" (
    "recipeYieldId" integer NOT NULL,
    "ingredientSachetId" integer,
    "isVisible" boolean DEFAULT true NOT NULL,
    "slipName" text,
    "isSachetValid" boolean,
    "isArchived" boolean DEFAULT false NOT NULL,
    "simpleRecipeIngredientProcessingId" integer NOT NULL,
    "subRecipeYieldId" integer,
    "simpleRecipeId" integer,
    "nutritionId" integer
);
CREATE SEQUENCE "simpleRecipe"."simpleRecipe_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "simpleRecipe"."simpleRecipe_id_seq" OWNED BY "simpleRecipe"."simpleRecipe".id;
CREATE TABLE "simpleRecipe"."simpleRecipe_ingredient_processing" (
    "processingId" integer,
    id integer DEFAULT public.defaultid('simpleRecipe'::text, 'simpleRecipe_ingredient_processing'::text, 'id'::text) NOT NULL,
    "simpleRecipeId" integer,
    "ingredientId" integer,
    "position" integer,
    "isArchived" boolean DEFAULT false NOT NULL,
    "subRecipeId" integer,
    "nutritionId" integer,
    "includedWithProduct" boolean DEFAULT true NOT NULL,
    "recipeComponentLabel" text
);
CREATE SEQUENCE "simpleRecipe"."simpleRecipe_ingredient_processing_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE "simpleRecipe"."simpleRecipe_ingredient_processing_id_seq" OWNED BY "simpleRecipe"."simpleRecipe_ingredient_processing".id;
CREATE TABLE "simpleRecipe"."simpleRecipe_productOptionType" (
    "simpleRecipeId" integer NOT NULL,
    "productOptionTypeTitle" text NOT NULL,
    "orderMode" text NOT NULL
);
CREATE TABLE sqldemo.author (
    id integer NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text
);
CREATE SEQUENCE sqldemo.author_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE sqldemo.author_id_seq OWNED BY sqldemo.author.id;
CREATE TABLE sqldemo.book (
    id integer NOT NULL,
    "bookName" text NOT NULL,
    "publishedDate" date NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    "authorId" integer NOT NULL,
    "authorName" text NOT NULL,
    "bookPrice" numeric,
    discount numeric,
    "discountType" text DEFAULT 'PERCENTAGE'::text NOT NULL,
    "inStock" integer DEFAULT 10 NOT NULL,
    "isOutOfStock" boolean DEFAULT false NOT NULL,
    "priceHistory" jsonb DEFAULT '{}'::jsonb NOT NULL
);
COMMENT ON COLUMN sqldemo.book.discount IS 'If discountType is fixed, it should never be greater than bookPrice. If it is Percentage, the value should never be greater than 100';
COMMENT ON COLUMN sqldemo.book."discountType" IS 'Possible values PERCENTAGE OR FIXED';
COMMENT ON COLUMN sqldemo.book."isOutOfStock" IS 'anytime, inStock value goes to 0, isOutOfStock automatically gets marked as true';
CREATE SEQUENCE sqldemo.book_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE sqldemo.book_id_seq OWNED BY sqldemo.book.id;
CREATE TABLE sqldemo.item (
    id integer NOT NULL,
    discount integer
);
CREATE SEQUENCE sqldemo.item_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE sqldemo.item_id_seq OWNED BY sqldemo.item.id;
CREATE TABLE subscription."brand_subscriptionTitle" (
    "brandId" integer NOT NULL,
    "subscriptionTitleId" integer NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "allowAutoSelectOptOut" boolean DEFAULT true NOT NULL
);
COMMENT ON TABLE subscription."brand_subscriptionTitle" IS 'This shows the relationship between brand and subscription title.';
CREATE TABLE subscription.subscription (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscription'::text, 'id'::text) NOT NULL,
    "subscriptionItemCountId" integer NOT NULL,
    rrule text NOT NULL,
    "metaDetails" jsonb,
    "cutOffTime" time without time zone,
    "leadTime" jsonb,
    "startTime" jsonb DEFAULT '{"unit": "days", "value": 28}'::jsonb,
    "startDate" date,
    "endDate" date,
    "defaultSubscriptionAutoSelectOption" text,
    "reminderSettings" jsonb DEFAULT '{"template": "Subscription Reminder Email", "hoursBefore": [24]}'::jsonb,
    "subscriptionServingId" integer,
    "subscriptionTitleId" integer,
    "position" numeric DEFAULT 1,
    "isDemo" boolean DEFAULT false NOT NULL,
    settings jsonb DEFAULT '{"isAutoSelect": false, "isReminderEmail": false, "isManageOccurence": false}'::jsonb,
    "titleName" text GENERATED ALWAYS AS (subscription."fetchSubscriptionTitle"("subscriptionTitleId")) STORED,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);
COMMENT ON TABLE subscription.subscription IS 'This lists records of all the subscription across all the brands.';
CREATE TABLE subscription."subscriptionAutoSelectOption" (
    "methodName" text NOT NULL,
    "displayName" text NOT NULL
);
CREATE SEQUENCE subscription."subscriptionItemCount_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionItemCount_id_seq" OWNED BY subscription."subscriptionItemCount".id;
CREATE VIEW subscription."subscriptionOccurenceView" AS
 SELECT (now() < "subscriptionOccurence"."cutoffTimeStamp") AS "isValid",
    "subscriptionOccurence".id,
    (now() > "subscriptionOccurence"."startTimeStamp") AS "isVisible",
    ( SELECT count(*) AS count
           FROM crm.brand_customer
          WHERE (brand_customer."subscriptionId" = "subscriptionOccurence"."subscriptionId")) AS "totalSubscribers",
    ( SELECT count(*) AS "skippedCustomers"
           FROM subscription."subscriptionOccurence_customer"
          WHERE (("subscriptionOccurence_customer"."subscriptionOccurenceId" = "subscriptionOccurence".id) AND ("subscriptionOccurence_customer"."isSkipped" = true))) AS "skippedCustomers",
    ( SELECT count(DISTINCT ROW("subscriptionOccurence_product"."productOptionId", "subscriptionOccurence_product"."productCategory")) AS count
           FROM subscription."subscriptionOccurence_product"
          WHERE ("subscriptionOccurence_product"."subscriptionOccurenceId" = "subscriptionOccurence".id)) AS "weeklyProductChoices",
    ( SELECT count(DISTINCT ROW("subscriptionOccurence_product"."productOptionId", "subscriptionOccurence_product"."productCategory")) AS count
           FROM subscription."subscriptionOccurence_product"
          WHERE ("subscriptionOccurence_product"."subscriptionId" = "subscriptionOccurence"."subscriptionId")) AS "allTimeProductChoices",
    ( SELECT (( SELECT count(DISTINCT ROW("subscriptionOccurence_product"."productOptionId", "subscriptionOccurence_product"."productCategory")) AS count
                   FROM subscription."subscriptionOccurence_product"
                  WHERE ("subscriptionOccurence_product"."subscriptionOccurenceId" = "subscriptionOccurence".id)) + ( SELECT count(DISTINCT ROW("subscriptionOccurence_product"."productOptionId", "subscriptionOccurence_product"."productCategory")) AS count
                   FROM subscription."subscriptionOccurence_product"
                  WHERE ("subscriptionOccurence_product"."subscriptionId" = "subscriptionOccurence"."subscriptionId")))) AS "totalProductChoices",
    ( SELECT subscription."assignWeekNumberToSubscriptionOccurence"("subscriptionOccurence".id) AS "subscriptionWeekRank") AS "subscriptionWeekRank",
    "subscriptionOccurence"."fulfillmentDate",
    "subscriptionOccurence"."subscriptionId"
   FROM subscription."subscriptionOccurence";
CREATE SEQUENCE subscription."subscriptionOccurence_addOn_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionOccurence_addOn_id_seq" OWNED BY subscription."subscriptionOccurence_addOn".id;
CREATE SEQUENCE subscription."subscriptionOccurence_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionOccurence_id_seq" OWNED BY subscription."subscriptionOccurence".id;
CREATE SEQUENCE subscription."subscriptionOccurence_product_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionOccurence_product_id_seq" OWNED BY subscription."subscriptionOccurence_product".id;
CREATE TABLE subscription."subscriptionPickupOption" (
    id integer DEFAULT public.defaultid('subscription'::text, 'subscriptionPickupOption'::text, 'id'::text) NOT NULL,
    "time" jsonb DEFAULT '{"to": "", "from": ""}'::jsonb NOT NULL,
    address jsonb DEFAULT '{"lat": "", "lng": "", "city": "", "label": "", "line1": "", "line2": "", "notes": "", "state": "", "country": "", "zipcode": ""}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);
CREATE SEQUENCE subscription."subscriptionPickupOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionPickupOption_id_seq" OWNED BY subscription."subscriptionPickupOption".id;
CREATE SEQUENCE subscription."subscriptionServing_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionServing_id_seq" OWNED BY subscription."subscriptionServing".id;
CREATE SEQUENCE subscription."subscriptionTitle_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription."subscriptionTitle_id_seq" OWNED BY subscription."subscriptionTitle".id;
CREATE SEQUENCE subscription.subscription_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE subscription.subscription_id_seq OWNED BY subscription.subscription.id;
CREATE TABLE subscription.subscription_zipcode (
    "subscriptionId" integer NOT NULL,
    zipcode text NOT NULL,
    "deliveryPrice" numeric DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true,
    "deliveryTime" jsonb DEFAULT '{"to": "", "from": ""}'::jsonb,
    "subscriptionPickupOptionId" integer,
    "isDeliveryActive" boolean DEFAULT true NOT NULL,
    "isPickupActive" boolean DEFAULT false NOT NULL,
    "defaultAutoSelectFulfillmentMode" text DEFAULT 'DELIVERY'::text NOT NULL,
    "isDemo" boolean DEFAULT false NOT NULL
);
COMMENT ON TABLE subscription.subscription_zipcode IS 'This lists records of all the zipcodes which is deliverable for that subscription.';
CREATE VIEW subscription."view_brand_customer_subscriptionOccurence" AS
 WITH view AS (
         SELECT s.id AS "subscriptionOccurenceId",
            c.id AS "brand_customerId",
            s.id,
            s."fulfillmentDate",
            s."cutoffTimeStamp",
            s."subscriptionId",
            s."startTimeStamp",
            s.assets,
            s."subscriptionAutoSelectOption",
            s."subscriptionItemCountId",
            s."subscriptionServingId",
            s."subscriptionTitleId",
            ( SELECT count(*) AS count
                   FROM subscription."subscriptionOccurence_customer"
                  WHERE (("subscriptionOccurence_customer"."brand_customerId" = c.id) AND ("subscriptionOccurence_customer"."subscriptionId" = c."subscriptionId") AND ("subscriptionOccurence_customer"."subscriptionOccurenceId" <= s.id))) AS "allTimeRank",
            ( SELECT count(*) AS count
                   FROM subscription."subscriptionOccurence_customer"
                  WHERE (("subscriptionOccurence_customer"."isSkipped" = true) AND ("subscriptionOccurence_customer"."brand_customerId" = c.id) AND ("subscriptionOccurence_customer"."subscriptionId" = c."subscriptionId") AND ("subscriptionOccurence_customer"."subscriptionOccurenceId" <= s.id))) AS "skippedBeforeThis"
           FROM (subscription."subscriptionOccurence" s
             JOIN crm.brand_customer c ON (((c."subscriptionId" = s."subscriptionId") AND (c."isSubscriptionCancelled" = false))))
          WHERE (s."startTimeStamp" < now())
        )
 SELECT view."subscriptionOccurenceId",
    view."brand_customerId",
    view.id,
    view."fulfillmentDate",
    view."cutoffTimeStamp",
    view."subscriptionId",
    view."startTimeStamp",
    view.assets,
    view."subscriptionAutoSelectOption",
    view."subscriptionItemCountId",
    view."subscriptionServingId",
    view."subscriptionTitleId",
    view."allTimeRank",
    view."skippedBeforeThis",
    ( SELECT subscription."betweenPauseFunc"(view."subscriptionOccurenceId", view."brand_customerId") AS "betweenPauseFunc") AS "betweenPause"
   FROM view;
CREATE VIEW subscription."view_subscriptionOccurence_customer" AS
 WITH view AS (
         SELECT s."subscriptionOccurenceId",
            s."keycloakId",
            s."cartId",
            s."isSkipped",
            s."isAuto",
            s."brand_customerId",
            s."subscriptionId",
            ( SELECT count(*) AS count
                   FROM subscription."subscriptionOccurence_customer" a
                  WHERE ((a."subscriptionOccurenceId" <= s."subscriptionOccurenceId") AND (a."brand_customerId" = s."brand_customerId"))) AS "allTimeRank",
            ( SELECT COALESCE(count(*), (0)::bigint) AS "coalesce"
                   FROM "order"."cartItem"
                  WHERE (("cartItem"."cartId" = s."cartId") AND ("cartItem"."isAddOn" = false) AND ("cartItem"."parentCartItemId" IS NULL))) AS "addedProductsCount",
            ( SELECT "subscriptionItemCount".count
                   FROM subscription."subscriptionItemCount"
                  WHERE ("subscriptionItemCount".id = ( SELECT "subscriptionOccurence"."subscriptionItemCountId"
                           FROM subscription."subscriptionOccurence"
                          WHERE ("subscriptionOccurence".id = s."subscriptionOccurenceId")))) AS "totalProductsToBeAdded",
            ( SELECT count(*) AS count
                   FROM subscription."subscriptionOccurence_customer" a
                  WHERE ((a."subscriptionOccurenceId" <= s."subscriptionOccurenceId") AND (a."isSkipped" = true) AND (a."brand_customerId" = s."brand_customerId"))) AS "skippedAtThisStage",
            s."isPaused",
            ( SELECT subscription."isSubCartItemCountValidFunc"(s."subscriptionOccurenceId", s."cartId") AS "isSubscriptionCartItemCountValidFunc") AS "isItemCountValid",
            s."isArchived"
           FROM subscription."subscriptionOccurence_customer" s
        )
 SELECT view."subscriptionOccurenceId",
    view."keycloakId",
    view."cartId",
    view."isSkipped",
    view."isAuto",
    view."brand_customerId",
    view."subscriptionId",
    view."allTimeRank",
    view."addedProductsCount",
    view."totalProductsToBeAdded",
    view."skippedAtThisStage",
    (((view."skippedAtThisStage")::numeric / (view."allTimeRank")::numeric) * (100)::numeric) AS "percentageSkipped",
    ( SELECT cart."paymentStatus"
           FROM "order".cart
          WHERE (cart.id = view."cartId")) AS "paymentStatus",
    ( SELECT cart."paymentRetryAttempt"
           FROM "order".cart
          WHERE (cart.id = view."cartId")) AS "paymentRetryAttempt",
    view."isPaused",
    view."isItemCountValid",
    view."isArchived"
   FROM view;
CREATE VIEW subscription.view_full_occurence_report AS
 SELECT COALESCE(b."subscriptionOccurenceId", a."subscriptionOccurenceId") AS "subscriptionOccurenceId",
    b."keycloakId",
    b."cartId",
    b."isSkipped",
    b."isAuto",
    COALESCE(b."brand_customerId", a."brand_customerId") AS "brand_customerId",
    COALESCE(b."subscriptionId", a."subscriptionId") AS "subscriptionId",
    b."allTimeRank",
    b."addedProductsCount",
    b."totalProductsToBeAdded",
    b."skippedAtThisStage",
    b."percentageSkipped",
    a."fulfillmentDate",
    a."cutoffTimeStamp",
    b."paymentStatus",
    b."paymentRetryAttempt",
    a."betweenPause",
    b."isPaused",
    COALESCE(b."isItemCountValid", false) AS "isItemCountValid",
    b."isArchived"
   FROM (subscription."view_brand_customer_subscriptionOccurence" a
     FULL JOIN subscription."view_subscriptionOccurence_customer" b ON (((a.id = b."subscriptionOccurenceId") AND (a."brand_customerId" = b."brand_customerId"))));
CREATE VIEW subscription.view_subscription AS
 SELECT subscription.id,
    subscription."subscriptionItemCountId",
    subscription.rrule,
    subscription."metaDetails",
    subscription."cutOffTime",
    subscription."leadTime",
    subscription."startTime",
    subscription."startDate",
    subscription."endDate",
    subscription."defaultSubscriptionAutoSelectOption",
    subscription."reminderSettings",
    subscription."subscriptionServingId",
    subscription."subscriptionTitleId",
    ( SELECT count(*) AS count
           FROM crm.brand_customer
          WHERE (brand_customer."subscriptionId" = subscription.id)) AS "totalSubscribers",
    ( SELECT "subscriptionTitle".title
           FROM subscription."subscriptionTitle"
          WHERE ("subscriptionTitle".id = subscription."subscriptionTitleId")) AS title,
    ( SELECT "subscriptionServing"."servingSize"
           FROM subscription."subscriptionServing"
          WHERE ("subscriptionServing".id = subscription."subscriptionServingId")) AS "subscriptionServingSize",
    ( SELECT "subscriptionItemCount".count
           FROM subscription."subscriptionItemCount"
          WHERE ("subscriptionItemCount".id = subscription."subscriptionItemCountId")) AS "subscriptionItemCount"
   FROM subscription.subscription;
CREATE VIEW subscription."view_subscriptionItemCount" AS
 SELECT "subscriptionItemCount".id,
    "subscriptionItemCount"."subscriptionServingId",
    "subscriptionItemCount".count,
    "subscriptionItemCount"."metaDetails",
    "subscriptionItemCount".price,
    "subscriptionItemCount"."isActive",
    "subscriptionItemCount".tax,
    "subscriptionItemCount"."isTaxIncluded",
    "subscriptionItemCount"."subscriptionTitleId",
    ( SELECT count(*) AS count
           FROM crm.brand_customer
          WHERE (brand_customer."subscriptionItemCountId" = "subscriptionItemCount".id)) AS "totalSubscribers"
   FROM subscription."subscriptionItemCount";
CREATE VIEW subscription."view_subscriptionOccurenceMenuHealth" AS
 SELECT ( SELECT "subscriptionItemCount".count
           FROM subscription."subscriptionItemCount"
          WHERE ("subscriptionItemCount".id = "subscriptionOccurence"."subscriptionItemCountId")) AS "totalProductsToBeAdded",
    ( SELECT "subscriptionOccurenceView"."weeklyProductChoices"
           FROM subscription."subscriptionOccurenceView"
          WHERE ("subscriptionOccurenceView".id = "subscriptionOccurence".id)) AS "weeklyProductChoices",
    ( SELECT "subscriptionOccurenceView"."allTimeProductChoices"
           FROM subscription."subscriptionOccurenceView"
          WHERE ("subscriptionOccurenceView".id = "subscriptionOccurence".id)) AS "allTimeProductChoices",
    ( SELECT "subscriptionOccurenceView"."totalProductChoices"
           FROM subscription."subscriptionOccurenceView"
          WHERE ("subscriptionOccurenceView".id = "subscriptionOccurence".id)) AS "totalProductChoices",
    ( SELECT (( SELECT "subscriptionOccurenceView"."totalProductChoices"
                   FROM subscription."subscriptionOccurenceView"
                  WHERE ("subscriptionOccurenceView".id = "subscriptionOccurence".id)) / ( SELECT "subscriptionItemCount".count
                   FROM subscription."subscriptionItemCount"
                  WHERE ("subscriptionItemCount".id = "subscriptionOccurence"."subscriptionItemCountId")))) AS "choicePerSelection"
   FROM subscription."subscriptionOccurence";
CREATE VIEW subscription."view_subscriptionServing" AS
 SELECT "subscriptionServing".id,
    "subscriptionServing"."subscriptionTitleId",
    "subscriptionServing"."servingSize",
    "subscriptionServing"."metaDetails",
    "subscriptionServing"."defaultSubscriptionItemCountId",
    "subscriptionServing"."isActive",
    ( SELECT count(*) AS count
           FROM crm.brand_customer
          WHERE (brand_customer."subscriptionServingId" = "subscriptionServing".id)) AS "totalSubscribers"
   FROM subscription."subscriptionServing";
CREATE VIEW subscription."view_subscriptionTitle" AS
 SELECT "subscriptionTitle".id,
    "subscriptionTitle".title,
    "subscriptionTitle"."metaDetails",
    "subscriptionTitle"."defaultSubscriptionServingId",
    "subscriptionTitle".created_at,
    "subscriptionTitle".updated_at,
    "subscriptionTitle"."isActive",
    ( SELECT count(*) AS count
           FROM crm.brand_customer
          WHERE (brand_customer."subscriptionTitleId" = "subscriptionTitle".id)) AS "totalSubscribers"
   FROM subscription."subscriptionTitle";
CREATE TABLE ux."accessPoint" (
    id integer DEFAULT public.defaultid('ux'::text, 'accessPoint'::text, 'id'::text) NOT NULL,
    "accessPointTypeTitle" text NOT NULL,
    "cssSelector" text NOT NULL,
    "internalDivId" text NOT NULL,
    "bottomBarOptionId" integer NOT NULL
);
CREATE TABLE ux."accessPointType" (
    title text NOT NULL
);
CREATE TABLE ux.action (
    id integer DEFAULT public.defaultid('ux'::text, 'action'::text, 'id'::text) NOT NULL,
    "actionTypeTitle" text NOT NULL,
    "fileId" integer,
    dailyos_action text
);
CREATE TABLE ux."actionType" (
    title text NOT NULL
);
CREATE SEQUENCE ux.action_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ux.action_id_seq OWNED BY ux.action.id;
CREATE TABLE ux."bottomBarOption" (
    id integer DEFAULT public.defaultid('ux'::text, 'bottomBarOption'::text, 'id'::text) NOT NULL,
    app text NOT NULL,
    title text NOT NULL,
    icon text,
    "navigationMenuId" integer
);
CREATE SEQUENCE ux."bottomBarOption_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ux."bottomBarOption_id_seq" OWNED BY ux."bottomBarOption".id;
CREATE TABLE ux."dailyosDivId" (
    id text NOT NULL,
    "fileId" integer NOT NULL,
    "isActive" boolean NOT NULL,
    "showAgain" boolean DEFAULT false
);
CREATE TABLE ux."dailyosDivIdFiles" (
    "divId" text NOT NULL,
    "fileId" integer,
    "conditionId" integer NOT NULL,
    "isActive" boolean DEFAULT false,
    "showAgain" boolean DEFAULT false,
    content jsonb,
    id integer DEFAULT public.defaultid('ux'::text, 'dailyosDivIdFiles'::text, 'id'::text) NOT NULL
);
CREATE SEQUENCE ux."dailyosDivIdFiles_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE ux."dailyosDivIdFiles_id_seq" OWNED BY ux."dailyosDivIdFiles".id;
CREATE TABLE ux."user_dailyosDivIdFile" (
    "divId" text,
    "fileId" integer,
    "shownCount" integer DEFAULT 0 NOT NULL,
    "closedCount" integer DEFAULT 0 NOT NULL,
    "userEmail" text NOT NULL,
    "showAgain" boolean DEFAULT false,
    "lastVisited" timestamp with time zone DEFAULT now(),
    "dailyosDivIdFileId" integer NOT NULL
);
CREATE TABLE website."navigationMenu" (
    id integer DEFAULT public.defaultid('website'::text, 'navigationMenu'::text, 'id'::text) NOT NULL,
    title text NOT NULL,
    "isPublished" boolean DEFAULT false NOT NULL,
    description text
);
CREATE TABLE website."navigationMenuItem" (
    id integer DEFAULT public.defaultid('website'::text, 'navigationMenuItem'::text, 'id'::text) NOT NULL,
    label text NOT NULL,
    "navigationMenuId" integer,
    "parentNavigationMenuItemId" integer,
    url text,
    "position" numeric,
    "openInNewTab" boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    "actionId" integer,
    level integer,
    path text
);
CREATE SEQUENCE website."navigationMenuItem_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website."navigationMenuItem_id_seq" OWNED BY website."navigationMenuItem".id;
CREATE SEQUENCE website."navigationMenu_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website."navigationMenu_id_seq" OWNED BY website."navigationMenu".id;
CREATE TABLE website."systemDefinedModule" (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    "configTemplate" jsonb
);
CREATE SEQUENCE website."systemDefinedModule_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website."systemDefinedModule_id_seq" OWNED BY website."systemDefinedModule".id;
CREATE TABLE website.website (
    id integer DEFAULT public.defaultid('website'::text, 'website'::text, 'id'::text) NOT NULL,
    "brandId" integer NOT NULL,
    "faviconUrl" text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    published boolean DEFAULT false NOT NULL,
    "navigationMenuId" integer
);
CREATE TABLE website."websitePageModule" (
    id integer DEFAULT public.defaultid('website'::text, 'websitePageModule'::text, 'id'::text) NOT NULL,
    "websitePageId" integer NOT NULL,
    "moduleType" text NOT NULL,
    "fileId" integer,
    "internalModuleIdentifier" text,
    "templateId" integer,
    "position" numeric,
    "visibilityConditionId" integer,
    config jsonb,
    config2 json,
    config3 jsonb,
    config4 text,
    name text,
    "isHidden" boolean DEFAULT false NOT NULL
);
CREATE SEQUENCE website."websitePageModule_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website."websitePageModule_id_seq" OWNED BY website."websitePageModule".id;
CREATE SEQUENCE website."websitePage_id_seq"
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website."websitePage_id_seq" OWNED BY website."websitePage".id;
CREATE SEQUENCE website.website_id_seq
    START WITH 1000
    INCREMENT BY 1
    MINVALUE 1000
    NO MAXVALUE
    CACHE 1;
ALTER SEQUENCE website.website_id_seq OWNED BY website.website.id;
ALTER TABLE ONLY brands."brandSetting" ALTER COLUMN id SET DEFAULT nextval('brands."brandSetting_id_seq"'::regclass);
ALTER TABLE ONLY brands."jsCssFileLinks" ALTER COLUMN id SET DEFAULT nextval('brands."jsCssFileLinks_id_seq"'::regclass);
ALTER TABLE ONLY brands."locationKiosk" ALTER COLUMN id SET DEFAULT nextval('brands."locationKiosk_id_seq"'::regclass);
ALTER TABLE ONLY brands."locationTable" ALTER COLUMN id SET DEFAULT nextval('brands."locationTable_id_seq"'::regclass);
ALTER TABLE ONLY brands."orderTab" ALTER COLUMN id SET DEFAULT nextval('brands."orderExperienceOption_id_seq"'::regclass);
ALTER TABLE ONLY brands."pagesLinkedFiles" ALTER COLUMN id SET DEFAULT nextval('brands."pagesLinkedFiles_id_seq"'::regclass);
ALTER TABLE ONLY developer."webhookUrl_events" ALTER COLUMN id SET DEFAULT nextval('developer."webhookUrl_events_Id_seq"'::regclass);
ALTER TABLE ONLY hdb_catalog.remote_schemas ALTER COLUMN id SET DEFAULT nextval('hdb_catalog.remote_schemas_id_seq'::regclass);
ALTER TABLE ONLY ingredient."ingredientSachet_unitConversion" ALTER COLUMN id SET DEFAULT nextval('ingredient."ingredientSachet_unitConversion_id_seq"'::regclass);
ALTER TABLE ONLY insights.analytics ALTER COLUMN id SET DEFAULT nextval('insights.analytics_id_seq'::regclass);
ALTER TABLE ONLY inventory."sachetItem_unitConversion" ALTER COLUMN id SET DEFAULT nextval('inventory."sachetItem_unitConversion_id_seq"'::regclass);
ALTER TABLE ONLY "onDemand"."linkedModifier" ALTER COLUMN id SET DEFAULT nextval('"onDemand"."linkedModifier_id_seq"'::regclass);
ALTER TABLE ONLY "paymentHub".company_ ALTER COLUMN id SET DEFAULT nextval('"paymentHub".company__id_seq'::regclass);
ALTER TABLE ONLY "paymentHub"."paymentPartnership_" ALTER COLUMN id SET DEFAULT nextval('"paymentHub"."paymentPartnership__id_seq"'::regclass);
ALTER TABLE ONLY products."nutritionInfo" ALTER COLUMN id SET DEFAULT nextval('products."nutritionInfo_id_seq"'::regclass);
ALTER TABLE ONLY public.author ALTER COLUMN id SET DEFAULT nextval('public.author_id_seq'::regclass);
ALTER TABLE ONLY settings.env ALTER COLUMN id SET DEFAULT nextval('settings.env_id_seq'::regclass);
ALTER TABLE ONLY sqldemo.author ALTER COLUMN id SET DEFAULT nextval('sqldemo.author_id_seq'::regclass);
ALTER TABLE ONLY sqldemo.book ALTER COLUMN id SET DEFAULT nextval('sqldemo.book_id_seq'::regclass);
ALTER TABLE ONLY sqldemo.item ALTER COLUMN id SET DEFAULT nextval('sqldemo.item_id_seq'::regclass);
ALTER TABLE ONLY website."systemDefinedModule" ALTER COLUMN id SET DEFAULT nextval('website."systemDefinedModule_id_seq"'::regclass);
ALTER TABLE ONLY aws.ses
    ADD CONSTRAINT ses_id_key UNIQUE (id);
ALTER TABLE ONLY aws.ses
    ADD CONSTRAINT ses_pkey PRIMARY KEY (domain);
ALTER TABLE ONLY brands."availableOrderInterface"
    ADD CONSTRAINT "availableOrderInterface_pkey" PRIMARY KEY (label);
ALTER TABLE ONLY brands."availablePaymentOption"
    ADD CONSTRAINT "availablePaymentOption_pkey" PRIMARY KEY (label);
ALTER TABLE ONLY brands."brandMenuCategory"
    ADD CONSTRAINT "brandMenuCategory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."brandMenu"
    ADD CONSTRAINT "brandMenu_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."brandPageModule"
    ADD CONSTRAINT "brandPageModule_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."brandPageSetting"
    ADD CONSTRAINT "brandPageSetting_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY brands."brandPageSetting"
    ADD CONSTRAINT "brandPageSetting_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."brandPage_brandPageSetting"
    ADD CONSTRAINT "brandPage_brandPageSetting_pkey" PRIMARY KEY ("brandPageId", "brandPageSettingId");
ALTER TABLE ONLY brands."brandPages"
    ADD CONSTRAINT "brandPages_brandId_route_key" UNIQUE ("brandId", route);
ALTER TABLE ONLY brands."brandPages"
    ADD CONSTRAINT "brandPages_id_key" UNIQUE (id);
ALTER TABLE ONLY brands."brandPages"
    ADD CONSTRAINT "brandPages_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."brandSetting"
    ADD CONSTRAINT "brandSetting_id_key" UNIQUE (id);
ALTER TABLE ONLY brands."brandSetting"
    ADD CONSTRAINT "brandSetting_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY brands."brandSetting"
    ADD CONSTRAINT "brandSetting_pkey" PRIMARY KEY (id, identifier);
ALTER TABLE ONLY brands."brand_brandSetting"
    ADD CONSTRAINT "brand_brandSetting_pkey" PRIMARY KEY ("brandSettingId", "brandId");
ALTER TABLE ONLY brands.brand_location
    ADD CONSTRAINT brand_location_id_key UNIQUE (id);
ALTER TABLE ONLY brands."brand_location_orderExperienceOption"
    ADD CONSTRAINT "brand_location_orderExperienceOption_pkey" PRIMARY KEY ("brand_locationId", "orderExperienceOptionId");
ALTER TABLE ONLY brands.brand_location
    ADD CONSTRAINT brand_location_pkey PRIMARY KEY ("brandId", "locationId");
ALTER TABLE ONLY brands."brand_paymentPartnership"
    ADD CONSTRAINT "brand_paymentPartnership_pkey" PRIMARY KEY ("brandId", "paymentPartnershipId");
ALTER TABLE ONLY brands.brand
    ADD CONSTRAINT brand_pkey PRIMARY KEY (id);
ALTER TABLE ONLY brands."brand_subscriptionStoreSetting"
    ADD CONSTRAINT "brand_subscriptionStoreSetting_pkey" PRIMARY KEY ("brandId", "subscriptionStoreSettingId");
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_brandId_linkedFileId_key" UNIQUE ("brandId", "linkedFileId");
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_brandPageId_linkedFileId_key" UNIQUE ("brandPageId", "linkedFileId");
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_brandPageModuleId_linkedFileId_key" UNIQUE ("brandPageModuleId", "linkedFileId");
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_htmlFileId_linkedFileId_key" UNIQUE ("htmlFileId", "linkedFileId");
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_id_key" UNIQUE (id);
ALTER TABLE ONLY brands."jsCssFileLinks"
    ADD CONSTRAINT "jsCssFileLinks_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."locationCluster"
    ADD CONSTRAINT "locationCluster_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."locationKiosk"
    ADD CONSTRAINT "locationKiosk_internalLocationKioskLabel_locationId_key" UNIQUE ("internalLocationKioskLabel", "locationId");
ALTER TABLE ONLY brands."locationKiosk"
    ADD CONSTRAINT "locationKiosk_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."locationTable"
    ADD CONSTRAINT "locationTable_internalTableLabel_locationId_key" UNIQUE ("internalTableLabel", "locationId");
ALTER TABLE ONLY brands."locationTable"
    ADD CONSTRAINT "locationTable_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands.location
    ADD CONSTRAINT location_id_key UNIQUE (id);
ALTER TABLE ONLY brands.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);
ALTER TABLE ONLY brands."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."navigationMenu"
    ADD CONSTRAINT "navigationMenu_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."orderTab"
    ADD CONSTRAINT "orderExperienceOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."orderType"
    ADD CONSTRAINT "orderType_pkey" PRIMARY KEY (label);
ALTER TABLE ONLY brands."pagesLinkedFiles"
    ADD CONSTRAINT "pagesLinkedFiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands.brand
    ADD CONSTRAINT shop_domain_key UNIQUE (domain);
ALTER TABLE ONLY brands.brand
    ADD CONSTRAINT shop_id_key UNIQUE (id);
ALTER TABLE ONLY brands."brand_storeSetting"
    ADD CONSTRAINT "shop_storeSetting_pkey" PRIMARY KEY ("brandId", "storeSettingId");
ALTER TABLE ONLY brands."storeSetting"
    ADD CONSTRAINT "storeSetting_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY brands."storeSetting"
    ADD CONSTRAINT "storeSetting_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."subscriptionStoreSetting"
    ADD CONSTRAINT "subscriptionStoreSetting_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY brands."subscriptionStoreSetting"
    ADD CONSTRAINT "subscriptionStoreSetting_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY brands."systemModule"
    ADD CONSTRAINT "systemModule_pkey" PRIMARY KEY (identifier);
ALTER TABLE ONLY brands."systemModule"
    ADD CONSTRAINT "systemModules_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY content."experienceDivId"
    ADD CONSTRAINT "experienceDivId_pkey" PRIMARY KEY (id, "brandPageId");
ALTER TABLE ONLY content.identifier
    ADD CONSTRAINT identifier_pkey PRIMARY KEY (title);
ALTER TABLE ONLY content.page
    ADD CONSTRAINT page_pkey PRIMARY KEY (title);
ALTER TABLE ONLY content."subscriptionDivIds"
    ADD CONSTRAINT "subscriptionDivIds_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY content.template
    ADD CONSTRAINT template_pkey PRIMARY KEY (id);
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brandCustomer_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm.brand_campaign
    ADD CONSTRAINT brand_campaign_pkey PRIMARY KEY ("brandId", "campaignId");
ALTER TABLE ONLY crm.brand_coupon
    ADD CONSTRAINT brand_coupon_pkey PRIMARY KEY ("brandId", "couponId");
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brand_customer_brandId_keycloakId_key" UNIQUE ("brandId", "keycloakId");
ALTER TABLE ONLY crm."campaignType"
    ADD CONSTRAINT "campaignType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."campaignType"
    ADD CONSTRAINT "campaignType_value_key" UNIQUE (value);
ALTER TABLE ONLY crm.campaign
    ADD CONSTRAINT campaign_pkey PRIMARY KEY (id);
ALTER TABLE ONLY crm.coupon
    ADD CONSTRAINT coupon_code_key UNIQUE (code);
ALTER TABLE ONLY crm.coupon
    ADD CONSTRAINT coupon_pkey PRIMARY KEY (id);
ALTER TABLE ONLY crm."customerData"
    ADD CONSTRAINT "customerData_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_referralCode_key" UNIQUE ("referralCode");
ALTER TABLE ONLY crm."customerReview"
    ADD CONSTRAINT "customerReview_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT "customer_dailyKeyUserId_key" UNIQUE ("keycloakId");
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT customer_email_key UNIQUE (email);
ALTER TABLE ONLY crm."customer_experienceTags"
    ADD CONSTRAINT "customer_experienceTags_pkey" PRIMARY KEY ("keycloakId");
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT customer_id_key UNIQUE (id);
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT customer_pkey PRIMARY KEY ("keycloakId");
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_keycloakId_experienceId_key" UNIQUE ("keycloakId", "experienceId");
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_keycloakId_productId_key" UNIQUE ("keycloakId", "productId");
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_keycloakId_simpleRecipeId_key" UNIQUE ("keycloakId", "simpleRecipeId");
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."loyaltyPointTransaction"
    ADD CONSTRAINT "loyaltyPointTransaction_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."loyaltyPoint"
    ADD CONSTRAINT "loyaltyPoint_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm."rewardType_campaignType"
    ADD CONSTRAINT "rewardType_campaignType_pkey" PRIMARY KEY ("rewardTypeId", "campaignTypeId");
ALTER TABLE ONLY crm."rewardType"
    ADD CONSTRAINT "rewardType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm.reward
    ADD CONSTRAINT reward_pkey PRIMARY KEY (id);
ALTER TABLE ONLY crm.vocher
    ADD CONSTRAINT vocher_pkey PRIMARY KEY ("couponId", "brandCustomerId");
ALTER TABLE ONLY crm."walletTransaction"
    ADD CONSTRAINT "walletTransaction_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY crm.wallet
    ADD CONSTRAINT wallet_pkey PRIMARY KEY (id);
ALTER TABLE ONLY developer."apiKey"
    ADD CONSTRAINT "apiKey_label_key" UNIQUE (label);
ALTER TABLE ONLY developer."apiKey"
    ADD CONSTRAINT "apiKey_pkey" PRIMARY KEY ("apiKey");
ALTER TABLE ONLY developer."availableWebhookEvent"
    ADD CONSTRAINT "availableWebhookEvents_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY developer."processedWebhookEventsByUrl"
    ADD CONSTRAINT "processedWebhookEventsByUrl_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY developer."processedWebhookEvents"
    ADD CONSTRAINT "processedWebhookEvents_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY developer."webhookUrl_EventsLog"
    ADD CONSTRAINT "webhookUrl_EventsLog_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY developer."webhookUrl_events"
    ADD CONSTRAINT "webhookUrl_events_Id_key" UNIQUE (id);
ALTER TABLE ONLY developer."webhookUrl_events"
    ADD CONSTRAINT "webhookUrl_events_pkey" PRIMARY KEY ("webhookUrlId", "availableWebhookEventId", id);
ALTER TABLE ONLY developer."webhookUrl"
    ADD CONSTRAINT "webhookUrl_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY developer."webhookUrl"
    ADD CONSTRAINT "webhookUrl_urlEndpoint_key" UNIQUE ("urlEndpoint");
ALTER TABLE ONLY "deviceHub".computer
    ADD CONSTRAINT computer_pkey PRIMARY KEY ("printNodeId");
ALTER TABLE ONLY "deviceHub".config
    ADD CONSTRAINT config_name_key UNIQUE (name);
ALTER TABLE ONLY "deviceHub".config
    ADD CONSTRAINT config_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "deviceHub"."labelTemplate"
    ADD CONSTRAINT "labelTemplate_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "deviceHub"."printerType"
    ADD CONSTRAINT "printerType_pkey" PRIMARY KEY (type);
ALTER TABLE ONLY "deviceHub".printer
    ADD CONSTRAINT printer_pkey PRIMARY KEY ("printNodeId");
ALTER TABLE ONLY "deviceHub".scale
    ADD CONSTRAINT scale_pkey PRIMARY KEY ("computerId", "deviceName", "deviceNum");
ALTER TABLE ONLY editor.block
    ADD CONSTRAINT "block_fileId_key" UNIQUE ("fileId");
ALTER TABLE ONLY editor.block
    ADD CONSTRAINT block_path_key UNIQUE (path);
ALTER TABLE ONLY editor.block
    ADD CONSTRAINT block_pkey PRIMARY KEY (id);
ALTER TABLE ONLY editor."cssFileLinks"
    ADD CONSTRAINT "cssFileLinks_id_key" UNIQUE (id);
ALTER TABLE ONLY editor."cssFileLinks"
    ADD CONSTRAINT "cssFileLinks_pkey" PRIMARY KEY ("guiFileId", "cssFileId");
ALTER TABLE ONLY editor."jsFileLinks"
    ADD CONSTRAINT "jsFileLinks_id_key" UNIQUE (id);
ALTER TABLE ONLY editor."jsFileLinks"
    ADD CONSTRAINT "jsFileLinks_pkey" PRIMARY KEY ("guiFileId", "jsFileId");
ALTER TABLE ONLY editor."linkedFiles"
    ADD CONSTRAINT "linkedFiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY editor."priorityFuncTable"
    ADD CONSTRAINT "priorityFuncTable_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY editor."systemComponent"
    ADD CONSTRAINT "systemComponent_pkey" PRIMARY KEY (identifier);
ALTER TABLE ONLY editor.file
    ADD CONSTRAINT template_path_key UNIQUE (path);
ALTER TABLE ONLY editor.file
    ADD CONSTRAINT template_pkey PRIMARY KEY (id);
ALTER TABLE ONLY editor.template
    ADD CONSTRAINT template_pkey1 PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceBookingOption"
    ADD CONSTRAINT "experienceBookingOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceBookingParticipantChoice"
    ADD CONSTRAINT "experienceBookingParticipantChoice_pkey" PRIMARY KEY ("experienceBookingOptionId", "experienceBookingParticipantId");
ALTER TABLE ONLY experiences."experienceBookingParticipant"
    ADD CONSTRAINT "experienceBookingParticipant_cartId_key" UNIQUE ("cartId");
ALTER TABLE ONLY experiences."experienceBookingParticipant"
    ADD CONSTRAINT "experienceBookingParticipant_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_cartId_key" UNIQUE ("cartId");
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_experienceClassId_hostKeycloakId_key" UNIQUE ("experienceClassId", "hostKeycloakId");
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceCategory"
    ADD CONSTRAINT "experienceCategory_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY experiences."experienceClassOption"
    ADD CONSTRAINT "experienceClassOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceClassType_experiencePriceLevel"
    ADD CONSTRAINT "experienceClassType_experiencePriceLevel_pkey" PRIMARY KEY ("experienceClassTypeId", "experiencePriceLevelId");
ALTER TABLE ONLY experiences."experienceClassType"
    ADD CONSTRAINT "experienceClassType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_experienceBookingId_key" UNIQUE ("experienceBookingId");
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceFaq"
    ADD CONSTRAINT "experienceFaq_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experiencePriceLevel"
    ADD CONSTRAINT "experiencePriceLevel_from_to_price_key" UNIQUE ("from", "to", price);
ALTER TABLE ONLY experiences."experiencePriceLevel"
    ADD CONSTRAINT "experiencePriceLevel_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."experienceTags"
    ADD CONSTRAINT "experienceTags_id_key" UNIQUE (id);
ALTER TABLE ONLY experiences."experienceTags"
    ADD CONSTRAINT "experienceTags_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY experiences."experienceTags"
    ADD CONSTRAINT "experienceTags_title_key" UNIQUE (title);
ALTER TABLE ONLY experiences."experience_experienceCategory"
    ADD CONSTRAINT "experience_experienceCategory_pkey" PRIMARY KEY ("experienceId", "experienceCategoryTitle");
ALTER TABLE ONLY experiences."experience_experienceTags"
    ADD CONSTRAINT "experience_experienceTags_pkey" PRIMARY KEY ("experienceId", "experienceTagId");
ALTER TABLE ONLY experiences.experience_expert
    ADD CONSTRAINT experience_expert_pkey PRIMARY KEY ("expertId", "experienceId");
ALTER TABLE ONLY experiences.experience_headers
    ADD CONSTRAINT experience_headers_pkey PRIMARY KEY (id);
ALTER TABLE ONLY experiences.experience
    ADD CONSTRAINT experience_pkey PRIMARY KEY (id);
ALTER TABLE ONLY experiences.experience_products
    ADD CONSTRAINT experience_products_pkey PRIMARY KEY ("experienceId", "productId");
ALTER TABLE ONLY experiences."inviteType"
    ADD CONSTRAINT "inviteType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experiences."workspaceMetaData"
    ADD CONSTRAINT "workspaceMetaData_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY experts.expert
    ADD CONSTRAINT expert_email_key UNIQUE (email);
ALTER TABLE ONLY experts.expert
    ADD CONSTRAINT expert_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fulfilment.brand_recurrence
    ADD CONSTRAINT brand_recurrence_pkey PRIMARY KEY ("brandId", "recurrenceId");
ALTER TABLE ONLY fulfilment.charge
    ADD CONSTRAINT charge_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fulfilment."deliveryPreferenceByCharge"
    ADD CONSTRAINT "deliveryPreferenceByCharge_pkey" PRIMARY KEY ("clauseId", "chargeId");
ALTER TABLE ONLY fulfilment."deliveryPreferenceByCharge"
    ADD CONSTRAINT "deliveryPreferenceByCharge_priority_key" UNIQUE (priority);
ALTER TABLE ONLY fulfilment."deliveryService"
    ADD CONSTRAINT "deliveryService_partnershipId_key" UNIQUE ("partnershipId");
ALTER TABLE ONLY fulfilment."deliveryService"
    ADD CONSTRAINT "deliveryService_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY fulfilment."fulfillmentType"
    ADD CONSTRAINT "fulfillmentType_pkey" PRIMARY KEY (value);
ALTER TABLE ONLY fulfilment."mileRange"
    ADD CONSTRAINT "mileRange_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY fulfilment.recurrence
    ADD CONSTRAINT recurrence_pkey PRIMARY KEY (id);
ALTER TABLE ONLY fulfilment."timeSlot"
    ADD CONSTRAINT "timeSlot_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.event_log
    ADD CONSTRAINT event_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.event_triggers
    ADD CONSTRAINT event_triggers_pkey PRIMARY KEY (name);
ALTER TABLE ONLY hdb_catalog.hdb_action_log
    ADD CONSTRAINT hdb_action_log_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_action_permission
    ADD CONSTRAINT hdb_action_permission_pkey PRIMARY KEY (action_name, role_name);
ALTER TABLE ONLY hdb_catalog.hdb_action
    ADD CONSTRAINT hdb_action_pkey PRIMARY KEY (action_name);
ALTER TABLE ONLY hdb_catalog.hdb_allowlist
    ADD CONSTRAINT hdb_allowlist_collection_name_key UNIQUE (collection_name);
ALTER TABLE ONLY hdb_catalog.hdb_computed_field
    ADD CONSTRAINT hdb_computed_field_pkey PRIMARY KEY (table_schema, table_name, computed_field_name);
ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
    ADD CONSTRAINT hdb_cron_event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_cron_events
    ADD CONSTRAINT hdb_cron_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_cron_triggers
    ADD CONSTRAINT hdb_cron_triggers_pkey PRIMARY KEY (name);
ALTER TABLE ONLY hdb_catalog.hdb_function
    ADD CONSTRAINT hdb_function_pkey PRIMARY KEY (function_schema, function_name);
ALTER TABLE ONLY hdb_catalog.hdb_permission
    ADD CONSTRAINT hdb_permission_pkey PRIMARY KEY (table_schema, table_name, role_name, perm_type);
ALTER TABLE ONLY hdb_catalog.hdb_query_collection
    ADD CONSTRAINT hdb_query_collection_pkey PRIMARY KEY (collection_name);
ALTER TABLE ONLY hdb_catalog.hdb_relationship
    ADD CONSTRAINT hdb_relationship_pkey PRIMARY KEY (table_schema, table_name, rel_name);
ALTER TABLE ONLY hdb_catalog.hdb_remote_relationship
    ADD CONSTRAINT hdb_remote_relationship_pkey PRIMARY KEY (remote_relationship_name, table_schema, table_name);
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
    ADD CONSTRAINT hdb_scheduled_event_invocation_logs_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_events
    ADD CONSTRAINT hdb_scheduled_events_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.hdb_table
    ADD CONSTRAINT hdb_table_pkey PRIMARY KEY (table_schema, table_name);
ALTER TABLE ONLY hdb_catalog.hdb_version
    ADD CONSTRAINT hdb_version_pkey PRIMARY KEY (hasura_uuid);
ALTER TABLE ONLY hdb_catalog.migration_settings
    ADD CONSTRAINT migration_settings_pkey PRIMARY KEY (setting);
ALTER TABLE ONLY hdb_catalog.remote_schemas
    ADD CONSTRAINT remote_schemas_name_key UNIQUE (name);
ALTER TABLE ONLY hdb_catalog.remote_schemas
    ADD CONSTRAINT remote_schemas_pkey PRIMARY KEY (id);
ALTER TABLE ONLY hdb_catalog.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);
ALTER TABLE ONLY imports."importHistory"
    ADD CONSTRAINT "importHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY imports.import
    ADD CONSTRAINT imports_pkey PRIMARY KEY (id);
ALTER TABLE ONLY ingredient."ingredientProcessing"
    ADD CONSTRAINT "ingredientProcessing_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ingredient."ingredientSacahet_recipeHubSachet"
    ADD CONSTRAINT "ingredientSacahet_recipeHubSachet_pkey" PRIMARY KEY ("ingredientSachetId", "recipeHubSachetId");
ALTER TABLE ONLY ingredient."ingredientSachet"
    ADD CONSTRAINT "ingredientSachet_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ingredient."ingredientSachet_unitConversion"
    ADD CONSTRAINT "ingredientSachet_unitConversion_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ingredient.ingredient
    ADD CONSTRAINT ingredient_pkey PRIMARY KEY (id);
ALTER TABLE ONLY ingredient."modeOfFulfillmentEnum"
    ADD CONSTRAINT "modeOfFulfillmentEnum_pkey" PRIMARY KEY (value);
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY insights.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (id);
ALTER TABLE ONLY insights.app_module_insight
    ADD CONSTRAINT app_module_insight_pkey PRIMARY KEY ("appTitle", "moduleTitle", "insightIdentifier");
ALTER TABLE ONLY insights.chart
    ADD CONSTRAINT chart_pkey PRIMARY KEY (id);
ALTER TABLE ONLY insights.date
    ADD CONSTRAINT date_pkey PRIMARY KEY (date);
ALTER TABLE ONLY insights.day
    ADD CONSTRAINT "day_dayNumber_key" UNIQUE ("dayNumber");
ALTER TABLE ONLY insights.day
    ADD CONSTRAINT day_pkey PRIMARY KEY ("dayName");
ALTER TABLE ONLY insights.hour
    ADD CONSTRAINT hour_pkey PRIMARY KEY (hour);
ALTER TABLE ONLY insights.insights
    ADD CONSTRAINT insights_pkey PRIMARY KEY (identifier);
ALTER TABLE ONLY insights.insights
    ADD CONSTRAINT insights_title_key UNIQUE (identifier);
ALTER TABLE ONLY insights.month
    ADD CONSTRAINT month_name_key UNIQUE (name);
ALTER TABLE ONLY insights.month
    ADD CONSTRAINT month_pkey PRIMARY KEY (number);
ALTER TABLE ONLY instructions."instructionStep"
    ADD CONSTRAINT "instructionStep_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY instructions."instructionSet"
    ADD CONSTRAINT instruction_pkey PRIMARY KEY (id);
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."bulkItem"
    ADD CONSTRAINT "bulkInventoryItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."bulkItem_unitConversion"
    ADD CONSTRAINT "bulkItem_unitConversion_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."packagingHistory"
    ADD CONSTRAINT "packagingHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_mandiPurchaseOrderItemId_key" UNIQUE ("mandiPurchaseOrderItemId");
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrder_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."sachetItemHistory"
    ADD CONSTRAINT "sachetHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."sachetItem"
    ADD CONSTRAINT "sachetItem2_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."sachetItem_unitConversion"
    ADD CONSTRAINT "sachetItem_unitConversion_pkey" PRIMARY KEY ("entityId", "unitConversionId");
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."supplierItem"
    ADD CONSTRAINT "supplierItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY inventory."supplierItem_unitConversion"
    ADD CONSTRAINT "supplierItem_unitConversion_pkey" PRIMARY KEY ("entityId", "unitConversionId");
ALTER TABLE ONLY inventory.supplier
    ADD CONSTRAINT "supplier_mandiSupplierId_key" UNIQUE ("mandiSupplierId");
ALTER TABLE ONLY inventory.supplier
    ADD CONSTRAINT supplier_pkey PRIMARY KEY (id);
ALTER TABLE ONLY inventory."unitConversionByBulkItem"
    ADD CONSTRAINT "unitConversionByBulkItem_id_key" UNIQUE (id);
ALTER TABLE ONLY inventory."unitConversionByBulkItem"
    ADD CONSTRAINT "unitConversionByBulkItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY master."accompanimentType"
    ADD CONSTRAINT "accompanimentType_name_key" UNIQUE (name);
ALTER TABLE ONLY master."accompanimentType"
    ADD CONSTRAINT "accompanimentType_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY master."allergenName"
    ADD CONSTRAINT allergen_name_key UNIQUE (name);
ALTER TABLE ONLY master."allergenName"
    ADD CONSTRAINT allergen_pkey PRIMARY KEY (id);
ALTER TABLE ONLY master."cuisineName"
    ADD CONSTRAINT "cuisineName_id_key" UNIQUE (id);
ALTER TABLE ONLY master."cuisineName"
    ADD CONSTRAINT "cuisineName_name_key" UNIQUE (name);
ALTER TABLE ONLY master."cuisineName"
    ADD CONSTRAINT "cuisineName_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY master."ingredientCategory"
    ADD CONSTRAINT "ingredientCategory_pkey" PRIMARY KEY (name);
ALTER TABLE ONLY master."processingName"
    ADD CONSTRAINT processing_name_key UNIQUE (name);
ALTER TABLE ONLY master."processingName"
    ADD CONSTRAINT processing_pkey PRIMARY KEY (id);
ALTER TABLE ONLY master."productCategory"
    ADD CONSTRAINT "productCategory_pkey" PRIMARY KEY (name);
ALTER TABLE ONLY master."recipeComponent"
    ADD CONSTRAINT "recipeComponent_pkey" PRIMARY KEY (label);
ALTER TABLE ONLY master."unitConversion"
    ADD CONSTRAINT "unitConversion_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY master.unit
    ADD CONSTRAINT unit_name_key UNIQUE (name);
ALTER TABLE ONLY master.unit
    ADD CONSTRAINT unit_pkey PRIMARY KEY (id);
ALTER TABLE ONLY master."vegNonvegType"
    ADD CONSTRAINT "vegNonvegType_pkey" PRIMARY KEY (label);
ALTER TABLE ONLY notifications.brand_touchpoint
    ADD CONSTRAINT brand_touchpoint_pkey PRIMARY KEY ("touchpointIdentifier", "brandId");
ALTER TABLE ONLY notifications."emailConfig"
    ADD CONSTRAINT "emailConfig_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY notifications."emailTriggers"
    ADD CONSTRAINT "emailTriggers_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY notifications."emailTriggers"
    ADD CONSTRAINT "emailTriggers_title_key" UNIQUE (title);
ALTER TABLE ONLY notifications."displayNotification"
    ADD CONSTRAINT notification_pkey PRIMARY KEY (id);
ALTER TABLE ONLY notifications."printConfig"
    ADD CONSTRAINT "printConfig_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY notifications."smsConfig"
    ADD CONSTRAINT "smsConfig_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY notifications.touchpoints
    ADD CONSTRAINT touchpoints_pkey PRIMARY KEY (identifier);
ALTER TABLE ONLY notifications.type
    ADD CONSTRAINT type_name_key UNIQUE (name);
ALTER TABLE ONLY notifications.type
    ADD CONSTRAINT type_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand".category
    ADD CONSTRAINT category_id_key UNIQUE (id);
ALTER TABLE ONLY "onDemand".category
    ADD CONSTRAINT category_name_key UNIQUE (name);
ALTER TABLE ONLY "onDemand".category
    ADD CONSTRAINT category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand".collection
    ADD CONSTRAINT collection_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand"."collection_productCategory"
    ADD CONSTRAINT "collection_productCategory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand"."collection_productCategory_product"
    ADD CONSTRAINT "collection_productCategory_product_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand"."linkedModifier"
    ADD CONSTRAINT "linkedModifier_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand".menu
    ADD CONSTRAINT menu_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand"."modifierCategoryOption"
    ADD CONSTRAINT "modifierCategoryOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand"."modifierCategory"
    ADD CONSTRAINT "modifierCategory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand".modifier
    ADD CONSTRAINT modifier_name_key UNIQUE (name);
ALTER TABLE ONLY "onDemand".modifier
    ADD CONSTRAINT modifier_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "onDemand".brand_collection
    ADD CONSTRAINT shop_collection_pkey PRIMARY KEY ("brandId", "collectionId");
ALTER TABLE ONLY "onDemand"."storeData"
    ADD CONSTRAINT "storeData_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "order"."cartPayment"
    ADD CONSTRAINT "cartPayment_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_customerId_subscriptionOccurenceId_brandId_key" UNIQUE ("customerId", "subscriptionOccurenceId", "brandId");
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_orderId_key" UNIQUE ("orderId");
ALTER TABLE ONLY "order".cart_rewards
    ADD CONSTRAINT cart_rewards_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "orderCartItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "orderCart_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "order"."orderMode"
    ADD CONSTRAINT "orderModes_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY "order"."orderStatusEnum"
    ADD CONSTRAINT "orderStatusEnum_pkey" PRIMARY KEY (value);
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT "order_cartId_key" UNIQUE ("cartId");
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT order_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT "order_thirdPartyOrderId_key" UNIQUE ("thirdPartyOrderId");
ALTER TABLE ONLY "order"."stripePaymentHistory"
    ADD CONSTRAINT "paymentHistory_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "order"."thirdPartyOrder"
    ADD CONSTRAINT "thirdPartyOrder_id_key" UNIQUE (id);
ALTER TABLE ONLY "order"."thirdPartyOrder"
    ADD CONSTRAINT "thirdPartyOrder_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY packaging."packagingSpecifications"
    ADD CONSTRAINT "packagingSpecifications_mandiPackagingId_key" UNIQUE ("mandiPackagingId");
ALTER TABLE ONLY packaging."packagingSpecifications"
    ADD CONSTRAINT "packagingSpecifications_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY packaging.packaging
    ADD CONSTRAINT "packaging_mandiPackagingId_key" UNIQUE ("mandiPackagingId");
ALTER TABLE ONLY packaging.packaging
    ADD CONSTRAINT packaging_pkey PRIMARY KEY (id);
ALTER TABLE ONLY "paymentHub".commission_
    ADD CONSTRAINT commission__pkey PRIMARY KEY (id);
ALTER TABLE ONLY "paymentHub".company_
    ADD CONSTRAINT company__pkey PRIMARY KEY (id);
ALTER TABLE ONLY "paymentHub".country_company_
    ADD CONSTRAINT country_company__pkey PRIMARY KEY (country, "companyId");
ALTER TABLE ONLY "paymentHub"."paymentPartnership_"
    ADD CONSTRAINT "paymentPartnership__pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "paymentHub".payment_
    ADD CONSTRAINT payment__pkey PRIMARY KEY (id);
ALTER TABLE ONLY "paymentHub".payout_
    ADD CONSTRAINT payout__pkey PRIMARY KEY (id);
ALTER TABLE ONLY platform."customerAddress"
    ADD CONSTRAINT "customerAddress__pkey" PRIMARY KEY (id);
ALTER TABLE ONLY platform.customer
    ADD CONSTRAINT customer__email_key UNIQUE (email);
ALTER TABLE ONLY platform.customer
    ADD CONSTRAINT "customer__keycloakId_key" UNIQUE ("keycloakId");
ALTER TABLE ONLY platform.customer
    ADD CONSTRAINT "customer__phoneNumber_key" UNIQUE ("phoneNumber");
ALTER TABLE ONLY platform.customer
    ADD CONSTRAINT customer__pkey PRIMARY KEY ("keycloakId");
ALTER TABLE ONLY platform.otp_transaction
    ADD CONSTRAINT otp_transaction_pkey PRIMARY KEY (id);
ALTER TABLE ONLY platform.provider_customer
    ADD CONSTRAINT provider_customer_id_key UNIQUE (id);
ALTER TABLE ONLY platform.provider_customer
    ADD CONSTRAINT provider_customer_pkey PRIMARY KEY (id);
ALTER TABLE ONLY platform."customerPaymentMethod"
    ADD CONSTRAINT "stripePaymentMethod__pkey" PRIMARY KEY ("paymentMethodId");
ALTER TABLE ONLY products."comboProductComponent"
    ADD CONSTRAINT "comboProductComponents_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."customizableProductComponent"
    ADD CONSTRAINT "customizableProductOptions_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."inventoryProductBundleSachet"
    ADD CONSTRAINT "inventoryProductBundleSachet_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."inventoryProductBundle"
    ADD CONSTRAINT "inventoryProductBundle_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."nutritionInfo"
    ADD CONSTRAINT "nutritionInfo_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."productOptionType"
    ADD CONSTRAINT "productOptionType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."productPrice_brand_location"
    ADD CONSTRAINT "productPrice_brand_location_ProductId_productOptionId_key" UNIQUE ("ProductId", "productOptionId");
ALTER TABLE ONLY products."productPrice_brand_location"
    ADD CONSTRAINT "productPrice_brand_location_brand_locationId_brandId_locationId" UNIQUE ("brand_locationId", "brandId", "locationId");
ALTER TABLE ONLY products."productPrice_brand_location"
    ADD CONSTRAINT "productPrice_brand_location_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY products."productType"
    ADD CONSTRAINT "productType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY products.product_category
    ADD CONSTRAINT product_category_pkey PRIMARY KEY (id);
ALTER TABLE ONLY products.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.response
    ADD CONSTRAINT response_pkey PRIMARY KEY (success, message);
ALTER TABLE ONLY rules.conditions
    ADD CONSTRAINT conditions_pkey PRIMARY KEY (id);
ALTER TABLE ONLY rules.facts
    ADD CONSTRAINT facts_pkey PRIMARY KEY (id);
ALTER TABLE ONLY safety."safetyCheckPerUser"
    ADD CONSTRAINT "safetyCheckByUser_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY safety."safetyCheck"
    ADD CONSTRAINT "safetyCheck_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY segmentation."ActionType"
    ADD CONSTRAINT "ActionType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY segmentation."listActionByType"
    ADD CONSTRAINT "listActionByType_pkey" PRIMARY KEY ("actionTitle", "listType");
ALTER TABLE ONLY segmentation."listAction_list_linkedRecord"
    ADD CONSTRAINT "listAction_list_linkedRecord_pkey" PRIMARY KEY ("listActionId", "list_linkedRecordId");
ALTER TABLE ONLY segmentation."listAction"
    ADD CONSTRAINT "listAction_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY segmentation."listType"
    ADD CONSTRAINT "listType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY segmentation."list_linkedRecord"
    ADD CONSTRAINT "list_linkedRecord_id_key" UNIQUE (id);
ALTER TABLE ONLY segmentation."list_linkedRecord"
    ADD CONSTRAINT "list_linkedRecord_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY segmentation.list
    ADD CONSTRAINT list_pkey PRIMARY KEY (id);
ALTER TABLE ONLY segmentation."workflowTriggerType"
    ADD CONSTRAINT "workflowTriggerType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY segmentation.workflow
    ADD CONSTRAINT workflow_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings."activityLogs"
    ADD CONSTRAINT "activityLogs_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY settings."appPermission"
    ADD CONSTRAINT "appPermission_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY settings."appSettings"
    ADD CONSTRAINT "appSettings_identifier_key" UNIQUE (identifier);
ALTER TABLE ONLY settings."appSettings"
    ADD CONSTRAINT "appSettings_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY settings.app_module
    ADD CONSTRAINT app_module_pkey PRIMARY KEY ("appTitle", "moduleTitle");
ALTER TABLE ONLY settings.app
    ADD CONSTRAINT apps_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings.app
    ADD CONSTRAINT apps_title_key UNIQUE (title);
ALTER TABLE ONLY settings."authProvider"
    ADD CONSTRAINT "authProvider_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY settings.env
    ADD CONSTRAINT env_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings.location
    ADD CONSTRAINT location_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings."operationConfig"
    ADD CONSTRAINT "operationConfig_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY settings."organizationSettings"
    ADD CONSTRAINT "organizationSettings_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY settings."role_appPermission"
    ADD CONSTRAINT "role_appPermission_pkey" PRIMARY KEY ("appPermissionId", "role_appId");
ALTER TABLE ONLY settings.role_app
    ADD CONSTRAINT role_app_id_key UNIQUE (id);
ALTER TABLE ONLY settings.role_app
    ADD CONSTRAINT role_app_pkey PRIMARY KEY ("roleId", "appId");
ALTER TABLE ONLY settings.role
    ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings.role
    ADD CONSTRAINT roles_role_key UNIQUE (title);
ALTER TABLE ONLY settings.station_kot_printer
    ADD CONSTRAINT station_kot_printer_pkey PRIMARY KEY ("stationId", "printNodeId");
ALTER TABLE ONLY settings.station
    ADD CONSTRAINT station_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings.station_label_printer
    ADD CONSTRAINT station_printer_pkey PRIMARY KEY ("stationId", "printNodeId");
ALTER TABLE ONLY settings.station_user
    ADD CONSTRAINT station_user_pkey PRIMARY KEY ("userKeycloakId", "stationId");
ALTER TABLE ONLY settings."user"
    ADD CONSTRAINT "user_keycloakId_key" UNIQUE ("keycloakId");
ALTER TABLE ONLY settings.user_location
    ADD CONSTRAINT user_location_pkey PRIMARY KEY ("userId", "locationId");
ALTER TABLE ONLY settings."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);
ALTER TABLE ONLY settings.user_role
    ADD CONSTRAINT user_role_pkey PRIMARY KEY ("userId", "roleId");
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield"
    ADD CONSTRAINT "recipeServing_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeComponent_productOptionType"
    ADD CONSTRAINT "simpleRecipeComponent_productOptionType_pkey" PRIMARY KEY ("simpleRecipeComponentId", "productOptionType");
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield_ingredientSachet"
    ADD CONSTRAINT "simpleRecipeYield_ingredientSachet_pkey" PRIMARY KEY ("recipeYieldId", "simpleRecipeIngredientProcessingId");
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe_ingredient_processing"
    ADD CONSTRAINT "simpleRecipe_ingredient_processing_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe"
    ADD CONSTRAINT "simpleRecipe_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe_productOptionType"
    ADD CONSTRAINT "simpleRecipe_productOptionType_pkey" PRIMARY KEY ("simpleRecipeId", "productOptionTypeTitle");
ALTER TABLE ONLY sqldemo.author
    ADD CONSTRAINT author_pkey PRIMARY KEY (id);
ALTER TABLE ONLY sqldemo.book
    ADD CONSTRAINT book_pkey PRIMARY KEY (id);
ALTER TABLE ONLY sqldemo.item
    ADD CONSTRAINT item_pkey PRIMARY KEY (id);
ALTER TABLE ONLY subscription."brand_subscriptionTitle"
    ADD CONSTRAINT "shop_subscriptionTitle_pkey" PRIMARY KEY ("brandId", "subscriptionTitleId");
ALTER TABLE ONLY subscription."subscriptionAutoSelectOption"
    ADD CONSTRAINT "subscriptionAutoSelectOption_pkey" PRIMARY KEY ("methodName");
ALTER TABLE ONLY subscription."subscriptionItemCount"
    ADD CONSTRAINT "subscriptionItemCount_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionOccurence_addOn"
    ADD CONSTRAINT "subscriptionOccurence_addOn_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_orderCartId_key" UNIQUE ("cartId");
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_pkey" PRIMARY KEY ("subscriptionOccurenceId", "keycloakId", "brand_customerId");
ALTER TABLE ONLY subscription."subscriptionOccurence"
    ADD CONSTRAINT "subscriptionOccurence_id_key" UNIQUE (id);
ALTER TABLE ONLY subscription."subscriptionOccurence"
    ADD CONSTRAINT "subscriptionOccurence_pkey" PRIMARY KEY ("subscriptionId", "fulfillmentDate");
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_id_key" UNIQUE (id);
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionPickupOption"
    ADD CONSTRAINT "subscriptionPickupOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionServing"
    ADD CONSTRAINT "subscriptionServing_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionTitle"
    ADD CONSTRAINT "subscriptionTitle_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY subscription."subscriptionTitle"
    ADD CONSTRAINT "subscriptionTitle_title_key" UNIQUE (title);
ALTER TABLE ONLY subscription.subscription
    ADD CONSTRAINT subscription_pkey PRIMARY KEY (id);
ALTER TABLE ONLY subscription.subscription_zipcode
    ADD CONSTRAINT subscription_zipcode_pkey PRIMARY KEY ("subscriptionId", zipcode);
ALTER TABLE ONLY ux."accessPointType"
    ADD CONSTRAINT "accessPointType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY ux."accessPoint"
    ADD CONSTRAINT "accessPoint_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ux."actionType"
    ADD CONSTRAINT "actionType_pkey" PRIMARY KEY (title);
ALTER TABLE ONLY ux.action
    ADD CONSTRAINT action_pkey PRIMARY KEY (id);
ALTER TABLE ONLY ux."bottomBarOption"
    ADD CONSTRAINT "bottomBarOption_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_conditionId_key" UNIQUE ("conditionId");
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_id_key" UNIQUE (id);
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ux."dailyosDivId"
    ADD CONSTRAINT "dailyosDivId_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY ux."user_dailyosDivIdFile"
    ADD CONSTRAINT "user_dailyosDivIdFile_pkey" PRIMARY KEY ("userEmail", "dailyosDivIdFileId");
ALTER TABLE ONLY website."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY website."navigationMenu"
    ADD CONSTRAINT "navigationMenu_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY website."systemDefinedModule"
    ADD CONSTRAINT "systemDefinedModule_name_key" UNIQUE (name);
ALTER TABLE ONLY website."systemDefinedModule"
    ADD CONSTRAINT "systemDefinedModule_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY website."websitePageModule"
    ADD CONSTRAINT "websitePageModule_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY website."websitePage"
    ADD CONSTRAINT "websitePage_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY website.website
    ADD CONSTRAINT "website_brandId_key" UNIQUE ("brandId");
ALTER TABLE ONLY website.website
    ADD CONSTRAINT website_pkey PRIMARY KEY (id);
CREATE INDEX event_invocation_logs_event_id_idx ON hdb_catalog.event_invocation_logs USING btree (event_id);
CREATE INDEX event_log_created_at_idx ON hdb_catalog.event_log USING btree (created_at);
CREATE INDEX event_log_delivered_idx ON hdb_catalog.event_log USING btree (delivered);
CREATE INDEX event_log_locked_idx ON hdb_catalog.event_log USING btree (locked);
CREATE INDEX event_log_trigger_name_idx ON hdb_catalog.event_log USING btree (trigger_name);
CREATE INDEX hdb_cron_event_status ON hdb_catalog.hdb_cron_events USING btree (status);
CREATE INDEX hdb_scheduled_event_status ON hdb_catalog.hdb_scheduled_events USING btree (status);
CREATE UNIQUE INDEX hdb_schema_update_event_one_row ON hdb_catalog.hdb_schema_update_event USING btree (((occurred_at IS NOT NULL)));
CREATE UNIQUE INDEX hdb_version_one_row ON hdb_catalog.hdb_version USING btree (((version IS NOT NULL)));
CREATE TRIGGER set_aws_ses_updated_at BEFORE UPDATE ON aws.ses FOR EACH ROW EXECUTE FUNCTION aws.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_aws_ses_updated_at ON aws.ses IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "handleBrandSettingsOnBrandInsert" AFTER INSERT ON brands.brand FOR EACH ROW EXECUTE FUNCTION brands."handleBrandSettingsSync"();
CREATE TRIGGER "handleBrandSettingsOnBrandSettingsInsert" AFTER INSERT ON brands."brandSetting" FOR EACH ROW EXECUTE FUNCTION brands."handleBrandSettingsSync"();
CREATE TRIGGER "handleDeleteProtectionOfDefaultBrand" BEFORE DELETE ON brands.brand FOR EACH ROW EXECUTE FUNCTION public."handleDeleteProtection"();
CREATE TRIGGER "handleDeleteProtectionOnBrandSetting" BEFORE DELETE ON brands."brandSetting" FOR EACH ROW EXECUTE FUNCTION public."handleDeleteProtection"();
CREATE TRIGGER set_brands_brand_updated_at BEFORE UPDATE ON brands.brand FOR EACH ROW EXECUTE FUNCTION brands.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_brands_brand_updated_at ON brands.brand IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_brands_navigationMenuItem_updated_at" BEFORE UPDATE ON brands."navigationMenuItem" FOR EACH ROW EXECUTE FUNCTION brands.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_brands_navigationMenuItem_updated_at" ON brands."navigationMenuItem" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_brands_navigationMenu_updated_at" BEFORE UPDATE ON brands."navigationMenu" FOR EACH ROW EXECUTE FUNCTION brands.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_brands_navigationMenu_updated_at" ON brands."navigationMenu" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "customerWLRTrigger" AFTER INSERT ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm."createCustomerWLR"();
CREATE TRIGGER handle_brand_customer_event_logging AFTER INSERT OR DELETE OR UPDATE OF "isSubscriber", "isAutoSelectOptOut", "subscriptionId", "subscriptionAddressId", "subscriptionPaymentMethodId", "subscriptionOnboardStatus", "isSubscriptionCancelled", "pausePeriod" ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm.handle_brand_customer_event_logging();
CREATE TRIGGER hasura_scheduled_event_on_new_brand_customer AFTER INSERT ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm.hasura_scheduled_event_on_new_brand_customer();
CREATE TRIGGER "loyaltyPointTransaction" AFTER INSERT ON crm."loyaltyPointTransaction" FOR EACH ROW EXECUTE FUNCTION crm."processLoyaltyPointTransaction"();
CREATE TRIGGER "referralRewardsTrigger" AFTER INSERT OR UPDATE OF "referredByCode" ON crm."customerReferral" FOR EACH ROW EXECUTE FUNCTION crm."referralCampaignRewardsTriggerFunction"();
CREATE TRIGGER "set_crm_brandCustomer_updated_at" BEFORE UPDATE ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_brandCustomer_updated_at" ON crm.brand_customer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_crm_campaign_updated_at BEFORE UPDATE ON crm.campaign FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_crm_campaign_updated_at ON crm.campaign IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_crm_customerReview_updated_at" BEFORE UPDATE ON crm."customerReview" FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_customerReview_updated_at" ON crm."customerReview" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_crm_customer_updated_at BEFORE UPDATE ON crm.customer FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_crm_customer_updated_at ON crm.customer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_crm_loyaltyPointTransaction_updated_at" BEFORE UPDATE ON crm."loyaltyPointTransaction" FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_loyaltyPointTransaction_updated_at" ON crm."loyaltyPointTransaction" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_crm_loyaltyPoint_updated_at" BEFORE UPDATE ON crm."loyaltyPoint" FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_loyaltyPoint_updated_at" ON crm."loyaltyPoint" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_crm_rewardHistory_updated_at" BEFORE UPDATE ON crm."rewardHistory" FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_rewardHistory_updated_at" ON crm."rewardHistory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_crm_walletTransaction_updated_at" BEFORE UPDATE ON crm."walletTransaction" FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_crm_walletTransaction_updated_at" ON crm."walletTransaction" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_crm_wallet_updated_at BEFORE UPDATE ON crm.wallet FOR EACH ROW EXECUTE FUNCTION crm.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_crm_wallet_updated_at ON crm.wallet IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "signUpRewardsTrigger" AFTER INSERT OR UPDATE OF "referredByCode" ON crm."customerReferral" FOR EACH ROW EXECUTE FUNCTION crm."signUpCampaignRewardsTriggerFunction"();
CREATE TRIGGER "updateBrand_customer" AFTER INSERT OR UPDATE OF "subscriptionId" ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm."updateBrand_customer"();
CREATE TRIGGER "updateIsSubscriberTimeStamp" AFTER INSERT OR UPDATE OF "isSubscriber" ON crm.brand_customer FOR EACH ROW EXECUTE FUNCTION crm.updateissubscribertimestamp();
CREATE TRIGGER "walletTransaction" AFTER INSERT ON crm."walletTransaction" FOR EACH ROW EXECUTE FUNCTION crm."processWalletTransaction"();
CREATE TRIGGER "handleIsActiveForWebhookEvent" AFTER INSERT OR DELETE ON developer."webhookUrl_events" FOR EACH ROW EXECUTE FUNCTION developer."handleIsActiveForWebhookEvent"();
CREATE TRIGGER handleprocessedwebhookeventsbyurl AFTER INSERT ON developer."processedWebhookEvents" FOR EACH ROW EXECUTE FUNCTION developer."handleProcessedWebhookEventsByUrl"();
CREATE TRIGGER "set_developer_apiKey_updated_at" BEFORE UPDATE ON developer."apiKey" FOR EACH ROW EXECUTE FUNCTION developer.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_developer_apiKey_updated_at" ON developer."apiKey" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_developer_webhookUrl_updated_at" BEFORE UPDATE ON developer."webhookUrl" FOR EACH ROW EXECUTE FUNCTION developer.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_developer_webhookUrl_updated_at" ON developer."webhookUrl" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER updateprocessedwebhookeventsbyurl AFTER INSERT ON developer."webhookUrl_EventsLog" FOR EACH ROW EXECUTE FUNCTION developer."updateProcessedWebhookEventsByUrl"();
CREATE TRIGGER "set_deviceHub_computer_updated_at" BEFORE UPDATE ON "deviceHub".computer FOR EACH ROW EXECUTE FUNCTION "deviceHub".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_deviceHub_computer_updated_at" ON "deviceHub".computer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_editor_block_updated_at BEFORE UPDATE ON editor.block FOR EACH ROW EXECUTE FUNCTION editor.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_editor_block_updated_at ON editor.block IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_editor_cssFileLinks_updated_at" BEFORE UPDATE ON editor."cssFileLinks" FOR EACH ROW EXECUTE FUNCTION editor.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_editor_cssFileLinks_updated_at" ON editor."cssFileLinks" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_editor_jsFileLinks_updated_at" BEFORE UPDATE ON editor."jsFileLinks" FOR EACH ROW EXECUTE FUNCTION editor.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_editor_jsFileLinks_updated_at" ON editor."jsFileLinks" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_editor_template_updated_at BEFORE UPDATE ON editor.file FOR EACH ROW EXECUTE FUNCTION editor.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_editor_template_updated_at ON editor.file IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER hasura_scheduled_event_on_experiencebookingcancellation AFTER UPDATE OF "isCancelled" ON experiences."experienceBooking" FOR EACH ROW EXECUTE FUNCTION experiences."hasura_scheduled_event_on_experienceBookingCancellation"();
CREATE TRIGGER hasura_scheduled_event_on_experiencepollcreate AFTER INSERT ON experiences."experienceBooking" FOR EACH ROW EXECUTE FUNCTION experiences."hasura_scheduled_event_on_experiencePollCreate"();
CREATE TRIGGER onupdate_resetexperienceclassbooking AFTER UPDATE OF "experienceBookingId" ON experiences."experienceClass" FOR EACH ROW EXECUTE FUNCTION experiences."resetExperienceClassBooking"();
CREATE TRIGGER setexpertid AFTER INSERT OR UPDATE ON experiences."experienceClass" FOR EACH ROW EXECUTE FUNCTION experiences."setExpertId"();
CREATE TRIGGER "handleDeleteProtectionOfFulfillmentType" BEFORE DELETE ON fulfilment."fulfillmentType" FOR EACH ROW EXECUTE FUNCTION public."handleDeleteProtection"();
CREATE TRIGGER "set_fulfilment_deliveryPreferenceByCharge_updated_at" BEFORE UPDATE ON fulfilment."deliveryPreferenceByCharge" FOR EACH ROW EXECUTE FUNCTION fulfilment.set_current_timestamp_updated_at();
CREATE TRIGGER event_trigger_table_name_update_trigger AFTER UPDATE ON hdb_catalog.hdb_table FOR EACH ROW EXECUTE FUNCTION hdb_catalog.event_trigger_table_name_update();
CREATE TRIGGER hdb_schema_update_event_notifier AFTER INSERT OR UPDATE ON hdb_catalog.hdb_schema_update_event FOR EACH ROW EXECUTE FUNCTION hdb_catalog.hdb_schema_update_event_notifier();
CREATE TRIGGER "set_ingredient_ingredientProcessing_updated_at" BEFORE UPDATE ON ingredient."ingredientProcessing" FOR EACH ROW EXECUTE FUNCTION ingredient.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_ingredient_ingredientProcessing_updated_at" ON ingredient."ingredientProcessing" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_ingredient_ingredientSachet_updatedAt" BEFORE UPDATE ON ingredient."ingredientSachet" FOR EACH ROW EXECUTE FUNCTION ingredient."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_ingredient_ingredientSachet_updatedAt" ON ingredient."ingredientSachet" IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER set_ingredient_ingredient_updated_at BEFORE UPDATE ON ingredient.ingredient FOR EACH ROW EXECUTE FUNCTION ingredient.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_ingredient_ingredient_updated_at ON ingredient.ingredient IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_ingredient_modeOfFulfillment_updated_at" BEFORE UPDATE ON ingredient."modeOfFulfillment" FOR EACH ROW EXECUTE FUNCTION ingredient.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_ingredient_modeOfFulfillment_updated_at" ON ingredient."modeOfFulfillment" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "updateModeOfFulfillment" AFTER INSERT OR UPDATE OF "ingredientSachetId" ON ingredient."modeOfFulfillment" FOR EACH ROW EXECUTE FUNCTION ingredient."updateModeOfFulfillment"();
CREATE TRIGGER set_insights_insights_updated_at BEFORE UPDATE ON insights.insights FOR EACH ROW EXECUTE FUNCTION insights.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_insights_insights_updated_at ON insights.insights IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_bulkItemHistory_updated_at" BEFORE UPDATE ON inventory."bulkItemHistory" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_bulkItemHistory_updated_at" ON inventory."bulkItemHistory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_bulkItem_updatedAt" BEFORE UPDATE ON inventory."bulkItem" FOR EACH ROW EXECUTE FUNCTION inventory."set_current_timestamp_updatedAt"();
COMMENT ON TRIGGER "set_inventory_bulkItem_updatedAt" ON inventory."bulkItem" IS 'trigger to set value of column "updatedAt" to current timestamp on row update';
CREATE TRIGGER "set_inventory_packagingHistory_updated_at" BEFORE UPDATE ON inventory."packagingHistory" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_packagingHistory_updated_at" ON inventory."packagingHistory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_purchaseOrderItem_updated_at" BEFORE UPDATE ON inventory."purchaseOrderItem" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_purchaseOrderItem_updated_at" ON inventory."purchaseOrderItem" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_sachetItemHistory_updated_at" BEFORE UPDATE ON inventory."sachetItemHistory" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_sachetItemHistory_updated_at" ON inventory."sachetItemHistory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_sachetWorkOrder_updated_at" BEFORE UPDATE ON inventory."sachetWorkOrder" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_sachetWorkOrder_updated_at" ON inventory."sachetWorkOrder" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_inventory_supplierItem_updated_at" BEFORE UPDATE ON inventory."supplierItem" FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_inventory_supplierItem_updated_at" ON inventory."supplierItem" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_inventory_supplier_updated_at BEFORE UPDATE ON inventory.supplier FOR EACH ROW EXECUTE FUNCTION inventory.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_inventory_supplier_updated_at ON inventory.supplier IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_accompanimentType_updated_at" BEFORE UPDATE ON master."accompanimentType" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_accompanimentType_updated_at" ON master."accompanimentType" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_allergenName_updated_at" BEFORE UPDATE ON master."allergenName" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_allergenName_updated_at" ON master."allergenName" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_cuisineName_updated_at" BEFORE UPDATE ON master."cuisineName" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_cuisineName_updated_at" ON master."cuisineName" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_ingredientCategory_updated_at" BEFORE UPDATE ON master."ingredientCategory" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_ingredientCategory_updated_at" ON master."ingredientCategory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_processingName_updated_at" BEFORE UPDATE ON master."processingName" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_processingName_updated_at" ON master."processingName" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_productCategory_updated_at" BEFORE UPDATE ON master."productCategory" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_productCategory_updated_at" ON master."productCategory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_master_unitConversion_updated_at" BEFORE UPDATE ON master."unitConversion" FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_master_unitConversion_updated_at" ON master."unitConversion" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_master_unit_updated_at BEFORE UPDATE ON master.unit FOR EACH ROW EXECUTE FUNCTION master.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_master_unit_updated_at ON master.unit IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_notifications_notification_updated_at BEFORE UPDATE ON notifications."displayNotification" FOR EACH ROW EXECUTE FUNCTION notifications.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_notifications_notification_updated_at ON notifications."displayNotification" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_notifications_printConfig_updated_at" BEFORE UPDATE ON notifications."printConfig" FOR EACH ROW EXECUTE FUNCTION notifications.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_notifications_printConfig_updated_at" ON notifications."printConfig" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_onDemand_collection_updated_at" BEFORE UPDATE ON "onDemand".collection FOR EACH ROW EXECUTE FUNCTION "onDemand".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_onDemand_collection_updated_at" ON "onDemand".collection IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_onDemand_modifierCategoryOption_updated_at" BEFORE UPDATE ON "onDemand"."modifierCategoryOption" FOR EACH ROW EXECUTE FUNCTION "onDemand".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_onDemand_modifierCategoryOption_updated_at" ON "onDemand"."modifierCategoryOption" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_onDemand_modifierCategory_updated_at" BEFORE UPDATE ON "onDemand"."modifierCategory" FOR EACH ROW EXECUTE FUNCTION "onDemand".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_onDemand_modifierCategory_updated_at" ON "onDemand"."modifierCategory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_onDemand_modifier_updated_at" BEFORE UPDATE ON "onDemand".modifier FOR EACH ROW EXECUTE FUNCTION "onDemand".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_onDemand_modifier_updated_at" ON "onDemand".modifier IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "deductLoyaltyPointsPostOrder" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."deductLoyaltyPointsPostOrder"();
CREATE TRIGGER "deductWalletAmountPostOrder" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."deductWalletAmountPostOrder"();
CREATE TRIGGER "handleExperienceCartItemUnitPrice" AFTER INSERT OR DELETE ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "cartFunctions"."handleExperienceCartItemUnitPrice"();
CREATE TRIGGER "handle_CRUD_cart_rewards" AFTER INSERT OR DELETE ON "order".cart_rewards FOR EACH ROW EXECUTE FUNCTION "order"."handle_CRUD_cart_rewards"();
CREATE TRIGGER "handle_CRUD_on_cart" AFTER INSERT OR DELETE OR UPDATE OF amount, "fulfillmentInfo", "deliveryParentShare", "walletAmountUsed", "loyaltyPointsUsed", tip, "offerDiscountParentShare" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order"."handle_CRUD_on_cart"();
CREATE TRIGGER "handle_CRUD_on_cartItem" AFTER INSERT OR DELETE OR UPDATE OF "unitPrice", discount, "parentShare" ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order"."handle_CRUD_on_cartItem"();
CREATE TRIGGER handle_cart_item_event_logging AFTER INSERT OR DELETE OR UPDATE OF status, "isAssembled" ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order".handle_cart_item_event_logging();
CREATE TRIGGER handle_create_sachets AFTER INSERT ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order"."createSachets"();
CREATE TRIGGER handle_on_cart_update_logging AFTER INSERT OR DELETE OR UPDATE OF "paymentStatus", status, "paymentMethodId", "stripeInvoiceId", "transactionId", address, "customerInfo", "fulfillmentInfo", "isArchived" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order".handle_on_cart_update_logging();
CREATE TRIGGER handle_on_order_update_logging AFTER INSERT OR DELETE OR UPDATE OF "isRejected", "isAccepted", "isArchived", "deliveryPartnershipId" ON "order"."order" FOR EACH ROW EXECUTE FUNCTION "order".handle_on_order_update_logging();
CREATE TRIGGER "handle_reset_activeCartPayment" BEFORE UPDATE OF "paymentRetryAttempt" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order"."handle_reset_activeCartPayment"();
CREATE TRIGGER handle_subscriber_status AFTER UPDATE OF "paymentStatus" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order"."handleSubscriberStatus"();
CREATE TRIGGER handlecartitemfields BEFORE INSERT ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order".handlecartitemfields();
CREATE TRIGGER "onPaymentSuccess" AFTER UPDATE OF "paymentStatus" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order"."onPaymentSuccess"();
CREATE TRIGGER on_cart_item_status_change AFTER UPDATE OF status ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order".on_cart_item_status_change();
CREATE TRIGGER on_cart_status_change AFTER UPDATE OF status ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order".on_cart_status_change();
CREATE TRIGGER on_paymentstatus_update AFTER UPDATE OF "paymentStatus" ON "order"."cartPayment" FOR EACH ROW WHEN (((new."paymentStatus" = 'SUCCEEDED'::text) AND (new."paymentStatus" IS DISTINCT FROM old."paymentStatus"))) EXECUTE FUNCTION "order"."handle_paymentStatus_on_cartPayment"();
CREATE TRIGGER order_confirmation_scheduled_event AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION "order".hasura_scheduled_event_on_order_confirmation();
CREATE TRIGGER "postOrderCouponRewards" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."postOrderCouponRewards"();
CREATE TRIGGER "postOrderRewardsTrigger" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."postOrderCampaignRewardsTriggerFunction"();
CREATE TRIGGER "referralRewardsTrigger" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."referralCampaignRewardsTriggerFunction"();
CREATE TRIGGER "set_order_orderCartItem_updated_at" BEFORE UPDATE ON "order"."cartItem" FOR EACH ROW EXECUTE FUNCTION "order".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_order_orderCartItem_updated_at" ON "order"."cartItem" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_order_orderCart_updated_at" BEFORE UPDATE ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_order_orderCart_updated_at" ON "order".cart IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_order_order_updated_at BEFORE UPDATE ON "order"."order" FOR EACH ROW EXECUTE FUNCTION "order".set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_order_order_updated_at ON "order"."order" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_order_paymentHistory_updated_at" BEFORE UPDATE ON "order"."stripePaymentHistory" FOR EACH ROW EXECUTE FUNCTION "order".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_order_paymentHistory_updated_at" ON "order"."stripePaymentHistory" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER setexperienceclassbooked AFTER UPDATE ON "order"."cartPayment" FOR EACH ROW EXECUTE FUNCTION "order"."updateExperienceClassBookingStatus"();
CREATE TRIGGER "signUpRewardsTrigger" AFTER INSERT ON "order"."order" FOR EACH ROW EXECUTE FUNCTION crm."signUpCampaignRewardsTriggerFunction"();
CREATE TRIGGER "updateStatementDescriptor" AFTER INSERT OR UPDATE OF "brandId" ON "order".cart FOR EACH ROW EXECUTE FUNCTION "order"."updateStatementDescriptor"();
CREATE TRIGGER set_packaging_packaging_updated_at BEFORE UPDATE ON packaging.packaging FOR EACH ROW EXECUTE FUNCTION packaging.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_packaging_packaging_updated_at ON packaging.packaging IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_paymentHub_payment__updated_at" BEFORE UPDATE ON "paymentHub".payment_ FOR EACH ROW EXECUTE FUNCTION "paymentHub".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_paymentHub_payment__updated_at" ON "paymentHub".payment_ IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_platform_customerAddress__updated_at" BEFORE UPDATE ON platform."customerAddress" FOR EACH ROW EXECUTE FUNCTION platform.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_platform_customerAddress__updated_at" ON platform."customerAddress" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_platform_customer__updated_at BEFORE UPDATE ON platform.customer FOR EACH ROW EXECUTE FUNCTION platform.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_platform_customer__updated_at ON platform.customer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_platform_otp_transaction_updated_at BEFORE UPDATE ON platform.otp_transaction FOR EACH ROW EXECUTE FUNCTION platform.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_platform_otp_transaction_updated_at ON platform.otp_transaction IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_platform_provider_customer_updated_at BEFORE UPDATE ON platform.provider_customer FOR EACH ROW EXECUTE FUNCTION platform.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_platform_provider_customer_updated_at ON platform.provider_customer IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_platform_stripePaymentMethod__updated_at" BEFORE UPDATE ON platform."customerPaymentMethod" FOR EACH ROW EXECUTE FUNCTION platform.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_platform_stripePaymentMethod__updated_at" ON platform."customerPaymentMethod" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "findSachetItem" AFTER INSERT OR UPDATE ON products."inventoryProductBundleSachet" FOR EACH ROW WHEN ((new."sachetItemId" IS NULL)) EXECUTE FUNCTION products."inventoryBundleSachetTriggerFunction"();
CREATE TRIGGER "set_products_comboProductComponent_updated_at" BEFORE UPDATE ON products."comboProductComponent" FOR EACH ROW EXECUTE FUNCTION products.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_products_comboProductComponent_updated_at" ON products."comboProductComponent" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_products_customizableProductOption_updated_at" BEFORE UPDATE ON products."customizableProductComponent" FOR EACH ROW EXECUTE FUNCTION products.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_products_customizableProductOption_updated_at" ON products."customizableProductComponent" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_products_productOption_updated_at" BEFORE UPDATE ON products."productOption" FOR EACH ROW EXECUTE FUNCTION products.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_products_productOption_updated_at" ON products."productOption" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_products_product_updated_at BEFORE UPDATE ON products.product FOR EACH ROW EXECUTE FUNCTION products.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_products_product_updated_at ON products.product IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_rules_conditions_updated_at BEFORE UPDATE ON rules.conditions FOR EACH ROW EXECUTE FUNCTION rules.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_rules_conditions_updated_at ON rules.conditions IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_safety_safetyCheck_updated_at" BEFORE UPDATE ON safety."safetyCheck" FOR EACH ROW EXECUTE FUNCTION safety.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_safety_safetyCheck_updated_at" ON safety."safetyCheck" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_segmentation_listAction_list_linkedRecord_updated_at" BEFORE UPDATE ON segmentation."listAction_list_linkedRecord" FOR EACH ROW EXECUTE FUNCTION segmentation.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_segmentation_listAction_list_linkedRecord_updated_at" ON segmentation."listAction_list_linkedRecord" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_segmentation_list_linkedRecord_updated_at" BEFORE UPDATE ON segmentation."list_linkedRecord" FOR EACH ROW EXECUTE FUNCTION segmentation.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_segmentation_list_linkedRecord_updated_at" ON segmentation."list_linkedRecord" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "defineOwnerRole" AFTER UPDATE OF "keycloakId" ON settings."user" FOR EACH ROW EXECUTE FUNCTION settings.define_owner_role();
CREATE TRIGGER "set_settings_activityLogs_updated_at" BEFORE UPDATE ON settings."activityLogs" FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_settings_activityLogs_updated_at" ON settings."activityLogs" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_settings_apps_updated_at BEFORE UPDATE ON settings.app FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_settings_apps_updated_at ON settings.app IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_settings_operationConfig_updated_at" BEFORE UPDATE ON settings."operationConfig" FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_settings_operationConfig_updated_at" ON settings."operationConfig" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_settings_role_app_updated_at BEFORE UPDATE ON settings.role_app FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_settings_role_app_updated_at ON settings.role_app IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_settings_roles_updated_at BEFORE UPDATE ON settings.role FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_settings_roles_updated_at ON settings.role IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_settings_user_role_updated_at BEFORE UPDATE ON settings.user_role FOR EACH ROW EXECUTE FUNCTION settings.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_settings_user_role_updated_at ON settings.user_role IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_simpleRecipe_simpleRecipe_updated_at" BEFORE UPDATE ON "simpleRecipe"."simpleRecipe" FOR EACH ROW EXECUTE FUNCTION "simpleRecipe".set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_simpleRecipe_simpleRecipe_updated_at" ON "simpleRecipe"."simpleRecipe" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER setsimplerecipeyieldcolumns BEFORE INSERT OR UPDATE OF yield ON "simpleRecipe"."simpleRecipeYield" FOR EACH ROW EXECUTE FUNCTION "simpleRecipe"."setSimpleRecipeYieldColumns"();
CREATE TRIGGER "updateSimpleRecipeYield_ingredientSachet" AFTER INSERT OR UPDATE OF "recipeYieldId" ON "simpleRecipe"."simpleRecipeYield_ingredientSachet" FOR EACH ROW EXECUTE FUNCTION "simpleRecipe"."updateSimpleRecipeYield_ingredientSachet"();
CREATE TRIGGER "handle_bookPrice_discount_validation" BEFORE INSERT OR UPDATE OF "bookPrice", discount, "discountType" ON sqldemo.book FOR EACH ROW EXECUTE FUNCTION sqldemo."handle_bookPrice_discount_validation"();
CREATE TRIGGER set_sqldemo_book_updated_at BEFORE UPDATE ON sqldemo.book FOR EACH ROW EXECUTE FUNCTION sqldemo.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_sqldemo_book_updated_at ON sqldemo.book IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "handle_subscriptionOccurence_customer_event_logging" AFTER INSERT OR DELETE OR UPDATE OF "isSkipped", "isPaused", "isArchived" ON subscription."subscriptionOccurence_customer" FOR EACH ROW EXECUTE FUNCTION subscription."handle_subscriptionOccurence_customer_event_logging"();
CREATE TRIGGER "set_subscription_subscriptionItemCount_updated_at" BEFORE UPDATE ON subscription."subscriptionItemCount" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionItemCount_updated_at" ON subscription."subscriptionItemCount" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionOccurence_addOn_updated_at" BEFORE UPDATE ON subscription."subscriptionOccurence_addOn" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionOccurence_addOn_updated_at" ON subscription."subscriptionOccurence_addOn" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionOccurence_customer_updated_at" BEFORE UPDATE ON subscription."subscriptionOccurence_customer" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionOccurence_customer_updated_at" ON subscription."subscriptionOccurence_customer" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionOccurence_product_updated_at" BEFORE UPDATE ON subscription."subscriptionOccurence_product" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionOccurence_product_updated_at" ON subscription."subscriptionOccurence_product" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionPickupOption_updated_at" BEFORE UPDATE ON subscription."subscriptionPickupOption" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionPickupOption_updated_at" ON subscription."subscriptionPickupOption" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionServing_updated_at" BEFORE UPDATE ON subscription."subscriptionServing" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionServing_updated_at" ON subscription."subscriptionServing" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "set_subscription_subscriptionTitle_updated_at" BEFORE UPDATE ON subscription."subscriptionTitle" FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_subscription_subscriptionTitle_updated_at" ON subscription."subscriptionTitle" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_subscription_subscription_updated_at BEFORE UPDATE ON subscription.subscription FOR EACH ROW EXECUTE FUNCTION subscription.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_subscription_subscription_updated_at ON subscription.subscription IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER "updateSubscription" AFTER INSERT ON subscription.subscription FOR EACH ROW EXECUTE FUNCTION subscription."updateSubscription"();
CREATE TRIGGER "updateSubscriptionItemCount" AFTER INSERT ON subscription."subscriptionItemCount" FOR EACH ROW EXECUTE FUNCTION subscription."updateSubscriptionItemCount"();
CREATE TRIGGER "updateSubscriptionOccurence" AFTER INSERT ON subscription."subscriptionOccurence" FOR EACH ROW EXECUTE FUNCTION subscription."updateSubscriptionOccurence"();
CREATE TRIGGER "updateSubscriptionOccurence_customer" BEFORE INSERT ON subscription."subscriptionOccurence_customer" FOR EACH ROW EXECUTE FUNCTION subscription."updateSubscriptionOccurence_customer"();
CREATE TRIGGER handlenavigationmenuitemfields BEFORE INSERT OR UPDATE OF "navigationMenuId", "parentNavigationMenuItemId" ON website."navigationMenuItem" FOR EACH ROW EXECUTE FUNCTION website.handlenavigationmenuitemfields();
CREATE TRIGGER "set_website_navigationMenuItem_updated_at" BEFORE UPDATE ON website."navigationMenuItem" FOR EACH ROW EXECUTE FUNCTION website.set_current_timestamp_updated_at();
COMMENT ON TRIGGER "set_website_navigationMenuItem_updated_at" ON website."navigationMenuItem" IS 'trigger to set value of column "updated_at" to current timestamp on row update';
CREATE TRIGGER set_website_website_updated_at BEFORE UPDATE ON website.website FOR EACH ROW EXECUTE FUNCTION website.set_current_timestamp_updated_at();
COMMENT ON TRIGGER set_website_website_updated_at ON website.website IS 'trigger to set value of column "updated_at" to current timestamp on row update';
ALTER TABLE ONLY brands."brandPageModule"
    ADD CONSTRAINT "brandPageModule_brandPageId_fkey" FOREIGN KEY ("brandPageId") REFERENCES brands."brandPages"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brandPageModule"
    ADD CONSTRAINT "brandPageModule_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brandPageModule"
    ADD CONSTRAINT "brandPageModule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES editor.template(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brandPage_brandPageSetting"
    ADD CONSTRAINT "brandPage_brandPageSetting_brandPageId_fkey" FOREIGN KEY ("brandPageId") REFERENCES brands."brandPages"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brandPage_brandPageSetting"
    ADD CONSTRAINT "brandPage_brandPageSetting_brandPageSettingId_fkey" FOREIGN KEY ("brandPageSettingId") REFERENCES brands."brandPageSetting"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brandPages"
    ADD CONSTRAINT "brandPages_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brand_brandSetting"
    ADD CONSTRAINT "brand_brandSetting_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brand_brandSetting"
    ADD CONSTRAINT "brand_brandSetting_brandSettingId_fkey" FOREIGN KEY ("brandSettingId") REFERENCES brands."brandSetting"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands.brand
    ADD CONSTRAINT "brand_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands.brand_location
    ADD CONSTRAINT "brand_location_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands.brand_location
    ADD CONSTRAINT "brand_location_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES brands.location(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands.brand
    ADD CONSTRAINT "brand_navigationMenuId_fkey" FOREIGN KEY ("navigationMenuId") REFERENCES brands."navigationMenu"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brand_paymentPartnership"
    ADD CONSTRAINT "brand_paymentPartnership_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brand_storeSetting"
    ADD CONSTRAINT "brand_storeSetting_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY brands."brand_storeSetting"
    ADD CONSTRAINT "brand_storeSetting_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."brand_storeSetting"
    ADD CONSTRAINT "brand_storeSetting_storeSettingId_fkey" FOREIGN KEY ("storeSettingId") REFERENCES brands."storeSetting"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brand_subscriptionStoreSetting"
    ADD CONSTRAINT "brand_subscriptionStoreSetting_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."brand_subscriptionStoreSetting"
    ADD CONSTRAINT "brand_subscriptionStoreSetting_subscriptionStoreSettingId_fk" FOREIGN KEY ("subscriptionStoreSettingId") REFERENCES brands."subscriptionStoreSetting"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY brands."locationCluster"
    ADD CONSTRAINT "locationCluster_parentLocationClusterId_fkey" FOREIGN KEY ("parentLocationClusterId") REFERENCES brands."locationCluster"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."locationKiosk"
    ADD CONSTRAINT "locationKiosk_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES brands.location(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."locationTable"
    ADD CONSTRAINT "locationTable_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES brands.location(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES ux.action(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_navigationMenuId_fkey" FOREIGN KEY ("navigationMenuId") REFERENCES brands."navigationMenu"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY brands."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_parentNavigationMenuItemId_fkey" FOREIGN KEY ("parentNavigationMenuItemId") REFERENCES brands."navigationMenuItem"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY content."experienceDivId"
    ADD CONSTRAINT "experienceDivId_brandPageId_fkey" FOREIGN KEY ("brandPageId") REFERENCES brands."brandPages"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY content."experienceDivId"
    ADD CONSTRAINT "experienceDivId_experienceCategoryTitle_fkey" FOREIGN KEY ("experienceCategoryTitle") REFERENCES experiences."experienceCategory"(title) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY content."experienceDivId"
    ADD CONSTRAINT "experienceDivId_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY content."experienceDivId"
    ADD CONSTRAINT "experienceDivId_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES experts.expert(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY content.identifier
    ADD CONSTRAINT "identifier_pageTitle_fkey" FOREIGN KEY ("pageTitle") REFERENCES content.page(title) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY content."subscriptionDivIds"
    ADD CONSTRAINT "subscriptionDivIds_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brandCustomer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brandCustomer_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm.brand_campaign
    ADD CONSTRAINT "brand_campaign_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_campaign
    ADD CONSTRAINT "brand_campaign_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES crm.campaign(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_coupon
    ADD CONSTRAINT "brand_coupon_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_coupon
    ADD CONSTRAINT "brand_coupon_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES crm.coupon(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brand_customer_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES subscription.subscription(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brand_customer_subscriptionItemCountId_fkey" FOREIGN KEY ("subscriptionItemCountId") REFERENCES subscription."subscriptionItemCount"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brand_customer_subscriptionServingId_fkey" FOREIGN KEY ("subscriptionServingId") REFERENCES subscription."subscriptionServing"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.brand_customer
    ADD CONSTRAINT "brand_customer_subscriptionTitleId_fkey" FOREIGN KEY ("subscriptionTitleId") REFERENCES subscription."subscriptionTitle"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.campaign
    ADD CONSTRAINT "campaign_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES rules.conditions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.campaign
    ADD CONSTRAINT campaign_type_fkey FOREIGN KEY (type) REFERENCES crm."campaignType"(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.coupon
    ADD CONSTRAINT "coupon_visibleConditionId_fkey" FOREIGN KEY ("visibleConditionId") REFERENCES rules.conditions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_campaignId_fkey" FOREIGN KEY ("referralCampaignId") REFERENCES crm.campaign(id);
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."customerReferral"
    ADD CONSTRAINT "customerReferral_referredByCode_fkey" FOREIGN KEY ("referredByCode") REFERENCES crm."customerReferral"("referralCode") ON DELETE SET NULL;
ALTER TABLE ONLY crm."customer_experienceTags"
    ADD CONSTRAINT "customer_experienceTags_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT "customer_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES platform.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."customer_savedEntities"
    ADD CONSTRAINT "customer_savedEntities_simpleRecipeId_fkey" FOREIGN KEY ("simpleRecipeId") REFERENCES "simpleRecipe"."simpleRecipe"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm.customer
    ADD CONSTRAINT "customer_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES subscription.subscription(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm."loyaltyPointTransaction"
    ADD CONSTRAINT "loyaltyPointTransaction_customerReferralId_fkey" FOREIGN KEY ("customerReferralId") REFERENCES crm."customerReferral"(id) ON DELETE SET NULL;
ALTER TABLE ONLY crm."loyaltyPointTransaction"
    ADD CONSTRAINT "loyaltyPointTransaction_loyaltyPointId_fkey" FOREIGN KEY ("loyaltyPointId") REFERENCES crm."loyaltyPoint"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."loyaltyPointTransaction"
    ADD CONSTRAINT "loyaltyPointTransaction_orderCartId_fkey" FOREIGN KEY ("orderCartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."loyaltyPoint"
    ADD CONSTRAINT "loyaltyPoint_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY crm."loyaltyPoint"
    ADD CONSTRAINT "loyaltyPoint_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES crm.campaign(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES crm.coupon(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_loyaltyPointTransactionId_fkey" FOREIGN KEY ("loyaltyPointTransactionId") REFERENCES crm."loyaltyPointTransaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_orderCartId_fkey" FOREIGN KEY ("orderCartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."order"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES crm.reward(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardHistory"
    ADD CONSTRAINT "rewardHistory_walletTransactionId_fkey" FOREIGN KEY ("walletTransactionId") REFERENCES crm."walletTransaction"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY crm."rewardType_campaignType"
    ADD CONSTRAINT "rewardType_campaignType_campaignTypeId_fkey" FOREIGN KEY ("campaignTypeId") REFERENCES crm."campaignType"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm."rewardType_campaignType"
    ADD CONSTRAINT "rewardType_campaignType_rewardTypeId_fkey" FOREIGN KEY ("rewardTypeId") REFERENCES crm."rewardType"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.reward
    ADD CONSTRAINT "reward_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES crm.campaign(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.reward
    ADD CONSTRAINT "reward_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES rules.conditions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.reward
    ADD CONSTRAINT "reward_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES crm.coupon(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY crm.vocher
    ADD CONSTRAINT "vocher_brandCustomerId_fkey" FOREIGN KEY ("brandCustomerId") REFERENCES crm.brand_customer(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm.vocher
    ADD CONSTRAINT "vocher_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES crm.coupon(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."walletTransaction"
    ADD CONSTRAINT "walletTransaction_customerReferralId_fkey" FOREIGN KEY ("customerReferralId") REFERENCES crm."customerReferral"(id);
ALTER TABLE ONLY crm."walletTransaction"
    ADD CONSTRAINT "walletTransaction_orderCartId_fkey" FOREIGN KEY ("orderCartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm."walletTransaction"
    ADD CONSTRAINT "walletTransaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES crm.wallet(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY crm.wallet
    ADD CONSTRAINT "wallet_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY crm.wallet
    ADD CONSTRAINT "wallet_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY developer."processedWebhookEventsByUrl"
    ADD CONSTRAINT "processedWebhookEventsByUrl_processedWebhookEventsId_fkey" FOREIGN KEY ("processedWebhookEventsId") REFERENCES developer."processedWebhookEvents"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY developer."processedWebhookEventsByUrl"
    ADD CONSTRAINT "processedWebhookEventsByUrl_webhookUrl_eventsId_fkey" FOREIGN KEY ("webhookUrl_eventsId") REFERENCES developer."webhookUrl_events"(id) ON DELETE CASCADE;
ALTER TABLE ONLY developer."processedWebhookEvents"
    ADD CONSTRAINT "processedWebhookEvents_availableWebhookEventId_fkey" FOREIGN KEY ("availableWebhookEventId") REFERENCES developer."availableWebhookEvent"(id) ON DELETE CASCADE;
ALTER TABLE ONLY developer."webhookUrl_EventsLog"
    ADD CONSTRAINT "webhookUrl_EventsLog_processedWebhookEventsByUrlId_fkey" FOREIGN KEY ("processedWebhookEventsByUrlId") REFERENCES developer."processedWebhookEventsByUrl"(id) ON DELETE CASCADE;
ALTER TABLE ONLY developer."webhookUrl_EventsLog"
    ADD CONSTRAINT "webhookUrl_EventsLog_webhookUrl_EventsId_fkey" FOREIGN KEY ("webhookUrl_EventsId") REFERENCES developer."webhookUrl_events"(id) ON DELETE CASCADE;
ALTER TABLE ONLY developer."webhookUrl_events"
    ADD CONSTRAINT "webhookUrl_events_availableWebhookEventId_fkey" FOREIGN KEY ("availableWebhookEventId") REFERENCES developer."availableWebhookEvent"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY developer."webhookUrl_events"
    ADD CONSTRAINT "webhookUrl_events_webhookUrlId_fkey" FOREIGN KEY ("webhookUrlId") REFERENCES developer."webhookUrl"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "deviceHub".printer
    ADD CONSTRAINT "printer_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "deviceHub".computer("printNodeId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "deviceHub".printer
    ADD CONSTRAINT "printer_printerType_fkey" FOREIGN KEY ("printerType") REFERENCES "deviceHub"."printerType"(type) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "deviceHub".scale
    ADD CONSTRAINT "scale_computerId_fkey" FOREIGN KEY ("computerId") REFERENCES "deviceHub".computer("printNodeId") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "deviceHub".scale
    ADD CONSTRAINT "scale_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY editor."cssFileLinks"
    ADD CONSTRAINT "cssFileLinks_cssFileId_fkey" FOREIGN KEY ("cssFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY editor."cssFileLinks"
    ADD CONSTRAINT "cssFileLinks_guiFileId_fkey" FOREIGN KEY ("guiFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY editor."jsFileLinks"
    ADD CONSTRAINT "jsFileLinks_guiFileId_fkey" FOREIGN KEY ("guiFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY editor."jsFileLinks"
    ADD CONSTRAINT "jsFileLinks_jsFileId_fkey" FOREIGN KEY ("jsFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingOption"
    ADD CONSTRAINT "experienceBookingOption_experienceBookingId_fkey" FOREIGN KEY ("experienceBookingId") REFERENCES experiences."experienceBooking"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingOption"
    ADD CONSTRAINT "experienceBookingOption_experienceClassId_fkey" FOREIGN KEY ("experienceClassId") REFERENCES experiences."experienceClass"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingParticipantChoice"
    ADD CONSTRAINT "experienceBookingParticipantChoice_experienceBookingOptionId" FOREIGN KEY ("experienceBookingOptionId") REFERENCES experiences."experienceBookingOption"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingParticipantChoice"
    ADD CONSTRAINT "experienceBookingParticipantChoice_experienceBookingParticip" FOREIGN KEY ("experienceBookingParticipantId") REFERENCES experiences."experienceBookingParticipant"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingParticipant"
    ADD CONSTRAINT "experienceBookingParticipant_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingParticipant"
    ADD CONSTRAINT "experienceBookingParticipant_experienceBookingId_fkey" FOREIGN KEY ("experienceBookingId") REFERENCES experiences."experienceBooking"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBookingParticipant"
    ADD CONSTRAINT "experienceBookingParticipant_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_experienceClassId_fkey" FOREIGN KEY ("experienceClassId") REFERENCES experiences."experienceClass"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT;
ALTER TABLE ONLY experiences."experienceBooking"
    ADD CONSTRAINT "experienceBooking_hostKeycloakId_fkey" FOREIGN KEY ("hostKeycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClassOption"
    ADD CONSTRAINT "experienceClassOption_experienceClassId_fkey" FOREIGN KEY ("experienceClassId") REFERENCES experiences."experienceClass"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClassOption"
    ADD CONSTRAINT "experienceClassOption_experiencePriceLevelId_fkey" FOREIGN KEY ("experiencePriceLevelId") REFERENCES experiences."experiencePriceLevel"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClassType_experiencePriceLevel"
    ADD CONSTRAINT "experienceClassType_experiencePriceLevel_experienceClassType" FOREIGN KEY ("experienceClassTypeId") REFERENCES experiences."experienceClassType"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClassType_experiencePriceLevel"
    ADD CONSTRAINT "experienceClassType_experiencePriceLevel_experiencePriceLeve" FOREIGN KEY ("experiencePriceLevelId") REFERENCES experiences."experiencePriceLevel"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_experienceBookingId_fkey" FOREIGN KEY ("experienceBookingId") REFERENCES experiences."experienceBooking"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES experts.expert(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_privateExperienceClassTypeId_fkey" FOREIGN KEY ("privateExperienceClassTypeId") REFERENCES experiences."experienceClassType"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experienceClass"
    ADD CONSTRAINT "experienceClass_publicExperienceClassTypeId_fkey" FOREIGN KEY ("publicExperienceClassTypeId") REFERENCES experiences."experienceClassType"(id) ON UPDATE RESTRICT;
ALTER TABLE ONLY experiences."experience_experienceCategory"
    ADD CONSTRAINT "experience_experienceCategory_experienceCategoryTitle_fkey" FOREIGN KEY ("experienceCategoryTitle") REFERENCES experiences."experienceCategory"(title) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experience_experienceCategory"
    ADD CONSTRAINT "experience_experienceCategory_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experience_experienceTags"
    ADD CONSTRAINT "experience_experienceTags_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences."experience_experienceTags"
    ADD CONSTRAINT "experience_experienceTags_experienceTagId_fkey" FOREIGN KEY ("experienceTagId") REFERENCES experiences."experienceTags"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences.experience_expert
    ADD CONSTRAINT "experience_expert_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences.experience_expert
    ADD CONSTRAINT "experience_expert_expertId_fkey" FOREIGN KEY ("expertId") REFERENCES experts.expert(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences.experience_headers
    ADD CONSTRAINT "experience_headers_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences.experience_products
    ADD CONSTRAINT "experience_products_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES experiences.experience(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY experiences.experience_products
    ADD CONSTRAINT "experience_products_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY fulfilment.brand_recurrence
    ADD CONSTRAINT "brand_recurrence_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY fulfilment.brand_recurrence
    ADD CONSTRAINT "brand_recurrence_brandLocationId_fkey" FOREIGN KEY ("brandLocationId") REFERENCES brands.brand_location(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY fulfilment.brand_recurrence
    ADD CONSTRAINT "brand_recurrence_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES fulfilment.recurrence(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY fulfilment.charge
    ADD CONSTRAINT "charge_mileRangeId_fkey" FOREIGN KEY ("mileRangeId") REFERENCES fulfilment."mileRange"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY fulfilment."deliveryPreferenceByCharge"
    ADD CONSTRAINT "deliveryPreferenceByCharge_chargeId_fkey" FOREIGN KEY ("chargeId") REFERENCES fulfilment.charge(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY fulfilment."deliveryPreferenceByCharge"
    ADD CONSTRAINT "deliveryPreferenceByCharge_clauseId_fkey" FOREIGN KEY ("clauseId") REFERENCES fulfilment."deliveryService"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY fulfilment."mileRange"
    ADD CONSTRAINT "mileRange_timeSlotId_fkey" FOREIGN KEY ("timeSlotId") REFERENCES fulfilment."timeSlot"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY fulfilment.recurrence
    ADD CONSTRAINT recurrence_type_fkey FOREIGN KEY (type) REFERENCES fulfilment."fulfillmentType"(value) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY fulfilment."timeSlot"
    ADD CONSTRAINT "timeSlot_recurrenceId_fkey" FOREIGN KEY ("recurrenceId") REFERENCES fulfilment.recurrence(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY hdb_catalog.event_invocation_logs
    ADD CONSTRAINT event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.event_log(id);
ALTER TABLE ONLY hdb_catalog.hdb_action_permission
    ADD CONSTRAINT hdb_action_permission_action_name_fkey FOREIGN KEY (action_name) REFERENCES hdb_catalog.hdb_action(action_name) ON UPDATE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_allowlist
    ADD CONSTRAINT hdb_allowlist_collection_name_fkey FOREIGN KEY (collection_name) REFERENCES hdb_catalog.hdb_query_collection(collection_name);
ALTER TABLE ONLY hdb_catalog.hdb_computed_field
    ADD CONSTRAINT hdb_computed_field_table_schema_table_name_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_cron_event_invocation_logs
    ADD CONSTRAINT hdb_cron_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_cron_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_cron_events
    ADD CONSTRAINT hdb_cron_events_trigger_name_fkey FOREIGN KEY (trigger_name) REFERENCES hdb_catalog.hdb_cron_triggers(name) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_permission
    ADD CONSTRAINT hdb_permission_table_schema_table_name_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_relationship
    ADD CONSTRAINT hdb_relationship_table_schema_table_name_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_remote_relationship
    ADD CONSTRAINT hdb_remote_relationship_table_schema_table_name_fkey FOREIGN KEY (table_schema, table_name) REFERENCES hdb_catalog.hdb_table(table_schema, table_name) ON UPDATE CASCADE;
ALTER TABLE ONLY hdb_catalog.hdb_scheduled_event_invocation_logs
    ADD CONSTRAINT hdb_scheduled_event_invocation_logs_event_id_fkey FOREIGN KEY (event_id) REFERENCES hdb_catalog.hdb_scheduled_events(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY imports."importHistory"
    ADD CONSTRAINT "importHistory_importId_fkey" FOREIGN KEY ("importId") REFERENCES imports.import(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."ingredientProcessing"
    ADD CONSTRAINT "ingredientProcessing_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES ingredient.ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY ingredient."ingredientProcessing"
    ADD CONSTRAINT "ingredientProcessing_processingName_fkey" FOREIGN KEY ("processingName") REFERENCES master."processingName"(name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."ingredientSacahet_recipeHubSachet"
    ADD CONSTRAINT "ingredientSacahet_recipeHubSachet_ingredientSachetId_fkey" FOREIGN KEY ("ingredientSachetId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."ingredientSachet"
    ADD CONSTRAINT "ingredientSachet_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES ingredient.ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY ingredient."ingredientSachet"
    ADD CONSTRAINT "ingredientSachet_ingredientProcessingId_fkey" FOREIGN KEY ("ingredientProcessingId") REFERENCES ingredient."ingredientProcessing"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY ingredient."ingredientSachet"
    ADD CONSTRAINT "ingredientSachet_liveMOF_fkey" FOREIGN KEY ("liveMOF") REFERENCES ingredient."modeOfFulfillment"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."ingredientSachet_unitConversion"
    ADD CONSTRAINT "ingredientSachet_unitConversion_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."ingredientSachet_unitConversion"
    ADD CONSTRAINT "ingredientSachet_unitConversion_unitConversionId_fkey" FOREIGN KEY ("unitConversionId") REFERENCES master."unitConversion"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."ingredientSachet"
    ADD CONSTRAINT "ingredientSachet_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient.ingredient
    ADD CONSTRAINT ingredient_category_fkey FOREIGN KEY (category) REFERENCES master."ingredientCategory"(name) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_bulkItemId_fkey" FOREIGN KEY ("bulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_ingredientSachetId_fkey" FOREIGN KEY ("ingredientSachetId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_labelTemplateId_fkey" FOREIGN KEY ("labelTemplateId") REFERENCES "deviceHub"."labelTemplate"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_operationalConfigId_fkey" FOREIGN KEY ("operationConfigId") REFERENCES settings."operationConfig"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES packaging.packaging(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY ingredient."modeOfFulfillment"
    ADD CONSTRAINT "modeOfFulfillment_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY insights.app_module_insight
    ADD CONSTRAINT "app_module_insight_insightIdentifier_fkey" FOREIGN KEY ("insightIdentifier") REFERENCES insights.insights(identifier) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY insights.chart
    ADD CONSTRAINT "chart_insightIdentifier_fkey" FOREIGN KEY ("insightIdentifier") REFERENCES insights.insights(identifier) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY insights.date
    ADD CONSTRAINT date_day_fkey FOREIGN KEY (day) REFERENCES insights.day("dayName") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY instructions."instructionStep"
    ADD CONSTRAINT "instructionStep_instructionSetId_fkey" FOREIGN KEY ("instructionSetId") REFERENCES instructions."instructionSet"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY instructions."instructionSet"
    ADD CONSTRAINT "instruction_simpleRecipeId_fkey" FOREIGN KEY ("simpleRecipeId") REFERENCES "simpleRecipe"."simpleRecipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkItemHistory_bulkItemId_fkey" FOREIGN KEY ("bulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkItemHistory_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES inventory."purchaseOrderItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkItemHistory_sachetWorkOrderId_fkey" FOREIGN KEY ("sachetWorkOrderId") REFERENCES inventory."sachetWorkOrder"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkItemHistory_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItemHistory"
    ADD CONSTRAINT "bulkItemHistory_workOrderId_fkey" FOREIGN KEY ("bulkWorkOrderId") REFERENCES inventory."bulkWorkOrder"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItem"
    ADD CONSTRAINT "bulkItem_processingName_fkey" FOREIGN KEY ("processingName") REFERENCES master."processingName"(name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItem"
    ADD CONSTRAINT "bulkItem_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES inventory."supplierItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItem_unitConversion"
    ADD CONSTRAINT "bulkItem_unitConversion_bulkItemId_fkey" FOREIGN KEY ("entityId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItem_unitConversion"
    ADD CONSTRAINT "bulkItem_unitConversion_unitConversionId_fkey" FOREIGN KEY ("unitConversionId") REFERENCES master."unitConversion"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkItem"
    ADD CONSTRAINT "bulkItem_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_inputBulkItemId_fkey" FOREIGN KEY ("inputBulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_inputQuantityUnit_fkey" FOREIGN KEY ("inputQuantityUnit") REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_outputBulkItemId_fkey" FOREIGN KEY ("outputBulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES inventory."supplierItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."bulkWorkOrder"
    ADD CONSTRAINT "bulkWorkOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES settings."user"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."packagingHistory"
    ADD CONSTRAINT "packagingHistory_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES packaging.packaging(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."packagingHistory"
    ADD CONSTRAINT "packagingHistory_purchaseOrderItemId_fkey" FOREIGN KEY ("purchaseOrderItemId") REFERENCES inventory."purchaseOrderItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_bulkItemId_fkey" FOREIGN KEY ("bulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES packaging.packaging(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES inventory."supplierItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_supplier_fkey" FOREIGN KEY ("supplierId") REFERENCES inventory.supplier(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."purchaseOrderItem"
    ADD CONSTRAINT "purchaseOrderItem_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItem"
    ADD CONSTRAINT "sachetItem2_bulkItemId_fkey" FOREIGN KEY ("bulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItem"
    ADD CONSTRAINT "sachetItem2_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItemHistory"
    ADD CONSTRAINT "sachetItemHistory_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItemHistory"
    ADD CONSTRAINT "sachetItemHistory_sachetWorkOrderId_fkey" FOREIGN KEY ("sachetWorkOrderId") REFERENCES inventory."sachetWorkOrder"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItemHistory"
    ADD CONSTRAINT "sachetItemHistory_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItem_unitConversion"
    ADD CONSTRAINT "sachetItem_unitConversion_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES inventory."sachetItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetItem_unitConversion"
    ADD CONSTRAINT "sachetItem_unitConversion_unitConversionId_fkey" FOREIGN KEY ("unitConversionId") REFERENCES master."unitConversion"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_inputBulkItemId_fkey" FOREIGN KEY ("inputBulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_outputSachetItemId_fkey" FOREIGN KEY ("outputSachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES packaging.packaging(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES inventory."supplierItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."sachetWorkOrder"
    ADD CONSTRAINT "sachetWorkOrder_userId_fkey" FOREIGN KEY ("userId") REFERENCES settings."user"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."supplierItem"
    ADD CONSTRAINT "supplierItem_importId_fkey" FOREIGN KEY ("importId") REFERENCES imports."importHistory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY inventory."supplierItem"
    ADD CONSTRAINT "supplierItem_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES inventory.supplier(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."supplierItem_unitConversion"
    ADD CONSTRAINT "supplierItem_unitConversion_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES inventory."supplierItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."supplierItem_unitConversion"
    ADD CONSTRAINT "supplierItem_unitConversion_unitConversionId_fkey" FOREIGN KEY ("unitConversionId") REFERENCES master."unitConversion"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."supplierItem"
    ADD CONSTRAINT "supplierItem_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory.supplier
    ADD CONSTRAINT "supplier_importId_fkey" FOREIGN KEY ("importId") REFERENCES imports."importHistory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY inventory."unitConversionByBulkItem"
    ADD CONSTRAINT "unitConversionByBulkItem_bulkItemId_fkey" FOREIGN KEY ("bulkItemId") REFERENCES inventory."bulkItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY inventory."unitConversionByBulkItem"
    ADD CONSTRAINT "unitConversionByBulkItem_unitConversionId_fkey" FOREIGN KEY ("unitConversionId") REFERENCES master."unitConversion"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY master."productCategory"
    ADD CONSTRAINT "productCategory_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY master."unitConversion"
    ADD CONSTRAINT "unitConversion_inputUnit_fkey" FOREIGN KEY ("inputUnitName") REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY master."unitConversion"
    ADD CONSTRAINT "unitConversion_outputUnit_fkey" FOREIGN KEY ("outputUnitName") REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY notifications."emailConfig"
    ADD CONSTRAINT "emailConfig_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES notifications.type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY notifications."emailTriggers"
    ADD CONSTRAINT "emailTriggers_emailTemplateFileId_fkey" FOREIGN KEY ("emailTemplateFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY notifications."emailTriggers"
    ADD CONSTRAINT "emailTriggers_functionFileId_fkey" FOREIGN KEY ("functionFileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY notifications."displayNotification"
    ADD CONSTRAINT "notification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES notifications.type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY notifications."printConfig"
    ADD CONSTRAINT "printConfig_printerPrintNodeId_fkey" FOREIGN KEY ("printerPrintNodeId") REFERENCES "deviceHub".printer("printNodeId") ON DELETE SET NULL;
ALTER TABLE ONLY notifications."printConfig"
    ADD CONSTRAINT "printConfig_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES notifications.type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY notifications."smsConfig"
    ADD CONSTRAINT "smsConfig_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES notifications.type(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "onDemand".brand_collection
    ADD CONSTRAINT "brand_collection_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "onDemand".collection(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand".brand_collection
    ADD CONSTRAINT "brand_collection_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand".collection
    ADD CONSTRAINT "collection_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."collection_productCategory"
    ADD CONSTRAINT "collection_productCategory_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "onDemand".collection(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."collection_productCategory"
    ADD CONSTRAINT "collection_productCategory_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."collection_productCategory"
    ADD CONSTRAINT "collection_productCategory_productCategoryName_fkey" FOREIGN KEY ("productCategoryName") REFERENCES master."productCategory"(name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "onDemand"."collection_productCategory_product"
    ADD CONSTRAINT "collection_productCategory_product_collection_productCategor" FOREIGN KEY ("collection_productCategoryId") REFERENCES "onDemand"."collection_productCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."collection_productCategory_product"
    ADD CONSTRAINT "collection_productCategory_product_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."collection_productCategory_product"
    ADD CONSTRAINT "collection_productCategory_product_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."linkedModifier"
    ADD CONSTRAINT "linkedModifier_linkedModifierId_fkey" FOREIGN KEY ("linkedModifierId") REFERENCES "onDemand".modifier(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "onDemand"."linkedModifier"
    ADD CONSTRAINT "linkedModifier_parentModifierId_fkey" FOREIGN KEY ("parentModifierId") REFERENCES "onDemand".modifier(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "onDemand"."modifierCategoryOption"
    ADD CONSTRAINT "modifierCategoryOption_ingredientSachetId_fkey" FOREIGN KEY ("ingredientSachetId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY "onDemand"."modifierCategoryOption"
    ADD CONSTRAINT "modifierCategoryOption_modifierCategoryId_fkey" FOREIGN KEY ("modifierCategoryId") REFERENCES "onDemand"."modifierCategory"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."modifierCategoryOption"
    ADD CONSTRAINT "modifierCategoryOption_operationConfigId_fkey" FOREIGN KEY ("operationConfigId") REFERENCES settings."operationConfig"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand"."modifierCategoryOption"
    ADD CONSTRAINT "modifierCategoryOption_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY "onDemand"."modifierCategory"
    ADD CONSTRAINT "modifierCategory_modifierTemplateId_fkey" FOREIGN KEY ("modifierTemplateId") REFERENCES "onDemand".modifier(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand".modifier
    ADD CONSTRAINT "modifier_importHistoryId_fkey" FOREIGN KEY ("importHistoryId") REFERENCES imports."importHistory"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "onDemand".brand_collection
    ADD CONSTRAINT "shop_collection_shopId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_comboProductComponentId_fkey" FOREIGN KEY ("comboProductComponentId") REFERENCES products."comboProductComponent"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_customizableProductComponentId_fkey" FOREIGN KEY ("customizableProductComponentId") REFERENCES products."customizableProductComponent"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_experienceClassId_fkey" FOREIGN KEY ("experienceClassId") REFERENCES experiences."experienceClass"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_ingredientSachetId_fkey" FOREIGN KEY ("ingredientSachetId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_labelTemplateId_fkey" FOREIGN KEY ("labelTemplateId") REFERENCES "deviceHub"."labelTemplate"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_modifierOptionId_fkey" FOREIGN KEY ("modifierOptionId") REFERENCES "onDemand"."modifierCategoryOption"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_parentCartItemId_fkey" FOREIGN KEY ("parentCartItemId") REFERENCES "order"."cartItem"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_productOptionId_fkey" FOREIGN KEY ("productOptionId") REFERENCES products."productOption"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_simpleRecipeYieldId_fkey" FOREIGN KEY ("simpleRecipeYieldId") REFERENCES "simpleRecipe"."simpleRecipeYield"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."cartItem"
    ADD CONSTRAINT "cartItem_subscriptionOccurenceProductId_fkey" FOREIGN KEY ("subscriptionOccurenceProductId") REFERENCES subscription."subscriptionOccurence_product"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order"."cartPayment"
    ADD CONSTRAINT "cartPayment_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_activeCartPaymentId_fkey" FOREIGN KEY ("activeCartPaymentId") REFERENCES "order"."cartPayment"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_experienceClassId_fkey" FOREIGN KEY ("experienceClassId") REFERENCES experiences."experienceClass"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_experienceClassTypeId_fkey" FOREIGN KEY ("experienceClassTypeId") REFERENCES experiences."experienceClassType"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES brands.location(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_locationKioskId_fkey" FOREIGN KEY ("locationKioskId") REFERENCES brands."locationKiosk"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_locationTableId_fkey" FOREIGN KEY ("locationTableId") REFERENCES brands."locationTable"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "order"."order"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY "order".cart
    ADD CONSTRAINT "cart_parentCartId_fkey" FOREIGN KEY ("parentCartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order".cart_rewards
    ADD CONSTRAINT "cart_rewards_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "order".cart_rewards
    ADD CONSTRAINT "cart_rewards_rewardId_fkey" FOREIGN KEY ("rewardId") REFERENCES crm.reward(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT "order_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT "order_deliveryPartnershipId_fkey" FOREIGN KEY ("deliveryPartnershipId") REFERENCES fulfilment."deliveryService"("partnershipId") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."order"
    ADD CONSTRAINT "order_thirdPartyOrderId_fkey" FOREIGN KEY ("thirdPartyOrderId") REFERENCES "order"."thirdPartyOrder"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "order"."stripePaymentHistory"
    ADD CONSTRAINT "paymentHistory_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY packaging.packaging
    ADD CONSTRAINT "packaging_packagingSpecificationsId_fkey" FOREIGN KEY ("packagingSpecificationsId") REFERENCES packaging."packagingSpecifications"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY packaging.packaging
    ADD CONSTRAINT "packaging_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES inventory.supplier(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "paymentHub".commission_
    ADD CONSTRAINT "commission__paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "paymentHub".payment_(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "paymentHub".country_company_
    ADD CONSTRAINT "country_company__companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "paymentHub".company_(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "paymentHub"."paymentPartnership_"
    ADD CONSTRAINT "paymentPartnership__paymentCompanyId_fkey" FOREIGN KEY ("paymentCompanyId") REFERENCES "paymentHub".company_(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "paymentHub".payment_
    ADD CONSTRAINT "payment__paymentPartnershipId_fkey" FOREIGN KEY ("paymentPartnershipId") REFERENCES "paymentHub"."paymentPartnership_"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "paymentHub".payout_
    ADD CONSTRAINT "payout__paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "paymentHub".payment_(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY platform."customerAddress"
    ADD CONSTRAINT "customerAddress__keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES platform.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY platform.provider_customer
    ADD CONSTRAINT "provider_customer_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES platform.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY platform."customerPaymentMethod"
    ADD CONSTRAINT "stripePaymentMethod__keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES platform.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY products."comboProductComponent"
    ADD CONSTRAINT "comboProductComponent_linkedProductId_fkey" FOREIGN KEY ("linkedProductId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products."comboProductComponent"
    ADD CONSTRAINT "comboProductComponent_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY products."customizableProductComponent"
    ADD CONSTRAINT "customizableProductOption_linkedProductId_fkey" FOREIGN KEY ("linkedProductId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY products."customizableProductComponent"
    ADD CONSTRAINT "customizableProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY products."inventoryProductBundleSachet"
    ADD CONSTRAINT "inventoryProductBundleSachet_inventoryProductBundleId_fkey" FOREIGN KEY ("inventoryProductBundleId") REFERENCES products."inventoryProductBundle"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY products."inventoryProductBundleSachet"
    ADD CONSTRAINT "inventoryProductBundleSachet_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY products."productOptionType"
    ADD CONSTRAINT "productOptionType_orderMode_fkey" FOREIGN KEY ("orderMode") REFERENCES "order"."orderMode"(title) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_inventoryProductBundleId_fkey" FOREIGN KEY ("inventoryProductBundleId") REFERENCES products."inventoryProductBundle"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_modifierId_fkey" FOREIGN KEY ("modifierId") REFERENCES "onDemand".modifier(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_operationConfigId_fkey" FOREIGN KEY ("operationConfigId") REFERENCES settings."operationConfig"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES products.product(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_sachetItemId_fkey" FOREIGN KEY ("sachetItemId") REFERENCES inventory."sachetItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_simpleRecipeYieldId_fkey" FOREIGN KEY ("simpleRecipeYieldId") REFERENCES "simpleRecipe"."simpleRecipeYield"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products."productOption"
    ADD CONSTRAINT "productOption_supplierItemId_fkey" FOREIGN KEY ("supplierItemId") REFERENCES inventory."supplierItem"(id) ON UPDATE CASCADE ON DELETE SET NULL;
ALTER TABLE ONLY products.product
    ADD CONSTRAINT "product_addedByApiKey_fkey" FOREIGN KEY ("addedByApiKey") REFERENCES developer."apiKey"("apiKey") ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY products.product
    ADD CONSTRAINT "product_addedBy_fkey" FOREIGN KEY ("addedBy") REFERENCES settings."user"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY products.product
    ADD CONSTRAINT "product_updatedByApiKey_fkey" FOREIGN KEY ("updatedByApiKey") REFERENCES developer."apiKey"("apiKey") ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY products.product
    ADD CONSTRAINT "product_updatedBy_fkey" FOREIGN KEY ("updatedBy") REFERENCES settings."user"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY safety."safetyCheckPerUser"
    ADD CONSTRAINT "safetyCheckByUser_SafetyCheckId_fkey" FOREIGN KEY ("SafetyCheckId") REFERENCES safety."safetyCheck"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY safety."safetyCheckPerUser"
    ADD CONSTRAINT "safetyCheckByUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES settings."user"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."appPermission"
    ADD CONSTRAINT "appPermission_appId_fkey" FOREIGN KEY ("appId") REFERENCES settings.app(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.app_module
    ADD CONSTRAINT "app_module_appTitle_fkey" FOREIGN KEY ("appTitle") REFERENCES settings.app(title) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."operationConfig"
    ADD CONSTRAINT "operationConfig_labelTemplateId_fkey" FOREIGN KEY ("labelTemplateId") REFERENCES "deviceHub"."labelTemplate"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."operationConfig"
    ADD CONSTRAINT "operationConfig_packagingId_fkey" FOREIGN KEY ("packagingId") REFERENCES packaging.packaging(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."operationConfig"
    ADD CONSTRAINT "operationConfig_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."role_appPermission"
    ADD CONSTRAINT "role_appPermission_appPermissionId_fkey" FOREIGN KEY ("appPermissionId") REFERENCES settings."appPermission"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings."role_appPermission"
    ADD CONSTRAINT "role_appPermission_role_appId_fkey" FOREIGN KEY ("role_appId") REFERENCES settings.role_app(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.role_app
    ADD CONSTRAINT "role_app_appId_fkey" FOREIGN KEY ("appId") REFERENCES settings.app(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.role_app
    ADD CONSTRAINT "role_app_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES settings.role(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.station
    ADD CONSTRAINT "station_defaultKotPrinterId_fkey" FOREIGN KEY ("defaultKotPrinterId") REFERENCES "deviceHub".printer("printNodeId") ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY settings.station
    ADD CONSTRAINT "station_defaultLabelPrinterId_fkey" FOREIGN KEY ("defaultLabelPrinterId") REFERENCES "deviceHub".printer("printNodeId") ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY settings.station_kot_printer
    ADD CONSTRAINT "station_kot_printer_printNodeId_fkey" FOREIGN KEY ("printNodeId") REFERENCES "deviceHub".printer("printNodeId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY settings.station_kot_printer
    ADD CONSTRAINT "station_kot_printer_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.station_label_printer
    ADD CONSTRAINT "station_label_printer_printNodeId_fkey" FOREIGN KEY ("printNodeId") REFERENCES "deviceHub".printer("printNodeId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY settings.station_label_printer
    ADD CONSTRAINT "station_printer_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY settings.station_user
    ADD CONSTRAINT "station_user_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES settings.station(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY settings.station_user
    ADD CONSTRAINT "station_user_userKeycloakId_fkey" FOREIGN KEY ("userKeycloakId") REFERENCES settings."user"("keycloakId") ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.user_role
    ADD CONSTRAINT "user_role_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES settings.role(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY settings.user_role
    ADD CONSTRAINT "user_role_userId_fkey" FOREIGN KEY ("userId") REFERENCES settings."user"("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield_ingredientSachet"
    ADD CONSTRAINT "simpleRecipeYield_ingredientSachet_ingredientSachetId_fkey" FOREIGN KEY ("ingredientSachetId") REFERENCES ingredient."ingredientSachet"(id) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield_ingredientSachet"
    ADD CONSTRAINT "simpleRecipeYield_ingredientSachet_recipeYieldId_fkey" FOREIGN KEY ("recipeYieldId") REFERENCES "simpleRecipe"."simpleRecipeYield"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield_ingredientSachet"
    ADD CONSTRAINT "simpleRecipeYield_ingredientSachet_simpleRecipeIngredientPro" FOREIGN KEY ("simpleRecipeIngredientProcessingId") REFERENCES "simpleRecipe"."simpleRecipe_ingredient_processing"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield"
    ADD CONSTRAINT "simpleRecipeYield_simpleRecipeId_fkey" FOREIGN KEY ("simpleRecipeId") REFERENCES "simpleRecipe"."simpleRecipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipeYield"
    ADD CONSTRAINT "simpleRecipeYield_unit_fkey" FOREIGN KEY (unit) REFERENCES master.unit(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe"
    ADD CONSTRAINT "simpleRecipe_cuisine_fkey" FOREIGN KEY (cuisine) REFERENCES master."cuisineName"(name) ON UPDATE CASCADE ON DELETE RESTRICT;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe_ingredient_processing"
    ADD CONSTRAINT "simpleRecipe_ingredient_processing_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES ingredient.ingredient(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe_ingredient_processing"
    ADD CONSTRAINT "simpleRecipe_ingredient_processing_processingId_fkey" FOREIGN KEY ("processingId") REFERENCES ingredient."ingredientProcessing"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY "simpleRecipe"."simpleRecipe_ingredient_processing"
    ADD CONSTRAINT "simpleRecipe_ingredient_processing_simpleRecipeId_fkey" FOREIGN KEY ("simpleRecipeId") REFERENCES "simpleRecipe"."simpleRecipe"(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY sqldemo.book
    ADD CONSTRAINT "book_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES sqldemo.author(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."brand_subscriptionTitle"
    ADD CONSTRAINT "brand_subscriptionTitle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY subscription."subscriptionItemCount"
    ADD CONSTRAINT "subscriptionItemCount_subscriptionServingId_fkey" FOREIGN KEY ("subscriptionServingId") REFERENCES subscription."subscriptionServing"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_addOn"
    ADD CONSTRAINT "subscriptionOccurence_addOn_productOptionId_fkey" FOREIGN KEY ("productOptionId") REFERENCES products."productOption"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_brand_customerId_fkey" FOREIGN KEY ("brand_customerId") REFERENCES crm.brand_customer(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "order".cart(id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_keycloakId_fkey" FOREIGN KEY ("keycloakId") REFERENCES crm.customer("keycloakId") ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_customer"
    ADD CONSTRAINT "subscriptionOccurence_customer_subscriptionOccurenceId_fkey" FOREIGN KEY ("subscriptionOccurenceId") REFERENCES subscription."subscriptionOccurence"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_productCategory_fkey" FOREIGN KEY ("productCategory") REFERENCES master."productCategory"(name) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_productOptionId_fkey" FOREIGN KEY ("productOptionId") REFERENCES products."productOption"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES subscription.subscription(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence_product"
    ADD CONSTRAINT "subscriptionOccurence_product_subscriptionOccurenceId_fkey" FOREIGN KEY ("subscriptionOccurenceId") REFERENCES subscription."subscriptionOccurence"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionOccurence"
    ADD CONSTRAINT "subscriptionOccurence_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES subscription.subscription(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionServing"
    ADD CONSTRAINT "subscriptionServing_defaultSubscriptionItemCountId_fkey" FOREIGN KEY ("defaultSubscriptionItemCountId") REFERENCES subscription."subscriptionItemCount"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY subscription."subscriptionServing"
    ADD CONSTRAINT "subscriptionServing_subscriptionTitleId_fkey" FOREIGN KEY ("subscriptionTitleId") REFERENCES subscription."subscriptionTitle"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription."subscriptionTitle"
    ADD CONSTRAINT "subscriptionTitle_defaultSubscriptionServingId_fkey" FOREIGN KEY ("defaultSubscriptionServingId") REFERENCES subscription."subscriptionServing"(id) ON UPDATE SET NULL ON DELETE SET NULL;
ALTER TABLE ONLY subscription.subscription
    ADD CONSTRAINT "subscription_subscriptionItemCountId_fkey" FOREIGN KEY ("subscriptionItemCountId") REFERENCES subscription."subscriptionItemCount"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY subscription.subscription_zipcode
    ADD CONSTRAINT "subscription_zipcode_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES subscription.subscription(id) ON UPDATE CASCADE ON DELETE CASCADE;
ALTER TABLE ONLY subscription.subscription_zipcode
    ADD CONSTRAINT "subscription_zipcode_subscriptionPickupOptionId_fkey" FOREIGN KEY ("subscriptionPickupOptionId") REFERENCES subscription."subscriptionPickupOption"(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY ux."accessPoint"
    ADD CONSTRAINT "accessPoint_accessPointTypeTitle_fkey" FOREIGN KEY ("accessPointTypeTitle") REFERENCES ux."accessPointType"(title) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ux.action
    ADD CONSTRAINT "action_actionTypeTitle_fkey" FOREIGN KEY ("actionTypeTitle") REFERENCES ux."actionType"(title) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY ux.action
    ADD CONSTRAINT "action_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY ux."bottomBarOption"
    ADD CONSTRAINT "bottomBarOption_navigationMenuId_fkey" FOREIGN KEY ("navigationMenuId") REFERENCES website."navigationMenu"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_conditionId_fkey" FOREIGN KEY ("conditionId") REFERENCES rules.conditions(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_divId_fkey" FOREIGN KEY ("divId") REFERENCES ux."dailyosDivId"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY ux."dailyosDivIdFiles"
    ADD CONSTRAINT "dailyosDivIdFiles_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE SET NULL;
ALTER TABLE ONLY ux."dailyosDivId"
    ADD CONSTRAINT "dailyosDivId_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY ux."user_dailyosDivIdFile"
    ADD CONSTRAINT "user_dailyosDivIdFile_dailyosDivIdFileId_fkey" FOREIGN KEY ("dailyosDivIdFileId") REFERENCES ux."dailyosDivIdFiles"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY website."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_actionId_fkey" FOREIGN KEY ("actionId") REFERENCES ux.action(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY website."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_navigationnMenuId_fkey" FOREIGN KEY ("navigationMenuId") REFERENCES website."navigationMenu"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY website."navigationMenuItem"
    ADD CONSTRAINT "navigationMenuItem_parentNavigationMenuItemId_fkey" FOREIGN KEY ("parentNavigationMenuItemId") REFERENCES website."navigationMenuItem"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY website."websitePageModule"
    ADD CONSTRAINT "websitePageModule_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES editor.file(id) ON UPDATE RESTRICT ON DELETE CASCADE;
ALTER TABLE ONLY website."websitePageModule"
    ADD CONSTRAINT "websitePageModule_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES editor.template(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY website."websitePageModule"
    ADD CONSTRAINT "websitePageModule_websitePageId_fkey" FOREIGN KEY ("websitePageId") REFERENCES website."websitePage"(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY website."websitePage"
    ADD CONSTRAINT "websitePage_websiteId_fkey" FOREIGN KEY ("websiteId") REFERENCES website.website(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY website.website
    ADD CONSTRAINT "website_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES brands.brand(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE ONLY website.website
    ADD CONSTRAINT "website_navigationMenuId_fkey" FOREIGN KEY ("navigationMenuId") REFERENCES website."navigationMenu"(id) ON UPDATE RESTRICT ON DELETE CASCADE;
