import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { BRANDS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../../shared/components/ConfigTemplateUI'
import { useInView } from "react-intersection-observer";
export const SettingsCard = ({ setting, title, isChangeSaved, setIsSavedChange, setIsComponentIsOnView, componentIsOnView }) => {
    const [config, setConfig] = React.useState({})
    const params = useParams()

    const { ref, inView } = useInView({
        threshold: 0
    });
    console.log(inView, "inView", ref)
    React.useEffect(() => {
        if (inView && !componentIsOnView.includes(title)) {
            setIsComponentIsOnView([...componentIsOnView, title])
        }
        else if (!inView && componentIsOnView.includes(title)) {
            const res = componentIsOnView.filter((i) => i !== title)
            console.log(res)
            setIsComponentIsOnView([...res])
        }
    }, [
        inView,
        title,
    ])
    console.log("componentIsOnView", componentIsOnView)
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
        <div ref={ref}>
            <ConfigTemplateUI
                config={config}
                setConfig={setConfig}
                configSaveHandler={saveInfo}
                identifier={title}
                isChangeSaved={isChangeSaved}
                setIsSavedChange={setIsSavedChange} />
        </div>
    )
}