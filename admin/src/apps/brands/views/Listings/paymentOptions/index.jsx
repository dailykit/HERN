import { useMutation, useSubscription } from '@apollo/react-hooks'
import { ButtonGroup, ComboButton, Flex, Form, IconButton, PlusIcon, Spacer, Text, TextButton, Tunnel, Tunnels, useTunnel } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import React from 'react'
import { toast } from 'react-toastify'
import { DeleteIcon } from '../../../../../shared/assets/icons'
import { Banner, DragNDrop, InlineLoader, Tooltip } from '../../../../../shared/components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { PaymentOption } from '../../../../../shared/CreateUtils/Brand/PaymentOptions'
import { useTabs } from '../../../../../shared/providers'
import { logger } from '../../../../../shared/utils'
import { DragIcon } from '../../../assets/icons'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { GridContainer, StyledCardText, StyledCompany, StyledDelete, StyledDrag, StyledHeader, StyledWrapper } from '../styled'
import axios from 'axios'

export const PaymentOptions = () => {
    const { initiatePriority } = useDnd()
    const { tab, addTab } = useTabs()
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
                `Are you sure you want to delete payment option - ${paymentOption.label}?`
            )
        ) {
            deletePaymentOption({
                variables: {
                    id: paymentOption.id,
                },
            })
        }
        // console.log(brandCoupon)
    }
    const cellClick = element => {
        addTab(
            element?.label || 'N/A',
            `/brands/payment/${element.id}`
        )
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
                <ButtonGroup>
                    <TextButton
                        type="ghost"
                        title='Synchronization after changes in payment option'
                        size={24}
                        onClick={() => axios.post(`${window.location.origin}/server/api/envs`)}
                    >
                        Sync Credentials
                    </TextButton>
                    <Spacer xAxis size={"16px"} />
                    <ComboButton type="solid" onClick={() => openTunnel(1)}>
                        <PlusIcon color="white" />
                        Create New
                    </ComboButton>
                </ButtonGroup>

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
                                <GridContainer key={element.id} >
                                    <StyledDrag ><DragIcon /></StyledDrag>
                                    <StyledCompany
                                        title={element.supportedPaymentOption.supportedPaymentCompany.label.charAt(0)
                                            .toUpperCase() + element.supportedPaymentOption.supportedPaymentCompany.label.slice(1)}
                                        onClick={() => cellClick(element)}
                                    >
                                        <img
                                            src={element.supportedPaymentOption.supportedPaymentCompany.logo}
                                            alt="new"
                                            width={28}
                                            height={32}
                                        />
                                        <div>{element.supportedPaymentOption.supportedPaymentCompany.label.charAt(0)
                                            .toUpperCase() + element.supportedPaymentOption.supportedPaymentCompany.label.slice(1)}</div>
                                    </StyledCompany>
                                    <StyledCardText title={element.label} onClick={() => cellClick(element)}>
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
                                                Published
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
