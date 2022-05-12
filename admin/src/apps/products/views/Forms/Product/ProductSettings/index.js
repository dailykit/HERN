import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { PRODUCT } from '../../../../graphql'
import { Text, Filler, Loader } from '@dailykit/ui'
import { Flex } from '../../../../../../shared/components'
import { Child, Styles, CollapsibleWrapper } from './styled'
import { SettingsCard } from './SettingsCard'
import { Card, Input } from 'antd'
import {
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'

import { CloseIcon } from '../../../../../../shared/assets/icons'
import { BrandContext } from '../../../../../../App'
import BrandListing from '../components/BrandListing';

export const ProductSettings = () => {
   const params = useParams()
   const [allSettings, setAllSettings] = React.useState([])
   const [settings, setSettings] = React.useState([])
   const [active, setActive] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const [isChangeSaved, setIsSavedChange] = React.useState(true)
   const [mode, setMode] = React.useState('saved')
   const [saveAllSettings, setSaveAllSettings] = React.useState({})
   const [componentIsOnView, setIsComponentIsOnView] = React.useState([])
   const [alertShow, setAlertShow] = React.useState(false)

   const [brandContext] = React.useContext(BrandContext)
   const [brandListTunnel, openBrandListTunnel, closeBrandListTunnel] =
      useTunnel(1)
   const { Search } = Input

   React.useEffect(() => {
      if (brandContext.brandId == null) {
         openBrandListTunnel(1)
      }
   }, [brandContext.brandId])

   const groupingproductSettings = (array, key) => {
      return array.reduce((obj, item) => {
         let objKey = item[key].type
         if (!obj[objKey]) {
            obj[objKey] = []
         }
         obj[objKey].push(item)
         return obj
      }, {})
   }

   const { loading: loadingSettings, error } = useSubscription(PRODUCT.SETTING, {
      variables: {
         productId: Number(params.id),
         brandId: brandContext.brandId
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { products_product_productSetting = [] } = {},
         } = {},
      }) => {
         if (!isEmpty(products_product_productSetting)) {
            setAllSettings(products_product_productSetting)
            const result = groupingproductSettings(
               products_product_productSetting,
               'productSetting'
            )
            setSettings(result)
         } else {
            setSettings([])
         }
      },
   })

   if (error) {
      toast.error('Something went wrong')
   }

   const types = Object.keys(settings)
   if (loadingSettings) return <Loader />

   //for searching productSettings
   const onSearch = value => {
      const lowerCaseValue = value.toLowerCase()
      setSearchResult(
         allSettings.filter(item => {
            return item.productSetting.identifier
               .toLowerCase()
               .includes(lowerCaseValue)
         })
      )
   }



   return (
      <Styles.Wrapper>
         {/* navigation bar */}
         <Styles.SettingsWrapper>
            {/* heading */}
            <Flex padding="0px 0px 32px">
               <Text as="h3">
                  Product Settings&nbsp;
                  {settings.length > 0 && <span>({settings.length})</span>}
               </Text>
               <Search
                  placeholder="search settings"
                  onSearch={onSearch}
                  enterButton
               />
            </Flex>

            {/* (Navigation) types and identifiers */}
            <div className="settings_wrapper">
               {types.length > 0 ? (
                  searchResult.length < 1 ? (
                     types.map(type => {
                        return (
                           <NavComponent
                              key={type}
                              heading={
                                 type.charAt(0).toUpperCase() + type.slice(1)
                              }
                           >
                              {settings[type].map(item => {
                                 return (
                                    <>
                                       <a
                                          href={`#${item?.productSetting?.identifier}`}
                                       >
                                          <Child
                                             key={item?.productSetting?.id}
                                             onClick={() =>
                                                setActive(
                                                   item?.productSetting
                                                      ?.identifier
                                                )
                                             }
                                          >
                                             <div
                                                tabindex="1"
                                                className={
                                                   active ==
                                                      item?.productSetting
                                                         ?.identifier ||
                                                      componentIsOnView.includes(
                                                         item?.productSetting
                                                            ?.identifier
                                                      )
                                                      ? 'active-link identifier_name'
                                                      : 'identifier_name'
                                                }
                                             >
                                                {item?.productSetting
                                                   ?.identifier || ''}
                                             </div>
                                          </Child>
                                       </a>
                                    </>
                                 )
                              })}
                           </NavComponent>
                        )
                     })
                  ) : (
                     <NavComponent
                        heading={'Search Results'}
                        setSearchResult={setSearchResult}
                        searchResult={searchResult}
                     >
                        {searchResult.map(item => {
                           return (
                              <>
                                 <a href={`#${item?.productSetting?.identifier}`}>
                                    <Child
                                       key={item?.productSetting?.id}
                                       onClick={() =>
                                          setActive(
                                             item?.productSetting?.identifier
                                          )
                                       }
                                    >
                                       <div
                                          tabindex="1"
                                          className={
                                             active ==
                                                item?.productSetting
                                                   ?.identifier ||
                                                componentIsOnView.includes(
                                                   item?.productSetting?.identifier
                                                )
                                                ? 'active-link identifier_name'
                                                : 'identifier_name'
                                          }
                                       >
                                          {item?.productSetting?.identifier || ''}
                                       </div>
                                    </Child>
                                 </a>
                              </>
                           )
                        })}
                     </NavComponent>
                  )
               ) : (
                  <Filler message="No productSettings" width="80%" height="80%" />
               )}
            </div>
         </Styles.SettingsWrapper>

         {/* contain all settings middle-segment */}
         <Styles.SettingWrapper>
            <Flex>
               {types.length > 0 &&
                  types.map(type => {
                     return (
                        <>
                           <Text as="h2">
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                           </Text>
                           {settings[type].map(setting => {
                              return (
                                 <>
                                    <a
                                       name={setting?.productSetting?.identifier}
                                    ></a>
                                    <SettingsCard
                                       setting={setting}
                                       key={setting?.productSetting?.id}
                                       title={setting?.productSetting?.identifier}
                                       isChangeSaved={isChangeSaved}
                                       setIsSavedChange={setIsSavedChange}
                                       setIsComponentIsOnView={
                                          setIsComponentIsOnView
                                       }
                                       componentIsOnView={componentIsOnView}
                                       mode={mode}
                                       setMode={setMode}
                                       saveAllSettings={saveAllSettings}
                                       setSaveAllSettings={setSaveAllSettings}
                                       alertShow={alertShow}
                                       setAlertShow={setAlertShow}
                                       brandId={brandContext.brandId}
                                    />
                                 </>
                              )
                           })}
                        </>
                     )
                  })}
            </Flex>
         </Styles.SettingWrapper>
         <Tunnels tunnels={brandListTunnel}>
            <Tunnel popup={true} layer={1} size="md">
               <BrandListing
                  closeTunnel={closeBrandListTunnel}
               />
            </Tunnel>
         </Tunnels>
      </Styles.Wrapper>
   )
}

const NavComponent = ({ children, heading, setSearchResult, searchResult }) => (
   <CollapsibleWrapper>
      <Flex
         margin="10px 0"
         container
         alignItems="center"
         width="100%"
         className="collapsible_head"
         justifyContent="space-between"
      >
         <Text as="title" style={{ color: '#555B6E', padding: '8px' }}>
            {' '}
            {heading}{' '}
         </Text>
         {searchResult?.length >= 1 && (
            <button
               title={'clear'}
               onClick={() => setSearchResult([])}
               style={{
                  cursor: 'pointer',
                  border: 'none',
                  marginTop: '0.5rem',
               }}
            >
               <CloseIcon color="#000" size="24" />
            </button>
         )}
      </Flex>
      <Flex
         margin="10px 0"
         container
         flexDirection="column"
         className="nav_child"
      >
         {children}
      </Flex>
   </CollapsibleWrapper>
)
