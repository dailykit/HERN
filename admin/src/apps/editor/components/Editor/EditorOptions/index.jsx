import React from 'react'
import PropTypes from 'prop-types'

// State
import { Context } from '../../../state'

// Components
import Modal from '../../Modal'

import { EditorOptionsWrapper } from './styles'

// Assets
import { HistoryIcon } from '../../../assets/Icons'

const EditorOptions = ({
   lastSaved,
   draft,
   publish,
   isBuilderOpen,
   language,
}) => {
   const { state, dispatch } = React.useContext(Context)
   const [isModalVisible, setIsModalVisible] = React.useState()
   const [isWebBuilderOpen, SetIsWebBuilderOpen] = React.useState(false)
   const [message, setMessage] = React.useState('')

   React.useEffect(() => {
      isBuilderOpen(isWebBuilderOpen)
   }, [isWebBuilderOpen])

   return (
      <EditorOptionsWrapper>
         {isModalVisible && (
            <Modal>
               <Modal.Header>
                  <span>Publish</span>
                  <button
                     onClick={() =>
                        setIsModalVisible(!isModalVisible) || setMessage('')
                     }
                  >
                     x
                  </button>
               </Modal.Header>
               <Modal.Body>
                  <label htmlFor="">Message</label>
                  <input
                     type="text"
                     value={message}
                     onChange={e => setMessage(e.target.value)}
                  />
               </Modal.Body>
               <Modal.Footer>
                  <button
                     onClick={() =>
                        setIsModalVisible(!isModalVisible) ||
                        setMessage('') ||
                        publish(message)
                     }
                  >
                     Confirm
                  </button>
                  <button
                     onClick={() =>
                        setIsModalVisible(!isModalVisible) || setMessage('')
                     }
                  >
                     Cancel
                  </button>
               </Modal.Footer>
            </Modal>
         )}
         <div id="left">
            {/* <button
                    className="btn__icon"
                    title="History"
                    onClick={() => dispatch({ type: 'TOGGLE_HISTORY_PANEL' })}
                >
                    <HistoryIcon color="#9a8484" />
                </button> */}
         </div>
         {lastSaved && (
            <div>
               <span>
                  Last Saved -{' '}
                  {new Intl.DateTimeFormat('en-US', {
                     month: 'short',
                     day: 'numeric',
                     hour: 'numeric',
                     minute: 'numeric',
                  }).format(
                     state.tabs[state.currentTab].lastSaved !== ''
                        ? state.tabs[state.currentTab].lastSaved
                        : lastSaved
                  )}
               </span>
            </div>
         )}
         <div id="right">
            {language === 'html' && (
               <button onClick={() => SetIsWebBuilderOpen(!isWebBuilderOpen)}>
                  {isWebBuilderOpen ? 'Open in Editor' : 'Open in web builder'}
               </button>
            )}
            <button onClick={() => draft()}>Save</button>
            <button onClick={() => setIsModalVisible(!isModalVisible)}>
               Publish
            </button>
         </div>
      </EditorOptionsWrapper>
   )
}

EditorOptions.propTypes = {
   publish: PropTypes.func,
   viewCurrentVersion: PropTypes.func,
}

export default EditorOptions
