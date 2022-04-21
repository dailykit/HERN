import { useSubscription } from '@apollo/react-hooks'
import { Flex, Text } from '@dailykit/ui'
import React from 'react'
import { toast } from 'react-toastify'
import { InlineLoader, Tooltip } from '../../../../../shared/components'
import { logger } from '../../../../../shared/utils'
import { PAYMENT_OPTIONS } from '../../../graphql'
import { StyledHeader, StyledWrapper } from '../styled'

export const PaymentOptions = () => {

    const {
        error,
        loading: listLoading,
        data: { brands_availablePaymentOption: paymentOptions = [] } = {},
    } = useSubscription(PAYMENT_OPTIONS.LIST)
    console.log(paymentOptions);

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
        </StyledWrapper>
    )
}
