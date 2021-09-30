import styled, { css } from 'styled-components'

export const Actions = styled.div(
   () => css`
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
   `
)

export const Action = styled.div(
   () => css`
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      width: 16px;
      height: 16px;
      margin: 4px;
   `
)

export const ActionDropdown = styled.div(
   () => css`
      font-weight: 400;
      font-size: 16px;
      color: #717171;
      line-height: 19px;
      font-style: Roboto;
      margin: 2px 2px;
      padding: 2px 2px;
      :hover {
         background: #717171;
         color: #fff;
      }
   `
)

export const Body = styled.div(
   () => css`
      display: flex;
      flex-direction: row;
      align-items: center;
      min-height: 84px;
      justify-content: space-around;
      div:first-child {
         border-right: 1px solid #e3e8ee;
         justify-content: center;
      }
      div + div {
         div:first-child {
            border: none;
         }
      }
      div:only-child {
         border: none;
         justify-content: flex-start;
      }
   `
)

export const Chart = styled.div(
   () => css`
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      justify-content: flex-start;
      flex-direction: column;
   `
)

export const Counts = styled.div(
   () => css`
      display: flex;
      align-items: center;
      flex-direction: row;
      width: 100%;
      span {
         display: flex;
         align-items: baseline;
         padding: 4px 4px;
         margin: 4px 4px;
         flex: 1;
      }
      span + span {
         border-left: 1px solid #e3e8ee;
      }
      span:only-child {
         flex: unset;
         display: flex;
         align-items: baseline;
         span {
            margin: 4px 4px;
            padding: 1px 1px;
            margin-left: 7px;
         }
      }
   `
)

export const Count = styled.span(
   () => css`
      font-weight: 600;
      font-size: 40px;
      color: #1c455c;
      display: flex;
      justify-content: center;
      align-items: center;
   `
)

export const Head = styled.div(
   () => css`
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      padding: 4px 4px;
      margin: 4px 4px;
      height: 32px;
      margin-bottom: 6px;
      border-bottom: 1px solid #e3e8ee;
   `
)
export const SubCount = styled.span(
   ({ subCountColor }) => css`
      font-style: normal;
      font-weight: 600;
      font-size: 17px;
      line-height: 19px;
      display: flex;
      align-items: center;
      letter-spacing: 0.32px;
      color: ${subCountColor};
   `
)
export const Tiles = styled.section(
   () => css`
      display: flex;
      flex-wrap: wrap;
      position: relative;
      width: calc(100% + 8px);
   `
)
export const Tile = styled.div(
   ({ hasChart }) => css`
      ${
         '' /* width: 340px;
      border: 1px solid #e3e8ee;
      box-sizing: border-box;
      border-radius: 2px;
      margin: 8px;
      flex-grow: 1; */
      }
      display: inline-block;
      margin-right: 8px;
      margin-bottom: 8px;
      min-height: 132px;
      text-align: center;
      border: 1px solid #e3e8ee;
      flex: 0 0 calc(33.33% - 8px);
      flex-grow: 1;
      max-width: ${hasChart ? '50%' : 'calc(33.33% - 8px)'};
   `
)
