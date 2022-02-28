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
import { logger } from '../../utils'
import { useTabs } from '../../providers'
import validator from '../validator'
import { Banner, Tooltip } from '../../components'
import { CREATE_SUPPLIER } from '../../../apps/inventory/graphql'

const CreateSupplier = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [supplier, setSupplier] = React.useState([
      {
         supplierName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createSupplier, { loading }] = useMutation(CREATE_SUPPLIER, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createSupplier.returning.map(separateTab => {
                  addTab(
                     separateTab.name,
                     `/inventory/suppliers/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setSupplier([
            {
               supplierName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Supplier!')
         closeTunnel(5)
      },
      onError: () =>
         toast.success('Failed to create the Supplier, please try again!'),
   })

   const createSupplierHandler = () => {
      try {
         const objects = supplier.filter(Boolean).map(supplier => ({
            name: `${supplier.supplierName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createSupplier({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedSupplier = supplier
      const { name, value } = e.target
      if (name === `supplierName-${i}`) {
         const supplierNameIs = updatedSupplier[i].supplierName
         const supplierNameMeta = updatedSupplier[i].supplierName.meta

         supplierNameIs.value = value
         supplierNameMeta.isTouched = true
         supplierNameMeta.errors = validator.text(value).errors
         supplierNameMeta.isValid = validator.text(value).isValid
         setSupplier([...updatedSupplier])
         console.log('Supplier Name::::', supplier)
      }
   }
   console.log('supplier :>> ', supplier)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `supplierName-${i}` && name === `supplierAuthor-${i}`) {
   //       const supplierInstant = supplier[i]

   //       setSupplier([
   //          ...supplier,
   //          {
   //             ...supplierInstant,
   //             supplierName: {
   //                ...supplierInstant.supplierName,
   //                meta: {
   //                   ...supplierInstant.supplierName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             supplierAuthor: {
   //                ...supplierInstant.supplierAuthor,
   //                meta: {
   //                   ...supplierInstant.supplierAuthor.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //          },
   //       ])
   //    }
   // }

   const save = type => {
      setClick(type)
      let supplierValid = true
      supplier.map(supplier => {
         supplierValid = supplier.supplierName.meta.isValid
         supplierValid = supplierValid && true
         return supplierValid
      })

      if (supplierValid === true) {
         return createSupplierHandler()
      }
      return toast.error('Supplier Name is required!')
   }
   const close = () => {
      setSupplier([
         {
            supplierName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      closeTunnel(5)
   }
   return (
      <>
         <TunnelHeader
            title="Add Supplier"
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
            tooltip={<Tooltip identifier="create_supplier_tunnelHeader" />}
         />
         <Banner id="inventory-app-supplier-create-supplier-tunnel-top" />
         <Flex padding="16px">
            {supplier.map((supplier, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`supplierName-${i}`}
                        title={`supplierName-${i}`}
                     >
                        Supplier Name*
                     </Form.Label>
                     <Form.Text
                        id={`supplierName-${i}`}
                        name={`supplierName-${i}`}
                        value={supplier.supplierName.value}
                        placeholder="Enter supplier name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `supplierName-${i}`)}
                        hasError={
                           !supplier.supplierName.meta.isValid &&
                           supplier.supplierName.meta.isTouched
                        }
                     />
                     {supplier.supplierName.meta.isTouched &&
                        !supplier.supplierName.meta.isValid &&
                        supplier.supplierName.meta.errors.map(
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
               text="Add New Supplier"
               onClick={() =>
                  setSupplier([
                     ...supplier,
                     {
                        supplierName: {
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
         <Banner id="inventory-app-supplier-create-supplier-tunnel-bottom" />
      </>
   )
}

export default CreateSupplier
