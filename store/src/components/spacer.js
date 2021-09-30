export const Spacer = ({ size = 'base', xAxis = false }) => {
   return xAxis ? (
      <span className={`hern-spacer__x-axis--${size}`} />
   ) : (
      <div className={`hern-spacer--${size}`} />
   )
}
