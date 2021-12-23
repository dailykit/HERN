BEGIN TRANSACTION;
ALTER TABLE "brands"."availablePaymentOption" DROP CONSTRAINT "availablePaymentOption_pkey";

ALTER TABLE "brands"."availablePaymentOption"
    ADD CONSTRAINT "availablePaymentOption_pkey" PRIMARY KEY ("id");
COMMIT TRANSACTION;
