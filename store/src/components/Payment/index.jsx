import React, { useState, useEffect } from "react";
import axios from "axios";
import { PlusIcon, Flex, ComboButton } from "@dailykit/ui";
import { useMutation } from "@apollo/client";
import { Wrapper } from "./styles";
import {
  Input,
  Button,
  ChevronLeft,
  DeleteIcon,
  VisaIcon,
  MasterCardIcon,
  MaestroIcon,
  AmexIcon,
  PaypalIcon,
  HorizontalTabs,
  HorizontalTab,
  HorizontalTabList,
  HorizontalTabPanel,
  HorizontalTabPanels,
} from "../../components";
import { useAuth } from "../../Providers";
import { theme } from "../../theme";
import { capitalize, isEmpty, isClient } from "../../utils";
import {
  UPDATE_PLATFORM_CUSTOMER,
  DELETE_STRIPE_PAYMENT_METHOD,
} from "../../graphql";
import PaymentForm from "../PaymentForm";

export default function Payment({
  type = "tunnel",
  onPay,
  isOnPayDisabled = true,
}) {
  const [defaultPaymentMethodId, setDefaultPaymentMethodId] = useState("");
  const [intent, setIntent] = useState(null);
  const [contentIndex, setContentIndex] = useState(0);
  const { state } = useAuth();
  const { user = {}, organization = {} } = state;

  const next = () => {
    if (contentIndex === 1) {
      return;
    } else {
      setContentIndex((prev) => prev + 1);
    }
  };
  const previous = () => {
    if (contentIndex === 0) {
      return;
    } else {
      setContentIndex((prev) => prev - 1);
    }
  };

  const [updateDefaultPaymentMethodId, { loading: isUpdating }] = useMutation(
    UPDATE_PLATFORM_CUSTOMER,
    {
      refetchQueries: ["CUSTOMER_DETAILS"],
      onCompleted: ({ platform_updateCustomer }) => {
        const { defaultPaymentMethodId } = platform_updateCustomer;
        setDefaultPaymentMethodId(defaultPaymentMethodId);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );
  const [deleteStripePaymentMethod, { loading: isDeleting }] = useMutation(
    DELETE_STRIPE_PAYMENT_METHOD,
    {
      refetchQueries: ["CUSTOMER_DETAILS"],
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const handleCheckboxClick = (paymentMethodId) => {
    updateDefaultPaymentMethodId({
      variables: {
        keycloakId: user?.keycloakId,
        _set: {
          defaultPaymentMethodId: paymentMethodId,
        },
      },
    });
  };

  const handleDeletePaymentCard = (paymentMethodId) => {
    if (paymentMethodId !== defaultPaymentMethodId) {
      deleteStripePaymentMethod({
        variables: {
          stripePaymentMethodId: paymentMethodId,
        },
      });
    } else {
      alert("Can't Delete the default Payment Method");
    }
  };

  const getSmallContent = (paymentMethodId) => {
    if (paymentMethodId === defaultPaymentMethodId) {
      return "Default";
    } else {
      return "Make it default";
    }
  };

  useEffect(() => {
    if (!isEmpty(user) && !isEmpty(user?.defaultPaymentMethodId)) {
      console.log("ContentIndex,here 0");
      setDefaultPaymentMethodId(user?.defaultPaymentMethodId);
      setContentIndex(0);
    }
    if (!isEmpty(user) && isEmpty(user?.stripePaymentMethods)) {
      console.log("ContentIndex,here 1");
      setContentIndex(1);
    }
  }, [user]);

  useEffect(() => {
    if (
      user?.CustomerByClients &&
      user?.CustomerByClients.length &&
      user?.CustomerByClients[0]?.organizationStripeCustomerId &&
      isClient
    ) {
      (async () => {
        const intent = await createSetupIntent(
          user?.CustomerByClients[0]?.organizationStripeCustomerId,
          organization
        );
        console.log("intent", intent);
        setIntent(intent);
      })();
    }
  }, [user, organization]);
  if (type === "tunnel") {
    return (
      <Wrapper isDeleting={isDeleting}>
        {contentIndex > 0 &&
          !isEmpty(user) &&
          !isEmpty(user?.stripePaymentMethods) && (
            <span className="ghost sticky-header" onClick={previous}>
              <ChevronLeft size="18px" color={theme.colors.textColor4} />
              <span> Select from saved Address</span>
            </span>
          )}
        {contentIndex === 0 && (
          <>
            <h3 className="greet-msg">Payment</h3>
            <div className="sticky-header">
              <Button className="custom-btn" onClick={next}>
                <Flex container alignItems="center">
                  <PlusIcon color="#fff" />
                  <span> Add New Payment Method</span>
                </Flex>
              </Button>
            </div>
            {!isEmpty(user) && !isEmpty(user?.stripePaymentMethods) ? (
              <div className="grid-view">
                {user?.stripePaymentMethods?.map((method) => {
                  return (
                    <div
                      key={method?.stripePaymentMethodId}
                      className="address-card"
                    >
                      <label className="checkbox-wrap">
                        <Input
                          type="checkbox"
                          customWidth="24px"
                          customHeight="24px"
                          checked={
                            method?.stripePaymentMethodId ===
                            defaultPaymentMethodId
                          }
                          onChange={() =>
                            handleCheckboxClick(method?.stripePaymentMethodId)
                          }
                          disabled={isUpdating}
                        />

                        <small>
                          {getSmallContent(method?.stripePaymentMethodId)}
                        </small>
                      </label>
                      <Flex
                        container
                        alignItems="flex-start"
                        flexDirection="column"
                        justifyContent="space-between"
                        flex="1"
                      >
                        <span className="checkbox-label">
                          {capitalize(method?.brand || "")}
                        </span>
                        <Flex container>
                          <span className="checkbox-label">Name :</span>
                          <span className="checkbox-label">
                            {capitalize(method?.cardHolderName || "")}
                          </span>
                        </Flex>
                        <Flex container>
                          <span className="checkbox-label">Expiry Date :</span>
                          <span className="checkbox-label">
                            {method?.expMonth}/{method?.expYear}
                          </span>
                        </Flex>
                        <Flex container>
                          <span className="checkbox-label">Last 4 digit :</span>
                          <span className="checkbox-label">
                            {method?.last4}
                          </span>
                        </Flex>
                      </Flex>
                      <span
                        className="delete-btn"
                        onClick={() =>
                          handleDeletePaymentCard(method?.stripePaymentMethodId)
                        }
                      >
                        <DeleteIcon
                          size="16px"
                          color={theme.colors.textColor3}
                        />
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <h1 className="empty_address_msg">
                Looks like you don't have any saved payment card!
              </h1>
            )}
          </>
        )}
        {contentIndex === 1 && <PaymentForm intent={intent} />}
      </Wrapper>
    );
  } else {
    return (
      <Wrapper isDeleting={isDeleting} type={type}>
        <div className="payment-div">
          <h3>Pay With</h3>
          <div className="payment-icon-wrapper">
            <span className="payment-icon">
              <VisaIcon size="64px" />
            </span>
            <span className="payment-icon">
              <AmexIcon size="64px" />
            </span>
            <span className="payment-icon">
              <MasterCardIcon size="64px" />
            </span>
            <span className="payment-icon">
              <MaestroIcon size="64px" />
            </span>
          </div>
        </div>
        <div>
          <HorizontalTabs>
            <HorizontalTabList>
              <HorizontalTab>Saved Cards</HorizontalTab>
              <HorizontalTab>Add Card</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
              <HorizontalTabPanel>
                <div className="grid-view">
                  {user?.stripePaymentMethods?.map((method) => {
                    return (
                      <div
                        key={method?.stripePaymentMethodId}
                        className="address-card"
                      >
                        <label className="checkbox-wrap">
                          <Input
                            type="checkbox"
                            customWidth="24px"
                            customHeight="24px"
                            checked={
                              method?.stripePaymentMethodId ===
                              defaultPaymentMethodId
                            }
                            onChange={() =>
                              handleCheckboxClick(method?.stripePaymentMethodId)
                            }
                            disabled={isUpdating}
                          />

                          <small>
                            {getSmallContent(method?.stripePaymentMethodId)}
                          </small>
                        </label>
                        <Flex
                          container
                          alignItems="flex-start"
                          flexDirection="column"
                          justifyContent="space-between"
                          flex="1"
                        >
                          <span className="checkbox-label">
                            <strong>
                              {`${capitalize(method?.brand || "")} Card `}
                            </strong>
                            ending in {method?.last4}
                          </span>
                          <Flex container>
                            <span className="checkbox-label">Name :</span>
                            <span className="checkbox-label">
                              {capitalize(method?.cardHolderName || "")}
                            </span>
                          </Flex>
                          <Flex container>
                            <span className="checkbox-label">
                              Expiry Date :
                            </span>
                            <span className="checkbox-label">
                              {method?.expMonth}/{method?.expYear}
                            </span>
                          </Flex>
                        </Flex>
                        <span
                          className="delete-btn"
                          onClick={() =>
                            handleDeletePaymentCard(
                              method?.stripePaymentMethodId
                            )
                          }
                        >
                          <DeleteIcon
                            size="16px"
                            color={theme.colors.textColor3}
                          />
                        </span>
                      </div>
                    );
                  })}
                </div>
                <Button
                  className="customButton"
                  disabled={isOnPayDisabled}
                  onClick={onPay}
                >
                  Confirm and pay
                </Button>
              </HorizontalTabPanel>
              <HorizontalTabPanel>
                <PaymentForm intent={intent} type="checkout" />
              </HorizontalTabPanel>
            </HorizontalTabPanels>
          </HorizontalTabs>
        </div>

        {/* {contentIndex === 1 && <PaymentForm intent={intent} />} */}
      </Wrapper>
    );
  }
}

const createSetupIntent = async (customer, organization = {}) => {
  try {
    let stripeAccountId = null;
    if (
      organization?.stripeAccountType === "standard" &&
      organization?.stripeAccountId
    ) {
      stripeAccountId = organization?.stripeAccountId;
    }
    const URL = `${
      (process.browser && window?._env_?.NEXT_PUBLIC_PAYMENTS_API_URL) ||
      process.env.NEXT_PUBLIC_PAYMENTS_API_URL
    }/api/setup-intent`;
    const { data } = await axios.post(URL, { customer, stripeAccountId });
    console.log("axios result", data);
    return data.data;
  } catch (error) {
    return error;
  }
};
