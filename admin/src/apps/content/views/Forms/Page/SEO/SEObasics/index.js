import React, { useState, useRef, useContext } from 'react'
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
import { useMutation, useLazyQuery } from '@apollo/react-hooks'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { StyledWrapper, ImageContainer } from './styled'
import { logger } from '../../../../../../../shared/utils'
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
import { EditIcon, DeleteIcon } from '../../../../../../../shared/assets/icons'
import { SEO_DETAILS, UPSERT_BRANDS_SEO } from '../../../../../graphql'
// import BrandContext from '../../../../../context/Brand'
import { InfoCircleOutlined } from '@ant-design/icons'
import { BrandContext } from '../../../../../../../App'

const SEObasics = ({ routeName }) => {
   const { Text, Title } = Typography
   const [tunnel1, openTunnel1, closeTunnel1] = useTunnel(1)
   const [isSEOBasicsModalVisible, setIsSEOBasicsModalVisible] = useState(false)
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)
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
   const showSEOBasicsModal = () => {
      setIsSEOBasicsModalVisible(true)
   }
   const handleSEOBasicsOk = () => {
      setIsSEOBasicsModalVisible(false)
   }

   const handleSEOBasicsCancel = () => {
      setIsSEOBasicsModalVisible(false)
   }
   const brandPageId = React.useMemo(() => parseInt(pageId), [])
   const updateFavicon = (data = {}) => {
      if ('url' in data) {
         form.favicon.value = data?.url
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
      upsertSEODetails({
         variables: {
            object: {
               brandPageId: brandPageId,
               brandPageSettingId: 1,
               value: {
                  metaTitle: form.metaTitle.value,
                  metaDescription: form.metaDescription.value,
                  favicon: form.favicon.value,
               },
            },
         },
      })
      setIsSEOBasicsModalVisible(false)
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
                  <Title level={4}>SEO Basics</Title>
                  <HelperText
                     type="hint"
                     message="Edit your default SEO settings for search results"
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
                     onClick={showSEOBasicsModal}
                  >
                     <EditIcon color="#202020" size={24} />
                     Edit Meta details
                  </ComboButton>
                  {/* modal content */}
                  <Modal
                     title="Customize SEO Basics settings"
                     visible={isSEOBasicsModalVisible}
                     onOk={handleSEOBasicsOk}
                     onCancel={handleSEOBasicsCancel}
                     footer={[
                        <Button type="primary" onClick={() => Save()}>
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
                                 Meta Title and Meta Description
                              </span>
                           }
                           tooltip={{
                              title: 'Your meta description displays below the title tag in search results.',
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
                        <Form.Item
                           label={
                              <span
                                 style={{
                                    color: '#555B6E',
                                    fontSize: '16px',
                                    fontWeight: '600',
                                 }}
                              >
                                 Favicon
                              </span>
                           }
                           tooltip={{
                              title: 'A favicon is a small icon next to your site title',
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
                           <Row>
                              <Col span={12}>
                                 {form.favicon.value ? (
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
                                                deleteImage('favicon', '')
                                             }
                                          >
                                             <DeleteIcon />
                                          </IconButton>
                                       </div>
                                       <img
                                          src={form.favicon.value}
                                          alt="icon"
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
                                          marginBottom: '10px',
                                       }}
                                    />
                                 )}
                                 <Tunnels tunnels={tunnel1}>
                                    <Tunnel layer={1} size="md">
                                       <TunnelHeader
                                          title="Add favicon"
                                          close={() => closeTunnel1(1)}
                                       />
                                       <Banner id="metadetails-image-tunnel-top" />
                                       <Flex padding="16px">
                                          <AssetUploader
                                             onAssetUpload={data =>
                                                updateFavicon(data)
                                             }
                                             onImageSelect={data =>
                                                updateFavicon(data)
                                             }
                                          />
                                       </Flex>
                                       <Banner id="metadetails-image-tunnel-top" />
                                    </Tunnel>
                                 </Tunnels>
                              </Col>
                              <Col span={24}>
                                 <Text>
                                    <span style={{ fontWeight: 'bold' }}>
                                       Note :{' '}
                                    </span>{' '}
                                    It can take time before you see these
                                    changes.{' '}
                                 </Text>
                              </Col>
                           </Row>
                        </Form.Item>
                     </Form>
                  </Modal>
               </Col>
               <Col span={12}>
                  <Text strong>Preview on Google</Text>
                  <Tooltip
                     placement="top"
                     title={'This is an example of a page in search results.'}
                  >
                     <InfoCircleOutlined
                        style={{
                           marginLeft: '5px',
                           background: '#555B6E',
                           color: 'white',
                           borderRadius: '50%',
                        }}
                     />
                  </Tooltip>
                  <Card>
                     <Tooltip placement="bottom" title={'google preview'}>
                        <p className="link">
                           {'https://' + brandContext.brandDomain + routeName}
                        </p>
                     </Tooltip>
                     <Title
                        strong
                        level={4}
                        style={{ color: '#2014ad' }}
                        id="pageRoute"
                        name="pageRoute"
                     >
                        {form.metaTitle.value || 'Page Name | Site Name'}
                     </Title>
                     <Typography.Paragraph ellipsis={{ rows: 2 }}>
                        {form.metaDescription.value ||
                           'this is the meta description'}
                     </Typography.Paragraph>
                  </Card>
               </Col>
            </Row>
         </div>
      </StyledWrapper>
   )
}

export default SEObasics
