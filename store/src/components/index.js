import dynamic from 'next/dynamic'
import { Form } from './form'
import { Button } from './button'
import { HernSkeleton } from './hernSkeleton'
import { Fulfillment } from './fulfillment'

const PaymentProcessingModal = dynamic(() => import('./paymentProcessingModal'))
const FloatingBar = dynamic(() => import('./floatingBar'))
const PaymentOptionsRenderer = dynamic(() => import('./paymentOptionsRenderer'))
const PayButton = dynamic(() => import('./PayButton'))
const PrintProcessingModal = dynamic(() => import('./printProcessingModal'))
const WalletTopUp = dynamic(() => import('./walletTopUp'))

const SEO = dynamic(() => import('./seo').then(promise => promise.SEO))

const Layout = dynamic(() => import('./layout').then(promise => promise.Layout))
const Spacer = dynamic(() => import('./spacer').then(promise => promise.Spacer))
const Loader = dynamic(() => import('./loader').then(promise => promise.Loader))
const StepsNavbar = dynamic(() =>
   import('./steps_navbar').then(promise => promise.StepsNavbar)
)

const PageLoader = dynamic(() =>
   import('./page_loader').then(promise => promise.PageLoader)
)
const ProfileSidebar = dynamic(() =>
   import('./profile_sidebar').then(promise => promise.ProfileSidebar)
)
const StyledArticle = dynamic(() =>
   import('./styled_tags').then(promise => promise.StyledArticle)
)
const ProductSkeleton = dynamic(() =>
   import('./product_skeleton').then(promise => promise.ProductSkeleton)
)
const CartProduct = dynamic(() =>
   import('./cart_product').then(promise => promise.CartProduct)
)
const Billing = dynamic(() =>
   import('./billing').then(promise => promise.Billing)
)
const WalletAmount = dynamic(() =>
   import('./wallet_amount').then(promise => promise.WalletAmount)
)
const LoyaltyPoints = dynamic(() =>
   import('./loyalty_points').then(promise => promise.LoyaltyPoints)
)
const Coupon = dynamic(() => import('./coupon').then(promise => promise.Coupon))
const CouponsList = dynamic(() =>
   import('./coupons_list').then(promise => promise.CouponsList)
)
const Referral = dynamic(() =>
   import('./referral').then(promise => promise.Referral)
)
const AddressList = dynamic(() =>
   import('./address_list').then(promise => promise.AddressList)
)
const AddressListHeader = dynamic(() =>
   import('./address_list').then(promise => promise.AddressListHeader)
)
const CardList = dynamic(() =>
   import('./card_list').then(promise => promise.CardList)
)

const BottomCartBar = dynamic(() =>
   import('./bottom_cart_bar').then(promise => promise.BottomCartBar)
)
const Divider = dynamic(() =>
   import('./divider').then(promise => promise.Divider)
)
const ModifierPopup = dynamic(() =>
   import('./modifier_popup').then(promise => promise.ModifierPopup)
)
const ModifierPopupForUnAvailability = dynamic(() =>
   import('./modifierPopUpForUnAvailability').then(
      promise => promise.ModifierPopupForUnAvailability
   )
)
const CounterButton = dynamic(() =>
   import('./counterBtn').then(promise => promise.CounterButton)
)
const Login = dynamic(() => import('./login').then(promise => promise.Login))
// const SEO = dynamic(() => import('./locationSelector'
const LanguageSwitch = dynamic(() =>
   import('./language_switch').then(promise => promise.LanguageSwitch)
)
const LoginWarning = dynamic(() =>
   import('./loginWarning').then(promise => promise.LoginWarning)
)
const LoginWarningWithText = dynamic(() =>
   import('./loginWarning').then(promise => promise.LoginWarningWithText)
)
const TemplateFile = dynamic(() =>
   import('./templateFile').then(promise => promise.TemplateFile)
)
const Recipe = dynamic(() => import('./recipe').then(promise => promise.Recipe))
const FulfillmentForm = dynamic(() =>
   import('./fulfillment').then(promise => promise.FulfillmentForm)
)
// const Fulfillment = dynamic(() =>
//    import('./fulfillment').then(promise => promise.Fulfillment)
// )
const CartPaymentComponent = dynamic(() =>
   import('./cartPayment').then(promise => promise.CartPaymentComponent)
)

