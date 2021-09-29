import styled, { css } from 'styled-components'

export const CardContainer = styled.div(
   ({ bgColor, borderColor }) => css`
      display: flex;
      flex-direction: column;
      background: ${bgColor};
      border: 1px solid ${borderColor};
      box-sizing: border-box;
      border-radius: 20px;
      padding: 21px;
      width: 100%;
      @media (max-width: 768px) {
         padding: 15px;
         align-items: center;
      }
   `
)
export const Card = styled.div(
   ({ onClick }) => css`
      position: relative;
      ${'' /* margin: 4px; */}
      cursor: ${onClick ? 'pointer' : 'default'};
   `
)
export const Title = styled.div(
   () => css`
      margin-bottom: 15px;
      span {
         color: #8e8e8e;
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
      grid-template-columns: 220px 220px 220px 220px;
      grid-template-rows: 150px;
      grid-gap: 36px;
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
      span {
         font-family: Roboto;
         font-style: normal;
         font-weight: normal;
         font-size: 12px;
         line-height: 14px;
      }
   `
)
export const Value = styled.div(
   ({ string }) => css`
      margin: 0px 4px 3px 8px;
      padding: 0px 4px 0px 8px;
      p {
         height: 41px;
         margin: 0px;
         font-family: Roboto;
         font-style: normal;
         font-weight: 500;
         font-size: ${string ? '17px' : '35px'};
         width: 100%;
         line-height: ${string ? '20px' : '41px'};
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
   `
)
