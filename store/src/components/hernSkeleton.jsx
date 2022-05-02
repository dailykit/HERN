export const HernSkeleton = ({
   width = '20px',
   height = '20px',
   style = {},
}) => {
   const styles = {
      skeleton: {
         width: width,
         height: height,
         ...style,
      },
   }
   return <div className="hern__skeleton" style={styles.skeleton}></div>
}
