import React from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { toast } from 'react-toastify'
import { PRODUCT, PRODUCT_ID } from '../../../../graphql'
import { logger } from '../../../../../../shared/utils'
import ConfigTemplateUI from '../../../../../../shared/components/ConfigTemplateUI'
import { useInView } from "react-intersection-observer";


export const SettingsCard = ({ setting, title, isChangeSaved, setIsSavedChange, setIsComponentIsOnView, componentIsOnView, setMode, mode, saveAllSettings, setSaveAllSettings, alertShow, setAlertShow, brandId }) => {
    const [config, setConfig] = React.useState({})
    const params = useParams()
    const [setting_product_Id, setProductId] = React.useState('')
    const { ref, inView } = useInView({
        threshold: 0
    });

    React.useEffect(() => {
        if (inView && !componentIsOnView.includes(title)) {
            setIsComponentIsOnView([...componentIsOnView, title])
        }
        else if (!inView && componentIsOnView.includes(title)) {
            const res = componentIsOnView.filter((i) => i !== title)

            setIsComponentIsOnView([...res])
        }
    }, [
        inView,
        title,
    ])

    const [updateSetting] = useMutation(PRODUCT.UPDATE_PRODUCT_SETTING, {
        onCompleted: () => {
            toast.success('Successfully updated productSetting')
        },
        onError: error => {
            toast.error('Something went wrong!!')
            logger(error)
        },
    })
    React.useEffect(() => setConfig(setting?.value), [config])


    React.useEffect(() => {
        if (setting == [] && setting?.value == null) {
            updateSetting({
                variables: {
                    object: {
                        productId: params?.id,
                        productSettingId: setting?.productSetting?.id,
                        value: setting.configTemplate,
                        brandId: brandId
                    },
                },
            })
        }
    }, [])

    //for updating previous changes
    React.useEffect(() => {
        if (saveAllSettings !== {} && isChangeSaved == false) {
            getProductSettingId({
                variables: {
                    identifier: { _eq: Object.keys(saveAllSettings)[0] },
                    brandId: { _eq: brandId }
                }
            })
        }
    }, [saveAllSettings, isChangeSaved])

    //from identifier getting productId
    const [getProductSettingId, { loading, products_product_productSetting }] =
        useLazyQuery(PRODUCT_ID, {
            onCompleted: ({ products_product_productSetting }) => {
                setProductId(products_product_productSetting[0]?.productSettingId)
            },
            onError: error => {
                toast.error('Something went wrong!')
                logger(error)
            }
        })

    const saveInfo = () => {
        //saving changes in alert box(save changes button)
        if (saveAllSettings !== {} && isChangeSaved == false && setting_product_Id) {
            updateSetting({
                variables: {
                    object: {
                        productId: params?.id,
                        productSettingId: setting_product_Id,
                        value: saveAllSettings,
                        brandId: brandId
                    },
                },
            })
            setAlertShow(true)
        }
        else {
            updateSetting({
                variables: {
                    object: {
                        productId: params?.id,
                        productSettingId: setting?.productSetting?.id,
                        value: config,
                        brandId: brandId
                    },
                },
            })
        }
    }

    return (
        <div ref={ref} style={{ marginBottom: "1em" }}>
            <ConfigTemplateUI
                config={config}
                setConfig={setConfig}
                configSaveHandler={saveInfo}
                identifier={title}
                isChangeSaved={isChangeSaved}
                setIsSavedChange={setIsSavedChange}
                mode={mode}
                setMode={setMode}
                //all for alert box 
                saveAllSettings={saveAllSettings}
                setSaveAllSettings={setSaveAllSettings}
                alertShow={alertShow}
            />
        </div>
    )
}
