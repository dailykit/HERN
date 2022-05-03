import React, { useContext } from 'react'
import { Switch, Route } from 'react-router-dom'
import { BrandName } from './styled'
// import BrandContext from '../../context/Brand'
import { ViewIcon } from '../../../../shared/assets/icons'
// Views
import {
   Home,
   CustomerListing,
   CustomerRelation,
   CouponListing,
   CouponForm,
   CampaignListing,
   CampaignForm,
} from '../../views'
import { BrandContext } from '../../../../App'

const Main = () => {
   // const [context, setContext] = useContext(BrandContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   return (
      <main>
         <Switch>
            <Route
               path="/crm/customers-:brandName-:brandId/:id"
               component={CustomerRelation}
               exact
            />
            <Route
               path="/crm/customers-:brandName-:brandId"
               component={CustomerListing}
               exact
            />
            <Route path="/crm/coupons/:id" exact component={CouponForm} />
            <Route path="/crm/campaign/:id" exact component={CampaignForm} />
            <Route path="/crm/coupons" component={CouponListing} exact />
            <Route path="/crm/campaign" component={CampaignListing} exact />
            <Route path="/crm" component={Home} exact />
         </Switch>

         <BrandName>
            <ViewIcon size="24" /> &nbsp;
            <p>Showing information for {brandContext.brandName} brand</p>
         </BrandName>
      </main>
   )
}

export default Main
