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
   StyledComp,
   InputWrapper,
   StyledDiv,
   StyledInsight,
} from './styled'
import { COUPON_DATA, UPDATE_COUPON } from '../../../graphql'
import {
   ConditionComp,
   DetailsComp,
   RewardComp,
   BrandCoupons,
} from './components'
import { logger } from '../../../../../shared/utils'
import {
   Banner,
   Tooltip,
   InlineLoader,
   InsightDashboard,
} from '../../../../../shared/components'
import moment from 'moment'
import { CloseIcon, TickIcon } from '../../../../../shared/assets/icons'
import { useTabs } from '../../../../../shared/providers'
import CouponContext from '../../../context/Coupon/CouponForm'

const CouponForm = () => {
   const { addTab, tab, setTabTitle } = useTabs()
   const { id: couponId } = useParams()
   const [codeTitle, setCodeTitle] = useState({
      value: '',
      meta: {
         isValid: false,
         isTouched: false,
         errors: [],
      },
   })
   const [state, setState] = useState({})
   const [toggle, setToggle] = useState(false)
   const [checkbox, setCheckbox] = useState(false)
   const today = moment().toISOString()
   const fromDate = moment().subtract(7, 'days').toISOString()

   // form validation
   const validateCouponCode = value => {
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
   const { loading, error } = useSubscription(COUPON_DATA, {
      variables: {
         id: couponId,
      },
      onSubscriptionData: data => {
         console.log(data)
         setState(data?.subscriptionData?.data?.coupon || {})
         setCodeTitle({
            ...codeTitle,
            value: data?.subscriptionData?.data?.coupon?.code || '',
         })
         setToggle(data?.subscriptionData?.data?.coupon?.isActive || false)
         setCheckbox(
            data?.subscriptionData?.data?.coupon?.isRewardMulti || false
         )
      },
   })
   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   // Mutation
   const [updateCoupon] = useMutation(UPDATE_COUPON, {
      onCompleted: () => {
         toast.success('Updated!')
         setTabTitle(codeTitle.value)
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const updatetoggle = () => {
      const val = !toggle
      if (val && !state.isCouponValid.status) {
         toast.error('Coupon should be valid!')
      } else {
         updateCoupon({
            variables: {
               id: couponId,
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
            id: couponId,
            set: {
               isRewardMulti: !checkbox,
            },
         },
      })
   }

   useEffect(() => {
      if (!tab) {
         addTab('Coupons', '/crm/coupons')
      }
   }, [addTab, tab])

   //coupon code validation & update name handler
   const onBlur = e => {
      setCodeTitle({
         ...codeTitle,
         meta: {
            ...codeTitle.meta,
            isTouched: true,
            errors: validateCouponCode(e.target.value).errors,
            isValid: validateCouponCode(e.target.value).isValid,
         },
      })
      if (
         validateCouponCode(e.target.value).isValid &&
         validateCouponCode(e.target.value).errors.length === 0
      ) {
         updateCoupon({
            variables: {
               id: couponId,
               set: {
                  code: e.target.value,
               },
            },
         })
      }
   }

   if (loading) return <InlineLoader />
   return (
      <CouponContext.Provider
         value={{
            state,
            checkbox,
            updateCheckbox: updateCheckbox,
            toggle,
         }}
      >
         <Banner id="crm-app-coupons-coupon-details-top" />
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
                        <Form.Label htmlFor="name" title="Coupon Code">
                           Coupon Code*
                        </Form.Label>
                        <Tooltip identifier="coupon_code_info" />
                     </Flex>
                     <Form.Text
                        id="couponCode"
                        name="couponCode"
                        value={codeTitle.value}
                        placeholder="Enter the Coupon Code "
                        onBlur={onBlur}
                        onChange={e =>
                           setCodeTitle({
                              ...codeTitle,
                              value: e.target.value,
                           })
                        }
                     />
                     {codeTitle.meta.isTouched &&
                        !codeTitle.meta.isValid &&
                        codeTitle.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
                  <Flex container alignItems="center" height="100%">
                     {state.isCouponValid?.status ? (
                        <>
                           <TickIcon color="#00ff00" stroke={2} />
                           <Text as="p">All good!</Text>
                        </>
                     ) : (
                        <>
                           <CloseIcon color="#ff0000" />
                           <Text as="p">{state.isCouponValid?.error}</Text>
                        </>
                     )}
                     <Spacer xAxis size="16px" />
                     <Form.Toggle
                        name="coupon_active"
                        onChange={updatetoggle}
                        value={toggle}
                     >
                        <Flex container alignItems="center">
                           Publish
                           <Tooltip identifier="coupon_publish_info" />
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
                              <div className="couponDetails">
                                 <DetailsComp />
                                 <ConditionComp />
                                 <RewardComp />
                              </div>
                           </Flex>
                        </StyledComp>
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <BrandCoupons />
                     </HorizontalTabPanel>
                     <HorizontalTabPanel>
                        <InsightDashboard
                           appTitle="CRM App"
                           moduleTitle="Coupon Page"
                           variables={{
                              couponId: couponId,
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
         <Banner id="crm-app-coupons-coupon-details-bottom" />
      </CouponContext.Provider>
   )
}

export default CouponForm
