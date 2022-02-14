import React from 'react'
import { LocationIcon } from '../assets/icons'
import { useConfig } from '../lib'

export const GoogleSuggestionsList = ({ suggestions, onSuggestionClick }) => {
   const { configOf } = useConfig()
   console.log('suggestions', suggestions)

   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   if (!suggestions) {
      return null
   }
   return (
      <div className="hern-google-autocomplete-suggestions-container">
         {suggestions.map(suggestion => (
            <div
               className="hern-google-autocomplete-suggestion"
               onClick={event => onSuggestionClick(suggestion)}
            >
               <div className="hern-google-autocomplete-location-icon">
                  <LocationIcon size={18} />
               </div>
               <div className="hern-google-autocomplete-text-container">
                  <span
                     className="hern-google-autocomplete-main-text"
                     style={{ color: themeColor }}
                  >
                     {suggestion.structured_formatting.main_text}
                  </span>
                  <span className="hern-google-autocomplete-secondary-text">
                     {suggestion.structured_formatting.secondary_text}
                  </span>
               </div>
            </div>
         ))}
      </div>
   )
}
