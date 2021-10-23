import React from 'react'
import { useRouter } from 'next/router'
import parse from 'html-react-parser'
import { Wrapper } from './styles'
import ReadMoreDiv from '../ReadMoreDiv'
import Button from '../Button'
import Image from 'next/image'

export default function AboutExpert({ expert, expertCategory }) {
   const router = useRouter()
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
            {/* <p className="expertCategory text7">{expertCategory || 'N/A'}</p>
            <p className="expertExp">
               {expert?.experience_experts_aggregate?.aggregate?.count || 0}{' '}
               Experiences
            </p> */}
            <ReadMoreDiv>
               <p className="expertDesc text7">
                  {parse(expert?.description || '')}
               </p>
            </ReadMoreDiv>
            <Button
               className="custom_btn text7"
               onClick={() => router.push(`/experts/${expert?.id}`)}
            >
               View Profile
            </Button>
         </div>
      </Wrapper>
   )
}
