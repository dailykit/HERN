import { useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Text } from '@dailykit/ui'
import { Tooltip } from 'antd'
import React from 'react'
import { useParams } from 'react-router-dom'
import { BRAND_COUPONS } from '../../../../../graphql'
import { DragNDrop } from '../../../../../../../shared/components'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'
import { isEmpty } from 'lodash'
import { CouponStripCard } from '../../../../../assets/illustration'
import { Card3, Card4, CardContext, CouponCard, StyledIcon, StyledText } from '../../styled'
import { DeleteIcon, DragIcon } from '../../../../../../../shared/assets/icons'

export const BrandCoupons = () => {
    const params = useParams()
    const { initiatePriority } = useDnd()

    const { loading, error, data: { brandCoupons = [] } = {} } = useSubscription(BRAND_COUPONS.LIST, {
        variables: {
            brandId: {
                _eq: params.id,
            },
        },
    })
    React.useEffect(() => {
        if (!loading && !isEmpty(brandCoupons)) {
            initiatePriority({
                tablename: 'brand_coupon',
                schemaname: 'crm',
                data: brandCoupons,
            })
        }
    }, [loading, brandCoupons])
    console.log("brandCouponsAggregate", brandCoupons);
    return (
        <Flex padding="16px 16px 16px 34px">
            <Flex container alignItems="center">
                <Text as="h2">
                    Brand Coupons ({brandCoupons.length || 0})
                </Text>
                <Tooltip identifier="brands_coupons_listing_heading" />
            </Flex>
            {
                Boolean(brandCoupons.length) && (
                    <Flex margin="16px 0 32px 0">
                        <DragNDrop
                            list={brandCoupons}
                            droppableId="brandCouponDroppableId"
                            tablename="brand_coupon"
                            schemaname="crm"
                        >
                            {brandCoupons.map(brandCoupon => (
                                <CouponCard>
                                    <StyledIcon ><DragIcon /></StyledIcon>
                                    <StyledText >{brandCoupon.coupon.code}</StyledText>

                                    {/* <CardContext>
                                        <Card1 ><DragIcon /></Card1>
                                        <Card2 >{brandCoupon.coupon.code}</Card2>
                                        <Card3>
                                            <Form.Group>
                                                <Form.Toggle
                                                    name='first_time'
                                                    onChange={() => console.log('nitin')}
                                                    value={brandCoupon.coupon.isActive}
                                                >
                                                    Publish
                                                </Form.Toggle>
                                            </Form.Group></Card3>
                                        <Card4><DeleteIcon /></Card4>
                                    </CardContext>
                                    <CouponStripCard /> */}
                                </CouponCard>
                            ))}
                        </DragNDrop>
                    </Flex>
                )
            }
        </Flex>
    )
}   
