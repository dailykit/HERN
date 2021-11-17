import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { Card } from 'antd'
import { Text } from '@dailykit/ui'
import { BRANDS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../shared/components/ConfigTemplateUI'

export const SettingsCard = ({ setting, title }) => {
    const [config, setConfig] = React.useState({})
    const params = useParams()
    const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
        onCompleted: () => {
            toast.success('Successfully updated!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            console.log('error in BRANDS.UPDATE_BRAND_SETTING', error)
            logger(error)
        },
    })
    React.useEffect(() => setConfig(setting?.value), [config])
    React.useEffect(() => {
        if (setting == [] && setting?.value == null) {
            updateSetting({
                variables: {
                    object: {
                        brandId: params?.id,
                        brandSettingId: setting?.brandSetting?.id,
                        value: setting.configTemplate,
                    },
                },
            })
        }
    }, [])
    const saveInfo = () => {
        updateSetting({
            variables: {
                object: {
                    brandId: params?.id,
                    brandSettingId: setting?.brandSetting?.id,
                    value: config,
                },
            },
        })
    }
    console.log(setting?.brandSetting?.id, setting?.value, title, "from setting Card")
    return (
        <Card
            title={title ? <Text as="h3">{title}</Text> : <Text as="h3" style={{ textAlign: "center" }}>Select a brand's setting to edit.</Text>}
            style={{ width: '100%' }}
        >
            <ConfigTemplateUI
                config={config}
                setConfig={setConfig}
                configSaveHandler={saveInfo}
            />
        </Card>
    )
}