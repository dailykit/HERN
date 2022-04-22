import { useMutation, useSubscription } from '@apollo/react-hooks'
import { ComboButton, Flex, Form, IconButton, PlusIcon, Text, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import React from 'react'
import { toast } from 'react-toastify'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import { Banner, DragNDrop, InlineLoader, Tooltip } from '../../../../../shared/components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { PaymentOption } from '../../../../../shared/CreateUtils/Brand/PaymentOptions'
import { logger } from '../../../../../shared/utils'
import { DragIcon } from '../../../assets/icons'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { GridContainer, StyledCardText, StyledCompany, StyledDelete, StyledDrag, StyledHeader, StyledWrapper } from '../styled'

export const PaymentOptions = () => {
    const { initiatePriority } = useDnd()
    const [tunnels, openTunnel, closeTunnel] = useTunnel(1)

    //subscription
    const {
        error,
        loading: listLoading,
        data: { brands_availablePaymentOption: paymentOptions = [] } = {},
    } = useSubscription(PAYMENT_OPTIONS.LIST)
    console.log(paymentOptions);

    //mutation
    const [updatePaymentOption, { loading: inFlight }] = useMutation(
        PAYMENT_OPTIONS.UPDATE,
        {
            onCompleted: () => {
                toast.success('Payment Options update successfully!')
            },
            onError: error => {
                logger(error)
                toast.error('Error update Payment Options!')
            },
        }
    )
    const [deletePaymentOption] = useMutation(PAYMENT_OPTIONS.DELETE, {
        onCompleted: () => {
            toast.success('Payment option deleted!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            logger(error)
        },
    })

    //useEffect
    React.useEffect(() => {
        if (!listLoading && !isEmpty(paymentOptions)) {
            initiatePriority({
                tablename: 'availablePaymentOption',
                schemaname: 'brands',
                data: paymentOptions,
            })
        }
    }, [listLoading, paymentOptions])

    //handler 
    const paymentOptionActiveHandler = paymentOption => {
        const value = !paymentOption.isActive
        updatePaymentOption({
            variables: {
                id: paymentOption.id,
                _set: {
                    isActive: value
                }
            },
        })
    }
    const deletePaymentOptionHandler = paymentOption => {
        if (
            window.confirm(
                `Are you sure you want to delete product - ${paymentOption.coupon.code}?`
            )
        ) {
            deletePaymentOption({
                variables: {
                    brandId: paymentOption.brandId,
                    couponId: paymentOption.couponId
                },
            })
        }
        // console.log(brandCoupon)
    }

    if (error) {
        toast.error('Something went wrong!')
        logger(error)
    }
    if (listLoading) return <InlineLoader />
    return (
        <StyledWrapper>
            <StyledHeader>
                <Flex container alignItems="center">
                    <Text as="h2" style={{ marginBottom: '0px' }}>
                        Payment Options ({paymentOptions?.length || 0})
                    </Text>
                    <Tooltip identifier="payment_options_listing_heading" />
                </Flex>
                <ComboButton type="solid" onClick={() => openTunnel(1)}>
                    <PlusIcon color="white" />
                    Create New
                </ComboButton>
            </StyledHeader>
            {
                Boolean(paymentOptions.length) && (
                    <Flex>
                        <DragNDrop
                            list={paymentOptions}
                            droppableId="paymentOptionsDroppableId"
                            tablename="availablePaymentOption"
                            schemaname="brands"
                        >
                            {paymentOptions.map(element => (
                                <GridContainer key={element.id}>
                                    <StyledDrag ><DragIcon /></StyledDrag>
                                    <StyledCompany title={element.supportedPaymentOption.supportedPaymentCompany.label.charAt(0)
                                        .toUpperCase() + element.supportedPaymentOption.supportedPaymentCompany.label.slice(1)}>
                                        <img
                                            src={element.supportedPaymentOption.supportedPaymentCompany.logo}
                                            alt="new"
                                            width={28}
                                            height={32}
                                        />
                                        <div>{element.supportedPaymentOption.supportedPaymentCompany.label.charAt(0)
                                            .toUpperCase() + element.supportedPaymentOption.supportedPaymentCompany.label.slice(1)}</div>
                                    </StyledCompany>
                                    <StyledCardText title={element.label}>
                                        <span>Label</span>
                                        <span>{element.label}</span>
                                    </StyledCardText>
                                    <StyledCardText title={element.supportedPaymentOption.paymentOptionLabel}>
                                        <span>Payment Option</span>
                                        <span>{element.supportedPaymentOption.paymentOptionLabel}</span>
                                    </StyledCardText>
                                    <StyledCardText>
                                        <Form.Group>
                                            <Form.Toggle
                                                name={`toggle-${element.id}`}
                                                title="Click to change active status of payment option"
                                                onChange={() => paymentOptionActiveHandler(element)}
                                                value={element.isActive}
                                            >
                                                Active
                                            </Form.Toggle>
                                        </Form.Group>
                                    </StyledCardText >
                                    <StyledDelete>
                                        <IconButton
                                            type="ghost"
                                            title="Click to remove payment option"
                                            onClick={() => deletePaymentOptionHandler(element)}
                                        >
                                            <DeleteIcon color="#FF5A52" />
                                        </IconButton>
                                    </StyledDelete>
                                </GridContainer>
                            )
                            )}
                        </DragNDrop>
                    </Flex>
                )
            }
            <Tunnels tunnels={tunnels}>
                <Tunnel layer={1} size="md">
                    <PaymentOption closeTunnel={closeTunnel} />
                </Tunnel>
            </Tunnels>
            <Banner id="brands-app-payment-options-listing-bottom" />
        </StyledWrapper>
    )
}
