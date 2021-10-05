import React, { useEffect, useState } from 'react'
import { ComboButton, ClearIcon, Flex } from '@dailykit/ui'
import { webRenderer } from '@dailykit/web-renderer'
import Styles from './styles'
import TreeView from './treeView'
import { useBottomBar } from '../../providers'
import { useOnClickOutside } from './useOnClickOutSide'
import { get_env } from '../../utils'
import CancelIcon from '../../assets/icons/Cancel'
import styled from 'styled-components'

export default function Modal({
   isOpen,
   setIsModalOpen,
   setIsOpen,
   bottomBarRef,
   handleMenuItemClick,
   isContentOpen,
   setIsContentOpen,
   filePaths,
   cssPaths,
   jsPaths,
   setJsPaths,
   setCssPaths,
   setfilePaths,
   hasAction,
   deleteNavigationMenuId,
   deleteOptionId,
   navigationMenuItemId,
}) {
   const { state = {}, removeClickedOptionInfo } = useBottomBar()
   const [optionMenu, setOptionMenu] = useState({})
   const ref = React.useRef()
   const contentRef = React.useRef()

   useOnClickOutside([ref, bottomBarRef, contentRef], () => {
      setIsModalOpen(false)
      // setIsOpen(null)
      removeClickedOptionInfo()
      deleteOptionId('optionId')
      deleteNavigationMenuId('navigationMenuItemId')
   })

   useEffect(() => {
      if (state?.clickedOptionMenu) {
         setOptionMenu(state?.clickedOptionMenu)
      }
   }, [state?.clickedOptionMenu])

   useEffect(() => {
      document.getElementById('content_area').innerHTML = ''
   }, [state])

   useEffect(() => {
      if (filePaths.length) {
         document.getElementById('content_area').innerHTML = ''
         webRenderer({
            type: 'file',
            config: {
               uri: get_env('REACT_APP_DATA_HUB_URI'),
               adminSecret: get_env('REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'),
               expressUrl: get_env('REACT_APP_EXPRESS_URL'),
            },
            fileDetails: [
               {
                  elementId: 'content_area',
                  filePath: filePaths,
                  csspath: cssPaths,
                  jsId: jsPaths,
               },
            ],
         })
      }
      return () => {
         document.getElementById('content_area').innerHTML = ''
      }
   }, [filePaths])

   useEffect(() => {
      if (!isOpen) {
         setfilePaths([])
         setCssPaths([])
         setJsPaths([])
      }
   }, [isOpen])

   const hasContent =
      ((filePaths?.length > 0 || cssPaths?.length > 0 || jsPaths?.length > 0) &&
         isContentOpen) ||
      (isContentOpen && hasAction)

   return (
      // <StyledWrapper>
      <Styles.ModalWrapper show={isOpen} hasContent={hasContent} id="modal">
         <Styles.ContentArea
            hasContent={hasContent}
            isContentOpen={isContentOpen}
            ref={contentRef}
            id="content area"
         >
            <StyledButton
               onClick={() => {
                  deleteNavigationMenuId('navigationMenuItemId')
                  setIsContentOpen(false)
                  deleteOptionId('optionId')
               }}
            >
               <CancelIcon />
            </StyledButton>

            {/* <ComboButton
               type="solid"
               variant="secondary"
               size="sm"
               onClick={() => {
                  deleteNavigationMenuId('navigationMenuItemId')
                  setIsContentOpen(false)
               }}
            >
               Close
            </ComboButton> */}
            <div id="content_area" />
         </Styles.ContentArea>
         <Styles.MenuArea ref={ref} hasContent={hasContent} id="menuarea">
            <Styles.MenuAreaHeader id="menuheader">
               <Flex
                  container
                  alignItems="center"
                  justifyContent="center"
                  width="100%"
               >
                  <h2>{optionMenu?.title || 'Title'}</h2>
                  <Styles.CloseButton onClick={() => setIsModalOpen(null)}>
                     <ClearIcon color="#fff" />
                  </Styles.CloseButton>
               </Flex>
               <p>{optionMenu?.description || 'Description'}</p>
            </Styles.MenuAreaHeader>
            <Styles.MenuBody id="menubody">
               <TreeView
                  data={optionMenu?.navigationMenuItems}
                  clickHandler={handleMenuItemClick}
                  navigationMenuItemId={navigationMenuItemId}
               />
            </Styles.MenuBody>
         </Styles.MenuArea>
      </Styles.ModalWrapper>
      // </StyledWrapper>
   )
}

const StyledButton = styled.button`
   position: relative;
   right: 10px;
   top: -4px;
   background: transparent;
   border: none;
`
const StyledWrapper = styled.div`
   position: relative;
   top: 0;
   display: flex;
   flex-direction: row-reverse;
   margin-left: -170vh;
   margin-top: -95px;
   backdrop-filter: blur(60px);

    {
      /* filter: blur(1px); */
   }
`
