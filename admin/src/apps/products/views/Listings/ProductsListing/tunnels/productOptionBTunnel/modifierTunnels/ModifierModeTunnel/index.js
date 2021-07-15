import React from 'react'
import { OptionTile, Spacer, TunnelHeader } from '@dailykit/ui'
import { Tooltip } from '../../../../../../../../../shared/components'
import { ModifiersContext } from '../../../../context/modifier'
import { TunnelBody } from '../../../styled'
import { useMutation } from '@apollo/react-hooks'
import { MODIFIERS } from '../../../../../../../graphql/modifiers'
import { toast } from 'react-toastify'
import { logger, randomSuffix } from '../../../../../../../../../shared/utils'

const ModifierModeTunnel = ({ open, close }) => {
   const { modifiersDispatch } = React.useContext(ModifiersContext)

   const [createModifier] = useMutation(MODIFIERS.CREATE, {
      onCompleted: data => {
         console.log(data)
         modifiersDispatch({
            type: 'MODIFIER_ID',
            payload: data.createModifier.id,
         })
         modifiersDispatch({
            type: 'MODIFIER_NAME',
            payload: data.createModifier.title,
         })
         open(2)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   return (
      <>
         <TunnelHeader
            title="Choose Method"
            close={() => close(1)}
            tooltip={<Tooltip identifier="modifier_mode_tunnel" />}
         />
         <TunnelBody>
            <OptionTile
               title="Choose Existing Template"
               onClick={() => open(6)}
            />
            <Spacer size="16px" />
            <OptionTile
               title="Create New Template"
               onClick={() =>
                  createModifier({
                     variables: {
                        object: {
                           name: `modifier-${randomSuffix()}`,
                        },
                     },
                  })
               }
            />
         </TunnelBody>
      </>
   )
}

export default ModifierModeTunnel
