import classNames from 'classnames'
import { useThemeStyle } from '../utils'

export const Button = ({
   children,
   disabled,
   bg,
   onClick,
   className,
   variant,
}) => {
   const themeColor = useThemeStyle('backgroundColor')
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': disabled,
      'hern__btn--warn': !disabled && variant === 'warn',
      'hern__btn--danger': !disabled && variant === 'danger',
      'hern__btn--dull': !disabled && variant === 'dull',
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
