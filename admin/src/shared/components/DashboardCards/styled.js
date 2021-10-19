import styled, { css } from 'styled-components'

export const CardContainer = styled.div(
   ({ bgColor, borderColor }) => css`
      display: flex;
      flex-direction: column;
      border: 1px solid #f3f3f3;
      background: ${bgColor};
      // border: 1px solid ${borderColor};
      box-sizing: border-box;
      border-radius: 6px;
      padding: 0px 20px 20px 20px;
      margin-bottom: 20px;
      width: 100%;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
      @media (max-width: 768px) {
         padding: 15px;
         align-items: center;
      }
   `
)
export const Card = styled.div(
   ({ onClick }) => css`
      position: relative;
      top: 0px;
      left: 0px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      width: 280px;
      height: 120px;
      border-radius: 20px;
      background: #ffffff;
      box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.1);
      :hover {
         background: #f9f9f9;
         box-shadow: 0px 2px 6px rgba(0, 0, 0, 0.1);
      }
      ${'' /* margin: 4px; */}
      cursor: ${onClick ? 'pointer' : 'default'};
   `
)
export const Title = styled.div(
   () => css`
      margin-top: 16px;
      margin-bottom: 12px;
      span {
         color: #919699;
         font-family: Roboto;
         font-style: normal;
         font-weight: 500;
         font-size: 14px;
         margin: 4px;
         line-height: 16px;
      }
   `
)
export const Cards = styled.div(
   () => css`
      display: grid;
      grid-template-columns: 280px 280px 280px;
      grid-template-rows: 120px;
      // grid-gap: 36px;

      justify-content: space-between;
      @media (max-width: 768px) {
         display: flex;
         flex-direction: column;
      }
   `
)
export const Text = styled.div(
   () => css`
      margin: 0px 4px 8px 8px;
      padding: 0px 4px 12px 8px;
      position: relative;
      left: 86px;
      width: 182px;
      bottom: 5px;
      span {
         font-family: Roboto;
         font-style: normal;
         font-weight: normal;
         font-size: 12px;
         line-height: 14px;
         color: #202020;
      }
   `
)
export const Value = styled.div(
   ({ string }) => css`
      margin: 0px 4px 3px 8px;
      padding: 0px 2px 0px 2px;
      position: relative;
      width: 180px;
      left: 90px;
      p {
         height: 41px;
         margin: 0px;
         font-family: Roboto;
         font-style: normal;
         font-weight: 500;
         font-size: ${string ? '12px' : '28px'};
         width: 100%;
         line-height: ${string ? '14px' : '33px'};
         overflow: hidden;
      }
   `
)
export const AdditionalBox = styled.div(
   ({ justifyContent }) => css`
      display: flex;
      flex-direction: row;
      justify-content: ${justifyContent};
      align-items: center;
      margin: 0px 4px 4px 8px;
      padding: 0px 4px 4px 8px;
      position: relative;
      width: 93px;
      top: 75px;
   `
)
