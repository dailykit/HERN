import styled, { css } from 'styled-components'

export const StyledButton = styled.button(
   ({ type, bg, mr }) => css`
      width: auto;
      height: 40px;
      padding: 0 16px;
      font-weight: 500;
      cursor: pointer;
      text-transform: uppercase;
      ${mr && `margin-right: ${mr}px;`};
      ${type === 'solid'
         ? css`
              color: #fff;
              border: none;
              background: ${bg === 'blue'
                 ? 'linear-gradient(180deg, #28C1F7 -4.17%, #00A7E1 100%)'
                 : '#53c22b'};
           `
         : css`
              border: 1px solid #ebebeb;
              background: transparent;
              :hover {
                 color: #fff;
                 border: none;
                 background: ${bg === 'blue'
                    ? 'linear-gradient(180deg, #28C1F7 -4.17%, #00A7E1 100%)'
                    : '#53c22b'};
              }
           `}
   `
)
