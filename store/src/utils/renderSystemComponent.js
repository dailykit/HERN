import ReactHtmlParser from 'react-html-parser'
import { renderComponentByName } from '../utils'
import axios from 'axios'
const renderComponent = (fold, options) => {
   try {
      if (fold.component) {
         return renderComponentByName(fold, options)
      } else if (fold.content) {
         return ReactHtmlParser(fold.content)
      } else {
         // const url = get_env('EXPRESS_URL') + `/template/hydrate-fold`
         const url = 'http://localhost:4000' + `/template/hydrate-fold`
         axios
            .post(url, {
               id: fold.id,
               brandId: settings['brand']['id'],
            })
            .then(response => {
               const { data } = response
               if (data.success) {
                  const targetDiv = document.querySelector(
                     `[data-fold-id=${fold.id}]`
                  )
                  targetDiv.innerHTML = data.data
               } else {
                  console.error(data.message)
               }
            })
         return 'Loading...'
         // make request to template service
      }
   } catch (err) {
      console.log(err)
   }
}

export const renderPageContent = (folds, options) => {
   return folds.map(fold => (
      <div
         key={fold.id}
         data-fold-id={fold.id}
         data-fold-position={fold.position}
         data-fold-type={fold.moduleType}

      >
         {renderComponent(fold, options)}
      </div>
   ))
}
