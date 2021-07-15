import React from 'react'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   TunnelHeader,
   Spacer,
} from '@dailykit/ui'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { UNITS, UNIT_CONVERSIONS } from '../../graphql'
import { InlineLoader } from '../../../InlineLoader'
import { toast } from 'react-toastify'
import { logger } from '../../../../utils'
import Banner from '../../../Banner'

const CreateUnitConversion = ({ closeTunnel }) => {
   const [inputUnitName, setInputUnitName] = React.useState('')
   const [outputUnits, setOutputUnits] = React.useState([
      {
         factor: '',
         unit: '',
      },
   ])

   const [options, setOptions] = React.useState([])

   const { loading, error } = useSubscription(UNITS.LIST, {
      onSubscriptionData: data => {
         const { units } = data.subscriptionData.data
         setOptions(units)
      },
   })
   if (error) console.log(error)

   const [createUnitConversions] = useMutation(UNIT_CONVERSIONS.CREATE, {
      onCompleted: () => {
         toast.success('Conversions created!')
         closeTunnel(2)
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const selectedOption = option => console.log(option)
   const searchedOption = option => console.log(option)

   const handleChange = (field, value, index) => {
      switch (field) {
         case 'factor': {
            if (!isNaN(value)) {
               const updatedOutputUnits = outputUnits
               updatedOutputUnits[index][field] = value
               setOutputUnits([...updatedOutputUnits])
            }
            break
         }
         case 'unit': {
            const updatedOutputUnits = outputUnits
            updatedOutputUnits[index][field] = value
            setOutputUnits([...updatedOutputUnits])
            break
         }
      }
   }

   const handleCreate = () => {
      const hasValidOutputs = outputUnits.every(el => el.factor && el.unit)
      if (inputUnitName && hasValidOutputs) {
         const hasValidOutputUnits = outputUnits.every(
            el => el.unit !== inputUnitName
         )
         if (hasValidOutputUnits) {
            const objects = outputUnits.map(el => ({
               inputUnitName,
               outputUnitName: el.unit,
               conversionFactor: el.factor,
            }))
            createUnitConversions({
               variables: {
                  objects,
               },
            })
         } else {
            toast.error('Input and output unit cannot be same!')
         }
      } else {
         toast.error('Invalid inputs!')
      }
   }

   return (
      <>
         <TunnelHeader
            title="Create Unit Conversion"
            close={() => closeTunnel(2)}
            right={{
               title: 'Create',
               action: handleCreate,
            }}
         />
         <Banner id="create-unit-conversion-tunnel-top" />

         {loading ? (
            <InlineLoader />
         ) : (
            <Flex padding="16px">
               <Form.Group>
                  <Form.Label> Input Unit </Form.Label>
                  <Dropdown
                     type="single"
                     options={options.filter(op => !op.isStandard)}
                     searchedOption={searchedOption}
                     selectedOption={option => setInputUnitName(option.title)}
                     placeholder="type what you're looking for..."
                  />
               </Form.Group>
               <Spacer size="16px" />
               {outputUnits.map((el, index) => (
                  <Flex
                     container
                     alignItems="center"
                     margin="0 0 16px"
                     key={index}
                  >
                     <Form.Group>
                        <Form.Label
                           htmlFor={`factor-${index}`}
                           title={`factor-${index}`}
                        >
                           Factor
                        </Form.Label>
                        <Form.Number
                           id={`factor-${index}`}
                           name={`factor-${index}`}
                           onChange={e =>
                              handleChange('factor', +e.target.value, index)
                           }
                           value={el.factor}
                           placeholder="Enter factor"
                        />
                     </Form.Group>
                     <Spacer xAxis size="16px" />
                     <Form.Group>
                        <Form.Label> Output Unit </Form.Label>
                        <Dropdown
                           type="single"
                           options={options.filter(op => op.isStandard)}
                           searchedOption={searchedOption}
                           selectedOption={option =>
                              handleChange('unit', option.title, index)
                           }
                           placeholder="type what you're looking for..."
                        />
                     </Form.Group>
                  </Flex>
               ))}
               <Spacer size="16px" />
               <ButtonTile
                  type="secondary"
                  text="Add another conversion"
                  onClick={() =>
                     setOutputUnits([
                        ...outputUnits,
                        {
                           factor: '',
                           unit: '',
                        },
                     ])
                  }
               />
            </Flex>
         )}
         <Banner id="create-unit-conversion-tunnel-bottom" />
      </>
   )
}

export default CreateUnitConversion
