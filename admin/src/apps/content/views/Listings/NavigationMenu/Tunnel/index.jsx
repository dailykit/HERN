import React, { useState, useEffect, useContext, useRef } from 'react'
import {
   Flex,
   Form,
   Spacer,
   ComboButton,
   PlusIcon,
   TunnelHeader,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { TreeView } from '../components'
import { StyledWrapper, InputWrapper, StyledDiv, TunnelBody } from './styles'
import {
   NAVIGATION_MENU_INFO,
   UPDATE_NAVIGATION_MENU,
} from '../../../../graphql'
import BrandContext from '../../../../context/Brand'
import NavMenuContext from '../../../../context/NavMenu'
import { useNavbarMenu } from '../../../../context/Mutation'
import { useTabs } from '../../../../../../shared/providers'
import { logger, randomSuffix } from '../../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   Banner,
} from '../../../../../../shared/components'
import { createDataTree } from '../../../../utils/getTreeViewArray'

const NavigationMenuTunnel = ({ close }) => {
   const { createMenuItem } = useNavbarMenu()
   const { addTab, tab, setTabTitle, closeAllTabs } = useTabs()
   const [context, setContext] = useContext(BrandContext)
   const [navMenuContext, setNavMenuContext] = useContext(NavMenuContext)
   const { brandId } = context
   const prevBrandId = useRef(brandId)
   const [menuTitle, setMenuTitle] = useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [toggle, setToggle] = useState(false)
   const [customLoading, setCustomLoading] = useState(true)

   // form validation
   const validatePageName = (value, name) => {
      const text = value.trim()
      let isValid = true
      let errors = []
      if (name === 'menuTitle') {
         if (text.length < 2) {
            isValid = false
            errors = [...errors, 'Must have atleast two letters.']
         }
      } else {
         if (text.length < 1) {
            isValid = false
            errors = [...errors, 'Must have atleast one letters.']
         }
         if (!text.includes('/')) {
            isValid = false
            errors = [...errors, 'Invalid route!Must start with ' / '.']
         }
      }
      return { isValid, errors }
   }

   // Subscription
   const { loading: menuLoading, error: menuError } = useSubscription(
      NAVIGATION_MENU_INFO,
      {
         variables: {
            menuId: navMenuContext.menuId,
         },
         onSubscriptionData: async ({
            subscriptionData: {
               data: { brands_navigationMenuItem: menuItems = [] } = {},
            } = {},
         }) => {
            setMenuTitle({
               ...menuTitle,
               value: menuItems[0]?.navigationMenu?.title || tab?.title,
            })
            setToggle(menuItems[0]?.navigationMenu.isPublished)
            const treeData = await createDataTree({
               dataset: menuItems,
               rootIdKeyName: 'id',
               parentIdKeyName: 'parentNavigationMenuItemId',
            })
            setNavMenuContext({
               ...navMenuContext,
               menuItems: treeData,
            })
            setCustomLoading(false)
         },
      }
   )

   // Mutation for page publish toggle
   const [updateMenu] = useMutation(UPDATE_NAVIGATION_MENU, {
      onCompleted: () => {
         toast.success('Updated!')
         setTabTitle(menuTitle.value)
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   // toggle handler
   const updatetoggle = () => {
      const val = !toggle
      updateMenu({
         variables: {
            menuId: navMenuContext.menuId,
            _set: {
               isPublished: val,
            },
         },
      })
   }

   // create menu Item handler
   const createMenuItemHandler = () => {
      createMenuItem({
         variables: {
            label: `label-${randomSuffix()}`,
            navigationMenuId: navMenuContext.menuId,
         },
      })
   }

   // page name validation & update name handler
   const onBlur = e => {
      if (e.target.name === 'menuTitle') {
         setMenuTitle({
            ...menuTitle,
            meta: {
               ...menuTitle.meta,
               isTouched: true,
               errors: validatePageName(e.target.value, e.target.name).errors,
               isValid: validatePageName(e.target.value, e.target.name).isValid,
            },
         })
         if (
            validatePageName(e.target.value, e.target.name).isValid &&
            validatePageName(e.target.value, e.target.name).errors.length === 0
         ) {
            updateMenu({
               variables: {
                  menuId: navMenuContext.menuId,
                  _set: {
                     title: e.target.value,
                  },
               },
            })
         }
      }
   }

   const closeFunc = () => {
      setMenuTitle({
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      })
      close(1)
   }

   useEffect(() => {
      if (!tab) {
         addTab('Pages', '/content/pages')
      }
   }, [addTab, tab])

   if (brandId !== prevBrandId.current) {
      closeAllTabs()
   }

   if (menuLoading || customLoading) {
      return <InlineLoader />
   }
   if (menuError) {
      toast.error('Something went wrong hereee')
      logger(menuError)
   }
   return (
      <StyledWrapper>
         <TunnelHeader
            title={navMenuContext?.menuTitle || ''}
            close={() => closeFunc()}
            tooltip={
               <Tooltip identifier="subscriptionFold_linking_tunnelHeader" />
            }
         />
         <Banner id="content-app-nav-menu-edit-menu-tunnel-top" />
         <TunnelBody>
            <InputWrapper>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  padding="0 0 16px 0"
               >
                  <Form.Group>
                     <Flex container alignItems="flex-end">
                        <Form.Label htmlFor="name" title="Page Name">
                           Menu Title*
                        </Form.Label>
                        <Tooltip identifier="navigation_menu_info" />
                     </Flex>
                     <Form.Text
                        id="menuTitle"
                        name="menuTitle"
                        value={menuTitle.value}
                        placeholder="Enter the Page Name "
                        onBlur={onBlur}
                        onChange={e =>
                           setMenuTitle({
                              ...menuTitle,
                              value: e.target.value,
                           })
                        }
                     />
                     {menuTitle.meta.isTouched &&
                        !menuTitle.meta.isValid &&
                        menuTitle.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Flex container alignItems="center" height="100%">
                     <Spacer xAxis size="24px" />
                     <Form.Toggle
                        name="page_published"
                        onChange={updatetoggle}
                        value={toggle}
                     >
                        <Flex container alignItems="center">
                           Publish
                           <Tooltip identifier="navigation_menu_publish_info" />
                        </Flex>
                     </Form.Toggle>
                  </Flex>
               </Flex>

               <ComboButton
                  type="outline"
                  size="sm"
                  onClick={createMenuItemHandler}
               >
                  <PlusIcon />
                  Add menu item
               </ComboButton>
            </InputWrapper>
            <StyledDiv>
               <TreeView />
            </StyledDiv>
         </TunnelBody>
         <Banner id="content-app-nav-menu-edit-menu-tunnel-bottom" />
      </StyledWrapper>
   )
}

export default NavigationMenuTunnel
