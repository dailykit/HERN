import React from 'react'
import { toast } from 'react-toastify'
import { Card } from 'antd'
import 'antd/dist/antd.css'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../../../graphql'
import { logger } from '../../../../../../../../../shared/utils'
import { Text, TextButton } from '@dailykit/ui'
import {
    Flex
} from '../../../../../../../../../shared/components'
import {
    BrandLogo,
    BrandContact
} from '../../sections'

export const Brand = () => {
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
        <>
            <Card
                title={<Text as="h3">Brands</Text>}
                extra={
                    <TextButton type="solid" size="sm" onClick={update}>
                        Edit
                    </TextButton>
                }
                style={{ width: '100%' }}
            >
                <Flex container justifyContent="space-between">
                    <BrandContact update={update} />
                    <BrandLogo update={update} />
                </Flex>
            </Card>
        </>
    )
}
