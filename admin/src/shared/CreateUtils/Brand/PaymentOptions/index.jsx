import { useSubscription } from '@apollo/react-hooks'
import { Tunnel, TunnelHeader, Tunnels, useTunnel } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { PAYMENT_OPTIONS } from '../../../../apps/brands/graphql'
import { InlineLoader, Tooltip } from '../../../components'
import { logger } from '../../../utils'
import { TunnelBody } from '../../styled'
import { CompanyCard, CompanyList } from './styled'
import { AvailablePaymentOption } from './tunnels/availablePaymentOption'

export const PaymentOption = ({ closeTunnel }) => {

    const [companyDetails, setCompanyDetails] = useState(null)
    const [tunnels, open, close] = useTunnel(1)

    //* subscription
    const { loading,
        error,
        data: { brands_supportedPaymentCompany: companyData = [] } = {}
    } = useSubscription(PAYMENT_OPTIONS.COMPANY_LIST)


    if (error) {
        toast.error('Something went wrong!')
        logger(error)
    }
    if (loading) return <InlineLoader />
    return (
        <div>
            <TunnelHeader title="Select Payment Company"
                right={{
                    action: () => {
                        companyDetails ? open(1) : toast.error('Please select a payment company!')
                    },
                    title: 'Next',
                }}
                close={() => (
                    closeTunnel(1),
                    setCompanyDetails(null)
                )}
                tooltip={<Tooltip identifier="create_payment_option_tunnelHeader" />}
            />
            <TunnelBody>
                <CompanyList>
                    {
                        companyData.map(company => (
                            <CompanyCard
                                key={company.id}
                                onClick={() => setCompanyDetails(company)}
                                active={company.id === companyDetails?.id}
                            >
                                <img
                                    src={company.logo}
                                    alt="new"
                                />
                                <div>{company.label.charAt(0)
                                    .toUpperCase() + company.label.slice(1)}</div>
                            </CompanyCard>
                        ))
                    }
                </CompanyList>
            </TunnelBody>
            <Tunnels tunnels={tunnels}>
                <Tunnel layer={1} size="md">
                    <AvailablePaymentOption close={close} companyDetails={companyDetails} />
                </Tunnel>
            </Tunnels>
        </div>
    )
}
