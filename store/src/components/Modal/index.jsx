import React from 'react'
import Button from '../Button'
import { ModalContainer, StyledTitle } from './styles'

export default function ModalComp({
   children,
   type = 'popup',
   close,
   closeButtonType = 'cross',
   showActionButton = false,
   disabledActionButton = false,
   actionHandler,
   actionButtonTitle,
   ...props
}) {
   return (
      <ModalContainer
         title={<StyledTitle>{props?.title || 'Welcome'}</StyledTitle>}
         visible={props.isOpen}
         onOk={actionHandler}
         onCancel={close}
         width={props?.width || 780}
         bodyStyle={{
            maxHeight: props?.height || '520px',
            overflowY: 'auto'
         }}
         footer={
            showActionButton ? (
               <Button
                  className="actionBtn"
                  onClick={actionHandler}
                  disabled={disabledActionButton}
               >
                  {actionButtonTitle}
               </Button>
            ) : null
         }
         closable={props?.closable || true}
      >
         {children}
      </ModalContainer>
   )
}
