import React from 'react'
import { getPageProps, getSettings, processExternalFiles } from '../../../utils'
import { RECIPE_DETAILS } from '../../../graphql'
import { HelperBar, Layout, SEO, Recipe } from '../../../components'
import { graphQLClient } from '../../../lib'

const RecipePage = props => {
   const {
      folds,
      settings,
      navigationMenus,
      seoSettings,
      linkedFiles,
      productOption,
   } = props
   const recipe = productOption.simpleRecipeYield?.simpleRecipe

   React.useEffect(() => {
      try {
         processExternalFiles(folds, linkedFiles)
      } catch (err) {
         console.log('Failed to render page: ', err)
      }
   }, [])

   if (!recipe)
      return (
         <Layout navigationMenus={navigationMenus} settings={settings}>
            <SEO seoSettings={seoSettings} />
            <main className="hern-recipe">
               <HelperBar type="info">
                  <HelperBar.Title> No such recipe exists!</HelperBar.Title>
               </HelperBar>
            </main>
         </Layout>
      )
   return (
      <Layout navigationMenus={navigationMenus} settings={settings}>
         <SEO
            seoSettings={seoSettings}
            title={recipe.name}
            richresult={recipe.richResult}
         />
         <Recipe productOption={productOption} />
      </Layout>
   )
}

export default RecipePage

export async function getStaticProps({ params }) {
   const client = await graphQLClient()
   const data = await client.request(RECIPE_DETAILS, {
      optionId: parseInt(params.id),
   })
   const domain = 'test.dailykit.org'
   //brand settings
   const { seo, settings } = await getSettings(domain, `/recipes/${params.id}`)

   const { parsedData, navigationMenus, seoSettings, linkedFiles } =
      await getPageProps(params, '/recipe')

   return {
      props: {
         folds: parsedData,
         linkedFiles,
         navigationMenus,
         seoSettings,
         productOption: data.productOption,
         seo,
         settings,
      },
      // revalidate: 60, // will be passed to the page component as props
   }
}

export async function getStaticPaths() {
   return {
      paths: [],
      fallback: 'blocking', // true -> build page if missing, false -> serve 404
   }
}
