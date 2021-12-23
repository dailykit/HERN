CREATE OR REPLACE FUNCTION "order"."handle_paymentStatus_on_cartPayment"()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
 rec record;
 experienceBookingId int;
BEGIN
    UPDATE "order"."cart" SET "amount" = (SELECT "amount" FROM "order"."cart" WHERE "id" = New."cartId") + New."amount" WHERE "id" = New."cartId";
  RETURN New;
END;
$function$;
