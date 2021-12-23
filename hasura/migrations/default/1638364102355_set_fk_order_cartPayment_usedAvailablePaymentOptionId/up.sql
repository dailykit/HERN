alter table "order"."cartPayment"
  add constraint "cartPayment_usedAvailablePaymentOptionId_fkey"
  foreign key ("usedAvailablePaymentOptionId")
  references "brands"."availablePaymentOption"
  ("id") on update restrict on delete restrict;
