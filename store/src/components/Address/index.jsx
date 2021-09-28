import React, { useState, useEffect } from "react";
import { PlusIcon, Flex, ComboButton } from "@dailykit/ui";
import { useMutation } from "@apollo/client";
import { Wrapper } from "./styles";
import {
  Input,
  Button,
  ChevronLeft,
  AddressForm,
  DeleteIcon,
} from "../../components";
import { useAuth } from "../../Providers";
import { theme } from "../../theme";
import { capitalize, isEmpty } from "../../utils";
import {
  UPDATE_PLATFORM_CUSTOMER,
  DELETE_CUSTOMER_ADDRESS,
} from "../../graphql";

export default function Address() {
  const [defaultAddressId, setDefaultAddressId] = useState("");
  const [contentIndex, setContentIndex] = useState(0);
  const { state } = useAuth();
  const { user = {} } = state;

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

  const [updateCustomerDefaultAddressId, { loading: isUpdating }] = useMutation(
    UPDATE_PLATFORM_CUSTOMER,
    {
      refetchQueries: ["CUSTOMER_DETAILS"],
      onCompleted: ({ platform_updateCustomer }) => {
        const { defaultCustomerAddressId } = platform_updateCustomer;
        setDefaultAddressId(defaultCustomerAddressId);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );
  const [deleteCustomerAddress, { loading: isDeleting }] = useMutation(
    DELETE_CUSTOMER_ADDRESS,
    {
      refetchQueries: ["CUSTOMER_DETAILS"],
      onCompleted: ({ platform_updateCustomer }) => {
        const { defaultCustomerAddressId } = platform_updateCustomer;
        setDefaultAddressId(defaultCustomerAddressId);
      },
      onError: (error) => {
        console.log(error);
      },
    }
  );

  const handleCheckboxClick = (addressId) => {
    updateCustomerDefaultAddressId({
      variables: {
        keycloakId: user?.keycloakId,
        _set: {
          defaultCustomerAddressId: addressId,
        },
      },
    });
  };

  const handleDeleteAddressClick = (addressId) => {
    deleteCustomerAddress({
      variables: {
        id: addressId,
      },
    });
  };

  const getSmallContent = (addressId) => {
    if (addressId === defaultAddressId) {
      return "Default";
    } else {
      return "Make it default";
    }
  };

  useEffect(() => {
    if (!isEmpty(user) && !isEmpty(user?.defaultCustomerAddressId)) {
      setDefaultAddressId(user?.defaultCustomerAddressId);
    }
  }, []);

  return (
    <Wrapper isDeleting={isDeleting}>
      {contentIndex > 0 && (
        <span className="ghost sticky-header" onClick={previous}>
          <ChevronLeft size="18px" color={theme.colors.textColor4} />
          <span> Select from saved Address</span>
        </span>
      )}
      {contentIndex === 0 && (
        <>
          <h3 className="greet-msg">Addresses</h3>
          <div className="sticky-header">
            <Button className="custom-btn" onClick={next}>
              <Flex container alignItems="center">
                <PlusIcon color="#fff" />
                <span> Add New Address</span>
              </Flex>
            </Button>
          </div>
          {!isEmpty(user) && !isEmpty(user?.customerAddresses) ? (
            <div className="grid-view">
              {user?.customerAddresses?.map((address) => {
                return (
                  <div key={address.id} className="address-card">
                    <label className="checkbox-wrap">
                      <Input
                        type="checkbox"
                        customWidth="24px"
                        customHeight="24px"
                        checked={address?.id === defaultAddressId}
                        onChange={() => handleCheckboxClick(address?.id)}
                        disabled={isUpdating}
                      />

                      <small>{getSmallContent(address?.id)}</small>
                    </label>
                    <Flex
                      container
                      alignItems="flex-start"
                      flexDirection="column"
                      justifyContent="space-between"
                      flex="1"
                    >
                      <span className="checkbox-label">
                        {capitalize(address?.label || "")}
                      </span>
                      <span className="checkbox-label">
                        {`${address?.line1},${address?.line2},${address?.city},${address?.state}-${address?.zipcode}`}
                      </span>
                    </Flex>
                    <span
                      className="delete-btn"
                      onClick={() => handleDeleteAddressClick(address?.id)}
                    >
                      <DeleteIcon size="16px" color={theme.colors.textColor3} />
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <h1 className="empty_address_msg">
              Looks like you don't have any saved address!{" "}
            </h1>
          )}
        </>
      )}
      {contentIndex === 1 && <AddressForm onSubmit={previous} />}
    </Wrapper>
  );
}
