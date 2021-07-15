import React from 'react'
import gql from 'graphql-tag'
import styled from 'styled-components'
import { first, isEmpty, isPlainObject } from 'lodash'
import { useQuery } from '@apollo/react-hooks'
import {
   Tunnels,
   Tunnel,
   TunnelHeader,
   Flex,
   Loader,
   Filler,
   Tag,
   Spacer,
   Avatar,
   Text,
} from '@dailykit/ui'
import moment from 'moment'
import Banner from '../Banner'

const parse_name = (node = {}) => {
   const { firstName = '', lastName = '' } = node || {}
   let name = ''
   if (firstName) {
      name = firstName + ' '
   }
   if (lastName) {
      name += lastName
   }
   return name || ''
}

export const ActivityLogs = ({
   tunnels,
   closeTunnel,
   keycloakId = null,
   brand_customerId = null,
   subscriptionOccurenceId = null,
}) => {
   const [customer, setCustomer] = React.useState(null)
   useQuery(CUSTOMERS, {
      skip: !keycloakId && !brand_customerId,
      variables: {
         where: {
            brandCustomers: {
               _or: [
                  { id: { _eq: brand_customerId } },
                  { keycloakId: { _eq: keycloakId || '' } },
               ],
            },
         },
      },
      onCompleted: ({ customers = [] } = {}) => {
         if (isEmpty(customers)) return
         const [customer] = customers

         setCustomer({
            id: customer.id,
            email: customer.email,
            name: parse_name(customer.platform_customer),
         })
      },
      onError: ({ error }) => {
         console.error('customers -> error -> ', error)
      },
   })
   const { loading, data: { activityLogs = [] } = {} } = useQuery(
      ACTIVITY_LOGS,
      {
         variables: {
            where: {
               ...(keycloakId && { keycloakId: { _eq: keycloakId } }),
               ...(brand_customerId && {
                  brand_customerId: { _eq: brand_customerId },
               }),
               ...(subscriptionOccurenceId && {
                  subscriptionOccurenceId: { _eq: subscriptionOccurenceId },
               }),
            },
         },
      }
   )
   return (
      <Tunnels tunnels={tunnels}>
         <Tunnel layer={1} size="lg">
            <TunnelHeader title="Activity Logs" close={() => closeTunnel(1)} />
            <Banner id="activity-log-tunnel-top" />
            <Flex padding="16px" overflowY="auto" height="calc(100% - 196px)">
               {customer?.name && !subscriptionOccurenceId && (
                  <section>
                     <Avatar withName title={customer?.name} />
                     <Spacer size="14px" />
                  </section>
               )}
               {loading ? (
                  <Loader inline />
               ) : (
                  <>
                     {activityLogs.length === 0 ? (
                        <Filler message="No activity logs yet!" />
                     ) : (
                        <Styles.Logs>
                           {activityLogs.map(row => (
                              <Log
                                 row={row}
                                 key={row.id}
                                 occurenceId={subscriptionOccurenceId}
                              />
                           ))}
                        </Styles.Logs>
                     )}
                  </>
               )}
            </Flex>
            <Banner id="activity-log-tunnel-bottom" />
         </Tunnel>
      </Tunnels>
   )
}

