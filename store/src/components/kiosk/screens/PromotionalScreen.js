import tw from 'twin.macro'
import { ArrowLeftIconBG } from '../../../assets/icons'
import { useTranslation } from '../../../context'
import { useConfig } from '../../../lib'
import { isClient } from '../../../utils'

export const PromotionalScreen = ({ config, setCurrentPage }) => {
   const { t } = useTranslation()
   const { currentPage } = useConfig()
   //Config for promotional screen
   const promotionalScreenSettings = {
      continueButtonLabel:
         config?.promotionalScreenSettings?.promotionalScreenContinueButton
            ?.labelForContinueButton?.value || 'CONTINUE',
      image:
         config?.promotionalScreenSettings?.promotionalScreenBackgroundImage
            ?.value ||
         'https://dailykit-133-test.s3.us-east-2.amazonaws.com/images/08345-app_promotion.png',
   }
   const { image } = promotionalScreenSettings

   const showPhoneScreen =
      config?.phoneNoScreenSettings?.askPhoneNumber.value ?? false
   const fulfillmentType = isClient && localStorage.getItem('fulfillmentType')
   //handle back for kiosk screens
   const handleBack = () => {
      switch (currentPage) {
         case 'promotionalPage':
            if (fulfillmentType === 'ONDEMAND_PICKUP') {
               if (showPhoneScreen) {
                  setCurrentPage('phonePage')
               } else {
                  setCurrentPage('fulfillmentPage')
               }
            } else {
               setCurrentPage('tableSelectionPage')
            }
            break
         default:
            break
      }
   }
   return (
      <div
         tw="fixed inset-0 bg-white"
         className="animate__animated animate__slideInRight animate-fill-none"
      >
         <div tw="h-full relative">
            <span tw="absolute top-6 left-4">
               <ArrowLeftIconBG
                  bgColor={'#fff'}
                  onClick={handleBack}
                  arrowColor={config.kioskSettings.theme.primaryColor.value}
               />
            </span>
            <img
               onClick={() => {
                  setCurrentPage('menuPage')
               }}
               src={image}
            />
            {/* <div
               onClick={() => {
                  setCurrentPage('menuPage')
               }}
               tw="absolute bottom-20 w-full flex justify-center"
            >
               <button tw="bg-[var(--hern-primary-color)] text-7xl text-white font-extrabold px-[56px] py-7 tracking-wide">
                  {t(continueButtonLabel)}
               </button>
            </div> */}
         </div>
      </div>
   )
}
