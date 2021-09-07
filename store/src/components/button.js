import classNames from 'classnames'
import { useThemeStyle } from '../utils'

export const Button = ({ children, disabled, bg, onClick, className }) => {
   const themeColor = useThemeStyle('backgroundColor')
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': disabled,
   })
   return (
      <button
         onClick={onClick}
         style={themeColor}
         className={`${buttonClasses} ${className ? className : ''}`}
         disabled={disabled}
      >
         {children}
      </button>
   )
}
