import classNames from 'classnames'

export const Button = ({ children, disabled, bg, onClick, className }) => {
   const buttonClasses = classNames('hern__btn', {
      'hern__btn--disabled': disabled,
   })
   return (
      <button
         onClick={onClick}
         style={{
            backgroundColor: bg ? bg : 'rgba(5, 150, 105, 1)',
         }}
         className={`${buttonClasses} ${className ? className : ''}`}
         disabled={disabled}
      >
         {children}
      </button>
   )
}
