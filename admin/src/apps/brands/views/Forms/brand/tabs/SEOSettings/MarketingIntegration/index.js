import React from 'react'
import { toast } from 'react-toastify'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../../graphql'
import { logger } from '../../../../../../../../shared/utils'

import { StyledWrapper } from './styled'
import { Card, Typography } from 'antd'

import FacebookPixelId from './facebookPixel'
import GoogleAnalyticsId from './googleAnalytics'

const MarketingIntegration = () => {
    const params = useParams()

    //updates facebookPixel and googleAnalytics id
    const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
        onCompleted: () => {
            toast.success('Successfully updated!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            logger(error)
        },
    })

    //passing id and value from facebookPixel and googleAnalytics component for updating
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
