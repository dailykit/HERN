import React from 'react'
import gql from 'graphql-tag'
import { Flex, Spacer } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useParams } from 'react-router'
import { useQuery, useSubscription } from '@apollo/react-hooks'

import { logger, get_env } from '../../../../../../../../shared/utils'
import { InlineLoader } from '../../../../../../../../shared/components'

const RAZORPAY_SCRIPT_URL =
   'https://s3.us-east-2.amazonaws.com/dailykit.org/payments/v2/index.js'

export const RazorpayTunnel = ({ closeViaTunnel }) => {
   const params = useParams()
   const [partnershipId, setPartnershipId] = React.useState(null)
   const [isOrganizationLoading, setIsOrganizationLoading] = React.useState(
      true
   )
   const [isScriptLoading, setIsScriptLoading] = React.useState(true)
   useQuery(ORGANIZATION, {
      variables: {
         where: { paymentCompany: { type: { _eq: 'Payment Links' } } },
      },
      onCompleted: ({ organizations = [] } = {}) => {
         if (organizations.length > 0) {
            const [organization = {}] = organizations
            if (organization.partnerships.length > 0) {
               const [partnership] = organization.partnerships
               const { company = {} } = partnership
               if (company?.id && company?.type) {
                  setPartnershipId(partnership.id)
               }
            }
         }
         setIsOrganizationLoading(false)
      },
      onError: error => {
         logger(error)
         setIsOrganizationLoading(false)
         toast.error('Failed to load payment partnership details.')
      },
   })
   const { loading, data: { cart = {} } = {} } = useSubscription(CART, {
      skip:
         isOrganizationLoading ||
         isScriptLoading ||
         !params?.id ||
         !partnershipId,
      variables: { id: params.id },
      onSubscriptionData: async ({
         subscriptionData: { data: { cart = {} } = {} } = {},
      }) => {
         if (cart.paymentStatus === 'SUCCEEDED') {
            closeViaTunnel(3)
            closeViaTunnel(1)
            return
         }
         const brandObject = {
            name: cart.brand.title,
            logo: '',
            color: '',
            description: '',
            isStoreLive: false,
         }
         await window.payments.provider({
            currency: 'INR',
            cart: { ...cart, brand: brandObject },
            datahub_url: get_env('REACT_APP_DATA_HUB_URI'),
            partnershipIds: [{ paymentPartnershipId: partnershipId }],
            admin_secret: get_env('REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET'),
         })
      },
   })
   React.useEffect(() => {
      const script = addScript(RAZORPAY_SCRIPT_URL, 'razorpay-script', () => {
         setIsScriptLoading(false)
      })
      return () => script.remove()
   }, [])

   if (isOrganizationLoading || isScriptLoading || loading)
      return <InlineLoader />
   return (
      <Flex padding="16px" overflowY="auto" height="calc(100vh - 196px)">
         {cart.paymentLinkUrl && (
            <>
               <p>
                  Send this payment link to your customer:{' '}
                  <a
                     target="_blank"
                     rel="noreferer noopener"
                     href={cart.paymentLinkUrl}
                  >
                     {cart.paymentLinkUrl}
                  </a>
               </p>
               <Spacer size="14px" />
            </>
         )}
         <div id="payment" />
      </Flex>
   )
}

const addScript = (url, id, callback) => {
   const exists = document.getElementById(id)

   if (!exists) {
      const script = document.createElement('script')
      script.id = id
      script.src = url
      script.setAttribute('async', 'async')
      script.setAttribute('defer', 'defer')
      document.body.appendChild(script)

      script.onload = () => {
         if (callback) callback()
      }
      return script
   }

   if (exists && callback) callback()
   return exists
}

const ORGANIZATION = gql`
   query organizations($where: paymentHub_paymentPartnership_bool_exp = {}) {
      organizations {
         id
         name: organizationName
         partnerships: paymentPartnerships(where: $where) {
            id
            company: paymentCompany {
               id
               type
            }
         }
      }
   }
`

const CART = gql`
   subscription cart($id: Int!) {
      cart(id: $id) {
         id
         isTest
         orderId
         paymentId
         totalPrice
         isCartValid
         paymentStatus
         transactionId
         paymentUpdatedAt
         customerKeycloakId
         paymentLinkUrl: transactionRemark(
            path: "payload.payment_link.entity.short_url"
         )
         brand {
            id
            title
         }
      }
   }
`
