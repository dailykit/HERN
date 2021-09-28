import styled from "styled-components";
import { theme } from "../../../../theme";

export const OptionDiv = styled.div`
  .slot-div {
    padding: 1rem;
    margin: 1rem;
    background: ${theme.colors.mainBackground};
    box-shadow: -3px 3px 6px rgba(21, 23, 30, 0.2),
      3px -3px 6px rgba(21, 23, 30, 0.2), -3px -3px 6px rgba(45, 51, 66, 0.9),
      3px 3px 8px rgba(21, 23, 30, 0.9), inset 1px 1px 2px rgba(45, 51, 66, 0.3),
      inset -1px -1px 2px rgba(21, 23, 30, 0.5);
    border-radius: 12px;
  }
  .slots-wrapper {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .slot-info-time {
    font-size: ${theme.sizes.h8};
    font-weight: 500;
    color: ${theme.colors.textColor4};
  }
  .vote-head {
    font-size: ${theme.sizes.h8};
    font-weight: 500;
    color: ${theme.colors.textColor};
    background: none;
    border: none;
    position: relative;
    text-decoration: none;
    padding: 4px 0;

    &:after {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      margin: auto;
      width: 0;
      content: "";
      color: ${theme.colors.textColor};
      background: ${theme.colors.textColor};
      height: 1px;
    }
    &:hover {
      cursor: pointer;
      &:after {
        width: 100%;
      }
    }
  }
  .vote-head,
  .vote-head:before,
  .vote-head:after {
    transition: all 560ms;
  }
  .booking-div {
    display: flex;
    align-items: center;
    justify-content: center;
    .book-slot {
      text-align: center;
      font-weight: 800;
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.tertiaryColor};
      text-transform: uppercase;
      cursor: pointer;
      background: none;
      border: none;
      display: block;
      &:disabled {
        cursor: not-allowed;
        opacity: 0.4;
      }
    }
  }

  .voters-div {
    padding: 1rem 2rem;
    margin-bottom: 1rem;
    .heading-h1 {
      font-weight: 600;
      font-size: ${theme.sizes.h3};
      color: ${theme.colors.textColor};
      margin-bottom: 1rem;
      position: sticky;
      top: 0;
      background: ${theme.colors.mainBackground};
    }
    .voter-info {
      font-size: ${theme.sizes.h8};
      color: ${theme.colors.textColor4};
      display: flex;
      justify-content: space-between;
      margin: 1rem 0;
      span {
        margin-right: 4px;
      }
    }
  }
`;
export const VotersDiv = styled.div`
  padding: 1rem 2rem;
  margin-bottom: 1rem;
  .heading-h1 {
    font-weight: 600;
    font-size: ${theme.sizes.h3};
    color: ${theme.colors.textColor};
    margin-bottom: 1rem;
    position: sticky;
    top: 0;
    background: ${theme.colors.mainBackground};
  }
  .voter-info {
    font-size: ${theme.sizes.h8};
    color: ${theme.colors.textColor4};
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
    span {
      margin-right: 4px;
    }
  }
`;
