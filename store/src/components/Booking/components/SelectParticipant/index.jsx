import React from "react";
import { Flex } from "@dailykit/ui";
import { Wrap } from "./styles";
import addParticipantsFunc from "../../addParticipants";
import { useCustomMutation } from "../../useCustomMutation";
import Button from "../../../Button";
import { AddIcon, MinusIcon, SpinnerIcon } from "../../../Icons";
import Input from "../../../Input";
import { useExperienceInfo, useCart, useAuth } from "../../../../Providers";
import { isEmpty } from "../../../../utils";
import { theme } from "../../../../theme";

export default function SelectParticipant({ experienceId }) {
  const { CART, EXPERIENCE_PARTICIPANTS } = useCustomMutation();
  const { state: userState } = useAuth();
  const { user } = userState;
  const {
    state: experienceState,
    updateExperienceInfo,
    toggleDetailBreakdown,
  } = useExperienceInfo();
  const { state: cartState } = useCart();
  const { currentCart, hostCart } = cartState;
  // const cart = getCart(experienceId);

  const {
    classTypeInfo,
    pricePerPerson,
    isHostParticipant,
    participants,
    totalPrice,
    priceBreakDown,
  } = experienceState;

  const addParticipantsHandler = async (type, event) => {
    const {
      updatedParticipants = 1,
      updatedTotalPrice = 0,
    } = await addParticipantsFunc({
      type,
      event,
      participants,
      pricePerPerson,
      totalPrice,
      classTypeInfo,
      priceBreakDown,
    });
    await updateExperienceInfo({
      participants: updatedParticipants,
      totalPrice: updatedTotalPrice,
    });
    if (!isEmpty(currentCart)) {
      if (type === "inc") {
        const updatedCartItems = {
          ...currentCart?.experienceClass?.experience?.experience_products[0]
            ?.product?.productOptions[0]?.cartItem,
          experienceClassId: currentCart?.experienceClassId,
          experienceClassTypeId: currentCart?.experienceClassTypeId,
        };
        await EXPERIENCE_PARTICIPANTS.create.mutation({
          variables: {
            objects: [
              {
                experienceBookingId: currentCart?.experienceBooking?.id,
                childCart: {
                  data: {
                    parentCartId: currentCart?.cartId,
                    experienceClassId: currentCart?.experienceClassId,
                    experienceClassTypeId: currentCart?.experienceClassTypeId,
                    cartItems: {
                      data: [
                        updatedCartItems,
                        {
                          experienceClassId: currentCart?.experienceClassId,
                          experienceClassTypeId:
                            currentCart?.experienceClassTypeId,
                        },
                      ],
                    },
                  },
                },
              },
            ],
          },
        });
      } else if (type === "dec") {
        await EXPERIENCE_PARTICIPANTS.delete.mutation({
          variables: {
            id:
              currentCart?.experienceBooking?.experienceBookingParticipants[0]
                ?.id,
          },
        });
        await CART.delete.mutation({
          variables: {
            cartIds: [
              currentCart?.experienceBooking?.experienceBookingParticipants[0]
                ?.cartId,
            ],
          },
        });
      }
    }
  };

  const handleHostCheckboxClick = async (e) => {
    if (isEmpty(currentCart)) {
      await updateExperienceInfo({
        isHostParticipant: !isHostParticipant,
      });
    } else {
      console.log("NOt Empty");
      await CART.update.mutation({
        variables: {
          cartId: hostCart?.id || currentCart?.childCarts[0]?.id,
          _set: {
            customerKeycloakId: isHostParticipant ? null : user?.keycloakId,
          },
        },
      });
      await updateExperienceInfo({
        isHostParticipant: !isHostParticipant,
      });
    }
  };

  return (
    <Wrap>
      <div className="counter-wrap">
        <Flex container alignItems="center" justifyContent="space-around">
          <Button
            className="customCounterBtn"
            onClick={() => addParticipantsHandler("dec")}
            btnType="circle"
            disabled={participants <= 1}
          >
            <MinusIcon size={theme.sizes.h4} color={theme.colors.textColor4} />
          </Button>

          <input
            className="participant_input"
            type="number"
            min="1"
            max={classTypeInfo?.maximumParticipant}
            value={participants}
            onChange={(event) => addParticipantsHandler("input", event)}
          />
          <Button
            className="customCounterBtn"
            onClick={() => addParticipantsHandler("inc")}
            btnType="circle"
            disabled={participants >= classTypeInfo?.maximumParticipant}
          >
            <AddIcon size={theme.sizes.h4} color={theme.colors.textColor4} />
          </Button>
        </Flex>
      </div>
      <p className="discount-info">20% per ticket</p>
      <label className="checkbox-wrap">
        {!CART.update.loading ? (
          <Input
            type="checkbox"
            customWidth="24px"
            customHeight="24px"
            checked={isHostParticipant}
            onChange={handleHostCheckboxClick}
          />
        ) : (
          <SpinnerIcon
            size="25"
            backgroundColor={theme.colors.secondaryColor}
            color={theme.colors.textColor4}
          />
        )}
        <span className="checkbox-label">Add myself as participant</span>
      </label>
    </Wrap>
  );
}
