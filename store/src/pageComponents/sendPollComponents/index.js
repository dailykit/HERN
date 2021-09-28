import React from "react";
import styled from "styled-components";
import FooterButton from "./FooterButton";
import PollDeadline from "./PollDeadline";
import { ChevronLeft, SEO } from "../../components";
import { SelectClass } from "../../components/Booking/components";
import { theme } from "../../theme";
import { useWindowDimensions } from "../../utils";

import { usePoll } from "../../Providers";

export default function SendPollComp({ experienceId }) {
  console.log("SendPollComp", experienceId);
  const { width } = useWindowDimensions();
  const { state: pollState, previousPollingSteps } = usePoll();
  const { pollingStepsIndex } = pollState;

  return (
    <Wrapper>
      {pollingStepsIndex === 1 && (
        <span
          className="previousBtn"
          onClick={() => previousPollingSteps(pollingStepsIndex)}
        >
          <ChevronLeft size={theme.sizes.h4} color={theme.colors.textColor4} />
        </span>
      )}
      {/* booking type form */}
      {pollingStepsIndex === 0 && (
        <SelectClass
          experienceBookingId={null}
          experienceId={experienceId}
          isMulti={true}
        />
      )}
      {/* add participants form  */}
      {pollingStepsIndex === 1 && <PollDeadline />}

      {/* footer  */}
      <FooterButton />
    </Wrapper>
  );
}

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 1rem;
  margin-bottom: 2rem;
  overflow-y: auto;
  position: relative;
  .modal-content-div {
    font-size: ${theme.sizes.h8};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    background: ${theme.colors.mainBackground};
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-sizing: border-box;
    border-radius: 4px;
    padding: 1rem;
    margin: 1rem;
    small {
      font-size: ${theme.sizes.h12};
    }
  }
  .top-heading {
    font-size: ${theme.sizes.h3};
    font-weight: 400;
    color: ${theme.colors.textColor4};
    text-transform: uppercase;
    margin-bottom: 28px;
    text-align: center;
  }
  .heading {
    font-size: ${theme.sizes.h8};
    font-weight: 700;
    color: ${theme.colors.textColor4};
    text-transform: uppercase;
    margin-bottom: 20px;
    text-align: center;
  }
  .customBtn {
    margin-left: 8px;
    height: 48px;
    text-transform: none;
    font-weight: 600;
  }
  .customAddressBtn {
    height: 38px;
    text-transform: none;
    font-weight: 600;
    width: auto;
    padding: 0 1rem;
  }
  .customAddressInput {
    margin-bottom: 1rem;
    color: ${theme.colors.textColor4};
  }
  .address-head {
    font-size: ${theme.sizes.h6};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    margin: 1rem;
    text-align: left;
  }
  .showAll {
    font-size: ${theme.sizes.h7};
    font-weight: 200;
    font-style: italic;
    color: ${theme.colors.textColor4};
  }
  .calendarSpan {
    background: ${theme.colors.mainBackground};
    box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
      3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
      3px 3px 8px rgba(21, 23, 30, 0.9), inset 1px 1px 2px rgba(45, 51, 66, 0.3),
      inset -1px -1px 2px rgba(21, 23, 30, 0.5);
    border-radius: 4px;
    padding: 8px;
  }
  .footerNextBtnWrapper {
    display: flex;
    align-items: center;
    position: absolute;
    bottom: 2px;
    left: 0;
    z-index: 5;
    width: 100%;
    background: ${theme.colors.mainBackground};
    padding: 1rem;
  }
  .nextBtn {
    height: 48px;
    font-size: ${theme.sizes.h8};
    padding: 0 8px;
  }
  .previousBtn {
    margin: 0;
    position: -webkit-sticky;
    position: sticky;
    top: -1px;
    cursor: pointer;
  }
  .availableDate {
    height: 100%;
    overflow: auto;
  }
  .minHead {
    font-size: ${theme.sizes.h7};
    font-weight: 500;
  }
  .guest {
    font-size: ${theme.sizes.h8};
    font-weight: normal;
    display: inline-block;
  }
  .minCost {
    margin-left: 4px;
    display: inline-block;
    font-size: ${theme.sizes.h4};
    font-weight: normal;
  }
  .normal-p {
    margin: 0 1rem;
    font-size: ${theme.sizes.h6};
    color: ${theme.colors.textColor4};
    line-height: ${theme.sizes.h3};
  }
  .change-head {
    color: ${theme.colors.textColor};
    cursor: pointer;
  }

  @media (min-width: 769px) {
    .footerNextBtnWrapper {
      position: sticky;
    }
  }
`;
