import React from "react";
import styled, { css } from "styled-components";
import { Tabs, TabList, Tab, TabPanels, TabPanel } from "@reach/tabs";
import { theme } from "../../theme";

export const HorizontalTab = ({ children }) => {
  return <StyledTab>{children}</StyledTab>;
};

export const HorizontalTabs = styled(Tabs)`
  width: 100%;
  height: 100%;
`;
export const HorizontalTabList = styled(TabList)`
  display: flex;
  overflow-x: auto;
  padding: 0 20px 0 0;
  border-bottom: 2px solid rgba(0, 0, 0, 0.2);
`;
const StyledTab = styled(Tab)`
  border: none;
  height: 32px;
  min-width: fit-content;
  color: ${theme.colors.textColor2};
  font-size: ${theme.sizes.h8};
  font-weight: 700;
  margin-right: 14px;
  letter-spacing: 0.3px;
  background: transparent;
  border-bottom: 2px solid transparent;
  cursor: pointer;
  &[data-selected] {
    color: ${theme.colors.textColor};
    border-bottom: 2px solid ${theme.colors.textColor};
  }
`;
export const HorizontalTabPanels = styled(TabPanels)(
  () => css`
    overflow: hidden;
    height: calc(100% - 32px);
    :focus {
      outline: none;
    }
  `
);

export const HorizontalTabPanel = styled(TabPanel)`
  height: 100%;
  padding: 16px;
  overflow-y: auto;
  background: ${theme.colors.mainBackground};
  border-radius: 2px;
  :focus {
    outline: none;
  }
`;
