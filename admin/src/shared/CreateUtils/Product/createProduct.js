import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   Form,
   RadioGroup,
   Spacer,
   TunnelHeader,
} from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { PRODUCTS } from '../../../apps/products/graphql'
import { Tooltip } from '../../components'
import { useTabs } from '../../providers'
import validator from '../validator'
const CreateProduct = ({ close }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [productType, setProductType] = React.useState('simple')
   const [productTitle, setProductTitle] = React.useState('Simple')

   const [product, setProduct] = React.useState([
      {
         productName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])
   const options = [
      { id: 'simple', title: 'Simple' },
      { id: 'customizable', title: 'Customizable' },
      { id: 'combo', title: 'Combo' },
   ]
   const [createProduct, { loading }] = useMutation(PRODUCTS.CREATE_PRODUCTS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createProducts.returning.map(separateTab => {
                  addTab(
                     separateTab.name,
                     `/products/products/${separateTab.id}`
                  )
               })
            }
         }
         console.log('The input contains:', input)
         setProduct([
            {
               productName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Product!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Product, please try again!'),
   })
   const onChange = (e, i) => {
      const updatedProduct = product
      const { name, value } = e.target
      if (name === `productName-${i}`) {
         const productNameIs = updatedProduct[i].productName
         const productNameMeta = updatedProduct[i].productName.meta

         productNameIs.value = value
         productNameMeta.isTouched = true
         productNameMeta.errors = validator.text(value).errors
         productNameMeta.isValid = validator.text(value).isValid
         setProduct([...updatedProduct])
         console.log('Product Name::::', product)
      }
   }
   const createProductHandler = () => {
      try {
         const objects = product.filter(Boolean).map(product => ({
            name: `${product.productName.value}`,
            type: `${productType}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createProduct({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }
   const save = type => {
      setClick(type)
      let productValid = true
      product.map(product => {
         productValid = product.productName.meta.isValid
         productValid = productValid && true
         return productValid
      })

      if (productValid === true) {
         return createProductHandler()
      }
      return toast.error('Product Name is required!')
   }
   const closeTunnel = () => {
      setProduct([
         {
            productName: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
         },
      ])
      close(3)
   }

   return (
      <>
         <TunnelHeader
            title="Add Product"
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
            close={closeTunnel}
            tooltip={<Tooltip identifier="create_product_tunnelHeader" />}
         />
         <Flex padding="16px">
            <RadioGroup
               options={options}
               active={productType}
               onChange={option => {
                  console.log(option)
                  setProductType(option.id)
                  setProductTitle(option.title)
               }}
            />
         </Flex>
         <Flex padding="16px">
            {product.map((product, i) => {
               return (
                  <>
                     <Form.Group>
                        <Form.Label
                           htmlFor={`productName-${i}`}
                           title={`productName-${i}`}
                        >
                           {productTitle} Product Name*
                        </Form.Label>
                        <Form.Text
                           id={`productName-${i}`}
                           name={`productName-${i}`}
                           value={product.productName.value}
                           placeholder="Enter Product Name"
                           onChange={e => onChange(e, i)}
                           // onBlur={e => onBlur(e, i, `productName-${i}`)}
                           hasError={
                              !product.productName.meta.isValid &&
                              product.productName.meta.isTouched
                           }
                        />
                        {product.productName.meta.isTouched &&
                           !product.productName.meta.isValid &&
                           product.productName.meta.errors.map(
                              (error, index) => (
                                 <Form.Error key={index}>{error}</Form.Error>
                              )
                           )}
                     </Form.Group>
                  </>
               )
            })}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Product"
               onClick={() =>
                  setProduct([
                     ...product,
                     {
                        productName: {
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
      </>
   )
}

export default CreateProduct
