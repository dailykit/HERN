import styled from "styled-components";

export const Spacer = styled.div`
  height: ${({ yAxis }) => yAxis};
  width: ${({ xAxis }) => xAxis};
`;
