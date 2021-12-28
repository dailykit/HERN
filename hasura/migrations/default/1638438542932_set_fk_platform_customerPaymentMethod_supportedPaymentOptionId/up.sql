alter table "platform"."customerPaymentMethod"
  add constraint "customerPaymentMethod_supportedPaymentOptionId_fkey"
  foreign key ("supportedPaymentOptionId")
  references "brands"."supportedPaymentOption"
  ("id") on update restrict on delete restrict;
