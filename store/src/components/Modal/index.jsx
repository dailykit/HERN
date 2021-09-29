import React, { useEffect } from 'react'
import { theme } from '../../theme'
import { CrossIcon } from '../Icons'
import Button from '../Button'
import { ModalDiv } from './styles'

export default function Modal({
   children,
   type,
   close,
   showActionButton = false,
   disabledActionButton = false,
   actionHandler,
   actionButtonTitle,
   ...props
}) {
   // useEffect(() => {
   //   if (props.isOpen) {
   //     document.body.scrollTop = "4rem";
   //     document.documentElement.scrollTop = "4rem";
   //     document.body.style.overflowY = "hidden";
   //   } else {
   //     document.body.style.overflowY = "auto";
   //   }
   //   return () => (document.body.style.overflowY = "auto");
   // }, [props.isOpen]);
   return (
      <ModalDiv
         id="modall"
         {...props}
         className={type.concat(
            props.isOpen ? ` ${type}_open` : ` ${type}_close`
         )}
      >
         <div className="modal-header">
            <button className="closeBtn" onClick={close}>
               <CrossIcon size="18" color={theme.colors.textColor} />
            </button>
            {showActionButton && (
               <Button
                  className="actionBtn"
                  disabled={disabledActionButton}
                  onClick={actionHandler}
               >
                  {actionButtonTitle}
               </Button>
            )}
         </div>
         <div className="modal-body">{children}</div>
      </ModalDiv>
   )
}
