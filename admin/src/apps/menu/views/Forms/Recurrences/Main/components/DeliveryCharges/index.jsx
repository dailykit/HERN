import React from 'react'
import { ButtonGroup, ButtonTile, IconButton, TextButton } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useMutation } from '@apollo/react-hooks'

import { StyledContent, StyledContentText, StyledHead, StyledHeadAction, StyledHeadText, TableRecord } from './styled'
import { RecurrenceContext } from '../../../../../../context/recurrence'
import { Flex } from '../../../styled'
import { DELETE_CHARGE } from '../../../../../../graphql'
import { currencyFmt, logger } from '../../../../../../../../shared/utils'
import { DeleteIcon, EditIcon, PlusIcon } from '../../../../../../../../shared/assets/icons'

const DeliveryCharges = ({ mileRangeId, charges, openTunnel }) => {
   const { recurrenceDispatch } = React.useContext(RecurrenceContext)

   // Mutations
   const [deleteCharge] = useMutation(DELETE_CHARGE, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   // Handlers
   const deleteHandler = id => {
      if (window.confirm('Are you sure you want to delete this charge?')) {
         deleteCharge({
            variables: {
               id,
            },
         })
      }
   }

   const addCharge = () => {
      recurrenceDispatch({
         type: 'CHARGE',
         payload: undefined,
      })
      recurrenceDispatch({
         type: 'MILE_RANGE',
         payload: {id: mileRangeId},
      })
      openTunnel(4)
   }

   const updateCharge = charge => {
      recurrenceDispatch({
         type: 'CHARGE',
         payload: charge,
      })
      openTunnel(4)
   }

   return (
      <>
         {charges.length > 0 ?
            <>
               <StyledHead>
                  <StyledHeadText>Delivery Charges</StyledHeadText>
                  <StyledHeadAction>
                     <ButtonGroup>
                        <TextButton type='ghost' size='sm' onClick={addCharge} title="Click to Add more charges">
                           <PlusIcon color="#367BF5" />
                           <span> {" "}Add More Charges</span>
                        </TextButton>
                     </ButtonGroup>
                  </StyledHeadAction>
               </StyledHead>
               {charges.map(charge => (
                  <StyledContent key={charge.id}>
                     <StyledContentText>
                        <div>Order value:</div>
                        <div>
                           {currencyFmt(Number(charge.orderValueFrom) || 0)} -{' '}
                           {currencyFmt(Number(charge.orderValueUpto) || 0)}
                        </div>
                     </StyledContentText>
                     <StyledContentText>
                        <div>Price:</div>
                        <div>
                           {currencyFmt(Number(charge.charge) || 0)}
                        </div>
                     </StyledContentText>
                     <Flex direction="row" align="center">
                        <IconButton
                           type="ghost"
                           title="Click to edit delivery charge"
                           onClick={() => updateCharge(charge)}
                        >
                           <EditIcon color="#919699" />
                        </IconButton>
                        <IconButton
                           type="ghost"
                           onClick={() => deleteHandler(charge.id)}
                           title="Click to remove delivery charge"
                        >
                           <DeleteIcon color="#919699" />
                        </IconButton>
                     </Flex>
                  </StyledContent>
               ))}
            </>
            : <ButtonTile
               type="secondary"
               text="Add Delivery Charge"
               onClick={addCharge}

            />}
      </>
   )
}

export default DeliveryCharges
