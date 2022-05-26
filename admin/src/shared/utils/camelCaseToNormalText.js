export const camelCaseToNormalText = camelCase => {
   return camelCase.replace(/([A-Z])/g, ' $1').replace(/^./, function (str) {
      return str.toUpperCase()
   })
}
