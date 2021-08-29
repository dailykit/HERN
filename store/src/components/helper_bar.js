export const HelperBar = ({ type = 'info', children }) => {
   return <div className={`hern-helper-bar--${type}`}>{children}</div>
}

const Button = ({ children, onClick }) => {
   return (
      <button onClick={onClick} className="hern-helper-bar__btn">
         {children}
      </button>
   )
}
const Title = ({ children }) => {
   return <h4 className="hern-helper-bar__title">{children}</h4>
}
const SubTitle = ({ children }) => {
   return <h5 className="hern-helper-bar__subtitle">{children}</h5>
}

HelperBar.Button = Button
HelperBar.Title = Title
HelperBar.SubTitle = SubTitle
