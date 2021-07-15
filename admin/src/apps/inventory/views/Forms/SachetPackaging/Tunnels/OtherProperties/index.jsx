import { useMutation } from '@apollo/react-hooks'
import { Flex, Form, Spacer, Toggle, TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { Banner, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { Separator } from '../../../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../../../constants/errorMessages'
import { UPDATE_PACKAGING_SPECS } from '../../../../../graphql'
import { TunnelWrapper } from '../../../utils/TunnelWrapper'

function errorHandler(error) {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function OtherProperties({ close, state }) {
   const [recycled, setRecycled] = useState(state.recycled)
   const [opacity, setOpacity] = useState(state.opacity || '')
   const [compressibility, setCompressibility] = useState(state.compressibility)

   const [updateSpecs, { loading }] = useMutation(UPDATE_PACKAGING_SPECS, {
      onError: errorHandler,
      onCompleted: () => {
         toast.success('Package Specification updated!')
         close(1)
      },
   })

   const handleNext = () => {
      updateSpecs({
         variables: {
            id: state.id,
            object: {
               recycled,
               opacity,
               compressibility,
            },
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title="Other Properties"
            close={() => close(1)}
            right={{ title: 'Save', action: handleNext, isLoading: loading }}
            description="Configure other properites"
            tooltip={
               <Tooltip identifier="packaging_form_view-other_properties_tunnel" />
            }
         />
         <Spacer size="16px" />
         <Banner id="inventory-app-packaging-form-other-properties-tunnel-top" />
         <TunnelWrapper>
            <Flex margin="0 auto">
               <Toggle
                  checked={recycled}
                  label="Recycled"
                  setChecked={() => setRecycled(!recycled)}
               />
               <Spacer size="16px" />
               <Toggle
                  checked={compressibility}
                  label="Compressable"
                  setChecked={() => setCompressibility(!compressibility)}
               />

               <Separator />

               <Form.Group>
                  <Form.Label htmlFor="opacity" title="opacity">
                     Opacity
                  </Form.Label>
                  <Form.Text
                     id="opacity"
                     name="opacity"
                     placeholder="Opacity"
                     value={opacity}
                     onChange={e => setOpacity(e.target.value)}
                  />
               </Form.Group>
            </Flex>
         </TunnelWrapper>
         <Banner id="inventory-app-packaging-form-other-properties-tunnel-bottom" />
      </>
   )
}
