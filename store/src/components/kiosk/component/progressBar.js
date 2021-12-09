import { Steps } from 'antd'
import React, { useEffect } from 'react'
import { CartContext, useTranslation } from '../../../context'
import { useQueryParamState } from '../../../utils'

const { Step } = Steps

export const ProgressBar = props => {
   const { config } = props

   const { cartState } = React.useContext(CartContext)
   const { t, direction } = useTranslation()
   const { cart } = cartState

   const [current, setCurrent] = React.useState(0)

   const [currentPage] = useQueryParamState('currentPage', 'fulfillmentPage')

   const steps = [
      {
         title: 'Select Product',
      },
      {
         title: 'ReviewCart',
      },
      {
         title: 'Payment',
      },
   ]
   useEffect(() => {
      if (currentPage === 'menuPage') {
         setCurrent(0)
      } else if (currentPage === 'cartPage') {
         setCurrent(1)
      } else if (currentPage === 'paymentPage') {
         setCurrent(2)
      }
   }, [currentPage])

   const StepCount = ({ step, isFinish, isCurrent }) => {
      return (
         <div
            className="hern-kiosk__step-bar-count"
            style={{
               backgroundColor: `${
                  isFinish
                     ? config.kioskSettings.theme.secondaryColor.value
                     : isCurrent
                     ? config.kioskSettings.theme.primaryColor.value
                     : 'transparent'
               }`,

               color: `${isFinish ? '#fff' : isCurrent ? '#fff' : '#5A5A5A99'}`,
               border: `${isFinish ? 'none' : '2px solid #5A5A5A99'}`,
            }}
         >
            {step}
         </div>
      )
   }
   return (
      <Steps
         current={current}
         className={direction === 'rtl' && 'hern-kiosk__step-bar-rtl'}
      >
         {steps.map((item, index) => (
            <Step
               key={item.title}
               title={t(item.title)}
               style={{
                  color: `${config.kioskSettings.theme.primaryColor.value}`,
               }}
               icon={
                  <StepCount
                     step={index + 1}
                     isFinish={index < current}
                     isCurrent={index == current}
                  />
               }
            />
         ))}
      </Steps>
   )
}
