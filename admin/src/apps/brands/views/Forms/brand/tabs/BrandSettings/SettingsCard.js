import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../shared/components/ConfigTemplateUI'

export const SettingsCard = ({ setting, title, isChangeSaved, setIsSavedChange }) => {
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

    return (
        <ConfigTemplateUI
            config={config}
            setConfig={setConfig}
            configSaveHandler={saveInfo}
            identifier={title}
            isChangeSaved={isChangeSaved}
            setIsSavedChange={setIsSavedChange}
        />
    )
}