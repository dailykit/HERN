import classNames from 'classnames'
import { useThemeStyle } from '../utils'

export const Button = ({
   children,
   disabled,
   bg,
   onClick,
   className,
   variant,
   type = 'button',
   style = {},
}) => {
   const themeColor = bg ? { background: bg } : useThemeStyle('backgroundColor')
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': disabled,
      'hern__btn--warn': !disabled && variant === 'warn',
      'hern__btn--danger': !disabled && variant === 'danger',
      'hern__btn--dull': !disabled && variant === 'dull',
   })
   return (
      <button
         onClick={onClick}
         style={{ ...themeColor, ...style }}
         className={`${buttonClasses} ${className ? className : ''}`}
         disabled={disabled}
         type={type}
      >
         {children}
      </button>
   )
}
