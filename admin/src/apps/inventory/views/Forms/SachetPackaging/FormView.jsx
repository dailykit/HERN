import { useMutation } from '@apollo/react-hooks'
import {
   Avatar,
   Flex,
   Form,
   IconButton,
   Spacer,
   Text,
   TextButton,
   Tunnel,
   Tunnels,
   useTunnel,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import EditIcon from '../../../../../shared/assets/icons/Edit'
import { Banner, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import { useTabs } from '../../../../../shared/providers'
import { UPDATE_PACKAGING } from '../../../graphql'
import { validators } from '../../../utils/validators'
import { StyledSupplier } from '../Item/styled'
import InfoBar from './InfoBar'
import PackagingStats from './PackagingStatus'
import {
   ItemInformationTunnel,
   MoreItemInfoTunnel,
   SuppliersTunnel,
} from './Tunnels'

export default function FormView({ state }) {
   const { setTabTitle } = useTabs()
   const [itemInfoTunnel, openItemInfoTunnel, closeItemInfoTunnel] = useTunnel(
      2
   )
   const [itemName, setItemName] = React.useState({
      value: state.packagingName,
      meta: {
         isValid: state.packagingName ? true : false,
         isTouched: false,
         errors: [],
      },
   })

   const [updatePackagingName] = useMutation(UPDATE_PACKAGING, {
      onCompleted: () => {
         toast.info('Packaging name updated !')
         setTabTitle(itemName.value)
      },
      onError: error => {
         logger(error)
         toast.error(GENERAL_ERROR_MESSAGE)
      },
   })

   const handlePackagingNameChange = e => {
      const name = e.target.value
      const { errors, isValid } = validators.name(name, 'packaging name')

      setItemName({
         value: name,
         meta: { errors, isValid, isTouched: true },
      })

      if (isValid)
         updatePackagingName({
            variables: {
               id: state.id,
               object: { name },
            },
         })
   }

   return (
      <>
         <Tunnels tunnels={itemInfoTunnel}>
            <Tunnel layer={1}>
               <ItemInformationTunnel
                  close={closeItemInfoTunnel}
                  next={openItemInfoTunnel}
                  state={state}
               />
            </Tunnel>
            <Tunnel layer={2}>
               <MoreItemInfoTunnel close={closeItemInfoTunnel} state={state} />
            </Tunnel>
         </Tunnels>
         <Banner id="inventory-app-packaging-add-packaging-top" />
         <Flex
            container
            alignItems="center"
            justifyContent="space-between"
            padding="16px 0"
         >
            {state.packagingName && (
               <>
                  <Flex>
                     <Form.Group>
                        <Form.Label htmlFor="itemName" title="itemName">
                           <Flex container alignItems="center">
                              Packaging Name
                              <Tooltip identifier="packaging_form_view-packagingName_input_field" />
                           </Flex>
                        </Form.Label>
                        <Form.Text
                           id="itemName"
                           name="itemName"
                           placeholder="Packaging Name"
                           value={itemName.value}
                           onChange={e =>
                              setItemName({
                                 value: e.target.value,
                                 meta: { ...itemName.meta },
                              })
                           }
                           onBlur={handlePackagingNameChange}
                        />
                        {itemName.meta.isTouched && !itemName.meta.isValid && (
                           <Form.Error>{itemName.meta.errors[0]}</Form.Error>
                        )}
                     </Form.Group>
                     <Text as="subtitle">
                        sku: {state.packagingSku || 'N/A'}
                     </Text>
                  </Flex>
                  <SupplierInfo state={state} />
               </>
            )}
         </Flex>

         <InfoBar open={openItemInfoTunnel} state={state} />
         <Spacer size="16px" />

         <PackagingStats state={state} />
         <Banner id="inventory-app-packaging-add-packaging-bottom" />
      </>
   )
}

function SupplierInfo({ state }) {
   const [
      suppliersTunnel,
      openSuppliersTunnel,
      closeSuppliersTunnel,
   ] = useTunnel(1)

   const TunnelContainer = (
      <Tunnels tunnels={suppliersTunnel}>
         <Tunnel layer={1}>
            <SuppliersTunnel close={closeSuppliersTunnel} state={state} />
         </Tunnel>
      </Tunnels>
   )

   const renderAvatar = contactPerson => {
      if (contactPerson && contactPerson.firstName)
         return (
            <Avatar
               withName
               title={`${state.supplier?.contactPerson?.firstName} ${
                  state.supplier?.contactPerson?.lastName || ''
               }`}
            />
         )
   }

   if (state.supplier && state.supplier.name)
      return (
         <>
            {TunnelContainer}
            <StyledSupplier>
               <span>{state.supplier.name}</span>
               {renderAvatar(state.supplier?.contactPerson)}
               <IconButton
                  type="outline"
                  onClick={() => openSuppliersTunnel(1)}
               >
                  <EditIcon />
               </IconButton>
            </StyledSupplier>
         </>
      )

   return (
      <>
         {TunnelContainer}
         <TextButton onClick={() => openSuppliersTunnel(1)} type="outline">
            Add Supplier
         </TextButton>
      </>
   )
}
