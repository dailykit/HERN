import React from 'react'
import { useRouter } from 'next/router'
import { Wrapper } from './styles'
import Button from '../Button'
import { isEmpty } from '../../utils'

export default function AboutExpert({ expert, expertCategory }) {
   const router = useRouter()
   const [description, setDescription] = React.useState('')

   React.useEffect(() => {
      let truncatedString = expert?.description || ''
      if (!isEmpty(truncatedString) && truncatedString.length > 200) {
         truncatedString = truncatedString.substring(0, 120) + '...'
      }
      setDescription(truncatedString)
   }, [expert?.description])
   return (
      <Wrapper bg_mode="light">
         <div className="imageWrapper">
            <img
               className="expertImg"
               src={
                  expert?.assets?.images[0] ||
                  `https://ui-avatars.com/api/?name=${expert?.firstName}+${expert?.lastName}&background=fff&color=15171F&size=500&rounded=false`
               }
               alt={`${expert?.firstName} ${expert?.lastName}-img`}
            />
         </div>
         <div className="expertInfo">
            <h1 className="expertName text2">{`${expert?.firstName} ${expert?.lastName}`}</h1>

            <p className="expertDesc text7">{description}</p>
            <Button
               className="custom_btn text8"
               onClick={() => router.push(`/experts/${expert?.id}`)}
            >
               View Profile
            </Button>
         </div>
      </Wrapper>
   )
}
