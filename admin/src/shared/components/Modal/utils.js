export const isObject = obj => {
   return Object.prototype.toString.call(obj) === '[object Object]'
}

export const toggleNode = (data, nodeToFind) => {
   return JSON.parse(
      JSON.stringify(data, function (key, node) {
         if (isObject(node) && node.id === nodeToFind) {
            return {
               ...node,
               isChildOpen: !node.isChildOpen,
            }
         }
         return node
      })
   )
}
