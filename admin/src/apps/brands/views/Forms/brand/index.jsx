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
import { BRANDS } from '../../../graphql'
import { Wrapper, Label } from './styled'
import { logger } from '../../../../../shared/utils'
import { useTabs } from '../../../../../shared/providers'
import { Banner, InlineLoader, Tooltip } from '../../../../../shared/components'
import {
   OnDemandSettings,
   OnDemandCollections,
   SubscriptionPlans,
   SubscriptionSettings,
   ThirdPartyIntegrations,
} from './tabs'

export const Brand = () => {
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
   const [update] = useMutation(BRANDS.UPDATE_BRAND, {
      onCompleted: () => toast.success('Successfully updated brand!'),
      onError: error => {
         toast.error('Failed to update brand!')
         logger(error)
      },
   })
   const {
      error,
      loading,
      data: { brand = {} } = {},
   } = useSubscription(BRANDS.BRAND, {
      variables: {
         id: params.id,
      },
      onSubscriptionData: ({
         subscriptionData: { data: { brand = {} } = {} } = {},
      }) => {
         setTitle({
            value: brand?.title || '',
            meta: {
               isValid: brand?.title ? true : false,
               isTouched: false,
               errors: [],
            },
         })
         setTabTitle(brand?.title || '')
      },
   })

   React.useEffect(() => {
      if (!tab && !loading && !isEmpty(brand)) {
         addTab(
            brand?.title || brand?.domain || 'N/A',
            `/brands/brands/${brand?.id}`
         )
      }
   }, [tab, addTab, loading, brand])

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
         toast.error('Brand Title must be provided')
      }
   }

   if (loading) return <InlineLoader />
   if (error) {
      toast.error('Something went wrong!')
      logger(error)
   }
   return (
      <Wrapper>
         <Banner id="brands-app-brands-brand-details-top" />
         <Flex
            container
            padding="0 34px"
            alignItems="center"
            justifyContent="space-between"
         >
            <Flex container>
               <Form.Group>
                  <Flex container alignItems="flex-end">
                     <Form.Label htmlFor="name" title="Brand title">
                        Title*
                     </Form.Label>
                     <Tooltip identifier="brand_title_info" />
                  </Flex>
                  <Form.Text
                     id="title"
                     name="title"
                     placeholder="Enter the brand title"
                     value={title.value}
                     disabled={brand?.isDefault}
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
               <section>
                  <Flex container alignItems="center">
                     <Label>Domain</Label>
                     <Tooltip identifier="brand_domain_info" />
                  </Flex>
                  <Text as="h3" style={{ marginTop: '13px' }}>
                     {brand?.domain}
                  </Text>
               </section>
            </Flex>

            <Form.Toggle
               name="Publish"
               value={brand?.isPublished}
               onChange={() =>
                  update({
                     variables: {
                        id: params.id,
                        _set: { isPublished: !brand?.isPublished || false },
                     },
                  })
               }
               style={{ marginTop: '24px' }}
            >
               <Flex container alignItems="center">
                  Publish
                  <Tooltip identifier="brands_publish_info" />
               </Flex>
            </Form.Toggle>
         </Flex>
         <Spacer size="24px" />
         <HorizontalTabs>
            <HorizontalTabList>
               <HorizontalTab>On Demand Settings</HorizontalTab>
               <HorizontalTab>On Demand Collections</HorizontalTab>
               <HorizontalTab>Subscription Settings</HorizontalTab>
               <HorizontalTab>Subscription Plans</HorizontalTab>
               <HorizontalTab>Third Party Integration</HorizontalTab>
            </HorizontalTabList>
            <HorizontalTabPanels>
               <HorizontalTabPanel>
                  <OnDemandSettings />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <OnDemandCollections />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <SubscriptionSettings />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <SubscriptionPlans />
               </HorizontalTabPanel>
               <HorizontalTabPanel>
                  <ThirdPartyIntegrations brand={brand} />
               </HorizontalTabPanel>
            </HorizontalTabPanels>
         </HorizontalTabs>
         <Banner id="brands-app-brands-brand-details-bottom" />
      </Wrapper>
   )
}
