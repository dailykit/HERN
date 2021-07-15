import { Avatar, IconButton } from '@dailykit/ui'
import styled from 'styled-components'

export const Wrapper = styled.div`
   display: flex;
   align-items: center;
   justify-content: space-evenly;
   height: 42px;
   padding: 0px 14px 0px 20px;
   background: linear-gradient(135deg, #ffffff 0%, #f1f0ef 100%);
   box-shadow: -8px 8px 16px rgba(191, 191, 190, 0.2),
      8px -8px 16px rgba(191, 191, 190, 0.2),
      -8px -8px 16px rgba(255, 255, 255, 0.9),
      8px 8px 20px rgba(191, 191, 190, 0.9),
      inset 1px 1px 2px rgba(255, 255, 255, 0.3),
      inset -1px -1px 2px rgba(191, 191, 190, 0.5);
   border-radius: 0px 0px 0px 24px;
   > button {
      border: none;
      outline: none;
      :first-child {
         border-radius: 0px 0px 0px 24px;
      }
      :last-child {
         padding-left: 20px;
         > img {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 2px solid #e3e3e3;
         }
      }
   }
   @media only screen and (max-width: 767px) {
      display: none;
   }
`

export const StyledAvatar = styled(Avatar)`
   height: 24px;
   width: 24px;
   font-size: 12px;
   cursor: pointer;
   border: ${({ open }) => (open ? '2px solid #367BF5' : '1px solid #E3E3E3')};
`
export const ToolbarMenu = styled(IconButton)`
   display: none;
   background: linear-gradient(135deg, #ffffff 0%, #f1f0ef 100%);
   box-shadow: -8px 8px 16px rgba(191, 191, 190, 0.2),
      8px -8px 16px rgba(191, 191, 190, 0.2),
      -8px -8px 16px rgba(255, 255, 255, 0.9),
      8px 8px 20px rgba(191, 191, 190, 0.9),
      inset 1px 1px 2px rgba(255, 255, 255, 0.3),
      inset -1px -1px 2px rgba(191, 191, 190, 0.5);
   height: 42px;
   width: 50px;
   border-radius: 0px 0px 0px 24.8921px;
   outline: none;
   @media only screen and (max-width: 767px) {
      display: block;
   }
`
