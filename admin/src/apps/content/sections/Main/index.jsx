import React, { useContext } from 'react'
import { Switch, Route } from 'react-router-dom'
import { BrandName } from './styled'
import BrandContext from '../../context/Brand'
import { ViewIcon } from '../../../../shared/assets/icons'
// Views
import {
   PageListing,
   Home,
   PageForm,
   SubscriptionFold,
   NavigationMenu,
} from '../../views'

export default function Main() {
   const [context, setContext] = useContext(BrandContext)
   const { brandName } = context
   return (
      <main>
         <Route exact path="/content" component={Home} />

         <Route exact path="/content/pages" component={PageListing} />

         <Route
            path="/content/pages/:pageId/:pageName"
            component={PageForm}
            exact
         />
         <Route
            exact
            path="/content/subscription"
            component={SubscriptionFold}
         />
         <Route exact path="/content/navbarMenu" component={NavigationMenu} />

         <Route exact path="/content/settings">
            <h1>Setting Page</h1>
         </Route>
         <Route exact path="/content/blocks">
            <h1>Blocks Page</h1>
         </Route>
         <BrandName>
            <ViewIcon size="24" /> &nbsp;
            <p>Showing information for {brandName} brand</p>
         </BrandName>
      </main>
   )
}
