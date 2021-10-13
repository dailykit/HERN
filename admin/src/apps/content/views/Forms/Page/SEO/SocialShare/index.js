import React from 'react'
import 'antd/dist/antd.css'
import { Typography, Card, Row, Col, Avatar, Button } from 'antd'
import { StyledWrapper } from './styled'
import { FacebookIcon, TwitterIcon } from '../../../../../../../shared/assets/icons'
const { Title } = Typography

export const SocialShare = props => {
    return (
        <StyledWrapper>
            <Title level={3}>SocialShare</Title>
            <Card style={{ width: 'fit-content' }}>
                <Row>
                    <Col span={4}>
                        {' '}
                        <Avatar shape="square" size={64} id="facebook-icon" icon={<FacebookIcon />} />
                    </Col>
                    <Col span={16}>
                        {' '}
                        <Title level={5}>Facebook</Title>Customize your Facebook
                        settings to displays image or text to your other social
                        networks
                    </Col>
                    <Col span={4}>
                        {' '}
                        <Button type="primary">Customize</Button>
                    </Col>
                </Row>
                <Row style={{ marginTop: '20px' }}>
                    {' '}
                    <Col span={4}>
                        <Avatar id="twitter-icon" shape="square" size={64} icon={<TwitterIcon />} />
                    </Col>
                    <Col span={16}>
                        {' '}
                        <Title level={5}>Twitter</Title>Customize your Twitter
                        settings to displays image or text to your other social
                        networks
                    </Col>
                    <Col span={4}>
                        {' '}
                        <Button type="primary">Customize</Button>
                    </Col>
                </Row>
            </Card>
        </StyledWrapper>
    )
}

export default SocialShare
