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
import { CREATE_ITEM } from '../../../apps/inventory/graphql'

const CreateItem = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [item, setItem] = React.useState([
      {
         itemName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         itemAuthor: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createItem, { loading }] = useMutation(CREATE_ITEM, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createSupplierItem.returning.map(separateTab => {
                  addTab(separateTab.name, `/inventory/items/${separateTab.id}`)
               })
            }
         }
         console.log('The input contains:', input)
         setItem([
            {
               itemName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Item!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Item, please try again!'),
   })

   const createItemHandler = () => {
      try {
         const objects = item.filter(Boolean).map(item => ({
            name: `${item.itemName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createItem({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedItem = item
      const { name, value } = e.target
      if (name === `itemName-${i}`) {
         const itemNameIs = updatedItem[i].itemName
         const itemNameMeta = updatedItem[i].itemName.meta

         itemNameIs.value = value
         itemNameMeta.isTouched = true
         itemNameMeta.errors = validator.text(value).errors
         itemNameMeta.isValid = validator.text(value).isValid
         setItem([...updatedItem])
         console.log('Item Name::::', item)
      }
   }
   console.log('item :>> ', item)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `itemName-${i}` && name === `itemAuthor-${i}`) {
   //       const itemInstant = item[i]

   //       setItem([
   //          ...item,
   //          {
   //             ...itemInstant,
   //             itemName: {
   //                ...itemInstant.itemName,
   //                meta: {
   //                   ...itemInstant.itemName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             itemAuthor: {
   //                ...itemInstant.itemAuthor,
   //                meta: {
   //                   ...itemInstant.itemAuthor.meta,
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
      let itemValid = true
      item.map(item => {
         itemValid = item.itemName.meta.isValid
         itemValid = itemValid && true
         return itemValid
      })

      if (itemValid === true) {
         return createItemHandler()
      }
      return toast.error('Item Name is required!')
   }
   const close = () => {
      setItem([
         {
            itemName: {
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
            title="Add Item"
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
            tooltip={<Tooltip identifier="create_item_tunnelHeader" />}
         />
         <Banner id="product-app-item-create-item-tunnel-top" />
         <Flex padding="16px">
            {item.map((item, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`itemName-${i}`}
                        title={`itemName-${i}`}
                     >
                        Item Name*
                     </Form.Label>
                     <Form.Text
                        id={`itemName-${i}`}
                        name={`itemName-${i}`}
                        value={item.itemName.value}
                        placeholder="Enter item name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `itemName-${i}`)}
                        hasError={
                           !item.itemName.meta.isValid &&
                           item.itemName.meta.isTouched
                        }
                     />
                     {item.itemName.meta.isTouched &&
                        !item.itemName.meta.isValid &&
                        item.itemName.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Item"
               onClick={() =>
                  setItem([
                     ...item,
                     {
                        itemName: {
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
         <Banner id="product-app-item-create-item-tunnel-bottom" />
      </>
   )
}

export default CreateItem
