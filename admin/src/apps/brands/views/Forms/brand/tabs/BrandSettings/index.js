import React from 'react'
import { isEmpty } from 'lodash'
import { useParams } from 'react-router-dom'
import { useSubscription } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import {
   Text, Filler, Loader
} from '@dailykit/ui'
import {
   Flex
} from '../../../../../../../shared/components'
import { Child, Styles, CollapsibleWrapper } from './styled'
import { SettingsCard } from './SettingsCard'
import { Card } from 'antd'
import { useInView } from "react-intersection-observer";
import LinkFiles from '../../../../../../content/views/Forms/Page/ContentSelection/components/LinkFiles'

export const BrandSettings = () => {
   const params = useParams()
   const [allSettings, setAllSettings] = React.useState([])
   const [setting, setSetting] = React.useState([])
   const [settings, setSettings] = React.useState([])
   const [active, setActive] = React.useState('')
   const [isChangeSaved, setIsSavedChange] = React.useState(true)
   // const mapped = allSettings.length > 0 && allSettings.map((item) => {
   //    const tabName = item.brandSetting.identifier.split(" ").join("")
   //    const { ref, inView } = useInView({
   //       threshold: 0
   //    });
   //    return { tab: tabName, ref, inView };
   // });
   // console.log(mapped, "mapped");
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
            setAllSettings(brands_brand_brandSetting)
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

   // const openConfig = data => {
   //    if (isChangeSaved) {
   //       setSetting(data)
   //    }
   //    else {
   //       toast.warning('Changes will be lost if not saved. Click on save button to save your changes.')
   //    }
   // }
   const types = Object.keys(settings)
   if (loadingSettings) return <Loader />
   return (
      <Styles.Wrapper>

         {/* navigation bar */}
         <Styles.SettingsWrapper>

            {/* heading */}
            <Flex padding="0 8px 16px 8px">
               <Text as="h3">
                  Brand Settings&nbsp;
                  {settings.length > 0 && (
                     <span>({settings.length})</span>
                  )}
               </Text>
            </Flex>

            {/* (Navigation) types and identifiers */}
            {types.length > 0 ? (
               types.map((type) => {
                  return (<NavComponent key={type} heading={(type).charAt(0).toUpperCase() + (type).slice(1)}>
                     {settings[type].map((item) => {
                        return (
                           <>
                              <a href={`#${item?.brandSetting?.identifier}`}>
                                 <Child key={item?.brandSetting?.id} onClick={() => setActive(item?.brandSetting?.identifier)}>
                                    <div tabindex="1" className={active == item?.brandSetting?.identifier ? "active-link identifier_name" : "identifier_name"}>
                                       {item?.brandSetting?.identifier || ''}
                                    </div>
                                 </Child>
                              </a>
                           </>)
                     })}
                  </NavComponent>)
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


         {/* contain all settings middle-segment */}
         < Styles.SettingWrapper >
            <Flex>
               {types.length > 0 && (
                  types.map((type) => {
                     return (<><Text as="h2">{(type).charAt(0).toUpperCase() + (type).slice(1)}</Text>
                        {settings[type].map((setting) => {
                           return (<><a name={setting?.brandSetting?.identifier}></a>
                              <SettingsCard setting={setting} key={setting?.brandSetting?.id} title={setting?.brandSetting?.identifier} isChangeSaved={isChangeSaved} setIsSavedChange={setIsSavedChange} />
                           </>)
                        })}</>)
                  }))}</Flex>
         </Styles.SettingWrapper >


         {/* linked component */}
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


const NavComponent = ({ children, heading }) => (
   <CollapsibleWrapper>
      <Flex
         margin="10px 0"
         container
         alignItems="center"
         width="100%"
         className="collapsible_head"
      >
         <Text as="title" style={{ color: "#555B6E", padding: "8px" }}> {heading} </Text>
      </Flex>
      <Flex margin="10px 0" container flexDirection="column" >
         {children}
      </Flex>
   </CollapsibleWrapper>
)
