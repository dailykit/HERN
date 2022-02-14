import React, { useState, useRef } from 'react'
import 'antd/dist/antd.css'
import {
    Tunnel,
    Tunnels,
    useTunnel,
    IconButton,
    ComboButton,
    TunnelHeader,
    ButtonTile,
    HelperText,
} from '@dailykit/ui'
import { isEmpty } from 'lodash'
import {
    InlineLoader,
    Flex,
    Banner,
    AssetUploader,
} from '../../../../../../../../shared/components'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper, ImageContainer } from './styled'
import { logger } from '../../../../../../../../shared/utils'
import {
    Tooltip,
    Row,
    Col,
    Typography,
    Card,
    Form,
    Input,
    Button,
    Modal,
} from 'antd'
import { EditIcon, DeleteIcon } from '../../../../../../../../shared/assets/icons'
import { BRANDS } from '../../../../../../graphql'
import { InfoCircleOutlined } from '@ant-design/icons'

const AdditionalTags = ({ update }) => {
    const params = useParams()
    const [settingId, setSettingId] = React.useState(null)
    const [isSEOBasicsModalVisible, setIsSEOBasicsModalVisible] = useState(false)

    const [form, setForm] = useState({
        additionalTags: {
            value: ''
        },
        tagName: {
            value: ''
        },
        tagContent: {
            value: ''
        }
    })
    const showSEOBasicsModal = () => {
        setIsSEOBasicsModalVisible(true)
    }
    const handleAdditonalSEOOk = () => {
        setIsSEOBasicsModalVisible(false)
    }

    const handleAdditonalSEOCancel = () => {
        setIsSEOBasicsModalVisible(false)
    }
    console.log(form.tagName, "formvalue")

    const [seoDetails, { loading: metaDetailsLoading, brandSettings }] =
        useLazyQuery(BRANDS.SETTINGS, {
            onCompleted: ({ brandSettings
            }) => {
                if (!isEmpty(brandSettings)) {
                    const { brand, id } = brandSettings[0]
                    setSettingId(id)
                    setForm(prev => ({
                        ...prev,
                        additionalTags: {
                            value: brand[0]?.value?.additionalTags
                        }
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
                identifier: { _eq: 'additionalTags' },
                type: { _eq: 'seo' },
                brandId: { _eq: Number(params?.id) }
            }
        })
    }, [])

    //save changes 
    const Save = () => {
        const tagName = form?.tagName?.value
        const tagContent = form?.tagContent?.value
        const prevAdditionalSettings = form?.additionalTags?.value || null
        const newSetting = {}
        newSetting[tagName] = tagContent
        console.log(newSetting, "newSetting")
        update({
            id: settingId,
            brandId: params.id,
            value: prevAdditionalSettings ? {
                "additionalTags": [
                    ...prevAdditionalSettings,
                    newSetting
                ]
            } : { "additionalTags": [newSetting] }
        })
        setIsSEOBasicsModalVisible(false)
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
        <StyledWrapper>
            <div className="metaDetails">
                {/* modal content */}
                <Modal
                    title="Additional SEO settings"
                    visible={isSEOBasicsModalVisible}
                    onOk={handleAdditonalSEOOk}
                    onCancel={handleAdditonalSEOCancel}
                    footer={[
                        <Button type="primary" onClick={() => Save()}>
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
                                    Enter name and the value for the SEO that you want to add.
                                </span>
                            }
                            tooltip={{
                                title: 'The name and the value will be added like this:<meta name={name} content={value}/>',
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
                            <Form.Item
                                label="Tag Name"
                                name="tagName"
                                style={{
                                    color: '#555B6E',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your name of the SEO property you want to add.!',
                                    },
                                ]}
                            >
                                <Input
                                    strong
                                    level={5}
                                    placeholder="name(like keywords,author etc)"
                                    style={{
                                        width: '50%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    value={form?.tagName?.value}
                                    onChange={onChangeHandler}
                                    id="tagName"
                                    name="tagName"
                                />
                            </Form.Item>
                            <Form.Item
                                label="Tag Content"
                                name="tagContent"
                                style={{
                                    color: '#555B6E',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                }}
                                rules={[
                                    {
                                        required: true,
                                        message: 'Please input your content/value of the SEO property you want to add.!',
                                    },
                                ]}
                            >
                                <Input
                                    strong
                                    level={5}
                                    placeholder="content/value"
                                    style={{
                                        width: '80%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    value={form?.tagContent?.value}
                                    onChange={onChangeHandler}
                                    id="tagContent"
                                    name="tagContent"
                                />
                            </Form.Item>
                        </Form.Item>
                    </Form>
                </Modal>
                <Button type="primary" ghost onClick={showSEOBasicsModal}>
                    Add Other Additional Tags
                </Button>
            </div>
        </StyledWrapper>
    )
}

export default AdditionalTags
