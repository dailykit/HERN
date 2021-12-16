import React from 'react'
import { Row, Col } from 'antd'
import { CartDetails } from './CartDetails'
import { Fulfillment } from '../../components'

export const OnDemandCart = () => {
   return (
      <Row>
         <Col span={16}>
            <div className="hern-ondemand-cart__left-card">Account</div>
            <div className="hern-ondemand-cart__left-card">
               <Fulfillment />
            </div>
            <div className="hern-ondemand-cart__left-card">Apply Coupons</div>
            <div className="hern-ondemand-cart__left-card">Loyalty points</div>
            <div className="hern-ondemand-cart__left-card">Wallet</div>
            <div className="hern-ondemand-cart__left-card">Payments</div>
         </Col>
         <Col span={8}>
            <CartDetails />
         </Col>
      </Row>
   )
}
