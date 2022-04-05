import { useSubscription } from '@apollo/react-hooks'
import { Flex, Text } from '@dailykit/ui'
import { Tooltip } from 'antd'
import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import { BRAND_COUPONS } from '../../../../../graphql'

export const BrandCoupons = () => {
    const params = useParams()
    // const [brandCoupons, setBrandCoupons] = useState({})

    const { loading, error, data: { brandCouponsAggregate: brandCoupons = {} } = {} } = useSubscription(BRAND_COUPONS.LIST, {
        variables: {
            brandId: {
                _eq: params.id,
            },
        },
    })
    console.log("brandCouponsAggregate", brandCoupons);
    return (
        <Flex padding="16px 16px 16px 34px">
            <Flex container alignItems="center">
                <Text as="h2">
                    Brand Coupons ({brandCoupons?.aggregate?.count || 0})
                </Text>
                <Tooltip identifier="brands_subscriptionPlans_listing_heading" />
            </Flex>
            {/* <Spacer size="24px" />
            {loading ? (
                <InlineLoader />
            ) : (
                <>
                    {plans?.aggregate?.count > 0 && (
                        <ReactTabulator
                            ref={tableRef}
                            columns={columns}
                            options={{
                                ...tableOptions,
                                placeholder: 'No Subscription Plans Available Yet !',
                            }}
                            data={plans?.nodes || []}
                        />
                    )}
                </>
            )} */}
        </Flex>
    )
}
