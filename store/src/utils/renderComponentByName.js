import dynamic from 'next/dynamic'

const Plans = dynamic(() =>
   import('../sections/select-plan').then(promise => promise.Plans)
)

export const renderComponentByName = componentName => {
   switch (componentName) {
      /*ROUTES: 
      [brand]/our-plans
      [brand]/get-started/select-plan
      */
      case 'Plans':
         return <Plans />
      /*ROUTES: 
      [brand]/our-menu
      */
      default:
         return null
   }
}
