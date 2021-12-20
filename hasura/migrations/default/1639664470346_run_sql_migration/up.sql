CREATE OR REPLACE FUNCTION platform.full_name(customer platform.customer)
 RETURNS text
 LANGUAGE plpgsql
 STABLE
AS $function$
BEGIN
    RETURN TRIM(INITCAP(CONCAT(customer."firstName", ' ', customer."lastName")));
END
$function$;
