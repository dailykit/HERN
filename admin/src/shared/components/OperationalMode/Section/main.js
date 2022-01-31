import React from 'react'
import { Switch, Route, Link, Router } from 'react-router-dom'
import ManagerLevel from '../Listing'
import LiveMenu from '../Listing/LiveMenu'
import LiveMenuBrandLocation from '../Listing/LiveMenuBrandLocation'

const Main = () => {
   return (
      <main>
         <Switch>
            <Route path="/operationMode" component={ManagerLevel} exact />
            <Route
               path="/operationMode/:brandName-:brandId:brandLocationId"
               component={LiveMenuBrandLocation}
               exact
            />
            <Route
               path="/operationMode/:brandName-:brandId"
               component={LiveMenu}
               exact
            />
         </Switch>
      </main>
   )
}
export default Main
