import React, { useState } from 'react'
import 'antd/dist/antd.css'
import { HelperText } from '@dailykit/ui'
import {
    InlineLoader
} from '../../../../../../../shared/components'
import { useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
// import { logger } from '../../../../../../../../shared/utils'
import { Row, Col, Typography, Form, Input, Button, Modal } from 'antd'
import { LocalBusinessIcon } from '../../../../../../../shared/assets/icons'
import { SEO_DETAILS } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import { InfoCircleOutlined } from '@ant-design/icons'

const LocalBusiness = ({ update }) => {
    const params = useParams()
    const { pageId, pageName } = useParams()
    const { Title } = Typography
    //for modal
    const [localBusinessJSONModalVisible, setLocalBusinessJSONModalVisible] = useState(false)
    const showFbPixelModal = () => {
        setLocalBusinessJSONModalVisible(true)
    }
    const handleFbPixelOk = () => {
        setLocalBusinessJSONModalVisible(false)
    }
    const handleFbPixelCancel = () => {
        setLocalBusinessJSONModalVisible(false)
    }
    const brandPageId = React.useMemo(() => parseInt(pageId), [])
    const [form, setForm] = useState({
        LocalBusinessJSON: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
    })

    const [seoDetails, { loading: metaDetailsLoading, brandsSEO }] =
        useLazyQuery(SEO_DETAILS, {
            onCompleted: brandsSEO => {
                const seoSettings =
                    brandsSEO.brands_brandPage_brandPageSetting_by_pk
                setForm(prev => ({
                    LocalBusinessJSON: {
                        ...prev.LocalBusinessJSON,
                        value: seoSettings[0]?.value,
                    },
                }))
            },
            onError: error => {
                toast.error('Something went wrong')
                logger(error)
            },
            fetchPolicy: 'cache-and-network',
        })

    React.useEffect(() => {
        seoDetails({
            variables: {
                brandPageId: brandPageId,
                brandPageSettingId: 4,
            },
        })
    }, [])

    //save changes
    const Save = () => {
        update({
            id: 4,
            brandId: params.id,
            value: form.LocalBusinessJSON.value,
        })
        setLocalBusinessJSONModalVisible(false)
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
        <div className="metaDetails fbContainer">
            <Row>
                <Col span={2}>
                    <LocalBusinessIcon />
                </Col>
                <Col span={18}>
                    <Title level={4}>Local Business Listing</Title>
                    <HelperText
                        type="hint"
                        message="Define each local business location as a LocalBusiness type. Use the most specific LocalBusiness sub-type possible; for example, Restaurant, DaySpa, HealthClub, and so on."
                    />
                </Col>
                <Col span={4}>
                    <Button type="primary" onClick={showFbPixelModal}>
                        {form.LocalBusinessJSON.value ? "Added" : "Add Local-Buisness"}
                    </Button>
                    {/* modal for editing */}
                    <Modal
                        title="Simple local business listing"
                        visible={localBusinessJSONModalVisible}
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
                                        Paste your Local-Buisness json data
                                    </span>
                                }
                                tooltip={{
                                    title: 'With Local Business structured data, you can tell Google about your business hours, different departments within a business, reviews for your business, and more.',
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
                                <Input.TextArea
                                    strong
                                    level={5}
                                    placeholder="Enter local business"
                                    style={{
                                        width: '60%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    className="text-box"
                                    bordered={false}
                                    value={form.LocalBusinessJSON.value}
                                    onChange={onChangeHandler}
                                    id="LocalBusinessJSON"
                                    name="LocalBusinessJSON"
                                />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </div>
    )
}

export default LocalBusiness
