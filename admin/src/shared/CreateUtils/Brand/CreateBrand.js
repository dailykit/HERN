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
import { CREATE_SIMPLE_RECIPE } from '../../../apps/products/graphql'
import { repeat } from 'lodash'
import { Banner, Tooltip } from '../../components'
import { BRANDS } from '../../../apps/brands/graphql'

const CreateBrand = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [brand, setBrand] = React.useState([
      {
         brandTitle: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
         brandDomain: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createBrand, { loading }] = useMutation(BRANDS.CREATE_BRANDS, {
      onCompleted: input => {
         // {
         //    if (click === 'SaveAndOpen') {
         //       input.createSimpleBrand.returning.map(separateTab => {
         //          addTab(separateTab.name, `/products/brands/${separateTab.id}`)
         //       })
         //    }
         // }
         console.log('The input contains:', input)
         setBrand([
            {
               brandTitle: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
               brandDomain: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Brand!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Brand, please try again!'),
   })

   const createBrandHandler = () => {
      try {
         const objects = brand.filter(Boolean).map(brand => ({
            title: `${brand.brandTitle.value}`,
            domain: `${brand.brandDomain.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createBrand({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedBrand = brand
      const { name, value } = e.target
      if (name === `brandTitle-${i}`) {
         const brandTitleIs = updatedBrand[i].brandTitle
         const brandTitleMeta = updatedBrand[i].brandTitle.meta

         brandTitleIs.value = value
         brandTitleMeta.isTouched = true
         brandTitleMeta.errors = validator.text(value).errors
         brandTitleMeta.isValid = validator.text(value).isValid
         setBrand([...updatedBrand])
         console.log('Brand Title::::', brand)
      }
      if (name === `brandDomain-${i}`) {
         const brandDomainIs = updatedBrand[i].brandDomain
         const brandDomainMeta = updatedBrand[i].brandDomain.meta

         brandDomainIs.value = value
         brandDomainMeta.isTouched = true
         brandDomainMeta.errors = validator.text(value).errors
         brandDomainMeta.isValid = validator.text(value).isValid

         setBrand([...updatedBrand])

         console.log(
            'Brand Domain::::',
            brand.map(brand => {
               return [brand.brandDomain.value, brand.brandDomain.meta.isValid]
            })
         )
      }
   }
   console.log('brand :>> ', brand)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `brandTitle-${i}` && name === `brandDomain-${i}`) {
   //       const brandInstant = brand[i]

   //       setBrand([
   //          ...brand,
   //          {
   //             ...brandInstant,
   //             brandTitle: {
   //                ...brandInstant.brandTitle,
   //                meta: {
   //                   ...brandInstant.brandTitle.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             brandDomain: {
   //                ...brandInstant.brandDomain,
   //                meta: {
   //                   ...brandInstant.brandDomain.meta,
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
      let brandValid = true
      brand.map(brand => {
         brandValid =
            brand.brandTitle.meta.isValid && brand.brandDomain.meta.isValid
         brandValid = brandValid && true
         return brandValid
      })

      if (brandValid === true) {
         return createBrandHandler()
      }
      return toast.error('Brand Title and Domain is required!')
   }
   const close = () => {
      setBrand([
         {
            brandTitle: {
               value: null,
               meta: {
                  isValid: false,
                  isTouched: false,
                  errors: [],
               },
            },
            brandDomain: {
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
            title="Add Brand"
            right={{
               action: () => {
                  save('save')
               },
               title: loading && click === 'save' ? 'Saving...' : 'Save',
               // disabled: types.filter(Boolean).length === 0,
            }}
            // extraButtons={[
            //    {
            //       action: () => {
            //          save('SaveAndOpen')
            //       },
            //       title:
            //          loading && click === 'SaveAndOpen'
            //             ? 'Saving...'
            //             : 'Save & Open',
            //    },
            // ]}
            close={close}
            tooltip={<Tooltip identifier="create_brand_tunnelHeader" />}
         />
         <Banner id="brand-app-brand-create-brand-tunnel-top" />
         <Flex padding="16px">
            {brand.map((brand, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`brandTitle-${i}`}
                        title={`brandTitle-${i}`}
                     >
                        Brand Title*
                     </Form.Label>
                     <Form.Text
                        id={`brandTitle-${i}`}
                        name={`brandTitle-${i}`}
                        value={brand.brandTitle.value}
                        placeholder="Enter brand name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `brandTitle-${i}`)}
                        hasError={
                           !brand.brandTitle.meta.isValid &&
                           brand.brandTitle.meta.isTouched
                        }
                     />
                     {brand.brandTitle.meta.isTouched &&
                        !brand.brandTitle.meta.isValid &&
                        brand.brandTitle.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>

                  <Spacer yAxis size="16px" />
                  <Form.Group>
                     <Form.Label
                        htmlFor={`brandDomain-${i}`}
                        title={`brandDomain-${i}`}
                     >
                        Domain*
                     </Form.Label>
                     <Form.Text
                        id={`brandDomain-${i}`}
                        name={`brandDomain-${i}`}
                        value={brand.brandDomain.value}
                        placeholder="Enter domain name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `brandDomain-${i}`)}
                        hasError={
                           !brand.brandDomain.meta.isValid &&
                           brand.brandDomain.meta.isTouched
                        }
                     />
                     {brand.brandDomain.meta.isTouched &&
                        !brand.brandDomain.meta.isValid &&
                        brand.brandDomain.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Brand"
               onClick={() =>
                  setBrand([
                     ...brand,
                     {
                        brandTitle: {
                           value: null,
                           meta: {
                              isValid: false,
                              isTouched: false,
                              errors: [],
                           },
                        },
                        brandDomain: {
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
         <Banner id="brand-app-brand-create-brand-tunnel-bottom" />
      </>
   )
}

export default CreateBrand
