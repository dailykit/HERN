import React, { useState, useContext, useEffect } from 'react'
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
import {
    InlineLoader,
    Flex,
    Banner,
    AssetUploader,
} from '../../../../../../../shared/components'
import {
    Typography,
    Card,
    Row,
    Col,
    Button,
    Modal,
    Form,
    Input,
    Tooltip,
} from 'antd'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper, ImageContainer } from './styled'
import { SEO_DETAILS, UPSERT_BRANDS_SEO } from '../../../../../graphql'
import { logger } from '../../../../../../../shared/utils'
import {
    EditIcon,
    DeleteIcon,
    LinkIcon2,
} from '../../../../../../../shared/assets/icons'
import { InfoCircleOutlined } from '@ant-design/icons'
import BrandContext from '../../../../../context/Brand'
const { Title, Text } = Typography

export const TwitterCard = ({ routeName }) => {
    const [tunnel1, openTunnel1, closeTunnel1] = useTunnel(1)
    const [context, setContext] = useContext(BrandContext)
    const { pageId, pageName } = useParams()
    const [form, setForm] = useState({
        twitterTitle: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
        twitterDescription: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
        twitterImage: {
            value: '',
            meta: {
                isValid: false,
                isTouched: false,
                errors: [],
            },
        },
    })
    const [isTwitterModalVisible, setIsTwitterModalVisible] = useState(false)
    const brandPageId = React.useMemo(() => parseInt(pageId), [])
    const updateImage = (data = {}) => {
        if ('url' in data) {
            form.twitterImage.value = data?.url
        }
        closeTunnel1(1)
    }
    const deleteImage = (name, value) => {
        setForm(prev => ({
            ...prev,
            [name]: {
                ...prev[name],
                value,
            },
        }))
    }

    const [seoDetails, { loading: metaDetailsLoading, brandsSEO }] =
        useLazyQuery(SEO_DETAILS, {
            onCompleted: brandsSEO => {
                const seoSettings =
                    brandsSEO.brands_brandPage_brandPageSetting_by_pk
                console.log('from subscription', seoSettings)
                setForm(prev => ({
                    twitterTitle: {
                        ...prev.twitterTitle,
                        value: seoSettings?.value?.twitterTitle,
                    },
                    twitterDescription: {
                        ...prev.twitterDescription,
                        value: seoSettings?.value?.twitterDescription,
                    },
                    twitterImage: {
                        ...prev.twitterImage,
                        value: seoSettings?.value?.twitterImage,
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
        // brandPageSettingId: 3 for social share settings
        seoDetails({
            variables: {
                brandPageId: brandPageId,
                brandPageSettingId: 3,
            },
        })
    }, [])

    // Mutation for upserting seo meta data
    const [upsertSEODetails] = useMutation(UPSERT_BRANDS_SEO, {
        onCompleted: () => {
            toast.success('Updated!')
        },
        onError: error => {
            toast.error('Something went wrong with UPSERT_BRANDS_SEO')
            console.log(error)
            logger(error)
        },
    })

    //save changes in metadetails
    const Save = () => {
        // brandPageSettingId: 3 for twitter settings
        upsertSEODetails({
            variables: {
                object: {
                    brandPageId: brandPageId,
                    brandPageSettingId: 3,
                    value: {
                        twitterTitle: form.twitterTitle.value,
                        twitterDescription: form.twitterDescription.value,
                        twitterImage: form.twitterImage.value,
                    },
                },
            },
        })
        handleTwitterOk()
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

    const showTwitterModal = () => {
        setIsTwitterModalVisible(true)
    }
    const handleTwitterOk = () => {
        setIsTwitterModalVisible(false)
    }

    const handleTwitterCancel = () => {
        setIsTwitterModalVisible(false)
    }
    return (
        <StyledWrapper>
            <div className="metaDetails">
                <Row style={{ marginTop: '20px' }}>
                    <Col span={12}>
                        <div style={{ marginTop: '7px' }} />
                        <Title level={4}>Twitter</Title>
                        <HelperText
                            type="hint"
                            message="Your Twitter settings can be customised so that it displays a different image or text to your other social networks."
                        />
                        <ComboButton
                            size="sm"
                            type="outline"
                            style={{
                                marginTop: '14px',
                                color: '#202020',
                                border: '1px solid #E5E5E5',
                                borderRadius: '2px',
                                boxShadow: '0px 2px 0px rgba(0, 0, 0, 0.016)',
                            }}
                            onClick={showTwitterModal}
                        >
                            <EditIcon color="#202020" size={24} />
                            Edit
                        </ComboButton>
                        <Modal
                            title="Customize Twitter Card settings"
                            visible={isTwitterModalVisible}
                            onOk={handleTwitterOk}
                            onCancel={handleTwitterCancel}
                            footer={[
                                <Button
                                    key="submit"
                                    type="primary"
                                    onClick={() => Save()}
                                >
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
                                            twitter: title
                                        </span>
                                    }
                                    tooltip={{
                                        title: 'Your twitter:title is what shows when pages in this pattern are shared on Twitter. It can be the same as your title for other social networks. ',
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
                                        placeholder="Enter Title"
                                        style={{
                                            width: '60%',
                                            border: '2px solid #E4E4E4',
                                            borderRadius: '4px',
                                        }}
                                        bordered={false}
                                        value={form.twitterTitle.value}
                                        onChange={onChangeHandler}
                                        id="twitter-title"
                                        name="twitterTitle"
                                    />{' '}
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
                                            twitter: Description
                                        </span>
                                    }
                                    tooltip={{
                                        title: 'This description displays below the twitter:title on Twitter. It tells people more about your site. ',
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
                                        style={{
                                            display: 'block',
                                            width: '80%',
                                            border: '2px solid #E4E4E4',
                                            borderRadius: '4px',
                                        }}
                                        bordered={false}
                                        value={form.twitterDescription.value}
                                        onChange={onChangeHandler}
                                        name="twitterDescription"
                                        id="twitter-description"
                                        placeholder="Add Page Meta description in 120 words"
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
                                            twitter: image
                                        </span>
                                    }
                                    tooltip={{
                                        title: 'This is the image that shows on Twitter.',
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
                                    {/* for image upload */}
                                    <Row>
                                        <Col span={12}>
                                            {form.twitterImage.value ? (
                                                <ImageContainer
                                                    border="none"
                                                    height="120px"
                                                    padding="0px"
                                                >
                                                    <div>
                                                        <IconButton
                                                            style={{
                                                                background: 'transparent',
                                                            }}
                                                            size="sm"
                                                            type="solid"
                                                            onClick={() => openTunnel1(1)}
                                                        >
                                                            <EditIcon />
                                                        </IconButton>

                                                        <IconButton
                                                            style={{
                                                                background: 'transparent',
                                                            }}
                                                            size="sm"
                                                            type="solid"
                                                            onClick={() =>
                                                                deleteImage('twitterImage', '')
                                                            }
                                                        >
                                                            <DeleteIcon />
                                                        </IconButton>
                                                    </div>
                                                    <img
                                                        src={form.twitterImage.value}
                                                        alt="twitter-image"
                                                        style={{
                                                            borderRadius: '8px',
                                                            width: '170px',
                                                            height: '120px',
                                                        }}
                                                    />
                                                </ImageContainer>
                                            ) : (
                                                <ButtonTile
                                                    type="uploadImage"
                                                    size="sm"
                                                    text=""
                                                    onClick={() => openTunnel1(1)}
                                                    style={{
                                                        width: '170px',
                                                        height: '120px',
                                                    }}
                                                />
                                            )}
                                            <Tunnels tunnels={tunnel1}>
                                                <Tunnel layer={1} size="md">
                                                    <TunnelHeader
                                                        title="Add Image"
                                                        close={() => closeTunnel1(1)}
                                                    />
                                                    <Banner id="SEODetails-image-tunnel-top" />
                                                    <Flex padding="16px">
                                                        <AssetUploader
                                                            onAssetUpload={data =>
                                                                updateImage(data)
                                                            }
                                                            onImageSelect={data =>
                                                                updateImage(data)
                                                            }
                                                        />
                                                    </Flex>
                                                    <Banner id="SEODetails-image-tunnel-top" />
                                                </Tunnel>
                                            </Tunnels>
                                        </Col>
                                        <Col span={24}>
                                            <Text>
                                                <span style={{ fontWeight: 'bold' }}>
                                                    Note:{' '}
                                                </span>{' '}
                                                It can take time before you see these
                                                changes on social networks.
                                                <br />
                                                <span style={{ fontWeight: 'bold' }}>
                                                    Recommended:{' '}
                                                </span>{' '}
                                                3: 1 aspect ratio, 1500px X px size and
                                                maximum file size of 5MB.Images can be in
                                                JPG, PNG or GIFs (but not animated GIFS)
                                            </Text>
                                        </Col>
                                    </Row>
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Col>
                    <Col span={12}>
                        <Text strong>Preview on Twitter</Text>
                        <Tooltip
                            placement="top"
                            title={
                                'This is an example of how a page looks when shared on Twitter. '
                            }
                        >
                            <InfoCircleOutlined
                                style={{
                                    background: '#555B6E',
                                    color: 'white',
                                    borderRadius: '50%',
                                }}
                            />
                        </Tooltip>
                        <Card
                            hoverable
                            cover={
                                form?.twitterImage?.value ? (
                                    <img
                                        alt="example"
                                        src={form.twitterImage.value}
                                        style={{
                                            maxHeight: '220px',
                                            objectFit: 'cover',
                                        }}
                                    />
                                ) : (
                                    <ButtonTile
                                        type="uploadImage"
                                        size="lg"
                                        text=""
                                        style={{
                                            width: '100%',
                                            boxShadow: 'none',
                                            border: '1px solid #e4e4e4',
                                            borderRadius: '0px',
                                        }}
                                    />
                                )
                            }
                        >
                            <p style={{ fontWeight: '600' }}>
                                {' '}
                                {form.twitterTitle.value || 'twitter: title'}
                            </p>
                            <p>
                                {form.twitterDescription.value ||
                                    'twitter: description'}
                            </p>
                            <Tooltip placement="bottom" title={'page link'}>
                                <p>
                                    <LinkIcon2 />
                                    <span>{context.brandDomain + routeName}</span>
                                </p>
                            </Tooltip>
                        </Card>
                    </Col>
                </Row>
            </div>
        </StyledWrapper>
    )
}

export default TwitterCard
