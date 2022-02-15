import classNames from 'classnames'
import { useConfig } from '../lib'
import { setThemeVariable } from '../utils'

export const Button = ({ children, style = {}, className, ...props }) => {
   const { configOf } = useConfig()
   const theme = configOf('theme-color', 'Visual')?.themeColor
   const themeColor = theme?.accent?.value
      ? theme?.accent?.value
      : 'rgba(5, 150, 105, 1)'
   /*TODO: Somer other button type could be added */
   setThemeVariable('--hern-accent', themeColor)
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': props.disabled,
      'hern__btn--outline--disabled':
         props.disabled && props.variant === 'outline',
      'hern__btn--warn': !props.disabled && props.variant === 'warn',
      'hern__btn--danger': !props.disabled && props.variant === 'danger',
      'hern__btn--dull': !props.disabled && props.variant === 'dull',
      'hern__btn--outline': !props.disabled && props.variant === 'outline',
      'hern__btn--ghost': !props.disabled && props.variant === 'ghost',
   })
   return (
      <button
         style={{ ...style }}
         className={`${buttonClasses} ${className ? className : ''}`}
         {...props}
      >
         {children}
      </button>
   )
}
