import React from "react";
import { Flex } from "@dailykit/ui";
import { Wrap } from "./styles";
import { theme } from "../../../../theme";
import { useExperienceInfo } from "../../../../Providers";

export default function PriceBreakDown() {
  const { state: experienceState } = useExperienceInfo();
  const { classTypeInfo, priceBreakDown, pricePerPerson } = experienceState;
  return (
    <Wrap>
      <div className="modal-content-div">
        <Flex container alignItems="center" justifyContent="space-between">
          <p>
            <small style={{ marginRight: "4px" }}>First </small>
            {classTypeInfo?.minimumParticipant}
            guests
          </p>
          <Flex
            container
            flexDirection="column"
            alignItems="flex-end"
            justifyContent="space-between"
          >
            <p>${classTypeInfo?.minimumBookingAmount}</p>
            {classTypeInfo?.discount && (
              <small style={{ color: theme.colors.tertiaryColor }}>
                {classTypeInfo?.discount}% off
              </small>
            )}
          </Flex>
        </Flex>
      </div>
      {priceBreakDown?.ranges.map((range, index) => {
        return (
          <div className="modal-content-div" key={index}>
            <Flex container alignItems="center" justifyContent="space-between">
              <p>
                {range?.from}-{range?.to} guests
              </p>
              <Flex
                container
                flexDirection="column"
                alignItems="flex-end"
                justifyContent="space-between"
              >
                <p>
                  <small style={{ marginRight: "4px" }}>additional</small>$
                  {range?.price}
                  <small style={{ marginLeft: "4px" }}>per person</small>
                </p>

                <small style={{ color: theme.colors.tertiaryColor }}>
                  {(
                    ((pricePerPerson - range?.price) / pricePerPerson) *
                    100
                  ).toFixed(2)}
                  % off
                </small>
              </Flex>
            </Flex>
          </div>
        );
      })}
    </Wrap>
  );
}
