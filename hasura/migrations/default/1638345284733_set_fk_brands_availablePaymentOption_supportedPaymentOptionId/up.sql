alter table "brands"."availablePaymentOption"
  add constraint "availablePaymentOption_supportedPaymentOptionId_fkey"
  foreign key ("supportedPaymentOptionId")
  references "brands"."supportedPaymentOption"
  ("id") on update restrict on delete restrict;
