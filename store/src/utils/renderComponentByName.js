import dynamic from 'next/dynamic'

const Plans = dynamic(() =>
   import('../sections/select-plan').then(promise => promise.Plans)
)
const Content = dynamic(() =>
   import('../sections/our-menu/content').then(promise => promise.Content)
)
const Registration = dynamic(() =>
   import('../sections/register').then(promise => promise.Registration)
)
const StepsNavbar = dynamic(() =>
   import('../components/steps_navbar').then(promise => promise.StepsNavbar)
)
const Delivery = dynamic(() =>
   import('../sections/select-delivery').then(promise => promise.Delivery)
)
const MenuSection = dynamic(() =>
   import('../sections/select-menu').then(promise => promise.MenuSection)
)
const CheckoutSection = dynamic(() =>
   import('../sections/checkout').then(promise => promise.CheckoutSection)
)
const ChangePlan = dynamic(() =>
   import('../sections/change-plan').then(promise => promise.ChangePlan)
)
const Login = dynamic(() =>
   import('../sections/login').then(promise => promise.Login)
)
const TermsAndConditions = dynamic(() =>
   import('../sections/terms-condition').then(
      promise => promise.TermsAndConditions
   )
)
const RefundPolicy = dynamic(() =>
   import('../sections/refund-policy').then(promise => promise.RefundPolicy)
)
const ResetPassword = dynamic(() =>
   import('../sections/reset-password').then(promise => promise.ResetPassword)
)
const Home = dynamic(() =>
   import('../sections/home').then(promise => promise.Home)
)
const PageNotFound = dynamic(() =>
   import('../sections/404').then(promise => promise.PageNotFound)
)
const ForgotPassword = dynamic(() =>
   import('../sections/forgot-password').then(promise => promise.ForgotPassword)
)
const Checkout = dynamic(() =>
   import('../sections/checkout-page').then(promise => promise.Checkout)
)
const MenuView = dynamic(() =>
   import('../sections/menu').then(promise => promise.MenuView)
)
const Addresses = dynamic(() =>
   import('../sections/addresses').then(promise => promise.Addresses)
)
const ManageCards = dynamic(() =>
   import('../sections/cards').then(promise => promise.ManageCards)
)
const LoyaltyPoints = dynamic(() =>
   import('../sections/loyalty-points').then(promise => promise.LoyaltyPoints)
)
const Orders = dynamic(() =>
   import('../sections/orders').then(promise => promise.Orders)
)
const Profile = dynamic(() =>
   import('../sections/profile').then(promise => promise.Profile)
)
const Wallet = dynamic(() =>
   import('../sections/wallet').then(promise => promise.Wallet)
)
const Referrals = dynamic(() =>
   import('../sections/referrals').then(promise => promise.Referrals)
)
const Inventory = dynamic(() =>
   import('../sections/inventory').then(promise => promise.Inventory)
)
const PlacingOrder = dynamic(() =>
   import('../sections/placing-order').then(promise => promise.PlacingOrder)
)
const OnDemandOrder = dynamic(() =>
   import('../sections/order').then(promise => promise.OnDemandOrder)
)
export const renderComponentByName = (componentName, options) => {
   const getProps = component => {
      if (options) {
         const [props] = options.filter(
            option => option.component === componentName
         )
         if (props) {
            return component === props.component ? props.props : []
         }
      }
   }

   switch (componentName) {
      /*ROUTES: 
      [brand]/our-plans
      [brand]/get-started/select-plan
      */
      case 'Plans':
         return <Plans {...getProps('Plans')} />
      /*ROUTES: 
      [brand]/our-menu
      */
      case 'Content':
         return <Content />
      /*ROUTES : 
      [brand]/get-started/register
      */
      case 'Registration':
         return <Registration {...getProps('Registration')} />
      /*ROUTES : 
      [brand]/get-started/select-delivery
      */
      case 'Delivery':
         return <Delivery />
      /*ROUTES : 
      [brand]/get-started/select-delivery
      */
      case 'MenuSection':
         return <MenuSection />
      /*ROUTES : 
      [brand]/get-started/checkout
      */
      case 'CheckoutSection':
         return <CheckoutSection />
      /*ROUTES : 
      [brand]/change-plan
      */
      case 'ChangePlan':
         return <ChangePlan />
      /*ROUTES : 
      [brand]/login
      */
      case 'Login':
         return <Login />
      /*ROUTES : 
      [brand]/terms-and-condition
      */
      case 'TermsAndConditions':
         return <TermsAndConditions />
      /*ROUTES : 
      [brand]/refund-policy
      */
      case 'RefundPolicy':
         return <RefundPolicy />
      /*ROUTES : 
      [brand]/reset-password
      */
      case 'ResetPassword':
         return <ResetPassword />
      /*ROUTES : 
      [brand]/
      */
      case 'Home':
         return <Home />
      /*ROUTES : 
      [brand]/404
      */
      case 'PageNotFound':
         return <PageNotFound />
      /*ROUTES : 
      [brand]/forgot-password
      */
      case 'ForgotPassword':
         return <ForgotPassword />
      /*ROUTES : 
      [brand]/checkout
      */
      case 'Checkout':
         return <Checkout />
      /*ROUTES : 
      [brand]/menu
      */
      case 'MenuView':
         return <MenuView />
      /*ROUTES : 
      [brand]/account/addresses
      */
      case 'Addresses':
         return <Addresses />
      /*ROUTES : 
      [brand]/account/cards
      */
      case 'ManageCards':
         return <ManageCards />
      /*ROUTES : 
      [brand]/account/loyalty-points
      */
      case 'LoyaltyPoints':
         return <LoyaltyPoints />
      /*ROUTES : 
      [brand]/account/orders
      */
      case 'Orders':
         return <Orders />
      /*ROUTES : 
      [brand]/account/profile
      */
      case 'Profile':
         return <Profile />
      /*ROUTES : 
      [brand]/account/wallet
      */
      case 'Wallet':
         return <Wallet />
      /*ROUTES : 
      [brand]/account/referrals
      */
      case 'Referrals':
         return <Referrals />
      /*ROUTES : 
      [brand]/account/inventory
      */
      case 'Inventory':
         return <Inventory />

      /*ROUTES : 
      [brand]/get-started/placing-order
      [brand]/placing-order
      */
      case 'PlacingOrder':
         return <PlacingOrder />

      /*ROUTES : 
      [brand]/get-started/register
      [brand]/get-started/select-plan
      [brand]/get-started/select-delivery
      [brand]/get-started/select-menu
      [brand]/get-started/checkout
      */
      case 'StepsNavbar':
         return <StepsNavbar />

      /* ROUTE :
      [brand]/order
      */
      case 'OnDemandOrder':
         return <OnDemandOrder />
      default:
         return null
   }
}
