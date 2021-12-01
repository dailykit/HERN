alter table "brands"."availablePaymentOption" drop constraint "availablePaymentOption_pkey";
alter table "brands"."availablePaymentOption"
    add constraint "availablePaymentOption_pkey"
    primary key ("label");
