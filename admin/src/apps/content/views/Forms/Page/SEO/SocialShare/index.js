import React, { useState } from 'react'
import 'antd/dist/antd.css'
import { Typography, Card, Row, Col, Avatar, Button, Modal, Form, Input, } from 'antd'
import { StyledWrapper } from './styled'
import {
    FacebookIcon,
    TwitterIcon,
} from '../../../../../../../shared/assets/icons'
import { InfoCircleOutlined } from '@ant-design/icons'
const { Title, Text } = Typography
const { TextArea } = Input
export const SocialShare = props => {
    const [isFacebookModalVisible, setIsFacebookModalVisible] = useState(false);
    const [isTwitterModalVisible, setIsTwitterModalVisible] = useState(false);
    const showTwitterModal = () => {
        setIsTwitterModalVisible(true);
    };
    const showFacebookModal = () => {
        setIsFacebookModalVisible(true);
    };
    const handleFacebookOk = () => {
        setIsFacebookModalVisible(false);
    };

    const handleFacebookCancel = () => {
        setIsFacebookModalVisible(false);
    };
    const handleTwitterOk = () => {
        setIsTwitterModalVisible(false);
    };

    const handleTwitterCancel = () => {
        setIsTwitterModalVisible(false);
    };
    return (
        <StyledWrapper>
            <Title level={3}>SocialShare</Title>
            <Card style={{ width: "80%" }}>
                <Row>
                    <Col span={2}>
                        <Avatar
                            shape="square"
                            size={64}
                            id="facebook-icon"
                            icon={<FacebookIcon />}
                        />
                    </Col>
                    <Col span={18}>
                        <Title level={4}>Facebook</Title>
                        <Text>
                            Customize your Facebook settings to displays image or text
                            to your other social networks
                        </Text>
                    </Col>
                    <Col span={2} style={{ padding: '0 4px' }}>
                        <Button type="primary" onClick={showFacebookModal}>
                            Customize
                        </Button>
                        <Modal
                            title="Customize Facebook settings"
                            visible={isFacebookModalVisible}
                            onOk={handleFacebookOk}
                            onCancel={handleFacebookCancel}
                            footer={[
                                <Button key="submit" type="primary" onClick={handleFacebookOk}>
                                    Submit
                                </Button>
                            ]}
                        >
                            <Form layout="vertical">
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
                                    value='TestPage-2'
                                    id="og-title"
                                    name="og-title"
                                />
                                <TextArea
                                    strong
                                    level={5}
                                    style={{
                                        display: 'block',
                                        margin: '29px 0px',
                                        width: '80%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    name="og-description"
                                    id="og-description"
                                    value=""
                                    placeholder="Add Page Meta description in 120 words"
                                />
                                <Form.Item
                                    label={
                                        <span
                                            style={{
                                                color: '#555B6E',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Image URL
                                        </span>
                                    }
                                    tooltip={{
                                        title: 'Image URL',
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
                                        addonBefore={'https://'}
                                        defaultValue={'testPage-2'}
                                        style={{
                                            width: 'fit-content',
                                            borderColor: '#E4E4E4',
                                            borderRadius: '4px',
                                        }}

                                    />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    <Col span={2}>
                        <Avatar
                            id="twitter-icon"
                            shape="square"
                            size={64}
                            icon={<TwitterIcon />}
                        />
                    </Col>
                    <Col span={18}>
                        <Title level={4}>Twitter</Title>
                        <Text>
                            Customize your Twitter settings to displays image or text
                            to your other social networks
                        </Text>
                    </Col>
                    <Col span={2} style={{ padding: '0 4px' }}>
                        <Button type="primary" onClick={showTwitterModal}>
                            Customize
                        </Button>
                        <Modal
                            title="Customize Twitter settings"
                            visible={isTwitterModalVisible}
                            onOk={handleTwitterOk}
                            onCancel={handleTwitterCancel}
                            footer={[
                                <Button key="submit" type="primary" onClick={handleTwitterOk}>
                                    Submit
                                </Button>
                            ]}
                        >
                            <Form layout="vertical">
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
                                    value='TestPage-2'
                                    id="og-title"
                                    name="og-title"
                                />
                                <TextArea
                                    strong
                                    level={5}
                                    style={{
                                        display: 'block',
                                        margin: '29px 0px',
                                        width: '80%',
                                        border: '2px solid #E4E4E4',
                                        borderRadius: '4px',
                                    }}
                                    bordered={false}
                                    name="og-description"
                                    id="og-description"
                                    value=""
                                    placeholder="Add Page Meta description in 120 words"
                                />
                                <Form.Item
                                    label={
                                        <span
                                            style={{
                                                color: '#555B6E',
                                                fontSize: '16px',
                                                fontWeight: '600',
                                            }}
                                        >
                                            Image URL
                                        </span>
                                    }
                                    tooltip={{
                                        title: 'Image URL',
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
                                        addonBefore={'https://'}
                                        defaultValue={'testPage-2'}
                                        style={{
                                            width: 'fit-content',
                                            borderColor: '#E4E4E4',
                                            borderRadius: '4px',
                                        }}

                                    />
                                </Form.Item>
                            </Form>
                        </Modal>
                    </Col>
                </Row>
            </Card>
        </StyledWrapper>
    )
}

export default SocialShare
