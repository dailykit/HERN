import React, { useState } from 'react'
import 'antd/dist/antd.css'
import { HelperText } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import { InlineLoader } from '../../../../../../../../shared/components'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { Row, Col, Typography, Form, Input, Button, Modal } from 'antd'
import { FacebookIcon } from '../../../../../../../../shared/assets/icons'
import { BRANDS } from '../../../../../../graphql'
import { InfoCircleOutlined } from '@ant-design/icons'

const FacebookPixelId = ({ update }) => {
    const params = useParams()
    const [settingId, setSettingId] = React.useState(null)
    const { Title } = Typography
    //for modal
    const [isFbPixelModalVisible, setIsFbPixelModalVisible] = useState(false)
    const showFbPixelModal = () => {
        setIsFbPixelModalVisible(true)
    }
    const handleFbPixelOk = () => {
        setIsFbPixelModalVisible(false)
    }
    const handleFbPixelCancel = () => {
        setIsFbPixelModalVisible(false)
    }

    const [form, setForm] = useState({
        fbPixelId: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
    })

    const [seoDetails, { loading: metaDetailsLoading, brandSettings }] =
        useLazyQuery(BRANDS.SETTINGS, {
            onCompleted: ({ brandSettings }) => {
                if (!isEmpty(brandSettings)) {
                    const index = brandSettings.findIndex(
                        node => node?.brand?.brandId === Number(params.id)
                    )
                    if (index === -1) {
                        const { id } = brandSettings[0]
                        setSettingId(id)
                        return
                    }
                    const { brand, id } = brandSettings[index]
                    setSettingId(id)
                    setForm(prev => ({
                        fbPixelId: {
                            ...prev.fbPixelId,
                            value: brand?.value?.fbPixelId,
                        },
                    }))
                }
            },
            onError: error => {
                toast.error('Something went wrong with BasicSEO')
                logger(error)
            },
            fetchPolicy: 'cache-and-network',
        })

    React.useEffect(() => {
        seoDetails({
            variables: {
                identifier: { _eq: 'facebookPixelId' },
                type: { _eq: 'seo' },
            },
        })
    }, [])

    // Mutation for upserting seo meta data
    const [upsertSEODetails] = useMutation(BRANDS.UPDATE_BRAND_SETTING, {
        onCompleted: () => {
            toast.success('Updated!')
        },
        onError: error => {
            toast.error('Something went wrong with UPDATE_BRAND_SETTING')
            console.log(error)
            logger(error)
        },
    })
    console.log({
        object: {
            value: {
                fbPixelId: form.fbPixelId.value,
            },
            brandId: params.id,
            brandSettingId: settingId,
        },
    })

    //save changes
    const Save = () => {
        upsertSEODetails({
            variables: {
                object: {
                    value: {
                        fbPixelId: form.fbPixelId.value,
                    },
                    brandId: params.id,
                    brandSettingId: settingId,
                },
            },
        })
        update({
            id: settingId,
            value: {
                fbPixelId: form.fbPixelId.value,
            },
        })
        setIsFbPixelModalVisible(false)
    }

    if (metaDetailsLoading) return <InlineLoader />

    const onChangeHandler = e => {
        const { name, value } = e.target
        console.log(name, value)
        setForm(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
            },
        }))
    }

    return (
        <div className="metaDetails fbContainer">
            <Row>
                <Col span={2}>
                    <FacebookIcon />
                </Col>
                <Col span={18}>
                    <Title level={4}>Facebook Pixel</Title>
                    <HelperText
                        type="hint"
                        message="Facebook Pixel tracks customer behavior on your online store. This data improves your marketing abilities, including retargeting ads"
                    />
                </Col>
                <Col span={4}>
                    <Button type="primary" onClick={showFbPixelModal}>
                        {form.fbPixelId.value ? "Connected" : "Connect Facebook Pixel"}
                    </Button>
                    {/* modal for editing */}
                    <Modal
                        title="Add Facebook Pixel Id"
                        visible={isFbPixelModalVisible}
                        onOk={handleFbPixelOk}
                        onCancel={handleFbPixelCancel}
                        footer={[
                            <Button key="submit" type="primary" onClick={() => Save()}>
                                Save
                            </Button>
                        ]}
                    >
                        <Form layout="vertical">
                            <Form.Item
                                label={
                                    <span
                                        style={{
                                            color: '#555B6E',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Facebook Pixel Id
                                    </span>
                                }
                                tooltip={{
                                    title: 'Track conversions and measure the success of Facebook campaigns.',
                                    icon: (
                                        <InfoCircleOutlined
                                            style={{
                                                background: '#555B6E',
                                                color: 'white',
                                                borderRadius: '50%',
                                            }}
                                        />
                                    ),
                                }}
                            >
                                <Input
                                    strong
                                    level={5}
                                    placeholder="Enter Facebook Pixel Id"
                                    style={{
                                        width: '60%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    className="text-box"
                                    bordered={false}
                                    value={form.fbPixelId.value}
                                    onChange={onChangeHandler}
                                    id="fbPixelId"
                                    name="fbPixelId"
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </div>
    )
}

export default FacebookPixelId
