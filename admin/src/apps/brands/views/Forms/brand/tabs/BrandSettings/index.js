import React from 'react'
import { Card } from 'antd'
import 'antd/dist/antd.css'
import { toast } from 'react-toastify'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import { Text, Spacer, TextButton } from '@dailykit/ui'
import {
    Flex,
    InlineLoader,
    Tooltip,
} from '../../../../../../../shared/components'
import {
    BrandName,
    BrandLogo,
    BrandContact,
    AppTitle,
    Favicon,
    Slides,
    PrimaryColor,
    Payments,
    Pickup,
    Delivery,
    Store,
    Address,
    Coupons,
    Wallet,
    LoyaltyPoints,
    Scripts,
    NavLinks,
    Referral,
    FoodCostPercent,
    TermsAndConditions,
    PrivacyPolicy,
    TaxPercentage,
    Brand
} from './sections'
// import { RefundPolicy } from './sections/RefundPolicy'

export const BrandSettings = () => {
    const params = useParams()
    const [settings, setSettings] = React.useState({})
    const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
        onCompleted: () => {
            toast.success('Successfully updated!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            logger(error)
        },
    })
    const {
        loading,
        error,
        data: { brandSettings = [] } = {},
    } = useSubscription(BRANDS.SETTINGS_TYPES)
    if (error) {
        toast.error('Something went wrong!')
        logger(error)
    }

    React.useEffect(() => {
        if (!loading && !isEmpty(brandSettings)) {
            const grouped = groupBy(brandSettings, 'type')

            Object.keys(grouped).forEach(key => {
                grouped[key] = grouped[key].map(node => node.identifier)
            })
            setSettings(grouped)
        }
    }, [loading, brandSettings])

    const update = ({ id, value }) => {
        updateSetting({
            variables: {
                object: {
                    value,
                    brandId: params.id,
                    brandSettingId: id,
                },
            },
        })
    }

    return (
        <Flex padding="16px 16px 16px 34px">
            <Flex container alignItems="center">
                <Text as="h2">Brand Settings</Text>
                <Tooltip identifier="brands_collection_listing_heading" />
            </Flex>
            <Spacer size="24px" />
            <Brand update={update} />
            <Spacer size="24px" />
            <Card
                title={<Text as="h3">Availability</Text>}
                extra={
                    <TextButton type="solid" size="sm">
                        Save
                    </TextButton>
                }
                style={{ width: '100%' }}
            >
                <Payments update={update} />
                <Spacer size="24px" />
                <Address update={update} />
                <Spacer size="24px" />
                <Store update={update} />
                <Spacer size="24px" />
                <Pickup update={update} />
                <Spacer size="24px" />
                <Delivery update={update} />
            </Card>
            <Spacer size="48px" />
            <Card
                title={<Text as="h3">Rewards</Text>}
                extra={
                    <TextButton type="solid" size="sm">
                        Save
                    </TextButton>
                }
                style={{ width: '100%' }}
            >
                <Referral update={update} />
                <Spacer size="24px" />
                <Coupons update={update} />
                <Spacer size="24px" />
                <Wallet update={update} />
                <Spacer size="24px" />
                <LoyaltyPoints update={update} />
            </Card>
            <Spacer size="48px" />
            <Card
                title={<Text as="h3">Sales</Text>}
                extra={
                    <TextButton type="solid" size="sm">
                        Save
                    </TextButton>
                }
                style={{ width: '100%' }}
            >
                <FoodCostPercent update={update} />
                <Spacer size="24px" />
                <TaxPercentage update={update} />
            </Card>
            <Spacer size="24px" />
            {/* </ScrollSection.Section> */}
            <Spacer size="48px" />
        </Flex>
    )
}
