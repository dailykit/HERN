import { useConfig } from '../lib'

export const useThemeStyle = (
   property,
   fallbackValue = 'rgba(5, 150, 105, 1)'
) => {
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')

   const getValue = property => {
      switch (property) {
         case 'color':
            return theme?.accent ? theme.accent : fallbackValue
         case 'backgroundColor':
            return theme?.accent ? theme.accent : fallbackValue
         default:
            return theme?.accent ? theme.accent : fallbackValue
      }
   }

   return {
      [property]: getValue(property),
   }
}
