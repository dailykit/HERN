import tw from 'twin.macro'
import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useRouter } from 'next/router'
import { Result, Spin, Button, Modal } from 'antd'
import { Wrapper } from './styles'
import { Button as StyledButton } from '../button'
import { useWindowSize, isKiosk, isClient } from '../../utils'
import { useCart, useTranslation } from '../../context'
import { useConfig } from '../../lib'

const PrintProcessingModal = ({
   printDetails,
   setPrintStatus = () => null,
   initializePrinting = () => null,
   resetPaymentProviderStates = () => null,
}) => {
   console.log('PrintProcessingModal')

   const router = useRouter()
   const isKioskMode = isKiosk()
   const { width, height } = useWindowSize()
   const {
      isPrintInitiated = false,
      printStatus = 'not-started',
      message = '',
   } = printDetails
   const { setStoredCartId } = useCart()
   const { setIsIdleScreen, clearCurrentPage } = useConfig()
   const { t } = useTranslation()

   const showPrintingStatus = () => {
      let icon = (
         <img
            src="/assets/gifs/receipt.gif"
            className="payment_status_loader"
         />
      )

      let title = 'Printing your receipt'
      let subtitle = 'Please wait while we print your receipt'
      let extra = null
      if (printStatus === 'success') {
         icon = (
            <img
               src="/assets/gifs/successful.gif"
               className="payment_status_loader"
            />
         )
         title = `${t('Printed your receipt successfully')}`
         subtitle = `${t('Taking you back to the home page shortly')}`
      } else if (printStatus === 'failed') {
         icon = (
            <img
               src="/assets/gifs/payment_fail.gif"
               className="payment_status_loader"
            />
         )
         title = `${t('Failed to print your receipt')}`
         subtitle = message
         extra = [
            <Button type="primary" onClick={initializePrinting}>
               {t('Retry Print Receipt')}
            </Button>,
         ]
      }
      return {
         icon,
         title,
         subtitle,
         extra,
      }
   }

   useEffect(() => {
      if (printStatus === 'success') {
         setTimeout(async () => {
            if (isKioskMode) {
               // await resetPaymentProviderStates()
               // clearCurrentPage()
               // setStoredCartId(null)
               if (isClient) {
                  window.location.reload()
               }
            }
         }, 5000)
      }
   }, [printStatus])

   return (
      <Modal
         title={null}
         visible={isPrintInitiated}
         footer={null}
         closable={false}
         keyboard={false}
         maskClosable={false}
         centered
         width={780}
         zIndex={10000}
         bodyStyle={{
            maxHeight: '520px',
            overflowY: 'auto',
         }}
         maskStyle={{
            backgroundColor: isKioskMode ? 'rgba(0, 64, 106, 0.9)' : '#fff',
         }}
      >
         <Wrapper>
            <Result
               icon={showPrintingStatus().icon}
               title={showPrintingStatus().title}
               subTitle={showPrintingStatus().subtitle}
               extra={showPrintingStatus().extra}
            />

            {printStatus === 'success' && <Confetti />}
         </Wrapper>
      </Modal>
   )
}

export default PrintProcessingModal
