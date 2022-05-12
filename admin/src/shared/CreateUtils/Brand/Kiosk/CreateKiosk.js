import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Dropdown,
   Flex,
   Form,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { logger } from '../../../utils'
import { useTabs } from '../../../providers'
import validator from '../../validator'
import { KIOSK } from '../../../../apps/brands/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../../components'

const CreateKiosk = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [kiosk, setKiosk] = React.useState([
      {
         internalLocationKioskLabel: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createKiosk, { loading }] = useMutation(KIOSK.CREATE_KIOSKS, {
      onCompleted: input => {
         {
            // console.log('input coming for new kiosk===>', input)
            if (click === 'SaveAndOpen') {
               input.insert_brands_locationKiosk.returning.map(separateTab => {
                  addTab(separateTab.name, `/brands/kiosks/${separateTab.id}`)
               })
            }
         }
         // console.log('The input contains:', input)
         setKiosk([
            {
               internalLocationKioskLabel: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the kiosk!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the kiosk, please try again!'),
   })

   const createKioskHandler = () => {
      try {
         const objects = kiosk.filter(Boolean).map(kiosk => ({
            internalLocationKioskLabel: `${kiosk.internalLocationKioskLabel.value}`,
            accessPassword: `${kiosk.internalLocationKioskLabel.value.replace(
               /\s/g,
               ''
            )}@123`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createKiosk({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedKiosk = kiosk
      const { name, value } = e.target
      if (name === `internalLocationKioskLabel-${i}`) {
         const internalLocationKioskLabelIs =
            updatedKiosk[i].internalLocationKioskLabel
         const internalLocationKioskLabelMeta =
            updatedKiosk[i].internalLocationKioskLabel.meta
         // console.log('label is===>>>', `internalLocationKioskLabel-${i}`)
         internalLocationKioskLabelIs.value = value
         internalLocationKioskLabelMeta.isTouched = true
         internalLocationKioskLabelMeta.errors = validator.text(value).errors
         internalLocationKioskLabelMeta.isValid = validator.text(value).isValid
         setKiosk([...updatedKiosk])
         // console.log('Kiosk Name::::', kiosk)
      }
   }
   // console.log('kiosk :>> ', kiosk)

   const save = type => {
      setClick(type)
      let kioskValid = true
      kiosk.map(kiosk => {
         kioskValid = kiosk.internalLocationKioskLabel.meta.isValid
         kioskValid = kioskValid && true
         return kioskValid
      })

      if (kioskValid === true) {
         return createKioskHandler()
      }
      return toast.error('kiosk label is required!')
   }
   const close = () => {
      setKiosk([
         {
            internalLocationKioskLabel: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(1)
   }
   return (
      <>
         <TunnelHeader
            title="Add New Kiosk"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            extraButtons={[
               {
                  action: () => {
                     save('SaveAndOpen')
                  },
                  title:
                     loading && click === 'SaveAndOpen'
                        ? 'Saving...'
                        : 'Save & Open',
               },
            ]}
            close={close}
            tooltip={<Tooltip identifier="create_recipe_tunnelHeader" />}
         />
         <Banner id="product-app-recipe-create-recipe-tunnel-top" />
         <Flex padding="16px">
            {kiosk.map((kiosk, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`internalLocationKioskLabel-${i}`}
                        title={`internalLocationKioskLabel-${i}`}
                     >
                        Kiosk Label*
                     </Form.Label>
                     <Form.Text
                        id={`internalLocationKioskLabel-${i}`}
                        name={`internalLocationKioskLabel-${i}`}
                        value={kiosk.internalLocationKioskLabel.value}
                        placeholder="Enter kiosk name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e =>
                        //    onBlur(e, i, `internalLocationKioskLabel-${i}`)
                        // }
                        hasError={
                           !kiosk.internalLocationKioskLabel.meta.isValid &&
                           kiosk.internalLocationKioskLabel.meta.isTouched
                        }
                     />
                     {kiosk.internalLocationKioskLabel.meta.isTouched &&
                        !kiosk.internalLocationKioskLabel.meta.isValid &&
                        kiosk.internalLocationKioskLabel.meta.errors.map(
                           (error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           )
                        )}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Kiosk"
               onClick={() =>
                  setKiosk([
                     ...kiosk,
                     {
                        internalLocationKioskLabel: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                     },
                  ])
               }
            />
         </Flex>
         <Spacer xAxis size="24px" />
         <Banner id="product-app-recipe-create-recipe-tunnel-bottom" />
      </>
   )
}

export default CreateKiosk
