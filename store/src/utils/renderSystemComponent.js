import axios from 'axios'
import ReactHtmlParser, { convertNodeToElement } from 'react-html-parser'
import { renderComponentByName } from '../utils'
const renderComponent = (fold, options) => {
   try {
      if (fold.component) {
         return renderComponentByName(fold, options)
      } else if (fold.content) {
         // parser = new DOMParser()
         // doc = parser.parseFromString(fold.content, 'text/html')
         // let images = doc.firstChild.getElementsByTagName('img')

         // for (let i = 0; i < images.length; i++) {
         //    images[i].classList.add('lazyload')
         //    const scrValue = images[i].getAttribute('src')
         //    images[i].setAttribute('data-src', scrValue)
         // }
         // parser = new DOMParser()
         // doc = parser.parseFromString(fold.content, 'text/html')

         return ReactHtmlParser(fold.content, {
            transform: function (node, index) {
               if (node.type === 'tag' && node.name === 'img') {
                  node.attribs['data-src'] = node.attribs.src
                  delete node.attribs.src
                  node.attribs.class =
                     (node.attribs?.class || '') + ' ' + 'lazyload'
                  return undefined
               }
            },
         })
      } else {
         // const url = get_env('BASE_BRAND_URL') + `/template/hydrate-fold`
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
