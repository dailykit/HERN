CREATE OR REPLACE FUNCTION "order"."maintainCartPaymentCancelledStatus"()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
BEGIN

IF (OLD."paymentStatus" = 'CANCELLED'  OR OLD."paymentStatus" = 'SUCCEEDED') and NEW."refundStatus" is null and NEW."isResultShow" = false then
return null;
else
 RETURN New;
 end if;
END;
$function$;
