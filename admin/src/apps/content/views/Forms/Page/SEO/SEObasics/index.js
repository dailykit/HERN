import React, { useState, useRef, useContext, useEffect } from 'react'
import 'antd/dist/antd.css'
import { InlineLoader } from '../../../../../../../shared/components'
import { useSubscription, useMutation } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper } from './styled'

import { logger } from '../../../../../../../shared/utils'
import { Tooltip, Row, Col, Typography, Card } from 'antd'
import { useTabs } from '../../../../../../../shared/providers'
import { SEO_DETAILS, UPDATE_BRANDS_SEO } from '../../../../../graphql'
import BrandContext from '../../../../../context/Brand'
import { Form, Input } from 'antd'
import { InfoCircleOutlined } from '@ant-design/icons'

const SEObasics = ({ routeName }) => {
    const { Text, Title } = Typography
    const { addTab, tab, setTabTitle, closeAllTabs } = useTabs()
    const [context, setContext] = useContext(BrandContext)
    const prevBrandId = useRef(context.brandId)
    const { pageId, pageName } = useParams()
    const [pageTitle, setPageTitle] = useState({
        value: '',
        meta: {
            isValid: false,
            isTouched: false,
            errors: [],
        },
    })
    const [metaTitle, setMetaTitle] = useState({
        value: '',
        meta: {
            isValid: false,
            isTouched: false,
            errors: [],
        },
    })
    const [metaDescription, setMetaDescription] = useState({
        value: '',
        meta: {
            isValid: false,
            isTouched: false,
            errors: [],
        },
    })
    const [pageRoute, setPageRoute] = useState({
        value: '',
        meta: {
            isValid: false,
            isTouched: false,
            errors: [],
        },
    })
    const [state, setState] = useState({})
    const [metaDetailsState, setMetaDetailsState] = useState({})
    const { TextArea } = Input


    // Mutation for page publish toggle
    const [updatePage] = useMutation(UPDATE_BRANDS_SEO, {
        onCompleted: () => {
            toast.success('Updated!')
        },
        onError: error => {
            toast.error('Something went wrong with UPDATE_BRANDS_SEO')
            console.log(error)
            logger(error)
        },
    })
    const updateInfo = () => {
        updatePage({
            variables: {
                pageId: pageId,
                _set: {
                    SEOBasics: {
                        metaTitle: metaTitle.value,
                        metaDescription: metaDescription.value,
                        url: context.brandDomain + pageRoute.value
                    }
                },
            },
        })
    }

    // whenever pageTitle value changes the pagetitle will be updated also
    useEffect(() => {
        if (pageTitle.value && !Boolean(pageTitle.meta.errors.length)) {
            setTabTitle(pageTitle.value)
        }
    }, [pageTitle])

    if (context.brandId !== prevBrandId.current) {
        closeAllTabs()
    }

    const { loading: metaDetailsLoading, error: metaDetailsLoadingError } =
        useSubscription(SEO_DETAILS, {
            variables: {
                pageId: { _eq: pageId },
                _route: routeName,
            },
            onSubscriptionData: ({
                subscriptionData: {
                    data: { brands_SEO: brandsSEO = {} } = {},
                } = {},
            }) => {
                setMetaDetailsState(brandsSEO || {})
                setMetaTitle({
                    ...metaTitle,
                    value: brandsSEO[0]?.SEOBasics?.metaTitle || metaTitle.value,
                })
                setMetaDescription({
                    ...metaDescription,
                    value: brandsSEO[0]?.SEOBasics?.metaDescription || metaDescription.value,
                })
                setPageRoute({
                    ...pageRoute,
                    value: brandsSEO[0]?.route || '',
                })
            },
        })

    if (metaDetailsLoading) {
        return <InlineLoader />
    }
    if (metaDetailsLoadingError) {
        toast.error('Something went wrong')
        logger(metaDetailsLoadingError)
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
                            <Title
                                strong
                                level={4}
                                id="pageRoute"
                                name="pageRoute"
                                onChange={e =>
                                    setPageRoute({
                                        ...pageRoute,
                                        value: e.target.value,
                                    })
                                }
                            >
                                {context.brandDomain + pageRoute.value}
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
                                    value={metaTitle.value}
                                    onChange={e =>
                                        setMetaTitle({
                                            ...metaTitle,
                                            value: e.target.value,
                                        })
                                    }
                                    id="meta-title"
                                    name="meta-title"
                                />
                                <TextArea
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
                                    name="meta-description"
                                    id="meta-description"
                                    value={metaDescription.value}
                                    placeholder="Add Page Meta description in 120 words"
                                    onChange={e =>
                                        setMetaDescription({
                                            ...metaDescription,
                                            value: e.target.value,
                                        })
                                    }
                                />
                            </Form.Item>
                            <Form.Item
                                label={
                                    <span
                                        style={{
                                            color: '#555B6E',
                                            fontSize: '16px',
                                            fontWeight: '600',
                                        }}
                                    >
                                        Customize your URL
                                    </span>
                                }
                                tooltip={{
                                    title: 'Customize your URL',
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
                                    level={5}
                                    addonBefore={context.brandDomain}
                                    defaultValue={routeName}
                                    style={{
                                        width: 'fit-content',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    onChange={e =>
                                        setPageRoute({
                                            ...pageRoute,
                                            value: e.target.value,
                                        }), updateInfo
                                    }
                                />
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col span={12}>
                        <Text strong>Preview on Google</Text>
                        <Tooltip placement="top" title={'preview on google'}>
                            {' '}
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
                                <Title
                                    strong
                                    level={4}
                                    id="pageRoute"
                                    name="pageRoute"
                                >
                                    {context.brandDomain + pageRoute.value}
                                </Title>
                            </Tooltip>
                            <p>{metaDescription.value}</p>
                        </Card>
                    </Col>
                </Row>
            </div>
        </StyledWrapper>
    )
}

export default SEObasics
