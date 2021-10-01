import React, { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useTabs } from '../../providers'
import { useWindowSize } from '../../hooks'
import { StyledTabs, HomeButton, StyledButton, TabsWrapper } from './styled'
import { DoubleArrowIcon, HomeIcon } from '../../assets/icons'
import ThreeDots from '../../assets/icons/ThreeDots'
import TabOption from './components/TabOption'
import { useOnClickOutside } from '@dailykit/ui'
import Tab from './components/Tab'

const Tabs = () => {
   const { pathname } = useLocation()
   const view = useWindowSize()
   const [open, setOpen] = useState(false)
   const { tabs } = useTabs()
   const [firstIndex, setFirstIndex] = useState(0)
   const [lastIndex, setLastIndex] = useState(0)
   const [numTabsToShow, setNumTabsToShow] = useState(0)

   const buttonRef = useRef()
   useOnClickOutside(buttonRef, () => setOpen(false))

   useEffect(() => {
      const tabWidth = 120
      const toolBarWidth = view.width > 767 ? 450 : 262
      const widthForTabs = Math.floor(view.width - toolBarWidth)

      if (view.width) {
         setFirstIndex(0)
         setNumTabsToShow(Math.floor(widthForTabs / tabWidth))
         setLastIndex(numTabsToShow)
      }

      if (tabs.length <= numTabsToShow) {
         setFirstIndex(0)
         setLastIndex(tabs.length)
      }
   }, [view.width, tabs.length, numTabsToShow])

   const handleTabForward = () => {
      if (lastIndex + numTabsToShow > tabs.length) {
         let tabsRemain = tabs.length - lastIndex
         setFirstIndex(lastIndex - (numTabsToShow - tabsRemain))
         setLastIndex(tabs.length)
      } else {
         setFirstIndex(lastIndex)
         setLastIndex(lastIndex + numTabsToShow)
      }
   }
   const handleTabPrev = () => {
      if (firstIndex <= numTabsToShow) {
         setFirstIndex(0)
         setLastIndex(numTabsToShow)
      } else {
         setFirstIndex(firstIndex - numTabsToShow)
         setLastIndex(lastIndex - numTabsToShow)
      }
   }

   const tabsToShow = tabs.slice(firstIndex, lastIndex)
   const getWidth = () => {
      if (view.width && view.width <= 767) {
         if (tabs.length <= 0) return '156px'
         if (
            firstIndex !== 0 &&
            numTabsToShow < tabs.length &&
            tabs.length !== lastIndex
         )
            return '262px'
         if (
            firstIndex !== 0 ||
            (numTabsToShow < tabs.length && tabs.length !== lastIndex)
         )
            return '227px'
         return '192px'
      } else {
         if (tabs.length <= 0) return '344px'
         if (
            firstIndex !== 0 &&
            numTabsToShow < tabs.length &&
            tabs.length !== lastIndex
         )
            return '450px'
         if (
            firstIndex !== 0 ||
            (numTabsToShow < tabs.length && tabs.length !== lastIndex)
         )
            return '365px'
         return '330px'
      }
   }

   const getWidthSm = () => {
      if (tabs.length <= 0) return '156px'
      if (
         firstIndex !== 0 &&
         numTabsToShow < tabs.length &&
         tabs.length !== lastIndex
      )
         return '262px'
      if (
         firstIndex !== 0 ||
         (numTabsToShow < tabs.length && tabs.length !== lastIndex)
      )
         return '227px'
      return '192px'
   }

   return (
      <TabsWrapper>
         {/* <HomeButton active={pathname === '/'} to="/">
            <HomeIcon color={pathname === '/' ? '#367BF5' : '#919699'} />
         </HomeButton> */}
         {tabs.length > 0 && (
            <>
               {firstIndex !== 0 && (
                  <button
                     onClick={() => handleTabPrev()} >
                     <DoubleArrowIcon direction="left" />
                  </button>
               )}
            </>
         )}
         <StyledTabs width={getWidth()}>
            {tabsToShow.map((tab, index) => (
               <Tab
                  tab={tab}
                  key={tab.path}
                  index={index}
                  numTabs={tabs.length}
               />
            ))}
         </StyledTabs>
         {tabs.length > 0 && (
            <>
               {numTabsToShow < tabs.length && tabs.length !== lastIndex && (
                  <button
                     onClick={() => handleTabForward()}>
                     <DoubleArrowIcon />
                  </button>
               )}
            </>
         )}
         {tabs.length > 0 && (
            <div ref={buttonRef}>
               <StyledButton
                  open={open}
                  size="sm"
                  type="ghost"
                  style={{ outline: 'none' }}
                  onClick={() => setOpen(!open)}
               >
                  <ThreeDots color={open ? '#367BF5' : '#45484C'} />
               </StyledButton>
               {open && <TabOption setOpen={setOpen} />}
            </div>
         )}
      </TabsWrapper>
   )
}

export default Tabs
