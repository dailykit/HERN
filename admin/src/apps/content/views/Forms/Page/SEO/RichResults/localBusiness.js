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
import ConfigTemplateUI from '../../../../../../../shared/components/ConfigTemplateUI'

const LocalBusiness = ({ update }) => {
    const params = useParams()
    const { pageId, pageName } = useParams()
    const { Title } = Typography

    //for config
    const [config, setConfig] = React.useState('')
    const [isChangeSaved, setIsSavedChange] = useState(true)

    //for modal
    const [localBusinessJSONModalVisible, setLocalBusinessJSONModalVisible] = useState(false)
    const showModal = () => {
        setLocalBusinessJSONModalVisible(true)
    }
    const handleOk = () => {
        setLocalBusinessJSONModalVisible(false)
    }
    const handleCancel = () => {
        setLocalBusinessJSONModalVisible(false)
    }
    const brandPageId = React.useMemo(() => parseInt(pageId), [])

    const [seoDetails, { loading: metaDetailsLoading, brandsSEO }] =
        useLazyQuery(SEO_DETAILS, {
            onCompleted: brandsSEO => {
                const data =
                    brandsSEO.brands_brandPage_brandPageSetting_by_pk?.value
                setConfig(data)
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
            value: config,
        })
        setLocalBusinessJSONModalVisible(false)
    }

    if (metaDetailsLoading) return <InlineLoader />


    return (
        <div className="metaDetails localBuisnessContainer">
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

                    <Button type="primary" onClick={showModal}>
                        {config?.richResults?.value ? "Added" : "Add Local-Buisness"}
                    </Button>

                    {/* modal for editing */}
                    <Modal
                        title="Simple local business listing"
                        visible={localBusinessJSONModalVisible}
                        onOk={handleOk}
                        onCancel={handleCancel}
                        footer={[
                            <Button key="submit" type="primary" onClick={() => Save()}>
                                Save
                            </Button>
                        ]}
                    >
                        <Form layout="vertical">
                            <ConfigTemplateUI
                                config={config}
                                setConfig={setConfig}
                                configSaveHandler={Save}
                                isChangeSaved={isChangeSaved}
                                setIsSavedChange={setIsSavedChange}
                                singleConfigUI={true}
                            />
                        </Form>
                    </Modal>
                </Col>
            </Row>
        </div>
    )
}

export default LocalBusiness
