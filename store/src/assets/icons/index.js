import dynamic from 'next/dynamic'

const AddressIcon = dynamic(() =>
   import('./AddressIcon').then(promise => promise.AddressIcon)
)
const ArrowLeftIcon = dynamic(() =>
   import('./ArrowLeft').then(promise => promise.ArrowLeftIcon)
)
const ArrowLeftIconBG = dynamic(() =>
   import('./ArrowLeftWithBG').then(promise => promise.ArrowLeftIconBG)
)
const ArrowRightIcon = dynamic(() =>
   import('./ArrowRight').then(promise => promise.ArrowRightIcon)
)
const ArrowRightCircle = dynamic(() =>
   import('./ArrowRightCircle').then(promise => promise.ArrowRightCircle)
)
const ArrowRightIconBG = dynamic(() =>
   import('./ArrowRightWithBG').then(promise => promise.ArrowRightIconBG)
)
const CartIcon = dynamic(() =>
   import('./CartIcon').then(promise => promise.CartIcon)
)
const CartIllo = dynamic(() =>
   import('./CartIllo').then(promise => promise.CartIllo)
)
const ChevronIcon = dynamic(() =>
   import('./Chevron').then(promise => promise.ChevronIcon)
)
const CheckIcon = dynamic(() =>
   import('./Check').then(promise => promise.CheckIcon)
)
const CheckBoxIcon = dynamic(() =>
   import('./Checkbox').then(promise => promise.CheckBoxIcon)
)
const ChefIcon = dynamic(() =>
   import('./Chef').then(promise => promise.ChefIcon)
)
const CloseIcon = dynamic(() =>
   import('./Close').then(promise => promise.CloseIcon)
)
const CouponIcon = dynamic(() =>
   import('./CouponIcon').then(promise => promise.CouponIcon)
)
const CouponTicketIcon = dynamic(() =>
   import('./CouponTicketIcon').then(promise => promise.CouponTicketIcon)
)
const CrossIcon = dynamic(() =>
   import('./Cross').then(promise => promise.CrossIcon)
)
const CuisineIcon = dynamic(() =>
   import('./Cuisine').then(promise => promise.CuisineIcon)
)
const DeleteIcon = dynamic(() =>
   import('./Delete').then(promise => promise.DeleteIcon)
)
const DeliveryLaterIcon = dynamic(() =>
   import('./DeliveryLaterIcon').then(promise => promise.DeliveryLaterIcon)
)
const DeliveryNowIcon = dynamic(() =>
   import('./DeliveryNowIcon').then(promise => promise.DeliveryNowIcon)
)
const DineInIcon = dynamic(() =>
   import('./Dinein').then(promise => promise.DineInIcon)
)
const DineinTable = dynamic(() =>
   import('./DineinTable').then(promise => promise.DineinTable)
)
const DistanceIcon = dynamic(() =>
   import('./DistanceIcon').then(promise => promise.DistanceIcon)
)
const EditIcon = dynamic(() =>
   import('./Edit').then(promise => promise.EditIcon)
)
const EmptyCart = dynamic(() =>
   import('./EmptyCart').then(promise => promise.EmptyCart)
)
const ErrorIllustration = dynamic(() =>
   import('./ErrorIllustration').then(promise => promise.ErrorIllustration)
)
const FacebookIcon = dynamic(() =>
   import('./Facebook').then(promise => promise.FacebookIcon)
)
const GoogleIcon = dynamic(() =>
   import('./Google').then(promise => promise.GoogleIcon)
)
const GPSIcon = dynamic(() => import('./GPS').then(promise => promise.GPSIcon))
const Info = dynamic(() => import('./Info').then(promise => promise.Info))
const LeftArrowIcon = dynamic(() =>
   import('./LeftArrow').then(promise => promise.LeftArrowIcon)
)
const LocationIcon = dynamic(() =>
   import('./LocationIcon').then(promise => promise.LocationIcon)
)
const LocationMarker = dynamic(() =>
   import('./LocationMarker').then(promise => promise.LocationMarker)
)
const LockIcon = dynamic(() => import('./Lock'))
const LoginSVG = dynamic(() =>
   import('./Login').then(promise => promise.LoginSVG)
)
const LoyaltyPointsIllustration = dynamic(() =>
   import('./MyLoyaltyPoints').then(
      promise => promise.LoyaltyPointsIllustration
   )
)
const LoyaltyPointsIcon = dynamic(() =>
   import('./LoyaltyPoints').then(promise => promise.LoyaltyPointsIcon)
)
const LoyaltyPointsIllustrationNoTrx = dynamic(() =>
   import('./MyLoyaltyPoints').then(
      promise => promise.LoyaltyPointsIllustrationNoTrx
   )
)
const MailIcon = dynamic(() =>
   import('./Mail').then(promise => promise.MailIcon)
)
const Menu = dynamic(() => import('./Menu').then(promise => promise.Menu))
const MenuIcon = dynamic(() =>
   import('./MenuIcon').then(promise => promise.MenuIcon)
)
const MinusIcon = dynamic(() =>
   import('./Minus').then(promise => promise.MinusIcon)
)
const NotFound = dynamic(() =>
   import('./NotFound').then(promise => promise.NotFound)
)
const OrderTime = dynamic(() =>
   import('./OrderTime').then(promise => promise.OrderTime)
)
const PaymentIllo = dynamic(() =>
   import('./PaymentIllo').then(promise => promise.PaymentIllo)
)
const PaymentModeIcon = dynamic(() =>
   import('./PaymentMode').then(promise => promise.PaymentModeIcon)
)
const PhoneIcon = dynamic(() =>
   import('./Phone').then(promise => promise.PhoneIcon)
)
const PlacedOrderIllo = dynamic(() =>
   import('./PlacedOrderIllo').then(promise => promise.PlacedOrderIllo)
)
const PlusIcon = dynamic(() =>
   import('./Plus').then(promise => promise.PlusIcon)
)
const PlusCircle = dynamic(() =>
   import('./PlusCircle').then(promise => promise.PlusCircle)
)
const ProductGalleryBG = dynamic(() =>
   import('./ProductGalleryBG').then(promise => promise.ProductGalleryBG)
)
const RadioIcon = dynamic(() =>
   import('./RadioIcon').then(promise => promise.RadioIcon)
)
const ReloadIcon = dynamic(() =>
   import('./ReloadIcon').then(promise => promise.ReloadIcon)
)
const RightArrowIcon = dynamic(() =>
   import('./RightArrow').then(promise => promise.RightArrowIcon)
)
const Scissor = dynamic(() =>
   import('./Scissor').then(promise => promise.Scissor)
)
const SearchIcon = dynamic(() =>
   import('./Search').then(promise => promise.SearchIcon)
)
const ShowImageIcon = dynamic(() =>
   import('./ShowImageIcon').then(promise => promise.ShowImageIcon)
)
const StoreIcon = dynamic(() =>
   import('./StoreIcon').then(promise => promise.StoreIcon)
)
const TakeOutIcon = dynamic(() =>
   import('./TakeOut').then(promise => promise.TakeOutIcon)
)
const TickIcon = dynamic(() =>
   import('./Tick').then(promise => promise.TickIcon)
)
const TimeIcon = dynamic(() =>
   import('./Time').then(promise => promise.TimeIcon)
)
const UserIcon = dynamic(() =>
   import('./UserIcon').then(promise => promise.UserIcon)
)
const UtensilsIcon = dynamic(() =>
   import('./UserIcon').then(promise => promise.UtensilsIcon)
)
const VegNonVegType = dynamic(() =>
   import('./VegNonVegType').then(promise => promise.VegNonVegType)
)
const WalletIcon = dynamic(() =>
   import('./Wallet').then(promise => promise.WalletIcon)
)
const WalletPageIllustration = dynamic(() =>
   import('./WalletPageIllustration').then(
      promise => promise.WalletPageIllustration
   )
)
const WalletPageIllustrationResponsive = dynamic(() =>
   import('./WalletPageIllustration').then(
      promise => promise.WalletPageIllustrationResponsive
   )
)
const WarningIcon = dynamic(() =>
   import('./Warning').then(promise => promise.WarningIcon)
)
/**Payment card  */
const DebitCardIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.DebitCardIcon)
)
const NetbankingIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.NetbankingIcon)
)
const UpiIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.UpiIcon)
)
const PaytmIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.PaytmIcon)
)
const VisaIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.VisaIcon)
)
const MasterCardIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.MasterCardIcon)
)
const MaestroIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.MaestroIcon)
)
const AmexIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.AmexIcon)
)
const PaypalIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.PaypalIcon)
)
const PaymentIcon = dynamic(() =>
   import('./PaymentIcons').then(promise => promise.PaymentIcon)
)
/**Profile sidebar */
const Profile = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.Profile)
)
const Wallet = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.Wallet)
)
const LoyaltyPoints = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.LoyaltyPoints)
)
const Referrals = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.Referrals)
)
const Orders = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.Orders)
)
const Subscriptions = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.Subscriptions)
)
const ManageAddresses = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.ManageAddresses)
)
const ManageCards = dynamic(() =>
   import('./ProfileSidebar').then(promise => promise.ManageCards)
)
const RoundCheckBoxIcon = dynamic(() =>
   import('./RoundCheckBox').then(promise => promise.RoundCheckBoxIcon)
)
const NoTickRoundCheckBoxIcon = dynamic(() =>
   import('./RoundCheckBox').then(promise => promise.NoTickRoundCheckBoxIcon)
)
const DownVector = dynamic(() =>
   import('./Vector').then(promise => promise.DownVector)
)
const UpVector = dynamic(() =>
   import('./Vector').then(promise => promise.UpVector)
)
const NoImage = dynamic(() =>
   import('./NoImage').then(promise => promise.NoImage)
)
const ProfileSidebarIcon = {
   Profile,
   Wallet,
   LoyaltyPoints,
   Referrals,
   Orders,
   Subscriptions,
   ManageAddresses,
   ManageCards,
}

