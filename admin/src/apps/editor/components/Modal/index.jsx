import React from 'react'
import ReactDOM from 'react-dom'

import {
   StyledModal,
   ModalCard,
   Styledheader,
   StyledBody,
   StyledFooter,
} from './styles'

const modalContainer = document.getElementById('modal__container')

const Header = ({ children }) => {
   return <Styledheader>{children}</Styledheader>
}
const Body = ({ children }) => {
   return <StyledBody>{children}</StyledBody>
}
const Footer = ({ children }) => {
   return <StyledFooter>{children}</StyledFooter>
}

class Modal extends React.Component {
   constructor(props) {
      super(props)
      this.el = document.createElement('div')
   }
   static Header = Header
   static Body = Body
   static Footer = Footer
   componentDidMount() {
      modalContainer.appendChild(this.el)
   }
   componentWillUnmount() {
      modalContainer.removeChild(this.el)
   }
   render() {
      return ReactDOM.createPortal(
         <StyledModal>
            <ModalCard>{this.props.children}</ModalCard>
         </StyledModal>,
         this.el
      )
   }
}

export default Modal
