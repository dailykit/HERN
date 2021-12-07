import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import {
   Text, Filler, IconButton,
   PlusIcon, Collapsible, Spacer, Loader
} from '@dailykit/ui'
import {
   Flex, Tooltip
} from '../../../../../../../shared/components'
import { Child, Styles, CollapsibleWrapper } from './styled'
import { SettingsCard } from './SettingsCard'
import { Card } from 'antd'
import LinkFiles from '../../../../../../content/views/Forms/Page/ContentSelection/components/LinkFiles'

export const BrandSettings = () => {
   const params = useParams()
   const [setting, setSetting] = React.useState([])
   const [settings, setSettings] = React.useState([])
   const [isChangeSaved, setIsSavedChange] = React.useState(true)

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
         subscriptionData: {
            data: { brands_brand_brandSetting = [] } = {},
         } = {},
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
      console.log("error in Brands.Setting", error)
   }
   const openConfig = data => {
      if (isChangeSaved) {
         setSetting(data)
      }
      else {
         toast.warning('Changes will be lost if not saved. Click on save button to save your changes.')
      }
   }
   const types = Object.keys(settings)
   if (loadingSettings) return <Loader />
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
            {
               types.length > 0 ? (
                  types.map((type) => {
                     return (<CollapsibleComponent key={type} heading={(type).charAt(0).toUpperCase() + (type).slice(1)}>
                        {settings[type].map((item) => {
                           return (
                              <Child key={item.brandSetting.id} onClick={() => openConfig(item)}>
                                 <div className="identifier_name" tabindex="1">
                                    {item?.brandSetting?.identifier || ''}
                                 </div>
                                 {/* <IconButton
                                    type="ghost"
                                 // style={{background: 'transparent'}} size="sm" type="solid"
                                 >
                                    <PlusIcon color="#555b6e" size="20" />
                                 </IconButton> */}
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
               )
            }
         </Styles.SettingsWrapper >
         {/* contain selected setting */}
         < Styles.SettingWrapper >
            <Flex>
               <SettingsCard setting={setting} key={setting?.brandSetting?.id} title={setting?.brandSetting?.identifier} isChangeSaved={isChangeSaved} setIsSavedChange={setIsSavedChange} />
            </Flex>
         </Styles.SettingWrapper >
         <Styles.LinkWrapper >
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
         </Styles.LinkWrapper >
      </Styles.Wrapper >
   )
}


const CollapsibleComponent = ({ children, heading }) => (
   <CollapsibleWrapper>
      <Collapsible
         className="collapsible"
         isHeadClickable={true}
         head={
            <Flex
               margin="10px 0"
               container
               alignItems="center"
               width="100%"
               className="collapsible_head"
            >
               <Text as="title" style={{ color: "#555B6E", padding: "8px" }}> {heading} </Text>
            </Flex>
         }
         body={
            <Flex margin="10px 0" container flexDirection="column" >
               {children}
            </Flex>
         }
         defaultOpen={false}
         isDraggable={false}
      />
   </CollapsibleWrapper>
)
