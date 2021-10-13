import React, { useEffect } from 'react'
import { Modal } from 'antd'
import { theme } from '../../theme'
import { CrossIcon } from '../Icons'
import Button from '../Button'
import { ModalDiv, StyledTitle } from './styles'

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
      <Modal
         title={<ModalTitle title={props?.title || 'Welcome'} />}
         visible={props.isOpen}
         onOk={actionHandler}
         onCancel={close}
         width={props?.width || 780}
         height={props?.height || 520}
         // {...props}
      >
         {children}
      </Modal>

      // <ModalDiv
      //    id="modall"
      //    {...props}
      //    className={type.concat(
      //       props.isOpen ? ` ${type}_open` : ` ${type}_close`
      //    )}
      // >
      //    <div className="modal-header">
      //       <button className={closeButtonType} onClick={close}>
      //          <CrossIcon size="32" color={theme.colors.textColor} />
      //       </button>
      //       {showActionButton && (
      //          <Button
      //             className="actionBtn"
      //             disabled={disabledActionButton}
      //             onClick={actionHandler}
      //          >
      //             {actionButtonTitle}
      //          </Button>
      //       )}
      //    </div>
      //    <div className="modal-body">{children}</div>
      // </ModalDiv>
   )
}

const ModalTitle = ({ title }) => <StyledTitle>{title}</StyledTitle>
