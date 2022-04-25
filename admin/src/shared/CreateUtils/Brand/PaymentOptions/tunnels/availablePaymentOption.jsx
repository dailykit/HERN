import React from 'react'
import { Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import { InlineLoader, Tooltip } from '../../../../components'
import { TunnelBody } from '../../../styled'
import { OptionList } from '../styled'

export const AvailablePaymentOption = ({ close, companyDetails }) => {
    return (
        <div>
            <TunnelHeader title="Select Payment option"
                right={{
                    action: () => {
                        console.log("selection", companyDetails);
                    },
                    title: 'Next',
                }}
                close={() => (
                    close(1)
                )}
                tooltip={<Tooltip identifier="create_payment_option_tunnelHeader" />}
            />
            <TunnelBody>
                <OptionList>
                    {
                        companyDetails.supportedPaymentOptions.map(option => (
                            <div
                                key={option.id}
                            >
                                {option.paymentOptionLabel}
                            </div>
                        ))
                    }
                </OptionList>
            </TunnelBody>
        </div>
    )
}
