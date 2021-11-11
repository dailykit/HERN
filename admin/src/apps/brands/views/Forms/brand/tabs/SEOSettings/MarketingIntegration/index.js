import React from 'react'
import { toast } from 'react-toastify'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'

import { StyledWrapper } from './styled'
import { Card, Typography } from 'antd'

import FacebookPixelId from './facebookPixel'
import GoogleAnalyticsId from './googleAnalytics'

const MarketingIntegration = () => {
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
        <StyledWrapper>
            <Card style={{ width: '100%' }}>
                <Typography.Title level={4}>Marketing Integration</Typography.Title>
                <FacebookPixelId update={update} />
                <GoogleAnalyticsId update={update} />
            </Card>
        </StyledWrapper>
    )
}

export default MarketingIntegration