export * from './DeliveryInfoIcons'
export * from './AddressLabelIcon'
export * from './DeliveryTitleIcons'

const EmptyCloche = dynamic(() =>
   import('./EmptyCloche').then(promise => promise.EmptyCloche)
)
const EmptyStore = dynamic(() =>
   import('./EmptyStore').then(promise => promise.EmptyStore)
)
const EmptyReferralIll = dynamic(() =>
   import('./EmptyReferralIll').then(promise => promise.EmptyReferralIll)
)
const Cloche = dynamic(() => import('./Cloche').then(promise => promise.Cloche))

const RoundedCloseIcon = dynamic(() =>
   import('./RoundedCloseIcon').then(promise => promise.RoundedCloseIcon)
)
const PaymentOptionIcon = dynamic(() =>
   import('./PaymentOptionIcon').then(promise => promise.PaymentOptionIcon)
)
const BackSpaceIcon = dynamic(() =>
   import('./BackSpaceIcon').then(promise => promise.BackSpaceIcon)
)

const CardCoverIllustration = dynamic(() =>
   import('./CardCoverIllustration').then(
      promise => promise.CardCoverIllustration
   )
)

const SkipPhoneNumberModalImage = dynamic(() =>
   import('./SkipPhoneNumberModalImage').then(
      promise => promise.SkipPhoneNumberModalImage
   )
)

