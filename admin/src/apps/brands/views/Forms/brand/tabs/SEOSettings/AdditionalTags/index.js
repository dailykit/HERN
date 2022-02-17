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
    PlusIcon
} from '@dailykit/ui'
import { findLastIndex, isEmpty, truncate } from 'lodash'
import {
    InlineLoader,
    Flex,
    Banner,
    AssetUploader,
} from '../../../../../../../../shared/components'
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper, DrawerWrapper, ModalList, ListItemWrapper } from './styled'
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
    Drawer,
    List
} from 'antd'
import { Form as Formd } from '@dailykit/ui'
import { EditIcon, DeleteIcon } from '../../../../../../../../shared/assets/icons'
import { BRANDS } from '../../../../../../graphql'
import { InfoCircleOutlined } from '@ant-design/icons'

const AdditionalTags = ({ update }) => {
    const params = useParams()
    const [settingId, setSettingId] = React.useState(null)
    const [isSEOBasicsModalVisible, setIsSEOBasicsModalVisible] = useState(false)
    const [showDrawer, setShowDrawer] = React.useState(false)

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
    const [prevAdditionalSettings, setPrevAdditionalSettings] = React.useState([])


    const [seoDetails, { loading: metaDetailsLoading, brandSettings }] =
        useLazyQuery(BRANDS.SETTINGS, {
            onCompleted: ({ brandSettings
            }) => {
                if (!isEmpty(brandSettings)) {
                    const { brand, id } = brandSettings[0]
                    setSettingId(id)
                    setPrevAdditionalSettings(brand[0]?.value?.additionalTags)
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
        // setIsSEOBasicsModalVisible(false)
        setShowDrawer(false)
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
    console.log(prevAdditionalSettings, "prevAdditionalSettings")
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
                    <Form>
                        <Form.Item
                            style={{ columnGap: '1rem' }}
                            label={<>
                                <span
                                    style={{
                                        color: "#919699",
                                        fontSize: '15px',
                                        fontWeight: '500',
                                    }}
                                >
                                    Add/Edit name and content for additional tags
                                </span>

                            </>
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

                        ><ComboButton type="outline" size='sm' style={{ border: '1px solid transparent', fontWeight: '600', fontSize: '15px', padding: '0px' }} onClick={() => setShowDrawer(true)}>
                                <PlusIcon color='#367BF5' />
                                Add more
                            </ComboButton>
                        </Form.Item>

                    </Form>
                    <div className="site-drawer-render-in-current-wrapper">

                        <DrawerWrapper>
                            <Drawer
                                title="Add meta tags"
                                placement="right"
                                closable={true}
                                onClose={() => setShowDrawer(false)}
                                visible={showDrawer}
                                getContainer={false}
                                style={{ position: 'absolute', display: !showDrawer && 'none' }}
                                className='drawer'
                            >
                                <><Form.Item
                                    label="Tag Name"
                                    name="tagName"
                                    style={{
                                        color: '#555B6E',
                                        fontSize: '16px',
                                        fontWeight: '600',
                                    }}
                                >
                                    <Input
                                        strong
                                        level={5}
                                        placeholder="name(like keywords,author etc)"
                                        style={{
                                            width: '100%',
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
                                    >
                                        <Input
                                            strong
                                            level={5}
                                            placeholder="content/value"
                                            style={{
                                                width: '100%',
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
                                    <Button type="primary" onClick={() => Save()}>
                                        Save
                                    </Button></>
                            </Drawer>
                        </DrawerWrapper>
                    </div>
                    <List
                        className="demo-loadmore-list"
                        loading={false}
                        itemLayout="horizontal"
                        // loadMore={loadMore}
                        dataSource={prevAdditionalSettings}
                        renderItem={obj => (
                            <ListItemWrapper>

                                <List.Item
                                    actions={[]}
                                    style={{ fontWeight: "900", paddingTop: "6px" }}
                                >
                                    <Formd.Group>
                                        <Formd.Label style={{ color: '#7d818d', fontWeight: '900' }} htmlFor='username' title='taglabel' className="taglabel">
                                            Tag
                                        </Formd.Label>
                                        <ModalList>
                                            <div className="listItem" style={{ display: "flex", justifyContent: "space-between" }} >
                                                <div className="metatag_text">
                                                    {`<meta name=`}
                                                    <span>"{Object.keys(obj)}"</span>
                                                    {`   content=`}
                                                    <span>"{Object.values(obj)}"</span>
                                                    {`/>`}
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center" }}>
                                                    <a key="list-loadmore-edit"> <EditIcon color="#919699" size={24} /></a>
                                                    <a key="list-loadmore-more"> <DeleteIcon /></a></div>
                                            </div>
                                        </ModalList>
                                    </Formd.Group>
                                </List.Item>
                            </ListItemWrapper>
                        )}
                    />
                </Modal>
                <Button type="primary" ghost onClick={showSEOBasicsModal}>
                    Add Other Additional Tags
                </Button>
            </div>
        </StyledWrapper>
    )
}

export default AdditionalTags
