import React from 'react'
import { isEmpty } from 'lodash'

import { useConfig } from '.'
import { isClient } from '../utils'

export const ScriptProvider = ({ children }) => {
   const { configOf } = useConfig('App')

   React.useEffect(() => {
      const scripts = configOf('scripts')
      if (!isEmpty(scripts)) {
         const {
            startHead = [],
            endHead = [],
            startBody = [],
            endBody = [],
         } = scripts

         if (isClient) {
            // MOUNT IN STARTING OF HEAD
            if (!isEmpty(startHead)) {
               startHead.forEach(node => loadScript(node, 'start', 'head'))
            }
            // MOUNT AT THE END OF HEAD
            if (!isEmpty(endHead)) {
               endHead.forEach(node => loadScript(node, 'end', 'head'))
            }
            // MOUNT IN STARTING OF BODY
            if (!isEmpty(startBody)) {
               startBody.forEach(node => loadScript(node, 'start', 'body'))
            }
            // MOUNT AT THE END OF BODY
            if (!isEmpty(endBody)) {
               endBody.forEach(node => loadScript(node, 'end', 'body'))
            }
         }
      }
   }, [])
   return <>{children}</>
}

const loadScript = (node, position, parent) => {
   const { tag, type, code } = node
   const parentContainer = document.querySelector(parent)
   const fragment = document.createDocumentFragment()
   if (type === 'inline' && tag === 'script') {
      const script = document.createElement('script')
      script.innerHTML = code.replace('<script>', '').replace('</script>', '')
      fragment.appendChild(script)
   } else if (type === 'src' && tag === 'script') {
      const element = document.createElement('div')
      const script = document.createElement('script')

      element.innerHTML = code
      const node = element.childNodes[0]
      const attributes = [...node.attributes]
      attributes.forEach(attribute => {
         script[attribute.name] = attribute.value
      })

      fragment.appendChild(element)
   } else if (type === 'inline' && tag === 'noscript') {
      // TODO: handle noscript markup injection
   }

   if (position === 'start') {
      parentContainer.prepend(fragment)
   } else if (position === 'end') {
      parentContainer.append(fragment)
   }
}
