export const getTreeViewArray = ({
   dataset,
   rootIdKeyName,
   parentIdKeyName
}) => {
   const hashTable = Object.create(null)
   dataset.forEach(
      aData =>
         (hashTable[aData[rootIdKeyName]] = {
            ...aData,
            childNodes: [],
            isChildOpen: false
         })
   )
   const dataTree = []
   dataset.forEach(aData => {
      if (aData[parentIdKeyName]) {
         hashTable[aData[parentIdKeyName]].isChildOpen = true
         hashTable[aData[parentIdKeyName]].childNodes.push(
            hashTable[aData[rootIdKeyName]]
         )
      } else {
         dataTree.push(hashTable[aData[rootIdKeyName]])
      }
   })
   return dataTree
}
