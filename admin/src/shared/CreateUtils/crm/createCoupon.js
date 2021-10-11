import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import { ButtonTile, Flex, Form, Spacer, TunnelHeader } from '@dailykit/ui'
import { toast } from 'react-toastify'
import { useTabs } from '../../providers'
import validator from '../validator'

import { Banner, Tooltip } from '../../components'
import { CREATE_COUPONS } from '../../../apps/crm/graphql/mutations'

const CreateCoupon = ({ closeTunnel }) => {
   const { addTab, tab } = useTabs()
   const [click, setClick] = React.useState(null)
   const [coupon, setCoupon] = React.useState([
      {
         couponName: {
            value: null,
            meta: {
               isValid: false,
               isTouched: false,
               errors: [],
            },
         },
      },
   ])

   const [createCoupon, { loading }] = useMutation(CREATE_COUPONS, {
      onCompleted: input => {
         {
            if (click === 'SaveAndOpen') {
               input.createCoupons.returning.map(separateTab => {
                  addTab(separateTab.code, `/crm/coupons/${separateTab.id}`)
               })
            }
         }
         console.log('The input contains:', input)
         setCoupon([
            {
               couponName: {
                  value: null,
                  meta: {
                     isValid: false,
                     isTouched: false,
                     errors: [],
                  },
               },
            },
         ])
         toast.success('Successfully created the Coupon!')
         closeTunnel(1)
      },
      onError: () =>
         toast.success('Failed to create the Coupon, please try again!'),
   })

   const createCouponHandler = () => {
      try {
         const objects = coupon.filter(Boolean).map(coupon => ({
            code: `${coupon.couponName.value}`,
         }))
         if (!objects.length) {
            throw Error('Nothing to add!')
         }
         createCoupon({
            variables: {
               objects,
            },
         })
      } catch (error) {
         toast.error(error.message)
      }
   }

   const onChange = (e, i) => {
      const updatedCoupon = coupon
      const { name, value } = e.target
      if (name === `couponName-${i}`) {
         const couponNameIs = updatedCoupon[i].couponName
         const couponNameMeta = updatedCoupon[i].couponName.meta

         couponNameIs.value = value
         couponNameMeta.isTouched = true
         couponNameMeta.errors = validator.text(value).errors
         couponNameMeta.isValid = validator.text(value).isValid
         setCoupon([...updatedCoupon])
         console.log('Coupon Name::::', coupon)
      }
   }
   console.log('coupon :>> ', coupon)

   // const onBlur = (e, i) => {
   //    const { name, value } = e.target
   //    if (name === `couponName-${i}` && name === `couponAuthor-${i}`) {
   //       const couponInstant = coupon[i]

   //       setCoupon([
   //          ...coupon,
   //          {
   //             ...couponInstant,
   //             couponName: {
   //                ...couponInstant.couponName,
   //                meta: {
   //                   ...couponInstant.couponName.meta,
   //                   isTouched: true,
   //                   errors: validator.text(value).errors,
   //                   isValid: validator.text(value).isValid,
   //                },
   //             },
   //             couponAuthor: {
   //                ...couponInstant.couponAuthor,
   //                meta: {
   //                   ...couponInstant.couponAuthor.meta,
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
      let couponValid = true
      coupon.map(coupon => {
         couponValid = coupon.couponName.meta.isValid
         couponValid = couponValid && true
         return couponValid
      })

      if (couponValid === true) {
         return createCouponHandler()
      }
      return toast.error('Coupon Name and Author is required!')
   }
   const close = () => {
      setCoupon([
         {
            couponName: {
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
            title="Add Coupon"
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
            tooltip={<Tooltip identifier="create_coupon_tunnelHeader" />}
         />
         <Banner id="crm-app-coupon-create-coupon-tunnel-top" />
         <Flex padding="16px">
            {coupon.map((coupon, i) => (
               <>
                  <Form.Group>
                     <Form.Label
                        htmlFor={`couponName-${i}`}
                        title={`couponName-${i}`}
                     >
                        Coupon Name*
                     </Form.Label>
                     <Form.Text
                        id={`couponName-${i}`}
                        name={`couponName-${i}`}
                        value={coupon.couponName.value}
                        placeholder="Enter coupon name"
                        onChange={e => onChange(e, i)}
                        // onBlur={e => onBlur(e, i, `couponName-${i}`)}
                        hasError={
                           !coupon.couponName.meta.isValid &&
                           coupon.couponName.meta.isTouched
                        }
                     />
                     {coupon.couponName.meta.isTouched &&
                        !coupon.couponName.meta.isValid &&
                        coupon.couponName.meta.errors.map((error, index) => (
                           <Form.Error key={index}>{error}</Form.Error>
                        ))}
                  </Form.Group>
               </>
            ))}
            <Spacer yAxis size="16px" />
            <ButtonTile
               type="secondary"
               text="Add New Coupon"
               onClick={() =>
                  setCoupon([
                     ...coupon,
                     {
                        couponName: {
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
         <Banner id="crm-app-coupon-create-coupon-tunnel-bottom" />
      </>
   )
}

export default CreateCoupon
