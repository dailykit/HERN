alter table "order"."cart"
  add constraint "cart_toUseAvailablePaymentOptionId_fkey"
  foreign key ("toUseAvailablePaymentOptionId")
  references "brands"."availablePaymentOption"
  ("id") on update restrict on delete restrict;
