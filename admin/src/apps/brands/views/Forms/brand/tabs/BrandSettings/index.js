import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import { Text, Filler, Loader } from '@dailykit/ui'
import { Flex } from '../../../../../../../shared/components'
import { Child, Styles, CollapsibleWrapper } from './styled'
import { SettingsCard } from './SettingsCard'
import { Card, Input } from 'antd'
import LinkFiles from '../../../../../../content/views/Forms/Page/ContentSelection/components/LinkFiles'
import { CloseIcon } from '../../../../../../../shared/assets/icons'

export const BrandSettings = () => {
   const params = useParams()
   const [allSettings, setAllSettings] = React.useState([])
   const [settings, setSettings] = React.useState([])
   const [active, setActive] = React.useState('')
   const [searchResult, setSearchResult] = React.useState([])
   const [isChangeSaved, setIsSavedChange] = React.useState(true)
   const [mode, setMode] = React.useState('saved')
   const [componentIsOnView, setIsComponentIsOnView] = React.useState([])
   const { Search } = Input

   const groupingBrandSettings = (array, key) => {
      return array.reduce((obj, item) => {
         let objKey = item[key].type
         if (!obj[objKey]) {
            obj[objKey] = []
         }
         obj[objKey].push(item)
         return obj
      }, {})
   }

   const { loading: loadingSettings, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         brandId: Number(params.id),
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { brands_brand_brandSetting = [] } = {},
         } = {},
      }) => {
         if (!isEmpty(brands_brand_brandSetting)) {
            setAllSettings(brands_brand_brandSetting)
            const result = groupingBrandSettings(
               brands_brand_brandSetting,
               'brandSetting'
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

   //for seraching brandSettings
   const onSearch = value => {
      const lowerCaseValue = value.toLowerCase()
      setSearchResult(
         allSettings.filter(item => {
            return item.brandSetting.identifier
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
                  Brand Settings&nbsp;
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
                                          href={`#${item?.brandSetting?.identifier}`}
                                       >
                                          <Child
                                             key={item?.brandSetting?.id}
                                             onClick={() =>
                                                setActive(
                                                   item?.brandSetting
                                                      ?.identifier
                                                )
                                             }
                                          >
                                             <div
                                                tabindex="1"
                                                className={
                                                   active ==
                                                      item?.brandSetting
                                                         ?.identifier ||
                                                      componentIsOnView.includes(
                                                         item?.brandSetting
                                                            ?.identifier
                                                      )
                                                      ? 'active-link identifier_name'
                                                      : 'identifier_name'
                                                }
                                             >
                                                {item?.brandSetting
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
                                 <a href={`#${item?.brandSetting?.identifier}`}>
                                    <Child
                                       key={item?.brandSetting?.id}
                                       onClick={() =>
                                          setActive(
                                             item?.brandSetting?.identifier
                                          )
                                       }
                                    >
                                       <div
                                          tabindex="1"
                                          className={
                                             active ==
                                                item?.brandSetting
                                                   ?.identifier ||
                                                componentIsOnView.includes(
                                                   item?.brandSetting?.identifier
                                                )
                                                ? 'active-link identifier_name'
                                                : 'identifier_name'
                                          }
                                       >
                                          {item?.brandSetting?.identifier || ''}
                                       </div>
                                    </Child>
                                 </a>
                              </>
                           )
                        })}
                     </NavComponent>
                  )
               ) : (
                  <Filler message="No brandSettings" width="80%" height="80%" />
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
                                       name={setting?.brandSetting?.identifier}
                                    ></a>
                                    <SettingsCard
                                       setting={setting}
                                       key={setting?.brandSetting?.id}
                                       title={setting?.brandSetting?.identifier}
                                       isChangeSaved={isChangeSaved}
                                       setIsSavedChange={setIsSavedChange}
                                       setIsComponentIsOnView={
                                          setIsComponentIsOnView
                                       }
                                       componentIsOnView={componentIsOnView}
                                       mode={mode}
                                       setMode={setMode}
                                    />
                                 </>
                              )
                           })}
                        </>
                     )
                  })}
            </Flex>
         </Styles.SettingWrapper>

         {/* linked component */}
         <Styles.LinkWrapper>
            <Card
               title={<Text as="h3">Link JS and CSS file</Text>}
               style={{ width: '100%' }}
            >
               <LinkFiles
                  title="Linked CSS files"
                  fileType="css"
                  entityId={params?.id}
                  scope="brand"
               />
               <LinkFiles
                  title="Linked JS files"
                  fileType="js"
                  entityId={params?.id}
                  scope="brand"
               />
            </Card>
         </Styles.LinkWrapper>
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
