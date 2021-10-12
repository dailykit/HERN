import styled from 'styled-components'
import { theme } from '../../theme'
export const StyledInput = styled.input`
   width: 100%;
   height: 48px;
   background: ${theme.colors.textColor4};
   border-radius: 8px;
   border: none;
   padding: 16px;
   font-size: ${theme.sizes.h9};
   &::placeholder {
      color: ${theme.colors.textColor7};
   }
   &:focus {
      border: 1px solid ${theme.colors.textColor};
   }
`
export const StyledTextArea = styled.textarea`
   width: 100%;
   border-radius: 8px;
   border: none;
   padding: 16px;
   height: 96px;
   &::placeholder {
      color: ${theme.colors.textColor7};
   }
   &:focus {
      border: 1px solid ${theme.colors.textColor};
   }
`

export const CheckboxContainer = styled.div`
   display: inline-block;
   vertical-align: middle;
`

export const Icon = styled.svg`
   fill: none;
   stroke: white;
   stroke-width: 2px;
`
// Hide checkbox visually but remain accessible to screen readers.
// Source: https://polished.js.org/docs/#hidevisually
export const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
   border: 0;
   clip: rect(0 0 0 0);
   clippath: inset(50%);
   height: 1px;
   margin: -1px;
   overflow: hidden;
   padding: 0;
   position: absolute;
   white-space: nowrap;
   width: 1px;
`

export const StyledCheckbox = styled.div`
   display: inline-block;
   width: ${({ customWidth }) => customWidth || '16px'};
   height: ${({ customHeight }) => customHeight || '16px'};
   background: ${({ checked }) =>
      checked ? theme.colors.secondaryColor : theme.colors.textColor8};
   border: ${({ border }) => (border ? border : 'none')};
   border-radius: 3px;
   transition: all 150ms;

   ${Icon} {
      visibility: ${props => (props.checked ? 'visible' : 'hidden')};
   }
`
