import React from 'react'
import { useParams } from 'react-router-dom'

import AccompanimentTypesForm from './AccompanimentTypes'
import CuisineForm from './Cuisine'
import AllergensForm from './Allergens'
import ProcessingsForm from './Processings'
import UnitsForm from './Units'
import ProductCategories from './ProductCategories'
import IngredientCategories from './IngredientCategories'
import VegNonVeg from './VegNonVeg'
import Recipe from './Recipe'
const MasterListForm = () => {
   const { list } = useParams()

   switch (list) {
      case 'accompaniment-types': {
         return <AccompanimentTypesForm />
      }
      case 'cuisines': {
         return <CuisineForm />
      }
      case 'allergens': {
         return <AllergensForm />
      }
      case 'processings': {
         return <ProcessingsForm />
      }
      case 'units': {
         return <UnitsForm />
      }
      case 'product-categories': {
         return <ProductCategories />
      }
      case 'ingredient-categories': {
         return <IngredientCategories />
      }
      case 'vegnonveg': {
         return <VegNonVeg />
      }
      case 'recipe': {
         return <Recipe />
      }
      default: {
         return <AccompanimentTypesForm />
      }
   }
}

export default MasterListForm
