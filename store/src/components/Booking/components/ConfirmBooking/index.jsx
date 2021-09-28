import React from "react";
import { Flex } from "@dailykit/ui";
import { Wrap } from "./styles";
import ParticipantUpdate from "./ParticipantUpdate";
import KitUpdate from "./KitUpdate";
import { ChevronRight } from "../../../Icons";
import { useAuth, useExperienceInfo } from "../../../../Providers";
import { theme } from "../../../../theme";
import { capitalize } from "../../../../utils";

export default function ConfirmBooking({ experienceId }) {
  const { togglePaymentModal, state: userState } = useAuth();
  const {
    user: { defaultStripePaymentMethod = {}, stripePaymentMethods = [] },
  } = userState;
  const { state: experienceState } = useExperienceInfo();
  const {
    bookingType,
    selectedSlot,
    participants,
    kit,
    totalPrice,
    pricePerPerson,
    totalKitPrice,
    deliveryCharge,
    salesTax,
  } = experienceState;

  return (
    <Wrap>
      <h2 className="top-heading">Confirm & Pay</h2>
      <div className="booking-info">
        <p>
          Your &nbsp; <strong> {capitalize(bookingType)} Group</strong>&nbsp;
          experience is booked for
        </p>
        <p>
          <strong>{`${selectedSlot?.date || ""} | ${
            selectedSlot?.time || ""
          }`}</strong>
        </p>
      </div>
      <ParticipantUpdate experienceId={experienceId} />
      <KitUpdate experienceId={experienceId} />
      <div className="table-wrap">
        <table>
          <tr>
            <td>
              Experience {participants}*{pricePerPerson}
            </td>
            <td>${totalPrice?.toFixed(1)}</td>
          </tr>
          <tr>
            <td>{kit} kit</td>
            <td>$ {totalKitPrice?.toFixed(1)} </td>
          </tr>
          <tr>
            <td>Delivery Charges</td>
            <td>${deliveryCharge?.toFixed(1)}</td>
          </tr>
          <tr>
            <td>sales tax</td>
            <td>${salesTax}</td>
          </tr>
        </table>
      </div>
      {/* <div className="points-wrap">
        <div className="extra-pts-wrap">
          <label>
            <Flex container alignItems="center" justifyContent="space-between">
              <Flex
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Input
                  type="checkbox"
                  customWidth="25px"
                  customHeight="25px"
                  checked={isLoyaltyPointChecked}
                  onClick={loyaltyPointHandler}
                />
                <Flex
                  container
                  flexDirection="column"
                  justifyContent="space-between"
                  margin="0 0 0 12px"
                >
                  <p>Use loyality Points</p>
                  <small>allowed till $5 per purchase</small>
                </Flex>
              </Flex>
              <h1>${loyaltyPoints}</h1>
            </Flex>
          </label>
        </div>
        <div className="extra-pts-wrap">
          <label>
            <Flex container alignItems="center" justifyContent="space-between">
              <Flex
                container
                alignItems="center"
                justifyContent="space-between"
              >
                <Input
                  type="checkbox"
                  customWidth="25px"
                  customHeight="25px"
                  checked={isWalletAmountChecked}
                  onClick={walletAmountHandler}
                />
                <Flex
                  container
                  flexDirection="column"
                  justifyContent="space-between"
                  margin="0 0 0 12px"
                >
                  <p>Use Wallet Amount</p>
                </Flex>
              </Flex>
              <h1>${walletAmount}</h1>
            </Flex>
          </label>
        </div>
      </div>
      <div className="coupon-wrapper">
        <Flex container alignItems="center" justifyContent="space-between">
          <Flex container flexDirection="column" justifyContent="space-between">
            <h1>Apply Coupon</h1>
            <small>3 valid coupons available</small>
          </Flex>
          <span>
            <ChevronRight
              size={theme.sizes.h4}
              color={theme.colors.textColor}
            />
          </span>
        </Flex>
      </div> */}
      <div className="total-sum">
        <Flex container alignItems="center" justifyContent="space-between">
          <p>Total</p>
          <p>${(totalPrice + totalKitPrice)?.toFixed(1)}</p>
        </Flex>
      </div>
      {stripePaymentMethods.length ? (
        <>
          <Flex container align="center" justifyContent="space-between">
            <p className="normal-p">Payment Method</p>
            <Flex container alignItems="center">
              <p
                onClick={() => togglePaymentModal(true)}
                className="change-head"
              >
                Change Payment Method
              </p>
              <ChevronRight
                size={theme.sizes.h6}
                color={theme.colors.textColor}
              />
            </Flex>
          </Flex>
          <div className="address-div">
            <Flex
              container
              alignItems="flex-start"
              flexDirection="column"
              justifyContent="space-between"
              flex="1"
            >
              <span className="checkbox-label card_brand">
                {capitalize(defaultStripePaymentMethod?.brand || "")}
              </span>
              <Flex container width="100%" justifyContent="space-between">
                <span className="checkbox-label">Name :</span>
                <span className="checkbox-label">
                  {capitalize(defaultStripePaymentMethod?.cardHolderName || "")}
                </span>
              </Flex>
              <Flex container width="100%" justifyContent="space-between">
                <span className="checkbox-label">Expiry Date :</span>
                <span className="checkbox-label">
                  {defaultStripePaymentMethod?.expMonth}/
                  {defaultStripePaymentMethod?.expYear}
                </span>
              </Flex>
              <Flex container width="100%" justifyContent="space-between">
                <span className="checkbox-label">Last 4 digit :</span>
                <span className="checkbox-label">
                  {defaultStripePaymentMethod?.last4}
                </span>
              </Flex>
            </Flex>
          </div>
        </>
      ) : (
        <p className="payment-head" onClick={() => togglePaymentModal(true)}>
          Add Payment Method
        </p>
      )}
    </Wrap>
  );
}
