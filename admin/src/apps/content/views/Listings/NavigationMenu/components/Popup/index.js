import React from 'react'
import { Modal } from './styles'

export default function Popup({ createMenuItemHandler, isPopupActive }) {
   return (
      <Modal isPopupActive={isPopupActive}>
         <div className="pointer" />
         <div className="modal-content">
            <ul className="action-list">
               <li className="action-list-item">
                  <button
                     type="button"
                     className="list-btn"
                     onClick={() => createMenuItemHandler('childItem')}
                  >
                     Add child item below
                  </button>
               </li>
               <li className="action-list-item">
                  <button
                     type="button"
                     className="list-btn"
                     onClick={() => createMenuItemHandler('rootItem')}
                  >
                     Add item below
                  </button>
               </li>
            </ul>
         </div>
      </Modal>
   )
}
