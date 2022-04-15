import React, { useState, useContext } from 'react'
import 'antd/dist/antd.css'
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
import { SEO_DETAILS, UPSERT_BRANDS_SEO } from '../../../../../graphql'
import { StyledWrapper, ImageContainer } from './styled'
import { logger } from '../../../../../../../shared/utils'
import { EditIcon, DeleteIcon } from '../../../../../../../shared/assets/icons'
import { InfoCircleOutlined } from '@ant-design/icons'
// import { BrandContext } from '../../../../../../../App'
import BrandContext from '../../../../../context/Brand'
const { Title, Text } = Typography

export const SocialShare = ({ routeName }) => {
   const [tunnel1, openTunnel1, closeTunnel1] = useTunnel(1)
   const { pageId } = useParams()
   const brandPageId = React.useMemo(() => parseInt(pageId), [])
   // const [context] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const [form, setForm] = useState({
      ogTitle: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      ogDescription: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      ogImage: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      },
      ogURL: {
         value: '',
         meta: {
            isValid: false,
            isTouched: false,
            errors: [],
         },
      }
   })
   //for modal
   const [isOgModalVisible, setIsOgModalVisible] = useState(false)
   const showOgModal = () => {
      setIsOgModalVisible(true)
   }
   const handleOgOk = () => {
      setIsOgModalVisible(false)
   }
   const handleOgCancel = () => {
      setIsOgModalVisible(false)
   }

   //update Image
   const updateImage = (data = {}) => {
      if ('url' in data) {
         form.ogImage.value = data?.url
      }
      closeTunnel1(1)
   }

   // delete image
   const deleteImage = (name, value) => {
      setForm(prev => ({
         ...prev,
         [name]: {
            ...prev[name],
            value,
         },
      }))
   }
   //query for getting metadetails
   const [seoDetails, { loading: metaDetailsLoading, brandsSEO }] =
      useLazyQuery(SEO_DETAILS, {
         onCompleted: brandsSEO => {
            const seoSettings =
               brandsSEO.brands_brandPage_brandPageSetting_by_pk
            console.log('from subscription', seoSettings)
            setForm(prev => ({
               ogTitle: {
                  ...prev.ogTitle,
                  value: seoSettings?.value?.ogTitle,
               },
               ogDescription: {
                  ...prev.ogDescription,
                  value: seoSettings?.value?.ogDescription,
               },
               ogImage: {
                  ...prev.ogImage,
                  value: seoSettings?.value?.ogImage,
               },
               ogURL: {
                  ...prev.ogURL,
                  value: seoSettings?.value?.ogURL || "https://" + brandContext.brandDomain + routeName
               }
            }))
         },
         onError: error => {
            toast.error('Something went wrong')
            logger(error)
         },
         fetchPolicy: 'cache-and-network',
      })

   React.useEffect(() => {
      // brandPageSettingId: 2 for social share settings
      seoDetails({
         variables: {
            brandPageId: brandPageId,
            brandPageSettingId: 2,
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
      // brandPageSettingId: 2 for social share settings
      upsertSEODetails({
         variables: {
            object: {
               brandPageId: brandPageId,
               brandPageSettingId: 2,
               value: {
                  ogTitle: form.ogTitle.value,
                  ogDescription: form.ogDescription.value,
                  ogImage: form.ogImage.value,
                  ogURL: form.ogURL.value
               },
            },
         },
      })
      handleOgOk()
   }
   if (metaDetailsLoading) return <InlineLoader />

   //for every change in data will update the field(form)
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
                  <Title level={4}>Social Share</Title>
                  <HelperText
                     type="hint"
                     message=" Enhance how your main site pages look when shared on social networks like Facebook, LinkedIn, Twitter and Pinterest."
                  />
                  <ComboButton
                     size="sm"
                     type="outline"
                     className="edit-button"
                     onClick={showOgModal}
                  >
                     <EditIcon color="#202020" size={24} />
                     Edit
                  </ComboButton>
                  {/* modal for editing */}
                  <Modal
                     title="Customize Open Graph settings"
                     visible={isOgModalVisible}
                     onOk={handleOgOk}
                     onCancel={handleOgCancel}
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
                                 og: title
                              </span>
                           }
                           tooltip={{
                              title: 'Your og:title is what shows when pages in this pattern are shared on social networks. ',
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
                              className="text-box"
                              bordered={false}
                              value={form.ogTitle.value}
                              onChange={onChangeHandler}
                              id="og-title"
                              name="ogTitle"
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
                                 og: Description
                              </span>
                           }
                           tooltip={{
                              title: 'Your og:description displays below the og:title on social networks. It tells people more about your site. ',
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
                              className="text-area"
                              bordered={false}
                              value={form.ogDescription.value}
                              onChange={onChangeHandler}
                              name="ogDescription"
                              id="og-description"
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
                                 og: url
                              </span>
                           }
                           tooltip={{
                              title: 'Your og:url is what shows when pages in this pattern are shared on social networks. ',
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
                              placeholder="Enter Url"
                              style={{
                                 width: '60%',
                                 border: '2px solid #E4E4E4',
                                 borderRadius: '4px',
                              }}
                              className="text-box"
                              bordered={false}
                              value={form.ogURL.value}
                              onChange={onChangeHandler}
                              id="ogURL"
                              name="ogURL"
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
                                 og: image
                              </span>
                           }
                           tooltip={{
                              title: 'This is the image that shows on social networks.',
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
                           {/* for image upload (modal)*/}
                           <Row>
                              <Col span={12} className="imageModal">
                                 {form.ogImage.value ? (
                                    <ImageContainer
                                       border="none"
                                       height="120px"
                                       padding="0px"
                                    >
                                       <div className="iconButton">
                                          <IconButton
                                             size="sm"
                                             type="solid"
                                             onClick={() => openTunnel1(1)}
                                          >
                                             <EditIcon />
                                          </IconButton>

                                          <IconButton
                                             size="sm"
                                             type="solid"
                                             onClick={() =>
                                                deleteImage('ogImage', '')
                                             }
                                          >
                                             <DeleteIcon />
                                          </IconButton>
                                       </div>
                                       <img
                                          src={form.ogImage.value}
                                          alt="og-image"
                                       />
                                    </ImageContainer>
                                 ) : (
                                    //inside modal
                                    <ButtonTile
                                       type="uploadImage"
                                       size="sm"
                                       text="Add Image"
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
                                          title="Add Image"
                                          close={() => closeTunnel1(1)}
                                       />
                                       <Banner id="metadetails-image-tunnel-top" />
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
                                       <Banner id="metadetails-image-tunnel-top" />
                                    </Tunnel>
                                 </Tunnels>
                              </Col>
                              <Col span={24}>
                                 <Text>
                                    <span style={{ fontWeight: 'bold' }}>
                                       Note :
                                    </span>
                                    It can take time before you see these
                                    changes on social networks.
                                    <br />
                                    <span style={{ fontWeight: 'bold' }}>
                                       Recommended :
                                    </span>
                                    Upload size should be 1,200 x 630 pixels.
                                 </Text>
                              </Col>
                           </Row>
                        </Form.Item>
                     </Form>
                  </Modal>
               </Col>
               {/* outside modal */}
               <Col span={12}>
                  <Text strong>Preview on Social Networks</Text>
                  <Tooltip
                     placement="top"
                     title={
                        'This is an example of how a page looks when shared on social networks. '
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
                     onClick={showOgModal}
                     style={{ backgroundColor: '#f0f4f7' }}
                     cover={
                        form?.ogImage?.value ? (
                           <img
                              alt="example"
                              src={form.ogImage.value}
                              style={{
                                 maxHeight: '220px',
                                 objectFit: 'cover',
                              }}
                           />
                        ) : (
                           <ButtonTile
                              type="uploadImage"
                              size="lg"
                              text="Add Image"
                           />
                        )
                     }
                  >
                     <Tooltip placement="bottom" title={'page link'}>
                        <p style={{ textTransform: 'uppercase' }}>
                           {form.ogURL.value || "https://" + brandContext.brandDomain + routeName}
                        </p>
                     </Tooltip>
                     <Title strong level={4}>
                        {form.ogTitle.value || 'Title Tag'}
                     </Title>
                     <p>
                        {form.ogDescription.value ||
                           'this is the og: description'}
                     </p>
                  </Card>
               </Col>
            </Row>
         </div>
      </StyledWrapper>
   )
}

export default SocialShare
