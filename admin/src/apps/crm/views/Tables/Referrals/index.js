import React, { useContext, useRef, useState } from 'react'
import { Text, Flex } from '@dailykit/ui'
import { ReactTabulator } from '@dailykit/react-tabulator'
import { useParams } from 'react-router-dom'
import { useQuery } from '@apollo/react-hooks'
import options from '../../tableOptions'
import { toast } from 'react-toastify'
import { logger } from '../../../../../shared/utils'
import { REFERRAL_LISTING } from '../../../graphql'
import { Tooltip, InlineLoader } from '../../../../../shared/components'
import { useTooltip, useTabs } from '../../../../../shared/providers'
import BrandContext from '../../../context/Brand'

const ReferralTable = () => {
   const [context, setContext] = useContext(BrandContext)
   const { addTab } = useTabs()
   const { tooltip } = useTooltip()
   const tableRef = useRef()
   const { id } = useParams()
   const [referralList, setReferralList] = useState([])
   const [referralCount, setReferralCount] = useState(0)

   // Query
   const { loading: listloading } = useQuery(REFERRAL_LISTING, {
      variables: {
         keycloakId: id,
         brandId: context.brandId,
      },
      onCompleted: ({ customerReferrals = [] } = {}) => {
         const result = customerReferrals.map(referral => {
            return {
               invitation: `${
                  referral?.customer?.platform_customer?.firstName || ''
               } ${referral?.customer?.platform_customer?.lastName || 'N/A'}`,
               email: referral?.customer?.platform_customer?.email || 'N/A',
               phone:
                  referral?.customer?.platform_customer?.phoneNumber || 'N/A',
               status: referral?.referralStatus || 'N/A',
            }
         })
         setReferralList(result)
         setReferralCount(customerReferrals.length)
      },
      onError: error => {
         toast.error('Something went wrong referral !')
         logger(error)
      },
   })

   const columns = [
      {
         title: 'Invitation Sent To',
         field: 'invitation',
         headerFilter: true,
         hozAlign: 'left',
         headerTooltip: function (column) {
            const identifier = 'referral_listing_name_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Email Address',
         field: 'email',
         hozAlign: 'left',
         headerTooltip: function (column) {
            const identifier = 'referral_listing_email_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
      {
         title: 'Phone Number',
         field: 'phone',
         hozAlign: 'right',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'right'
            return '' + cell.getValue()
         },
         headerTooltip: function (column) {
            const identifier = 'referral_listing_phone_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
         width: 150,
      },
      {
         title: 'Status',
         field: 'status',
         hozAlign: 'left',
         width: 100,
         headerTooltip: function (column) {
            const identifier = 'referral_listing_status_column'
            return (
               tooltip(identifier)?.description || column.getDefinition().title
            )
         },
      },
   ]

   if (listloading) return <InlineLoader />
   return (
      <Flex maxWidth="1280px" width="calc(100vw-64px)" margin="0 auto">
         <Flex container height="80px" padding="16px" alignItems="center">
            <Text as="title">Referrals({referralCount})</Text>
            <Tooltip identifier="referral_list_heading" />
         </Flex>
         {Boolean(referralList) && (
            <ReactTabulator
               columns={columns}
               data={referralList}
               ref={tableRef}
               options={{
                  ...options,
                  placeholder: 'No Referrals Available Yet !',
               }}
            />
         )}
      </Flex>
   )
}

export default ReferralTable
