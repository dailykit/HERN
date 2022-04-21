import { useSubscription } from '@apollo/react-hooks'
import { Flex, Text } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import React from 'react'
import { toast } from 'react-toastify'
import { DragNDrop, InlineLoader, Tooltip } from '../../../../../shared/components'
import { useDnd } from '../../../../../shared/components/DragNDrop/useDnd'
import { logger } from '../../../../../shared/utils'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'

export const PaymentOptions = () => {
    const { initiatePriority } = useDnd()

    const {
        error,
        loading: listLoading,
        data: { brands_availablePaymentOption: paymentOptions = [] } = {},
    } = useSubscription(PAYMENT_OPTIONS.LIST)
    console.log(paymentOptions);

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
                                <p key={element.id}>Payment list</p>
                            )
                            )}
                        </DragNDrop>
                    </Flex>
                )
            }
        </StyledWrapper>
    )
}
