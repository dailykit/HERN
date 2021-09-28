import React from "react";
import { Flex } from "@dailykit/ui";
import addParticipantsFunc from "../../addParticipants";
import { useCustomMutation } from "../../useCustomMutation";
import Button from "../../../Button";
import { AddIcon, MinusIcon } from "../../../Icons";
import { useExperienceInfo, useCart } from "../../../../Providers";
import { isEmpty } from "../../../../utils";
import { theme } from "../../../../theme";

export default function ParticipantUpdate({ experienceId }) {
  const { CHILD_CART, CART } = useCustomMutation();
  const { getCart } = useCart();
  const cart = getCart(experienceId);
  const { state: experienceState, updateExperienceInfo } = useExperienceInfo();
  const {
    classTypeInfo,
    participants,
    totalPrice,
    pricePerPerson,
    priceBreakDown,
    onSummaryStep,
    selectedSlot,
  } = experienceState;

  const addParticipantsHandler = async (type, event) => {
    const { updatedParticipants, updatedTotalPrice } =
      await addParticipantsFunc({
        type,
        event,
        participants,
        pricePerPerson,
        totalPrice,
        classTypeInfo,
        priceBreakDown,
      });

    if (
      updatedParticipants &&
      onSummaryStep &&
      type === "inc" &&
      !isEmpty(cart) &&
      cart?.id
    ) {
      CHILD_CART.create.mutation({
        variables: {
          object: {
            parentCartId: cart?.id,
            experienceClassId: selectedSlot?.selectedExperienceClassId || null,
            experienceClassTypeId: classTypeInfo?.id,
            cartItems: {
              data: {
                experienceClassId:
                  selectedSlot?.selectedExperienceClassId || null,
                experienceClassTypeId: classTypeInfo?.id,
              },
            },
          },
        },
      });
    }
    if (
      updatedParticipants &&
      onSummaryStep &&
      type === "dec" &&
      !isEmpty(cart) &&
      cart?.childCarts.length
    ) {
      const differenceInChildCart = participants - cart?.totalParticipants;

      const childCarts = cart?.childCarts.filter(
        (childCart) => childCart?.customerKeycloakId === null
      );
      const childCartIds = [];
      childCarts?.forEach((childCart, index) => {
        if (index <= Math.abs(differenceInChildCart)) {
          childCartIds.push(childCart?.id);
        }
      });
      CART.delete.mutation({
        variables: {
          cartIds: childCartIds,
        },
      });
    }

    if (updatedParticipants) {
      console.log("updatedParticipants", updatedParticipants);
      await updateExperienceInfo({
        participants: updatedParticipants,
      });
    }
    if (updatedTotalPrice) {
      await updateExperienceInfo({
        totalPrice: updatedTotalPrice,
      });
    }
  };
  return (
    <div className="counter-update">
      <Flex container alignItems="center" justifyContent="space-between">
        <Flex
          container
          flexDirection="column"
          justifyContent="space-between"
          flex="1"
        >
          <p>Select number of people</p>
          <small>
            <em>
              starting from $
              {classTypeInfo?.minimumBookingAmount /
                classTypeInfo?.minimumParticipant}
              per person
            </em>
          </small>
        </Flex>
        <Flex
          container
          alignItems="center"
          justifyContent="space-evenly"
          flex="1"
        >
          <Button
            className="customCounterBtn"
            customWidth="30px"
            customHeight="30px"
            onClick={() => addParticipantsHandler("dec")}
            btnType="circle"
            disabled={participants <= 1}
          >
            <MinusIcon size={theme.sizes.h9} color={theme.colors.textColor4} />
          </Button>
          <p className="guest-count">{participants}</p>
          <Button
            className="customCounterBtn"
            customWidth="30px"
            customHeight="30px"
            onClick={() => addParticipantsHandler("inc")}
            btnType="circle"
            disabled={participants >= classTypeInfo?.maximumParticipant}
          >
            <AddIcon size={theme.sizes.h9} color={theme.colors.textColor4} />
          </Button>
        </Flex>
      </Flex>
    </div>
  );
}
