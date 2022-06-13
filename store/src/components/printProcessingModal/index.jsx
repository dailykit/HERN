import tw from 'twin.macro'
import React, { useState, useEffect } from 'react'
import Confetti from 'react-confetti'
import { useRouter } from 'next/router'
import { Result, Spin, Button, Modal } from 'antd'
import { Wrapper } from './styles'
import { Button as StyledButton } from '../button'
import { useWindowSize, isKiosk, isClient, get_env } from '../../utils'
import { useCart, useTranslation } from '../../context'
import { useConfig } from '../../lib'
import QRCode from 'react-qr-code'
import KioskButton from '../kiosk/component/button'
import moment from 'moment'
import CryptoJS from 'crypto-js'

const PrintProcessingModal = ({
   printDetails,
   setPrintStatus = () => null,
   initializePrinting = () => null,
   resetPaymentProviderStates = () => null,
}) => {
   const router = useRouter()
   const isKioskMode = isKiosk()
   const { width, height } = useWindowSize()
   const {
      isPrintInitiated = false,
      printStatus = 'not-started',
      message = '',
   } = printDetails
   const { storedCartId } = useCart()
   const { setIsIdleScreen, clearCurrentPage, KioskConfig, settings } =
      useConfig()
   const { t } = useTranslation()
   const SuccessExtraArea = () => {
      const [count, setCount] = useState(
         KioskConfig?.printPopupSettings?.QrTime?.value || 30
      )
      React.useEffect(() => {
         const interval = setInterval(() => {
            setCount(prev => prev - 1)
         }, 1000)
         return () => {
            clearInterval(interval)
         }
      }, [])
      return (
         <div
            style={{
               display: 'flex',
               flexDirection: 'column',
               alignItems: 'center',
            }}
         >
            <span>{moment(count, 'ss').format('mm:ss')}</span>
            <KioskButton
               onClick={() => {
                  window.location.reload()
               }}
               buttonConfig={KioskConfig.kioskSettings.buttonSettings}
               style={{ padding: '0 25px' }}
            >
               {t('Exit')}
            </KioskButton>
         </div>
      )
   }
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
      const path =
         settings['printing']?.['KioskCustomerTokenTemplate']?.path?.value

      // encrypt invoice details
      const invoiceDetail = CryptoJS.AES.encrypt(
         JSON.stringify({
            template: { path: path, format: 'pdf', readVar: false },
            data: { cartId: storedCartId },
         }),
         get_env('ADMIN_SECRET')
      ).toString()

      // encodeURIComponent
      const encodedInvoiceDetail = encodeURIComponent(invoiceDetail)

      if (printStatus === 'success') {
         icon = KioskConfig?.printPopupSettings?.showInvoiceQrCode?.value ? (
            <div
               style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
               }}
            >
               <QRCode
                  value={`${get_env(
                     'BASE_BRAND_URL'
                  )}/server/api/invoice/${encodedInvoiceDetail}`}
                  level="L"
                  size="250"
                  title="hello"
               />
               <span style={{ fontSize: '18px' }}>
                  {t('Scan QR code to get invoice')}
               </span>
            </div>
         ) : (
            <img
               src="/assets/gifs/successful.gif"
               className="payment_status_loader"
            />
         )
         title = 'Printed your receipt successfully'
         subtitle = 'Taking you back to the home page shortly'
         extra = KioskConfig?.printPopupSettings?.showInvoiceQrCode?.value ? (
            <SuccessExtraArea />
         ) : null
      } else if (printStatus === 'failed') {
         icon = (
            <img
               src="/assets/gifs/payment_fail.gif"
               className="payment_status_loader"
            />
         )
         title = 'Failed to print your receipt'
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
         const timer = KioskConfig?.printPopupSettings?.showInvoiceQrCode?.value
            ? KioskConfig?.printPopupSettings?.QrTime?.value
               ? KioskConfig?.printPopupSettings?.QrTime?.value * 1000
               : 30000
            : 5000
         console.log('timer', timer)
         setTimeout(async () => {
            if (isKioskMode) {
               // await resetPaymentProviderStates()
               // clearCurrentPage()
               // setStoredCartId(null)
               if (isClient) {
                  window.location.reload()
               }
            }
         }, timer)
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
               title={t(showPrintingStatus().title)}
               subTitle={t(showPrintingStatus().subtitle)}
               extra={showPrintingStatus().extra}
            />

            {printStatus === 'success' &&
               !KioskConfig?.printPopupSettings?.showInvoiceQrCode?.value && (
                  <Confetti />
               )}
         </Wrapper>
      </Modal>
   )
}

export default PrintProcessingModal
