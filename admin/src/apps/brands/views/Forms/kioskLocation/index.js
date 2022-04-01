import React from 'react'
import { isEmpty } from 'lodash'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Text,
   Spacer,
   Form,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
} from '@dailykit/ui'
import validator from '../../validator'
import { KIOSK } from '../../../graphql'
import { Wrapper, Label } from '../brand/styled'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import { KioskConfig, BasicInfo, LinkOrderTab } from './tabs'

export const KioskLocation = () => {
   const params = useParams()
   const { tab, addTab, setTabTitle } = useTabs()
   const [title, setTitle] = React.useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })

   const [update] = useMutation(KIOSK.UPDATE_KIOSK, {
      onCompleted: () => toast.success('Successfully updated KIOSK!'),
      onError: error => {
         toast.error('Failed to update KIOSK!')
         logger(error)
      },
   })

   const {
      error,
      loading,
      data: { kiosk = {} } = {},
   } = useSubscription(KIOSK.KIOSK, {
      variables: {
         id: { _eq: params.id },
      },
      onSubscriptionData: ({
         subscriptionData: {
            data: { kiosk = {} },
         },
      }) => {
         console.log('data is:', kiosk)
         setTitle({
            value: kiosk[0].kioskLabel || '',
            meta: {
               isValid: kiosk[0].kioskLabel ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(kiosk[0].kioskLabel || '')
      },
   })

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(kiosk)) {
         addTab(kiosk?.title || 'N/A', `/kiosks/kiosks/${kiosk[0].id}`)
         console.log('data:', loading)
      }
   }, [tab, addTab, loading, kiosk])

   const updateTitle = e => {
      setTitle({
         ...title,
         meta: {
            ...title.meta,
            isTouched: true,
            errors: validator.name(e.target.value).errors,
            isValid: validator.name(e.target.value).isValid,
         },
      })
      if (validator.name(e.target.value).isValid) {
         update({
            variables: {
               id: params.id,
               _set: {
                  title: title.value,
               },
            },
         })
      } else {
         toast.error('kiosk Title must be provided')
      }
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }

   return (
      <Wrapper>
         {/* <Banner id="brands-app-brands-brand-details-top" /> */}
         <Flex
            container
            padding="0 34px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container>
               <Form.Group>
                  <Flex container alignItems="flex-end">
                     <Form.Label htmlFor="name" title="Kiosk Label">
                        Title*
                     </Form.Label>
                     <Tooltip identifier="brand_title_info" />
                  </Flex>
                  <Form.Text
                     id="Kiosk"
                     name="Kiosk"
                     placeholder="Enter the kiosk label"
                     value={title.value}
                     disabled={kiosk?.isDefault}
                     onChange={e =>
                        setTitle({ ...title, value: e.target.value })
                     }
                     onBlur={e => updateTitle(e)}
                  />
                  {title.meta.isTouched &&
                     !title.meta.isValid &&
                     title.meta.errors.map((error, index) => (
                        <Form.Error key={index}>{error}</Form.Error>
                     ))}
               </Form.Group>

               <Spacer size="24px" xAxis />
               {/* <section>
                  <Flex container alignItems="center">
                     <Label>Domain</Label>
                     <Tooltip identifier="brand_domain_info" />
                  </Flex>
                  <Text as="h3" style={{ marginTop: '13px' }}>
                     {brand?.domain}
                  </Text>
               </section> */}
            </Flex>

            <Form.Toggle
               name="Active"
               value={kiosk[0]?.isActive}
               onChange={() =>
                  update({
                     variables: {
                        id: params.id,
                        _set: { isActive: !kiosk[0].isActive || false },
                     },
                  })
               }
               style={{ marginTop: '24px' }}
            >
               <Flex container alignItems="center">
                  Active
                  <Tooltip identifier="brands_publish_info" />
               </Flex>
            </Form.Toggle>
         </Flex>
         <Spacer size="24px" />
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>Basic Info</HorizontalTab>
               <HorizontalTab>Link Order Tab</HorizontalTab>
               <HorizontalTab>Kiosk Config</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel style={{ height: 'auto' }}>
                  <BasicInfo />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <LinkOrderTab />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <KioskConfig />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
         <Banner id="brands-app-brands-brand-details-bottom" />
      </Wrapper>
   )
}
// const KioskLocation = ()=>{
//    const params = useParams()
//    console.log("id:",params.id)
//    return (
//       <div>
//          <h1>hello</h1>
//       </div>
//    )
// }
export default KioskLocation
