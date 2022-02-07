import classNames from 'classnames'

export const Text = props => {
   const textInputClasses = classNames('hern-form__text', {
      'hern-form__text--disabled': props.disabled || props.readOnly,
   })
   return <input className={textInputClasses} {...props} />
}
export const DisabledText = props => {
   return <input disabled className="hern-form__text--disabled" {...props} />
}

export const TextArea = props => {
   const { className } = props
   return (
      <textarea
         {...props}
         className={`hern-form__text-area ${className ? className : ''}`}
      >
         {props.children}
      </textarea>
   )
}
export const Label = props => {
   return (
      <label {...props} className="hern-form__label">
         {props.children}
      </label>
   )
}
export const Field = props => {
   const { mr, ml, w, className } = props
   return (
      <section
         {...props}
         style={{
            width: w ? w : '100%',
            margin: `0 ${mr ? mr : 0} 1rem ${ml ? ml : 0}`,
         }}
         className={`hern-form__field ${className ? className : ''}`}
      >
         {props.children}
      </section>
   )
}

export const Form = { Text, Label, Field, TextArea, DisabledText }
