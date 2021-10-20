import React, { useState, useRef, useContext } from 'react'
import 'antd/dist/antd.css'
import { InlineLoader } from '../../../../../../../shared/components'
import { useSubscription, useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper } from './styled'
import { logger } from '../../../../../../../shared/utils'
import { Tooltip, Row, Col, Typography, Card, Form, Input, Button } from 'antd'
import { SEO_DETAILS, UPSERT_BRANDS_SEO } from '../../../../../graphql'
import BrandContext from '../../../../../context/Brand'
import { InfoCircleOutlined } from '@ant-design/icons'

const SEObasics = ({ routeName }) => {
    const { Text, Title } = Typography
    const [context, setContext] = useContext(BrandContext)
    const prevBrandId = useRef(context.brandId)
    const { pageId, pageName } = useParams()
    const [form, setForm] = useState({
        metaTitle: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
        metaDescription: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
        favicon: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
    })
    const brandPageId = React.useMemo(() => parseInt(pageId), [])


    const [seoDetails, { loading: metaDetailsLoading, brandsSEO }] =
        useLazyQuery(SEO_DETAILS, {
            onCompleted: brandsSEO => {
                const seoSettings = brandsSEO.brands_brandPage_brandPageSetting_by_pk
                console.log("from subscription", seoSettings)
                setForm(prev => ({
                    metaTitle: {
                        ...prev.metaTitle,
                        value: seoSettings?.value?.metaTitle,
                    },
                    metaDescription: {
                        ...prev.metaDescription,
                        value: seoSettings?.value?.metaDescription,
                    },
                    favicon: {
                        ...prev.favicon,
                        value: seoSettings?.value?.favicon,
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
                brandPageSettingId: 1,
            },
        })
    }, [])
    // Mutation for update seo meta data
    const [updateSEODetails] = useMutation(UPSERT_BRANDS_SEO, {
        onCompleted: () => {
            toast.success('Updated!')
        },
        onError: error => {
            toast.error('Something went wrong with UPSERT_BRANDS_SEO')
            console.log(error)
            logger(error)
        },
    })

    const updateInfo = () => {
        console.log("UPDATED", form)
        updateSEODetails({
            variables: {
                object: {
                    brandPageId: brandPageId,
                    brandPageSettingId: 1,
                    value: {
                        metaTitle: form.metaTitle.value,
                        metaDescription: form.metaDescription.value,
                        favicon: "https://www.dailykit.org/_next/image?url=%2Fassets%2Fimages%2Fdailykit_logo.svg&w=64&q=75"
                    },
                }
            },
        })
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
        <StyledWrapper>
            <div className="metaDetails">
                <Row>
                    <Col span={12}>
                        <Text strong style={{ color: '#555B6E', fontSize: '16px' }}>
                            Page Route
                        </Text>
                        <div style={{ marginTop: '7px' }} />
                        <Tooltip placement="bottom" title={'page_route_info'}>
                            <Title strong level={4} id="pageRoute" name="pageRoute">
                                {context.brandDomain + routeName}
                            </Title>
                        </Tooltip>
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
                                        Meta Title and Meta Description
                                    </span>
                                }
                                tooltip={{
                                    title: 'meta description',
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
                                    placeholder="Enter Page Meta Title"
                                    style={{
                                        width: '30%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    value={form.metaTitle.value}
                                    onChange={onChangeHandler}
                                    id="metaTitle"
                                    name="metaTitle"
                                />
                                <Input.TextArea
                                    strong
                                    level={5}
                                    style={{
                                        display: 'block',
                                        marginTop: '29px',
                                        width: '60%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    name="metaDescription"
                                    id="metaDescription"
                                    value={form.metaDescription.value}
                                    onChange={onChangeHandler}
                                    placeholder="Add Page Meta description in 120 words"
                                />
                            </Form.Item>
                            <Button type="primary" onClick={() => updateInfo()}>Update</Button>
                        </Form>
                    </Col>
                    <Col span={12}>
                        <Text strong>Preview on Google</Text>
                        <Tooltip placement="top" title={'preview on google'}>
                            <InfoCircleOutlined
                                style={{
                                    background: '#555B6E',
                                    color: 'white',
                                    borderRadius: '50%',
                                }}
                            />
                        </Tooltip>
                        <Card>
                            <Tooltip placement="bottom" title={'google preview'}>
                                <p>{context.brandDomain + routeName}</p>
                            </Tooltip>
                            <Title
                                strong
                                level={4}
                                style={{ color: '#2014ad' }}
                                id="pageRoute"
                                name="pageRoute"
                            >
                                {form.metaTitle.value}
                            </Title>
                            <p>{form.metaDescription.value}</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </StyledWrapper>
    )
}

export default SEObasics
