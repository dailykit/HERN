import React from 'react'
import tw from 'twin.macro'
import { Skeleton } from 'antd'

import { Form, Referral } from '../../components'
import { useUser } from '../../context'
import { usePayment } from '../../lib'

export const ProfileSection = () => {
   const { user } = useUser()
   const { profileInfo, setProfileInfo, isPaymentLoading } = usePayment()

   React.useEffect(() => {
      const { lastName, firstName, phoneNumber } = profileInfo
      setProfileInfo({
         lastName: lastName || user?.platform_customer?.lastName,
         firsName: firstName || user?.platform_customer?.firstName,
         phoneNumber: phoneNumber || user?.platform_customer?.phoneNumber,
      })
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [user])

   const handleChange = e => {
      const { name, value } = e.target
      setProfileInfo({
         ...profileInfo,
         [name]: value,
      })
   }

   return (
      <main css={tw`flex flex-col`}>
         <Skeleton
            active
            loading={isPaymentLoading}
            title={{ width: 550 }}
            paragraph={{ rows: 4, width: Array(5).fill(550) }}
         >
            <form onSubmit={handleSubmit(onSubmit)}></form>
            <Form.Field tw="w-full md:w-3/12">
               <Form.Label>First name*</Form.Label>
               <Form.Text
                  required
                  type="text"
                  name="firstName"
                  onChange={e => handleChange(e)}
                  value={profileInfo?.firstName}
               />
            </Form.Field>
            <Form.Field tw="w-full md:w-3/12">
               <Form.Label>Last Name*</Form.Label>
               <Form.Text
                  required
                  type="text"
                  name="lastName"
                  onChange={e => handleChange(e)}
                  value={profileInfo?.lastName}
               />
            </Form.Field>
            <Form.Field tw="w-full md:w-3/12">
               <Form.Label>Phone No.*</Form.Label>
               <Form.Text
                  required
                  type="text"
                  name="phoneNumber"
                  onChange={e => handleChange(e)}
                  value={profileInfo?.phoneNumber}
                  placeholder="Enter your phone no. eg. 987 987 9876"
               />
            </Form.Field>
            {!user?.isSubscriber && !user?.customerReferral?.referredByCode && (
               <Referral />
            )}
         </Skeleton>
      </main>
   )
}
