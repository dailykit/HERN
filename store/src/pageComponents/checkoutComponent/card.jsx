import React, { useState } from "react";
import { CardWrapper } from "./styles";
import { ChevronDown, ChevronRight } from "../../components";
import { getMinute } from "../../utils";
import { theme } from "../../theme";

export default function Card({ experienceInfo }) {
  const [showBilling, setShowBilling] = useState(false);
  return (
    <CardWrapper>
      <div className="experience-info">
        <img src={experienceInfo?.assets?.images[0]} alt="experince-img" />
        <div className="experience-details">
          <p>
            Duration: {getMinute(experienceInfo?.experienceClass?.duration)}{" "}
            mins
          </p>
          <p>{experienceInfo?.title}</p>
        </div>
      </div>

      <div className="price-details">
        <h2>Price details</h2>
        <div className="estimate-billing-div">
          <span
            className="billing-action"
            onClick={() => setShowBilling((prev) => !prev)}
          >
            See estimated billing
            {showBilling ? (
              <ChevronDown
                size={theme.sizes.h6}
                color={theme.colors.textColor}
              />
            ) : (
              <ChevronRight
                size={theme.sizes.h6}
                color={theme.colors.textColor}
              />
            )}
          </span>
          {showBilling && (
            <div class="estimated-billing-details">
              <table>
                <tr>
                  <td>Total Participants</td>
                  <td>{experienceInfo?.totalParticipants}</td>
                </tr>
                <tr>
                  <td>Total experience price</td>
                  <td>${experienceInfo?.totalExperiencePrice}</td>
                </tr>
                <tr>
                  <td>Total kit</td>
                  <td>{experienceInfo?.totalKit}</td>
                </tr>
                <tr>
                  <td>Total kit price</td>
                  <td>${experienceInfo?.totalKitPrice}</td>
                </tr>
                <tr>
                  <td>Overall total amount</td>
                  <td>${experienceInfo?.toPayByParent}</td>
                </tr>
              </table>
            </div>
          )}
        </div>
        <div className="pricing">
          <p>Minimum Booking Amount</p>
          <p>${experienceInfo?.balancePayment}</p>
        </div>
        <div className="pricing boldText">
          <p>Payable Now(USD)</p>
          <p>${experienceInfo?.balancePayment}</p>
        </div>
      </div>
    </CardWrapper>
  );
}
