import React from 'react'
import { toast } from 'react-toastify'
import { Card } from 'antd'
import 'antd/dist/antd.css'
import { isEmpty, groupBy } from 'lodash'
import { useParams } from 'react-router-dom'
import { useMutation, useSubscription } from '@apollo/react-hooks'
import { BRANDS } from '../../../../../../../graphql'
import validator from '../../../../../../validator'
import { logger } from '../../../../../../../../../shared/utils'
import { Form, Spacer, Text, TextButton } from '@dailykit/ui'
import { Flex } from '../../../../../../../../../shared/components'

import ConfigTemplateUI from '../../../../../../../../../shared/components/ConfigTemplateUI'


export const Brand = ({ update }) => {
    const params = useParams()
    const [settings, setSettings] = React.useState({})
    const [settingId, setSettingId] = React.useState(null)
    const [configTemplate, setConfigTemplate] = React.useState({})
    const [form, setForm] = React.useState({
        brandEmail: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
        brandPhoneNo: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
    })

    const [updateSetting] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
        onCompleted: () => {
            toast.success('Successfully updated!')
        },
        onError: error => {
            toast.error('Something went wrong!')
            console.log("error", error)
            logger(error)
        },
    })
    const { loading: loadingSettings } = useSubscription(BRANDS.SETTING, {
        variables: {
            identifier: { _eq: 'Contact' },
            type: { _eq: 'brand' },
        },
        onSubscriptionData: ({
            subscriptionData: { data: { brandSettings = [] } = {} } = {},
        }) => {
            if (!isEmpty(brandSettings)) {
                const index = brandSettings.findIndex(
                    node => node?.brand?.brandId === Number(params.id)
                )

                if (index === -1) {
                    const { id, configTemplate } = brandSettings[0]
                    setConfigTemplate(configTemplate)
                    setSettingId(id)
                    return
                }
                const { brand, id, configTemplate } = brandSettings[index]
                setConfigTemplate(configTemplate)
                setSettingId(id)

                if ('email' in brand.value || 'phoneNo' in brand.value) {
                    setForm({
                        ...form,
                        brandEmail: { value: brand.value.email },
                        brandPhoneNo: { value: brand.value.phoneNo }
                    })
                }
            }
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


    const onChangeHandler = e => {
        const { name, value } = e.target
        console.log(name, value)
        setForm({
            ...form,
            [name]: {
                ...form[name],
                value,
            },
        })
    }

    const onBlur = target => {
        const { name, value } = target
        if (name === 'brandEmail') {
            const { isValid, errors } = validator.email(value)
            setForm({
                ...form,
                brandEmail: {
                    value: value,
                    meta: {
                        isTouched: true,
                        isValid,
                        errors,
                    }
                }
            })
        }
        if (name === 'brandPhoneNo') {
            const { isValid, errors } = validator.phone(value)
            setForm({
                ...form,
                brandPhoneNo: {
                    value: value,
                    meta: {
                        isTouched: true,
                        isValid,
                        errors,
                    }
                }
            })
        }
    }

    const saveInfo = () => {
        updateSetting({
            variables: {
                object: {
                    brandId: 1,
                    brandSettingId: 10,
                    value: {
                        email: form.brandEmail.value,
                        phoneNo: form.brandPhoneNo.value,
                    },
                }
            }
        })
    }

    return (
        <div>
            {console.log("configTemplate", configTemplate)}
            <ConfigTemplateUI config={configTemplate} />
        </div>
    )
}
