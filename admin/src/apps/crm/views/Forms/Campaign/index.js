import React, { useState, useEffect } from 'react'
import {
   Flex,
   HorizontalTab,
   HorizontalTabs,
   HorizontalTabList,
   HorizontalTabPanel,
   HorizontalTabPanels,
   Form,
   Spacer,
   Text,
} from '@dailykit/ui'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import {
   StyledWrapper,
   InputWrapper,
   StyledComp,
   StyledDiv,
   StyledInsight,
} from './styled'
import { CAMPAIGN_DATA, UPDATE_CAMPAIGN } from '../../../graphql'
import {
   ConditionComp,
   DetailsComp,
   RewardComp,
   BrandCampaign,
} from './components'
import { logger } from '../../../../../shared/utils'
import {
   Tooltip,
   InlineLoader,
   InsightDashboard,
   Banner,
} from '../../../../../shared/components'
import { CloseIcon, TickIcon } from '../../../../../shared/assets/icons'
import CampaignContext from '../../../context/Campaign/CampaignForm'
import moment from 'moment'
import { useTabs } from '../../../../../shared/providers'

const CampaignForm = () => {
   const { addTab, tab, setTabTitle } = useTabs()
   const { id: campaignId } = useParams()
   const [campaignTitle, setCampaignTitle] = useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [type, setType] = useState('')
   const [state, setState] = useState({})
   const [toggle, setToggle] = useState(false)
   const [checkbox, setCheckbox] = useState(false)
   const today = moment().toISOString()
   const fromDate = moment().subtract(7, 'days').toISOString()

   // form validation
   const validateCampaignName = value => {
      const text = value.trim()
      console.log(`text ${text.length}`)
      let isValid = true
      let errors = []
      if (text.length < 2) {
         isValid = false
         errors = [...errors, 'Must have atleast two letters.']
      }
      console.log(isValid)
      return { isValid, errors }
   }

   // Subscription
   const { loading, error } = useSubscription(CAMPAIGN_DATA, {
      variables: {
         id: campaignId,
      },
      onSubscriptionData: ({ subscriptionData: { data = {} } = {} }) => {
         setState(data?.campaign || {})
         setCampaignTitle({
            ...campaignTitle,
            value: data?.campaign?.metaDetails?.title || '',
         })
         setType(data?.campaign?.type || '')
         setToggle(data?.campaign?.isActive || false)
         setTabTitle(data?.campaign?.metaDetails?.title || 'N/A')
         setCheckbox(data?.campaign?.isRewardMulti || false)
      },
   })

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   // Mutation
   const [updateCoupon] = useMutation(UPDATE_CAMPAIGN, {
      onCompleted: () => {
         toast.success('Updated!')
         setTabTitle(campaignTitle.value)
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const updatetoggle = () => {
      const val = !toggle
      if (val && !state.isCampaignValid.status) {
         toast.error('Campaign should be valid!')
      } else {
         updateCoupon({
            variables: {
               id: campaignId,
               set: {
                  isActive: val,
               },
            },
         })
      }
   }

   const updateCheckbox = () => {
      updateCoupon({
         variables: {
            id: campaignId,
            set: {
               isRewardMulti: !checkbox,
            },
         },
      })
   }

   //campaign name validation & update name handler
   const onBlur = e => {
      setCampaignTitle({
         ...campaignTitle,
         meta: {
            ...campaignTitle.meta,
            isTouched: true,
            errors: validateCampaignName(e.target.value).errors,
            isValid: validateCampaignName(e.target.value).isValid,
         },
      })
      if (
         validateCampaignName(e.target.value).isValid &&
         validateCampaignName(e.target.value).errors.length === 0
      ) {
         updateCoupon({
            variables: {
               id: campaignId,
               set: {
                  metaDetails: {
                     ...state.metaDetails,
                     title: e.target.value,
                  },
               },
            },
         })
      }
   }

   useEffect(() => {
      if (!tab) {
         addTab('Campaign', '/crm/campaign')
      }
   }, [addTab, tab])

   if (loading) return <InlineLoader />
   return (
      <CampaignContext.Provider
         value={{
            state,
            campaignType: type,
            toggle,
            checkbox,
            updateCheckbox: updateCheckbox,
         }}
      >
         <Banner id="crm-app-campaigns-campaign-details-top" />

         <StyledWrapper>
            <InputWrapper>
               <Flex
                  container
                  alignItems="center"
                  justifyContent="space-between"
                  padding="0 0 16px 0"
               >
                  <Form.Group>
                     <Flex container alignItems="flex-end">
                        <Form.Label htmlFor="name" title="Campaign Name">
                           Campaign Name*
                        </Form.Label>
                        <Tooltip identifier="campaign_info" />
                     </Flex>
                     <Form.Text
                        id="campaignName"
                        name="campaignName"
                        value={campaignTitle.value}
                        placeholder="Enter the campaign Name"
                        onBlur={onBlur}
                        onChange={e =>
                           setCampaignTitle({
                              ...campaignTitle,
                              value: e.target.value,
                           })
                        }
                     />
                     {campaignTitle.meta.isTouched &&
                        !campaignTitle.meta.isValid &&
                        campaignTitle.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Flex container alignItems="center" height="100%" style={{position:'relative', top:'13px'}}>
                     {state.isCampaignValid?.status ? (
                        <>
                           <Flex>
                              <TickIcon color="#00ff00" stroke={2} />
                           </Flex>
                           <Text as="p">All good!</Text>
                        </>
                     ) : (
                        <>
                           <Flex container alignItems="center" height="100%" style={{position:'relative', top:'4px'}}>
                              <CloseIcon color="#ff0000" /> 
                           </Flex>
                           <Text as="p">{state.isCampaignValid?.error}</Text>
                        </>
                     )}
                     <Spacer xAxis size="16px" />
                     <Form.Toggle
                        name="campaign_active"
                        onChange={updatetoggle}
                        value={toggle}
                     >
                        <Flex container alignItems="center" style={{position:'relative', left:'12px'}}>
                           <p>Publish</p>
                           <Tooltip identifier="campaign_publish_info" />
                        </Flex>
                     </Form.Toggle>
                  </Flex>
               </Flex>
            </InputWrapper>

            <StyledDiv>
               <HorizontalTabs>
                  <div className="styleTab">
                     <HorizontalTabList>
                        <HorizontalTab>Details</HorizontalTab>
                        <HorizontalTab>Brand</HorizontalTab>
                        <HorizontalTab>Insights</HorizontalTab>
                     </HorizontalTabList>
                  </div>
                  <HorizontalTabPanels>
                     <HorizontalTabPanel>
                        <StyledComp>
                           <Flex container>
                              <div className="campaignDetails">
                                 <DetailsComp />
                                 <ConditionComp />
                                 <RewardComp />
                              </div>
                           </Flex>
                        </StyledComp>
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <BrandCampaign />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <InsightDashboard
                           appTitle="CRM App"
                           moduleTitle="Campaign Page"
                           variables={{
                              campaignId: campaignId,
                              today: today,
                              fromDate: fromDate,
                           }}
                           showInTunnel={false}
                        />
                     </HorizontalTabPanel>
                  </HorizontalTabPanels>
               </HorizontalTabs>
            </StyledDiv>
         </StyledWrapper>
         <Banner id="crm-app-campaigns-campaign-details-bottom" />
      </CampaignContext.Provider>
   )
}

export default CampaignForm
