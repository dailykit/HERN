import { useMutation, useSubscription } from '@apollo/react-hooks'
import { ButtonGroup, ComboButton, Flex, Form, IconButton, PlusIcon, Text, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import React from 'react'
import { useParams } from 'react-router-dom'
import { BRAND_COUPONS } from '../../../../../graphql'
import { DragNDrop, InlineLoader } from '../../../../../../../shared/components'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'
import { isEmpty } from 'lodash'
import { CouponCard, StyledDelete, StyledHeader, StyledIcon, StyledText } from '../../styled'
import { DeleteIcon, DragIcon } from '../../../../../../../shared/assets/icons'
import { BrandCouponsTunnel } from '../../Tunnels/BrandCoupons'
import { logger } from '../../../../../../../shared/utils'
import { toast } from 'react-toastify'

export const BrandCoupons = () => {
    const params = useParams()
    const { initiatePriority } = useDnd()
    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

    //subscription
    const { loading, error, data: { brandCoupons = [] } = {} } = useSubscription(BRAND_COUPONS.LIST, {
        variables: {
            brandId: {
                _eq: params.id,
            },
        },
    })

    //mutation
    const [deleteCoupon] = useMutation(BRAND_COUPONS.DELETE, {
        onCompleted: () => {
            toast.success('Coupon deleted!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            logger(error)
        },
    })

    const [updateCoupon, { loading: inFlight }] = useMutation(
        BRAND_COUPONS.UPDATE,
        {
            onCompleted: () => {
                toast.success('Coupons update successfully!')
            },
            onError: error => {
                logger(error)
                toast.error('Error update Coupons!')
            },
        }
    )

    //useEffect
    React.useEffect(() => {
        if (!loading && !isEmpty(brandCoupons)) {
            initiatePriority({
                tablename: 'brand_coupon',
                schemaname: 'crm',
                data: brandCoupons,
            })
        }
    }, [loading, brandCoupons])
    // console.log("brandCouponsAggregate", brandCoupons);

    // Handler
    const deleteCouponHandler = brandCoupon => {
        if (
            window.confirm(
                `Are you sure you want to delete product - ${brandCoupon.coupon.code}?`
            )
        ) {
            deleteCoupon({
                variables: {
                    brandId: brandCoupon.brandId,
                    couponId: brandCoupon.couponId
                },
            })
        }
        // console.log(brandCoupon)
    }
    const couponToggleHandler = brandCoupon => {
        const value = !brandCoupon.isActive
        updateCoupon({
            variables: {
                brandId: brandCoupon.brandId,
                couponId: brandCoupon.couponId,
                _set: {
                    isActive: value
                }
            },
        })
        // console.log(brandCoupon)
    }

    if (loading) return <InlineLoader />
    return (
        <Flex padding="16px 16px 16px 34px">
            <StyledHeader>
                <Text as="h2">
                    Brand Coupons ({brandCoupons.length || 0})
                </Text>
                <ButtonGroup>
                    <ComboButton
                        type="ghost"
                        size="sm"
                        onClick={() => openTunnel(1)}
                        title="Click to add new Coupon"
                    >
                        <PlusIcon color="#367BF5" /> Add More
                    </ComboButton>
                </ButtonGroup>
            </StyledHeader>
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
                                    <StyledIcon><DragIcon /></StyledIcon>
                                    <StyledText
                                        title={brandCoupon.coupon.code}
                                    >
                                        {brandCoupon.coupon.code}
                                    </StyledText>
                                    <StyledText>
                                        <Form.Group>
                                            <Form.Toggle
                                                name={`toggle-${brandCoupon.id}`}
                                                title="Click to change active status of coupon"
                                                onChange={() => couponToggleHandler(brandCoupon)}
                                                value={brandCoupon.isActive}
                                            >
                                                Active
                                            </Form.Toggle>
                                        </Form.Group>
                                    </StyledText>
                                    <StyledDelete>
                                        <IconButton
                                            type="ghost"
                                            title="Click to remove coupon"
                                            onClick={() => deleteCouponHandler(brandCoupon)}
                                        >
                                            <DeleteIcon color="#FF5A52" />
                                        </IconButton>
                                    </StyledDelete>
                                </CouponCard>
                            ))}
                        </DragNDrop>
                    </Flex>
                )
            }
            <Tunnels tunnels={tunnels}>
                <Tunnel layer={1} size="md">
                    <BrandCouponsTunnel
                        close={closeTunnel}
                        brandId={params.id}
                    />
                </Tunnel>
            </Tunnels>
        </Flex>
    )
}   
