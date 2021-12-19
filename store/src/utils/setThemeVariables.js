export const setThemeVariable = (value, property) => {
   if (typeof window !== 'undefined') {
      const root = document.querySelector(':root')
      root.style.setProperty(value, property)
   }
}
