import React from 'react'

export default function CountArrayLength({
   cell: {
      _cell: { value },
   },
}) {
   return <>{value.length}</>
}
