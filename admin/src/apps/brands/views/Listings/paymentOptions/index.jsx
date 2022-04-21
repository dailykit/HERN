import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Flex, Form, Text } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import React from 'react'
import { toast } from 'react-toastify'
import { DragNDrop, InlineLoader, Tooltip } from '../../../../../shared/components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { logger } from '../../../../../shared/utils'
import { DragIcon } from '../../../assets/icons'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { GridContainer, StyledCardText, StyledCompany, StyledDrag, StyledHeader, StyledWrapper } from '../styled'

export const PaymentOptions = () => {
    const { initiatePriority } = useDnd()

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
        // console.log(paymentOption)
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
                                    <StyledCompany>
                                        <img
                                            src={element.supportedPaymentOption.supportedPaymentCompany.logo}
                                            alt="new"
                                            width={28}
                                            height={32}
                                        />
                                        <div>{element.supportedPaymentOption.supportedPaymentCompany.label.charAt(0)
                                            .toUpperCase() + element.supportedPaymentOption.supportedPaymentCompany.label.slice(1)}</div>
                                    </StyledCompany>
                                    <StyledCardText>
                                        <span>Label</span>
                                        <span>{element.label}</span>
                                    </StyledCardText>
                                    <StyledCardText>
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
                                </GridContainer>
                            )
                            )}
                        </DragNDrop>
                    </Flex>
                )
            }
        </StyledWrapper>
    )
}
