import styled, { css } from 'styled-components'

export const Wrapper = styled.aside`
   height: 100%;
   padding: 0 12px 12px 12px;
   border-right: 1px solid #e7e7e7;
   border-left: 1px solid #e7e7e7;
`

export const StyledMode = styled.div`
   height: 40px;
   display: flex;
   align-items: center;
   justify-content: space-between;
   border-bottom: 1px solid #ececec;
`

export const StyledHeader = styled.header`
   height: 32px;
   display: flex;
   align-items: center;
   border-bottom: 1px solid #ececec;
   h3 {
      font-weight: 500;
      font-size: 14px;
      line-height: 14px;
      color: #555b6e;
   }
`

export const StyledButton = styled.button(
   ({ disabled }) => css`
      color: #fff;
      height: 32px;
      border: none;
      padding: 0 12px;
      cursor: pointer;
      margin-right: 16px;
      border-radius: 6px;
      background: #53c22b;
      ${disabled &&
      css`
         color: #7b6a6a;
         background: #e7e8e7;
         cursor: not-allowed;
      `}
   `
)

export const StyledStat = styled.div(
   ({ status }) => css`
      display: flex;
      margin: 12px 0;
      align-items: center;
      justify-content: space-between;
      span {
         :first-child {
            color: #a7a8a6;
            display: block;
            font-size: 14px;
            font-weight: 400;
         }
         :last-child {
            color: #fff;
            display: block;
            font-size: 14px;
            font-weight: 500;
            padding: 3px 6px;
            border-radius: 3px;
            background: ${status === 'PENDING' ? '#FF5A52' : '#53C22B'};
         }
      }
   `
)

export const StyledSection = styled.section`
   display: flex;
   margin: 4px 0;
   align-items: flex-start;
   justify-content: space-between;
   span:first-child {
      flex: 1;
      color: #9aa5ab;
      font-size: 14px;
      font-weight: 500;
      margin-right: 16px;
      letter-spacing: 0.6px;
      text-transform: uppercase;
   }
   span:last-child {
      text-align: right;
   }
`