const UserInfo = dynamic(() =>
   import('./userInfo').then(promise => promise.UserInfo)
)
const Nutritions = dynamic(() =>
   import('./nutrition').then(promise => promise.Nutritions)
)
const UserType = dynamic(() =>
   import('./userType').then(promise => promise.UserType)
)
const ExternalJSCSSFiles = dynamic(() =>
   import('./externalJSCSSFiles').then(promise => promise.ExternalJSCSSFiles)
)
const CartBillingDetails = dynamic(() =>
   import('./cart_billing_details').then(promise => promise.CartBillingDetails)
)
const OrderDetails = dynamic(() =>
   import('./order_details').then(promise => promise.OrderDetails)
)
const UserAddressList = dynamic(() =>
   import('./userAddressList').then(promise => promise.UserAddressList)
)
const CartOrderDetails = dynamic(() =>
   import('./cart_order_details').then(promise => promise.CartOrderDetails)
)
const GoogleSuggestionsList = dynamic(() =>
   import('./googleSuggestionsList').then(
      promise => promise.GoogleSuggestionsList
   )
)
const CartCard = dynamic(() =>
   import('./cart_card').then(promise => promise.CartCard)
)
const ModifierOptionCard = dynamic(() =>
   import('./modifierOptionCard').then(promise => promise.ModifierOptionCard)
)
const ModifierCategory = dynamic(() =>
   import('./modifierCategory').then(promise => promise.ModifierCategory)
)
const Empty = dynamic(() => import('./empty').then(promise => promise.Empty))
const PageBanner = dynamic(() =>
   import('./page_banner').then(promise => promise.PageBanner)
)

export {
   PaymentProcessingModal,
   FloatingBar,
   PaymentOptionsRenderer,
   PayButton,
   PrintProcessingModal,
   SEO,
   Button,
   Layout,
   // Tunnel,
   Spacer,
   Loader,
   StepsNavbar,
   // OnDemandMenu,
   PageLoader,
   ProfileSidebar,
   StyledArticle,
   ProductSkeleton,
   CartProduct,
   Billing,
   WalletAmount,
   LoyaltyPoints,
   Coupon,
   CouponsList,
   Referral,
   AddressList,
   AddressListHeader,
   CardList,
   BottomCartBar,
   Divider,
   ModifierPopup,
   ModifierPopupForUnAvailability,
   CounterButton,
   Login,
   LoginWarning,
   LoginWarningWithText,
   TemplateFile,
   Fulfillment,
   FulfillmentForm,
   Recipe,
   CartPaymentComponent,
   UserInfo,
   Nutritions,
   UserType,
   ExternalJSCSSFiles,
   CartBillingDetails,
   OrderDetails,
   UserAddressList,
   CartOrderDetails,
   GoogleSuggestionsList,
   CartCard,
   ModifierOptionCard,
   ModifierCategory,
   LanguageSwitch,
   Empty,
   Form,
   HernSkeleton,
   WalletTopUp,
   PageBanner,
}

const TunnelHeader = dynamic(() =>
   import('./tunnel').then(promise => promise.Header)
)
const TunnelWrapper = dynamic(() =>
   import('./tunnel').then(promise => promise.Tunnel)
)
const Body = dynamic(() => import('./tunnel').then(promise => promise.Body))
const Left = dynamic(() => import('./tunnel').then(promise => promise.Left))
const Right = dynamic(() => import('./tunnel').then(promise => promise.Right))
const Bottom = dynamic(() => import('./tunnel').then(promise => promise.Bottom))

export const Tunnel = {
   Wrapper: TunnelWrapper,
   Header: TunnelHeader,
   Left,
   Right,
   Bottom,
   Body,
}
export * from './helper_bar'
export * from './on_demand_menu'
export * from './product_card'
