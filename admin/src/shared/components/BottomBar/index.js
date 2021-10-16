import React from 'react'
import { useBottomBar } from '../../providers'
import { getTreeViewArray } from '../../utils'
import Modal from '../Modal'
import Styles from './style'
import { useWindowSize } from '../../hooks/useWindowSize'
import { useLocation } from 'react-router'
import qs from 'query-string'
import useQueryParamState from './useQueryParamState'
import { useHistory } from 'react-router-dom'
import BackButton from '../TabBar/components/Tools/BackButton'

const BottomBar = ({ setIsOpen, isOpen, setOpen, setIsMenuOpen }) => {
   const history = useHistory()
   const [isModalOpen, setIsModalOpen] = React.useState(false)
   const bottomBarRef = React.useRef()
   const { width } = useWindowSize()
   const { search } = useLocation()
   const [isContentOpen, setIsContentOpen] = React.useState(false)
   const [hasAction, setHasAction] = React.useState(false)
   const [filePaths, setfilePaths] = React.useState([])
   const [cssPaths, setCssPaths] = React.useState([])
   const [jsPaths, setJsPaths] = React.useState([])

   const [optionId, setOptionId, deleteOptionId] =
      useQueryParamState('optionId')
   const [
      navigationMenuItemId,
      setNavigationMenuItemId,
      deleteNavigationMenuId,
   ] = useQueryParamState('navigationMenuItemId')

   const { state, addClickedOptionInfo, addClickedOptionMenuInfo } =
      useBottomBar()

   const handleBottomBarOptionClick = async option => {
      await addClickedOptionInfo(option)
      const treeData = await getTreeViewArray({
         dataset: option?.navigationMenu?.navigationMenuItems,
         rootIdKeyName: 'id',
         parentIdKeyName: 'parentNavigationMenuItemId',
      })
      await addClickedOptionMenuInfo({
         ...option?.navigationMenu,
         navigationMenuItems: treeData,
      })
      setIsModalOpen(true)
   }

   const getMenuItemAction = menuItem => {
      if (menuItem?.action?.actionTypeTitle === 'infoOverlay') {
         const { path, linkedCssFiles, linkedJsFiles } = menuItem?.action?.file
         const linkedCssPaths = linkedCssFiles.map(file => {
            return file.cssFile.path
         })
         const linkedJsPaths = linkedJsFiles.map(file => {
            return file.jsFile.path
         })
         setfilePaths([path])
         setCssPaths(linkedCssPaths)
         setJsPaths(linkedJsPaths)
         setIsContentOpen(true)
      } else {
         document.getElementById('content_area').innerHTML = ''
      }
   }

   const handleMenuItemClick = menuItem => {
      getMenuItemAction(menuItem)
      setNavigationMenuItemId(menuItem.id)
   }

   React.useEffect(() => {
      const searchedValue = qs.parse(search)
      const optionId = Number(searchedValue?.optionId)
      const navigationMenuItemId = Number(searchedValue?.navigationMenuItemId)

      if (optionId) {
         const [filtered] = state?.bottomBarOptions.filter(
            option => option.id === Number(optionId)
         )
         if (filtered) {
            handleBottomBarOptionClick(filtered)
            const [filteredNavMenuItem] =
               filtered?.navigationMenu?.navigationMenuItems.filter(
                  item => item.id === Number(navigationMenuItemId)
               )
            if (filteredNavMenuItem?.actionId && filteredNavMenuItem) {
               setHasAction(true)
               getMenuItemAction(filteredNavMenuItem)
            }
         }
      }
   }, [search])

   React.useEffect(() => {
      var element = document.getElementById('root')
      element.addEventListener('navigator', function (e) {
         const pathname = e.detail.pathname.replace('/apps', '')
         history.push({ pathname, search: e.detail.query })
      })
      return () =>
         element.removeEventListener('navigator', () => {
            console.log('unmount event listener......')
         })
   }, [])

   return (
      <>
         <Styles.Wrapper isModalOpen={state?.clickedOption} id="wrapper" isContentOpen={isContentOpen}>
            <Styles.OptionsWrapper
               ref={bottomBarRef}
               isModalOpen={state?.clickedOption}
            >
               <BackButton setOpen={setOpen} />
               <span style={{padding: '9px'}}>Help</span>

               {state?.bottomBarOptions.map(option => {
                  return (
                     <Styles.Option
                        key={option.id}
                        active={
                           isModalOpen &&
                           state?.clickedOption?.navigationMenu?.id ===
                              option?.navigationMenuId
                        }
                        onClick={() => {
                           handleBottomBarOptionClick(option)
                           setOptionId(option.id)
                           deleteNavigationMenuId('navigationMenuItemId')
                           setIsContentOpen(false)
                        }}
                     >
                        {option?.title || ''}
                     </Styles.Option>
                  )
               })}
            </Styles.OptionsWrapper>

            {state?.clickedOption && (
               <Modal
                  isOpen={null}
                  setIsOpen={null}
                  setIsModalOpen={setIsModalOpen}
                  bottomBarRef={bottomBarRef}
                  handleMenuItemClick={handleMenuItemClick}
                  isContentOpen={isContentOpen}
                  setIsContentOpen={setIsContentOpen}
                  filePaths={filePaths}
                  cssPaths={cssPaths}
                  jsPaths={jsPaths}
                  setJsPaths={setJsPaths}
                  setCssPaths={setCssPaths}
                  setfilePaths={setfilePaths}
                  hasAction={hasAction}
                  deleteNavigationMenuId={deleteNavigationMenuId}
                  deleteOptionId={deleteOptionId}
                  navigationMenuItemId={navigationMenuItemId}
               />
            )}
         </Styles.Wrapper>
      </>
   )
}

export default BottomBar
