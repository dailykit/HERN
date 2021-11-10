import React from 'react'
import { useRouter } from 'next/router'
import parse from 'html-react-parser'
import { Wrapper } from './styles'
import ReadMoreDiv from '../ReadMoreDiv'
import Button from '../Button'
import Image from 'next/image'

export default function AboutExpert({ expert, expertCategory }) {
   const router = useRouter()
   const truncate = str => {
      return str.length > 200 ? str.substring(0, 120) + '...' : str
   }
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

            <p className="expertDesc text7">
               {parse(expert?.description || '', {
                  replace: domNode => {
                     return <p>{truncate(domNode?.firstChild?.data)}</p>
                  }
               })}
            </p>
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
