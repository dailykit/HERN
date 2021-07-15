import styled from 'styled-components'

const whatColor = type => {
   switch (type) {
      case 'primary':
         return '#28C1F7'
      case 'danger':
         return '#FF5A52'
      default:
         return '#28C1F7'
   }
}

export const Wrapper = styled.div`
   z-index: 10;
   position: absolute;
   top: 0;
   left: 0;
   right: 0;
   bottom: 0;
   display: ${props => (props.show ? 'flex' : 'none')};
   justify-content: center;
   align-items: center;
   background: rgba(0, 0, 0, 0.4);
`

export const StyledPopup = styled.div`
   background: #fff;
   border-radius: 8px;
   box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.15);
   padding: 20px;
   max-width: calc(100vw - 40px);
   text-align: left;
   width: ${props => props?.size || 'max-content'};
`

export const Text = styled.p`
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   margin-bottom: 16px;
   color: ${props => whatColor(props.type)};
`

export const ConfirmText = styled.p`
   font-weight: 500;
   font-size: 14px;
   line-height: 16px;
   margin-bottom: 16px;
   color: #555b6e;
`

export const Actions = styled.div`
   display: flex;
   justify-content: space-between;
`
