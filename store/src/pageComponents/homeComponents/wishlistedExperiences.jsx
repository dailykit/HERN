import React, { useState, useEffect } from 'react'
import { useSubscription } from '@apollo/client'
import { Empty } from 'antd'
import Link from 'next/link'
import { useToasts } from 'react-toast-notifications'
import { Wrapper } from './styles'
import { useRouter } from 'next/router'
import { useExperienceInfo } from '../../Providers'
import { isEmpty } from '../../utils'
import { WISHLISTED_EXPERIENCES } from '../../graphql'
import { Masonry, Card } from '../../components'

export default function WishlistedExperience({ keycloakId }) {
   const router = useRouter()
   const breakpointColumnsObj = {
      default: 4,
      1100: 3,
      700: 2,
      500: 1
   }
   // subscription query for getting all wishlisted experiences of the user
   const {
      data: { experiences_experience: wishlistedExperience = [] } = {},
      loading: isLoadingWishlistedExperience,
      error: hasWishlistExperienceError
   } = useSubscription(WISHLISTED_EXPERIENCES, {
      variables: {
         where: {
            customer_savedEntities: {
               keycloakId: {
                  _eq: keycloakId
               },
               experienceId: {
                  _is_null: false
               }
            }
         },
         params: {
            keycloakId
         }
      }
   })

   if (hasWishlistExperienceError) {
      console.log(hasWishlistExperienceError)
      addToast('Something went wrong!', { appearance: 'error' })
   }
   return (
      <Wrapper>
         <div className="wrapper-div">
            <div className="recycler-heading-wrapper">
               <h3 className="recycler-heading text1">MY Wishlist</h3>
            </div>
            <div className="card-grid">
               {!isEmpty(wishlistedExperience) ? (
                  wishlistedExperience.map(experience => {
                     return (
                        <Card
                           onClick={() =>
                              router.push(`/experiences/${experience?.id}`)
                           }
                           boxShadow={false}
                           key={`${experience?.title}-${experience?.id}`}
                           type="experience"
                           data={{ experience }}
                           backgroundMode="light"
                           customWidth=""
                        />
                     )
                  })
               ) : (
                  <Empty />
               )}
            </div>
         </div>
      </Wrapper>
   )
}