const Log = ({ row, occurenceId }) => {
   return (
      <Styles.Log>
         <Flex
            as="header"
            container
            alignItems="center"
            justifyContent="space-between"
         >
            <Tag>{row.type}</Tag>
            {row?.created_at && (
               <span>
                  {moment(row.created_at).format('MMM DD, YYYY - hh:mm a')}
               </span>
            )}
         </Flex>
         <Spacer size="14px" />
         {occurenceId && (
            <>
               <section>
                  {parse_name(
                     row?.subscriptionOccurence_customer?.customer
                        ?.platform_customer
                  ) ? (
                     <Avatar
                        withName
                        title={parse_name(
                           row?.subscriptionOccurence_customer?.customer
                              ?.platform_customer
                        )}
                     />
                  ) : (
                     <Flex as="section" container alignItems="center">
                        <Text as="h4">User: </Text>
                        <Text as="p">
                           &nbsp;
                           {
                              row?.subscriptionOccurence_customer?.customer
                                 ?.email
                           }
                        </Text>
                     </Flex>
                  )}
               </section>
               <Spacer size="14px" />
            </>
         )}
         {row?.log?.message && (
            <>
               <Flex as="section" container alignItems="center">
                  <Text as="h4">Message: </Text>
                  <Text as="p">&nbsp;{row?.log?.message}</Text>
               </Flex>
               <Spacer size="14px" />
            </>
         )}
         {row?.cartId && (
            <>
               <Flex as="section" container>
                  <Text as="h4">Cart Id: </Text>
                  <Text as="text1">&nbsp;{row.cartId}</Text>
               </Flex>
               <Spacer size="14px" />
            </>
         )}
         {row?.cart?.orderId && (
            <>
               <Flex as="section" container>
                  <Text as="h4">Order Id: </Text>
                  <Text as="text1">&nbsp;{row.cart.orderId}</Text>
               </Flex>
               <Spacer size="14px" />
            </>
         )}
         {row?.subscriptionOccurenceId && (
            <>
               <Flex as="section" container>
                  <Text as="h4">Plan: </Text>
                  <Text as="text1">
                     &nbsp;
                     {row?.plan}
                  </Text>
               </Flex>
               <Spacer size="14px" />
            </>
         )}
         {!isEmpty(row?.log?.fields) && (
            <Flex container id="fields" margin="0 0 8px 0">
               <aside>
                  <Text as="h4">Old Data: </Text>
                  <Spacer size="8px" />
                  <pre>
                     <code>
                        {JSON.stringify(row?.log?.fields?.old, null, 3)}
                     </code>
                  </pre>
               </aside>
               <Spacer size="16px" xAxis />
               <aside>
                  <Text as="h4">New Data: </Text>
                  <Spacer size="8px" />
                  <pre>
                     <code>
                        {JSON.stringify(row?.log?.fields?.new, null, 3)}
                     </code>
                  </pre>
               </aside>
            </Flex>
         )}
         <Flex as="section" container alignItems="center" id="update__by">
            {row?.updateByUserId && (
               <>
                  <Flex as="section" container alignItems="center">
                     <Text as="h4">Updated by customer: </Text>
                     <Spacer size="8px" xAxis />
                     {parse_name(row?.updatedByCustomer?.platform_customer) ? (
                        <Avatar
                           withName
                           title={parse_name(
                              row?.updatedByCustomer?.platform_customer
                           )}
                        />
                     ) : (
                        <Flex as="section" container alignItems="center">
                           <Text as="h4">User: </Text>
                           <Text as="p">{row?.updatedByCustomer?.email}</Text>
                        </Flex>
                     )}
                  </Flex>
               </>
            )}
            <Spacer size="24px" xAxis />
            {row?.updateByStaffId && (
               <>
                  <Flex as="section" container alignItems="center">
                     <Text as="h4">Updated by staff: </Text>
                     <Spacer size="8px" xAxis />
                     {parse_name(row?.updatedByStaff) ? (
                        <Avatar
                           withName
                           title={parse_name(row?.updatedByStaff)}
                        />
                     ) : (
                        <Flex as="section" container alignItems="center">
                           <Text as="h4">User: </Text>
                           <Text as="p">{row?.updatedByStaff?.email}</Text>
                        </Flex>
                     )}
                  </Flex>
               </>
            )}
         </Flex>
         {row?.updateByMessage && (
            <>
               <Spacer size="14px" />
               <Flex as="section" container alignItems="center">
                  <Text as="h4">Update Reason: </Text>
                  <Text as="p">&nbsp;{row?.updateByMessage}</Text>
               </Flex>
            </>
         )}
      </Styles.Log>
   )
}

const Styles = {
   Logs: styled.ul``,
   Log: styled.li`
      padding: 8px;
      list-style: none;
      border-radius: 2px;
      border: 1px solid #e3e3e3;
      @media screen and (max-width: 980px) {
         #fields,
         #update__by {
            flex-direction: column;
            align-items: flex-start;
            aside:last-child,
            section:last-child {
               margin-top: 14px;
            }
         }
      }
      + li {
         margin-top: 14px;
      }
   `,
}

const ACTIVITY_LOGS = gql`
   query activityLogs($where: settings_view_activityLogs_bool_exp = {}) {
      activityLogs: settings_view_activityLogs(
         where: $where
         order_by: { created_at: desc }
      ) {
         id
         type
         log
         cartId
         cart {
            id
            orderId
         }
         created_at
         plan
         updateByMessage
         subscriptionOccurence_customer {
            customer {
               id
               email
               platform_customer {
                  firstName
                  lastName
               }
            }
         }
         updateByUserId
         updatedByCustomer {
            id
            email
            platform_customer {
               firstName
               lastName
            }
         }
         updateByStaffId
         updatedByStaff {
            id
            email
            firstName
            lastName
         }
      }
   }
`

const CUSTOMERS = gql`
   query customers($where: crm_customer_bool_exp = {}) {
      customers(where: $where) {
         id
         email
         keycloakId
         platform_customer {
            firstName
            lastName
         }
      }
   }
`
