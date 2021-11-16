import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import {
   Text, Filler, IconButton,
   PlusIcon, Collapsible
} from '@dailykit/ui'
import {
   Flex, Tooltip
} from '../../../../../../../shared/components'
import { Child, Styles } from './styled'
import { SettingsCard } from './SettingsCard'

export const BrandSettings = () => {
   const params = useParams()
   const [setting, setSetting] = React.useState([])
   const [settings, setSettings] = React.useState([])
   const [typeActive, setTypeActive] = React.useState(null)

   const groupingBrandSettings = (array, key) => {
      return array.reduce((obj, item) => {
         let objKey = item[key].type;
         console.log(key, item)
         if (!obj[objKey]) {
            obj[objKey] = [];
         }
         obj[objKey].push(item);
         return obj;
      }, {});
   };

   const { loading: loadingSettings, error } = useSubscription(BRANDS.SETTING, {
      variables: {
         brandId: Number(params.id)
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brands_brand_brandSetting = [] } = {} } = {},
      }) => {
         if (!isEmpty(brands_brand_brandSetting)) {
            const result = groupingBrandSettings(brands_brand_brandSetting, 'brandSetting')
            setSettings(result)
         } else {
            setSettings([])
         }
      },
   })

   if (error) {
      toast.error('Something went wrong')
      console.log("error in Brands.Setting query", error)
   }
   const openConfig = data => {
      setSetting(data)
      console.log(data, "openConfig")
   }
   const types = Object.keys(settings)
   console.log(settings, types, "SETTINGS")
   return (
      <Styles.Wrapper>
         {/* contain all settings */}
         <Styles.SettingsWrapper>
            <Flex padding="0 8px 16px 8px">
               <Text as="h3">
                  Brand Settings&nbsp;
                  {settings.length > 0 && (
                     <span>({settings.length})</span>
                  )}
               </Text>
            </Flex>
            {types.length > 0 ? (
               types.map((type) => {
                  return (<CollapsibleComponent key={type} heading={(type).charAt(0).toUpperCase() + (type).slice(1)}>
                     {settings[type].map((item) => {
                        return (
                           <Child key={item.brandSetting.id}>
                              <div className="identifier_name">
                                 {item?.brandSetting?.identifier || ''}
                              </div>
                              <IconButton
                                 type="ghost"
                                 onClick={() => openConfig(item)}
                              >
                                 <PlusIcon color="#555b6e" size="20" />
                              </IconButton>
                           </Child>)
                     })}
                  </CollapsibleComponent>)
               }
               )) : (
               <Filler
                  message="No brandSettings"
                  width="80%"
                  height="80%"
               />
            )}
         </Styles.SettingsWrapper>
         {/* contain selected setting */}
         <Styles.SettingWrapper>
            <Flex>
               <SettingsCard setting={setting} key={setting?.brandSetting?.id} title={setting?.brandSetting?.identifier} />
            </Flex>
         </Styles.SettingWrapper>
      </Styles.Wrapper>
   )
}


const CollapsibleComponent = ({ children, heading }) => (
   <Collapsible
      isHeadClickable={true}
      head={
         <Flex
            margin="10px 0"
            container
            alignItems="center"
            justifyContent="center"
            width="100%"
         >
            <Text as="title" style={{ color: "#575b5d" }}> {heading} </Text>
         </Flex>
      }
      body={
         <Flex margin="10px 0" container flexDirection="column" alignItems="center">
            {children}
         </Flex>
      }
      defaultOpen={false}
      isDraggable={false}
   />
)