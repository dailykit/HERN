import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Form,
   IconButton,
   Spacer,
   Text,
   TunnelHeader,
   Flex,
} from '@dailykit/ui'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'
// graphql
import { COMBO_PRODUCT_COMPONENT } from '../../../../../../graphql'
import { TunnelBody } from '../../../tunnels/styled'
import { logger } from '../../../../../../../../shared/utils'
import validator from '../../../validators'
import { DeleteIcon } from '../../../../../../../../shared/assets/icons'
import { Tooltip, Banner } from '../../../../../../../../shared/components'

const address =
   'apps.menu.views.forms.product.comboproduct.tunnels.itemstunnel.'

const LabelTunnel = ({ productId, closeTunnel }) => {
   const { t } = useTranslation()

   const [labels, setLabels] = React.useState([
      {
         value: '',
         meta: {
            isTocuhed: false,
            isValid: true,
            errors: [],
         },
      },
   ])

   // Mutation
   const [createComboProductComponent, { loading: inFlight }] = useMutation(
      COMBO_PRODUCT_COMPONENT.CREATE,
      {
         onCompleted: () => {
            closeTunnel(1)
            toast.success(t(address.concat('items added!')))
         },
         onError: error => {
            console.log('Something went wrong!')
            logger(error)
         },
      }
   )

   // Handlers
   const save = () => {
      if (inFlight || !labels.length) return
      const hasInvalidValues = labels.some(
         label => !label.meta.isValid || !label.value.trim()
      )
      if (hasInvalidValues) {
         return toast.error('Invalid values!')
      }
      const objects = labels.map(label => {
         return {
            productId,
            label: label.value,
         }
      })
      createComboProductComponent({
         variables: {
            objects,
         },
      })
   }

   return (
      <>
         <TunnelHeader
            title={t(address.concat('add items'))}
            right={{
               action: save,
               title: inFlight
                  ? t(address.concat('saving'))
                  : t(address.concat('save')),
            }}
            close={() => closeTunnel(1)}
            tooltip={<Tooltip identifier="combo_product_items_tunnel" />}
         />
         <TunnelBody>
            <Banner id="products-app-combo-product-items-tunnel-top" />
            <Text as="h3">
               {t(address.concat('label your items to add recipes for'))}
            </Text>
            <Spacer size="16px" />
            {labels.map((label, i) => (
               <>
                  <Flex container alignItems="end">
                     <Form.Group>
                        <Form.Text
                           id={`label-${i}`}
                           name={`label-${i}`}
                           onBlur={() => {
                              const { isValid, errors } = validator.name(
                                 label.value
                              )
                              const newLabels = labels
                              newLabels[i] = {
                                 ...newLabels[i],
                                 meta: { isTouched: true, isValid, errors },
                              }
                              setLabels([...newLabels])
                           }}
                           onChange={e => {
                              const newLabels = labels
                              newLabels[i] = {
                                 ...newLabels[i],
                                 value: e.target.value,
                              }
                              setLabels([...newLabels])
                           }}
                           value={label.value}
                           placeholder="Enter label"
                           hasError={
                              label.meta.isTouched && !label.meta.isValid
                           }
                        />
                        {label.meta.isTouched &&
                           !label.meta.isValid &&
                           label.meta.errors.map((error, index) => (
                              <Form.Error key={index}>{error}</Form.Error>
                           ))}
                     </Form.Group>
                     <IconButton
                        type="ghost"
                        onClick={() => {
                           const newLabels = labels
                           newLabels.splice(i, 1)
                           setLabels([...newLabels])
                        }}
                     >
                        <DeleteIcon color="#FF5A52" />
                     </IconButton>
                  </Flex>
                  <Spacer size="16px" />
               </>
            ))}
            <ButtonTile
               type="secondary"
               text={t(address.concat('add another item'))}
               onClick={() =>
                  setLabels([
                     ...labels,
                     {
                        value: '',
                        meta: {
                           isTocuhed: false,
                           isValid: true,
                           errors: [],
                        },
                     },
                  ])
               }
            />
            <Banner id="products-app-combo-product-items-tunnel-bottom" />
         </TunnelBody>
      </>
   )
}

export default LabelTunnel
