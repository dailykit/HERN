import classNames from 'classnames'
import { useConfig } from '../lib'
import { setThemeVariable } from '../utils'

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
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')
   const themeColor = theme?.accent ? theme?.accent : 'rgba(5, 150, 105, 1)'
   /*TODO: Somer other button type could be added */
   setThemeVariable('----hern-accent', themeColor)
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': disabled,
      'hern__btn--warn': !disabled && variant === 'warn',
      'hern__btn--danger': !disabled && variant === 'danger',
      'hern__btn--dull': !disabled && variant === 'dull',
      'hern__btn--outline': !disabled && type === 'outline',
   })
   return (
      <button
         onClick={onClick}
         style={style}
         className={`${buttonClasses} ${className ? className : ''}`}
         disabled={disabled}
         type={type}
      >
         {children}
      </button>
   )
}