const SkipPhoneNumberCartPageIllustration = dynamic(() =>
   import('./SkipPhoneNumberCartPageIllustration').then(
      promise => promise.SkipPhoneNumberCartPageIllustration
    )
)
const ResetPopUpImage = dynamic(() =>
   import('./ResetPopUpImage').then(
      promise => promise.ResetPopUpImage
   )
)
const GoBackMenuPageIllustration = dynamic(() =>
   import('./GoBackMenuPageIllustration').then(
      promise => promise.GoBackMenuPageIllustration
   )
)
const DeleteConfirmationPopUpIllustration = dynamic(() =>
   import('./DeleteConfirmationPopUpIllustration').then(
      promise => promise.DeleteConfirmationPopUpIllustration
   )
)

export {
   AddressIcon,
   ArrowLeftIcon,
   ArrowLeftIconBG,
   ArrowRightIcon,
   ArrowRightCircle,
   ArrowRightIconBG,
   CardCoverIllustration,
   CartIcon,
   CartIllo,
   ChevronIcon,
   CheckIcon,
   CheckBoxIcon,
   ChefIcon,
   CloseIcon,
   CouponIcon,
   CouponTicketIcon,
   CrossIcon,
   CuisineIcon,
   DeleteIcon,
   DeliveryLaterIcon,
   DeliveryNowIcon,
   DineInIcon,
   DineinTable,
   DistanceIcon,
   EditIcon,
   EmptyCart,
   ErrorIllustration,
   FacebookIcon,
   GoogleIcon,
   GPSIcon,
   Info,
   LeftArrowIcon,
   LocationIcon,
   LocationMarker,
   LockIcon,
   LoginSVG,
   LoyaltyPointsIcon,
   LoyaltyPointsIllustration,
   LoyaltyPointsIllustrationNoTrx,
   MailIcon,
   Menu,
   MenuIcon,
   MinusIcon,
   NotFound,
   OrderTime,
   PaymentIllo,
   PaymentModeIcon,
   PhoneIcon,
   PlacedOrderIllo,
   PlusIcon,
   PlusCircle,
   RadioIcon,
   ReloadIcon,
   RightArrowIcon,
   Scissor,
   SearchIcon,
   ShowImageIcon,
   StoreIcon,
   TakeOutIcon,
   TickIcon,
   TimeIcon,
   UserIcon,
   UtensilsIcon,
   VegNonVegType,
   WalletIcon,
   WarningIcon,
   DebitCardIcon,
   NetbankingIcon,
   UpiIcon,
   PaytmIcon,
   VisaIcon,
   MasterCardIcon,
   MaestroIcon,
   AmexIcon,
   PaypalIcon,
   PaymentIcon,
   RoundCheckBoxIcon,
   NoTickRoundCheckBoxIcon,
   DownVector,
   UpVector,
   ProfileSidebarIcon,
   ProductGalleryBG,
   WalletPageIllustration,
   WalletPageIllustrationResponsive,
   NoImage,
   EmptyCloche,
   EmptyStore,
   EmptyReferralIll,
   Cloche,
   RoundedCloseIcon,
   PaymentOptionIcon,
   BackSpaceIcon,
   SkipPhoneNumberModalImage,
   SkipPhoneNumberCartPageIllustration,
   ResetPopUpImage,
   GoBackMenuPageIllustration,
   DeleteConfirmationPopUpIllustration,
}
