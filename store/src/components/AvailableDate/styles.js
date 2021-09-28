import styled from "styled-components";
import { theme } from "../../theme";

export const Wrapper = styled.div`
  width: 100%;
  margin: 1rem 0;
  .flexWrapper {
    display: "flex";
    flex-direction: column;
    border-bottom: 1px solid ${theme.colors.textColor4};
  }
  .date {
    font-size: ${theme.sizes.h8};
    font-weight: 600;
    color: ${theme.colors.textColor4};
    margin-bottom: 12px;
    text-align: left;
  }
  .custom-slot-Btn {
    height: 48px;
    width: auto;
    text-transform: none;
    font-weight: 600;
    padding: 0 1rem;
    &:active {
      animation: scale-down-center 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)
        both;
      @keyframes scale-down-center {
        0% {
          -webkit-transform: scale(1);
          transform: scale(1);
        }
        100% {
          -webkit-transform: scale(0.5);
          transform: scale(0.8);
        }
      }
    }
    .spanText {
      font-size: ${theme.sizes.h7};
      font-weight: 300;
      font-style: italic;
      color: ${theme.colors.textColor4};
      margin-right: 4px;
    }
    .time {
      font-size: ${theme.sizes.h8};
      font-weight: 500;
      color: ${theme.colors.textColor4};
    }
  }
  .time-info {
    font-size: ${theme.sizes.h6};
    font-weight: 500;
    color: ${theme.colors.textColor4};
    text-transform: capitalize;
  }
  .slot-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 1rem;
  }
`;
