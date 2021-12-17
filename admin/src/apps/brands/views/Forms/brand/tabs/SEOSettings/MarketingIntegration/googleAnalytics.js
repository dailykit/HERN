import React, { useState } from 'react'
import 'antd/dist/antd.css'
import { HelperText } from '@dailykit/ui'
import { isEmpty } from 'lodash'
import { InlineLoader } from '../../../../../../../../shared/components'
import { useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { logger } from '../../../../../../../../shared/utils'
import { Row, Col, Typography, Form, Input, Button, Modal } from 'antd'
import { GoogleAnalyticsIcon } from '../../../../../../../../shared/assets/icons'
import { BRANDS } from '../../../../../../graphql'
import { InfoCircleOutlined } from '@ant-design/icons'

const GoogleAnalyticsId = ({ update }) => {
    const params = useParams()
    const [settingId, setSettingId] = React.useState(null)
    const { Title } = Typography
    //for modal
    const [isGoogleAnalyticsModalVisible, setIsGoogleAnalyticsModalVisible] =
        useState(false)
    const showGoogleAnalyticsModal = () => {
        setIsGoogleAnalyticsModalVisible(true)
    }
    const handleGoogleAnalyticsOk = () => {
        setIsGoogleAnalyticsModalVisible(false)
    }
    const handleGoogleAnalyticsCancel = () => {
        setIsGoogleAnalyticsModalVisible(false)
    }

    const [form, setForm] = useState({
        googleAnalyticsId: {
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
                    const { brand, id } = brandSettings[0]
                    setSettingId(id)
                    setForm(prev => ({
                        googleAnalyticsId: {
                            ...prev.googleAnalyticsId,
                            value: brand[0]?.value?.googleAnalyticsId,
                        },
                    }))
                }
            },
            onError: error => {
                toast.error('Something went wrong with google Analytics')
                logger(error)
            },
            fetchPolicy: 'cache-and-network',
        })

    React.useEffect(() => {
        seoDetails({
            variables: {
                identifier: { _eq: 'googleAnalyticsId' },
                type: { _eq: 'seo' },
                brandId: { _eq: params?.id }
            },
        })
    }, [])

    //save changes
    const Save = () => {
        update({
            id: settingId,
            brandId: params.id,
            value: {
                googleAnalyticsId: form?.googleAnalyticsId?.value,
            },
        })
        setIsGoogleAnalyticsModalVisible(false)
    }

    if (metaDetailsLoading) return <InlineLoader />

    const onChangeHandler = e => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
            },
        }))
    }

    return (
        <div className="metaDetails">
            <Row>
                <Col span={2}>
                    <GoogleAnalyticsIcon />
                </Col>
                <Col span={18}>
                    <Title level={4}>Google Analytics</Title>
                    <HelperText
                        type="hint"
                        message="Google Analytics enables you to track the visitors to your store, and generates reports that will help you with your marketing"
                    />
                </Col>
                <Col span={4}>
                    <Button type="primary" onClick={showGoogleAnalyticsModal}>
                        {form.googleAnalyticsId.value ? "Connected" : "Connect Google Analytics"}
                    </Button>
                    {/* modal for editing */}
                    <Modal
                        title="Add Google Analytics Id"
                        visible={isGoogleAnalyticsModalVisible}
                        onOk={handleGoogleAnalyticsOk}
                        onCancel={handleGoogleAnalyticsCancel}
                        footer={[
                            <Button key="submit" type="primary" onClick={() => Save()}>
                                Save
                            </Button>,
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
                                        Google Analytics Id
                                    </span>
                                }
                                tooltip={{
                                    title: 'Discover where your visitors come from and what they do on your site.',
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
                                    placeholder="Enter Google Analytics Id"
                                    style={{
                                        width: '60%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    className="text-box"
                                    bordered={false}
                                    value={form.googleAnalyticsId.value}
                                    onChange={onChangeHandler}
                                    id="googleAnalyticsId"
                                    name="googleAnalyticsId"
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </div>
    )
}

export default GoogleAnalyticsId
