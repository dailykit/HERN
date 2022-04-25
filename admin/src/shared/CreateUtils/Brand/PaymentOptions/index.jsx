import { useSubscription } from '@apollo/react-hooks'
import { TunnelHeader } from '@dailykit/ui'
import React, { useState } from 'react'
import { toast } from 'react-toastify'
import { PAYMENT_OPTIONS } from '../../../../apps/brands/graphql'
import { InlineLoader, Tooltip } from '../../../components'
import { logger } from '../../../utils'
import { TunnelBody } from '../../styled'
import { CompanyCard, CompanyList } from './styled'

export const PaymentOption = ({ closeTunnel }) => {

    const [companyDetails, setCompanyDetails] = useState(null)

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
                        console.log('customerId', companyDetails);
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
        </div>
    )
}
