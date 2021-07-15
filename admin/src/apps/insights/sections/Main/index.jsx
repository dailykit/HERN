import React from 'react'
import { Route } from 'react-router-dom'

// Views
import { Home } from '../../views'
import RecipeInsight from '../../views/RecipeInsight'

const Main = () => {
   return (
      <>
         <Route path="/insights" component={Home} exact />
         <Route path="/insights/recipe" component={RecipeInsight} exact />
      </>
   )
}

export default Main
