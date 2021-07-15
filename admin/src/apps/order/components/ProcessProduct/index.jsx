import React from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Text, IconButton, Flex, TextButton, Spacer } from '@dailykit/ui'

import { CloseIcon } from '../../assets/icons'
import { logger } from '../../../../shared/utils'
import { QUERIES, MUTATIONS } from '../../graphql'
import { useConfig, useOrder } from '../../context'
import { useAccess } from '../../../../shared/providers'
import { Tooltip, InlineLoader } from '../../../../shared/components'
import { Wrapper, StyledStat, StyledMode, StyledHeader } from './styled'

export const ProcessProduct = () => {
   const { isSuperUser } = useAccess()
   const { state: config } = useConfig()
   const { state, switchView } = useOrder()
   const [label, setLabel] = React.useState('')
   const [updateCartItem] = useMutation(MUTATIONS.CART_ITEM.UPDATE, {
      onCompleted: () => toast.success('Succesfully updated product details!'),
      onError: error => {
         logger(error)
         toast.error('Failed to update product details!')
      },
   })
   const {
      loading,
      error,
      data: { product = {} } = {},
   } = useSubscription(QUERIES.ORDER.PRODUCT, {
      skip: !state.current_product?.id,
      variables: { id: state.current_product?.id },
   })

   const print = React.useCallback(async () => {
      if (!product?.operationConfig?.labelTemplateId) {
         toast.error('No template assigned!')
         return
      }

      if (config.print.print_simulation.value.isActive) {
         const url = `${window._env_.REACT_APP_TEMPLATE_URL}?template={"name":"${product?.operationConfig?.labelTemplate?.name}","type":"label","format":"html"}&data={"id":${product?.id}}`
         setLabel(url)
      } else {
         const url = `${
            new URL(window._env_.REACT_APP_DATA_HUB_URI).origin
         }/datahub/v1/query`

         const data = { id: product?.id, status: 'READY' }
         await axios.post(
            url,
            {
               type: 'invoke_event_trigger',
               args: {
                  name: 'printLabel',
                  payload: { new: data },
               },
            },
            {
               headers: {
                  'Content-Type': 'application/json; charset=utf-8',
                  'x-hasura-admin-secret':
                     window._env_.REACT_APP_HASURA_GRAPHQL_ADMIN_SECRET,
               },
            }
         )
      }
   }, [product])

   if (!state.current_product.id) {
      return (
         <Wrapper>
            <ViewSwitcher view={state.current_view} setView={switchView} />
            <span>No product selected!</span>
         </Wrapper>
      )
   }
   if (loading)
      return (
         <Wrapper>
            <InlineLoader />
         </Wrapper>
      )
   if (error)
      return (
         <Wrapper>
            <ViewSwitcher view={state.current_view} setView={switchView} />
            <span>{error.message}</span>
         </Wrapper>
      )

   const isOrderConfirmed = Boolean(
      product?.cart?.order?.isAccepted && !product?.cart?.order?.isRejected
   )
   const hasStationAccess = () => {
      let access = false

      if (!isOrderConfirmed) return access

      if (isSuperUser) {
         access = true
         return access
      } else if (
         product?.operationConfig?.stationId === config.current_station?.id
      ) {
         access = true
      } else {
         access = false
      }
      return access
   }
   return (
      <Wrapper>
         <ViewSwitcher view={state.current_view} setView={switchView} />
         <StyledHeader>
            <h3 title={product?.displayName}>
               {product?.displayName.split('->').pop().trim()}
            </h3>
         </StyledHeader>
         <main>
            <StyledStat status={product?.status}>
               <span>Status</span>
               <span>{product?.status}</span>
            </StyledStat>
            <ActionsWrapper container alignItems="center">
               <TextButton
                  size="sm"
                  type="solid"
                  disabled={['READY', 'PACKED'].includes(product?.status)}
                  hasAccess={hasStationAccess()}
                  onClick={() =>
                     updateCartItem({
                        variables: {
                           id: product.id,
                           _set: {
                              status: 'READY',
                           },
                        },
                     })
                  }
               >
                  {['READY', 'PACKED'].includes(product?.status)
                     ? 'Ready'
                     : 'Mark Ready'}
               </TextButton>
               <Spacer size="16px" xAxis />
               <TextButton
                  size="sm"
                  type="solid"
                  hasAccess={hasStationAccess()}
                  disabled={product?.status === 'PACKED'}
                  onClick={() =>
                     updateCartItem({
                        variables: {
                           id: product?.id,
                           _set: {
                              status: 'PACKED',
                           },
                        },
                     })
                  }
               >
                  {product?.status === 'PACKED' ? 'Packed' : 'Mark Packed'}
               </TextButton>
            </ActionsWrapper>
            <Spacer size="16px" />
            <PrintButton size="sm" type="outline" onClick={print}>
               Print label
            </PrintButton>
            <Spacer size="8px" />
            <Flex>
               {label && (
                  <>
                     <Flex
                        container
                        as="header"
                        width="300px"
                        alignItems="center"
                        justifyContent="space-between"
                     >
                        <Text as="h3">Label Preview</Text>
                        <IconButton
                           size="sm"
                           type="ghost"
                           onClick={() => setLabel('')}
                        >
                           <CloseIcon size={22} />
                        </IconButton>
                     </Flex>
                     <Spacer size="8px" />
                     <iframe
                        src={label}
                        frameBorder="0"
                        title="label preview"
                     />
                  </>
               )}
            </Flex>
         </main>
      </Wrapper>
   )
}

const ViewSwitcher = ({ view, setView }) => {
   return (
      <StyledMode>
         <Flex container alignItems="center">
            <label htmlFor="mode">Mode</label>
            <Tooltip identifier="left_panel_mode" />
         </Flex>
         <select
            id="mode"
            name="mode"
            value={view}
            onChange={e => setView(e.target.value)}
         >
            <option value="SUMMARY">Summary</option>
            <option value="SACHET_ITEM">Process Sachet</option>
            <option value="PRODUCT">Process Product</option>
         </select>
      </StyledMode>
   )
}

const ActionsWrapper = styled(Flex)`
   display: flex;
   > button {
      flex: 1;
   }
`

const PrintButton = styled(TextButton)`
   width: 100%;
`
