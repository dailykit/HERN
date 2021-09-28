import React, { useState, useEffect } from "react";
import { Flex } from "@dailykit/ui";
import { Wrapper } from "./styles";
import { ChevronRight, AddressForm } from "../../../components";
import { useAuth, useRsvp } from "../../../Providers";
import { theme } from "../../../theme";
import { capitalize } from "../../../utils";

export default function AddAddress() {
  const { state: rsvpState, setResponseDetails } = useRsvp();
  const { responseDetails } = rsvpState;
  const { state: userState, toggleAddressModal } = useAuth();
  const [isValid, setIsValid] = useState(false);
  const { user } = userState;
  const handleAddressChange = (address) => {
    setResponseDetails({
      ...responseDetails,
      address,
    });
  };

  useEffect(() => {
    if (!isValid) {
      console.log("valid", isValid);
      setResponseDetails({
        ...responseDetails,
        address: null,
      });
    }
  }, [isValid]);

  return (
    <Wrapper>
      <Flex container align="center" justifyContent="space-between"></Flex>
      <div className="address-div">
        <h1 className="address-header">Add Address Details</h1>
        <AddressForm
          defaultMutation={false}
          defaultActionButton={false}
          defaultAddress={responseDetails?.address}
          isValidFunc={(valid) => setIsValid(valid)}
          onChange={(address) => handleAddressChange(address)}
        />
      </div>
    </Wrapper>
  );
}
