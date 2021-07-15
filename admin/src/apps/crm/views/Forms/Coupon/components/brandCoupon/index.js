import React, { useState, useEffect, useRef, useContext } from 'react'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { ReactTabulator, reactFormatter } from '@dailykit/react-tabulator'
import { toast } from 'react-toastify'
import { Text, Flex, Form } from '@dailykit/ui'
import { BRAND_COUPONS, UPSERT_BRAND_COUPON } from '../../../../../graphql'
import { StyledHeader, StyledWrapper } from './styled'
import options from '../../../../tableOptions'
import { Tooltip, InlineLoader } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import CouponContext from '../../../../../context/Coupon/CouponForm'

const BrandCoupon = () => {
   const tableRef = useRef()
   const context = useContext(CouponContext)
   // Subscription
   const {
      loading: listloading,
      error,
      data: { brands = [] } = {},
   } = useSubscription(BRAND_COUPONS)

   if (error) {
      toast.error('Something went wrong')
      logger(error)
   }

   const [upsertBrandCoupon] = useMutation(UPSERT_BRAND_COUPON, {
      onCompleted: data => {
         console.log(data)
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong')
         logger(error)
      },
   })

   const columns = [
      {
         title: 'Title',
         field: 'title',
         headerFilter: true,
         headerSort: false,
         hozAlign: 'left',
      },
      {
         title: 'Domain',
         field: 'domain',
         headerFilter: true,
         hozAlign: 'left',
      },
      {
         title: 'Coupon Available',
         formatter: reactFormatter(
            <ToggleCoupon
               couponId={context.state.id}
               onChange={object => upsertBrandCoupon({ variables: { object } })}
            />
         ),
         hozAlign: 'center',
         titleFormatter: function (cell, formatterParams, onRendered) {
            cell.getElement().style.textAlign = 'center'
            return '' + cell.getValue()
         },
         width: 200,
      },
   ]

   if (listloading) return <InlineLoader />

   return (
      <StyledWrapper>
         <Flex container alignItems="center" padding="6px">
            <Text as="h2">Brands</Text>
            <Tooltip identifier="brand_coupon_list_heading" />
         </Flex>
         {error ? (
            <Text as="p">Could not load brands</Text>
         ) : (
            <ReactTabulator
               ref={tableRef}
               columns={columns}
               data={brands}
               options={{
                  ...options,
                  placeholder: 'No Brand Coupons Data Available Yet !',
               }}
            />
         )}
      </StyledWrapper>
   )
}

export default BrandCoupon

const ToggleCoupon = ({ cell, couponId, onChange }) => {
   const brand = useRef(cell.getData())
   const [active, setActive] = useState(false)

   const toggleHandler = () => {
      const value = !active
      onChange({
         couponId,
         brandId: brand.current.id,
         isActive: value,
      })
   }

   React.useEffect(() => {
      const isActive = brand.current.brand_coupons.some(
         coupon => coupon.couponId === couponId && coupon.isActive
      )
      setActive(isActive)
   }, [brand.current])

   return (
      <Form.Group>
         <Form.Toggle
            name={`brand_coupon_active-${brand.current.id}`}
            onChange={toggleHandler}
            value={active}
         />
      </Form.Group>
   )
}
