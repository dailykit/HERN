import dynamic from 'next/dynamic'

const Plans = dynamic(() =>
   import('../sections/select-plan').then(promise => promise.Plans)
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
      default:
         return null
   }
}
