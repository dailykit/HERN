function flatten(items) {
   const flat = []

   items.forEach(item => {
      if (item.type === 'folder') {
         flat.push(...flatten(item.children))
      } else {
         flat.push(item.path)
      }
   })

   return flat
}

module.exports = flatten
