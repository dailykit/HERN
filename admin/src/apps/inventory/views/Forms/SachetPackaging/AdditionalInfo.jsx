import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Spacer, Text, Toggle } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { ErrorState, InlineLoader } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { Separator } from '../../../components'
import { GENERAL_ERROR_MESSAGE } from '../../../constants/errorMessages'
import {
   PACKAGING_SPECS_SUBSCRIPTION,
   UPDATE_PACKAGING_SPECS,
} from '../../../graphql'
import { ShadowCard } from '../styled'

function errorHandler(error) {
   logger(error)
   toast.error(GENERAL_ERROR_MESSAGE)
}

export default function AdditionalInfo({ id }) {
   const {
      data: { packaging: { packagingSpecification: spec = {} } = {} } = {},
      loading,
      error,
   } = useSubscription(PACKAGING_SPECS_SUBSCRIPTION, {
      variables: { id },
   })

   const [updateSpecs] = useMutation(UPDATE_PACKAGING_SPECS, {
      onError: errorHandler,
      onCompleted: () => toast.success('Package Specification updated!'),
   })

   const handleSave = specName => {
      updateSpecs({
         variables: {
            id: spec.id,
            object: {
               [specName]: !spec[specName],
            },
         },
      })
   }

   if (error) {
      logger(error)
      return <ErrorState />
   }

   return (
      <ShadowCard style={{ flexDirection: 'column' }}>
         {loading ? (
            <InlineLoader />
         ) : (
            <>
               <Flex
                  container
                  justifyContent="space-between"
                  alignItems="center"
               >
                  <Text as="title">Additional Information</Text>
               </Flex>
               <Separator />
               <Flex container justifyContent="space-between">
                  <Toggle
                     checked={spec.innerWaterResistant}
                     label="Inner Water Resistant"
                     setChecked={() => handleSave('innerWaterResistant')}
                  />

                  <Toggle
                     checked={spec.microwaveable}
                     label="Microwaveable"
                     setChecked={() => handleSave('microwaveable')}
                  />
               </Flex>
               <Spacer size="16px" />
               <Flex container justifyContent="space-between">
                  <Toggle
                     checked={spec.outerWaterResistant}
                     label="Outer Water Resistant"
                     setChecked={() => handleSave('outerWaterResistant')}
                  />

                  <Toggle
                     checked={spec.recyclable}
                     label="Recyclable"
                     setChecked={() => handleSave('recyclable')}
                  />
               </Flex>
               <Spacer size="16px" />
               <Flex container justifyContent="space-between">
                  <Toggle
                     checked={spec.innerGreaseResistant}
                     label="Inner Grease Resistant"
                     setChecked={() => handleSave('innerGreaseResistant')}
                  />

                  <Toggle
                     checked={spec.compostable}
                     label="Compostable"
                     setChecked={() => handleSave('compostable')}
                  />
               </Flex>
               <Spacer size="16px" />
               <Flex container justifyContent="space-between">
                  <Toggle
                     checked={spec.outerGreaseResistant}
                     label="Outer Grease Resistant"
                     setChecked={() => handleSave('innerGreaseResistant')}
                  />

                  <Toggle
                     checked={spec.fdaCompliant}
                     label="FDA compliant"
                     setChecked={() => handleSave('fdaCompliant')}
                  />
               </Flex>
            </>
         )}
      </ShadowCard>
   )
}
