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
      [brand]/get-started/register
      [brand]/get-started/select-plan
      [brand]/get-started/select-delivery
      [brand]/get-started/select-menu
      [brand]/get-started/checkout
      */
      case 'StepsNavbar':
         return <StepsNavbar />
      default:
         return null
   }
}
