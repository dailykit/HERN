import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSubscription, useMutation } from '@apollo/client'
import { Wrapper, CategoryTagWrap } from './styles'
import { ChevronRight } from '../Icons'
import Button from '../Button'
import InlineLoader from '../InlineLoader'
import { theme } from '../../theme'
import { useUser } from '../../Providers'
import {
   EXPERIENCE_TAGS,
   CUSTOMER_SELECTED_TAGS,
   UPSERT_CUSTOMER_TAGS
} from '../../graphql'

export default function CategoryTagPage({ onSubmit }) {
   const { state } = useUser()
   const { user = {} } = state
   const [selectedTags, setSelectedTags] = useState([])
   const [isValid, setIsValid] = useState(true)
   const {
      loading: isTagsLoading,
      error: tagsQueryError,
      data: { experiences_experienceTags: tags = [] } = {}
   } = useSubscription(EXPERIENCE_TAGS)
   const {
      loading: isSelectedTagsLoading,
      error: selectedTagsQueryError,
      data: { crm_customer_experienceTags: customerSelectedTags = [] } = {}
   } = useSubscription(CUSTOMER_SELECTED_TAGS, {
      skip: !user && !user.keycloakId,
      variables: {
         keycloakId: user?.keycloakId
      }
   })

   const [upsertCustomerTags, { loading }] = useMutation(UPSERT_CUSTOMER_TAGS, {
      onCompleted: () => {
         if (typeof onSubmit === 'function') {
            return onSubmit()
         }
         redirect()
      },
      onError: error => {
         console.log(error)
      }
   })

   const tagSelection = selectedTag => {
      const selectedIndex = selectedTags.findIndex(
         tag => tag.id === selectedTag.id
      )
      if (selectedIndex === -1) {
         setSelectedTags(prev => [...prev, selectedTag])
      } else {
         const updatedselectedTags = selectedTags
         updatedselectedTags.splice(selectedIndex, 1)
         setSelectedTags([...updatedselectedTags])
      }
   }

   const handleClick = () => {
      upsertCustomerTags({
         variables: {
            keycloakId: user?.keycloakId,
            tags: selectedTags
         }
      })
   }

   useEffect(() => {
      setIsValid(Boolean(selectedTags?.length === 0))
   }, [selectedTags])

   useEffect(() => {
      if (customerSelectedTags.length) {
         setSelectedTags(customerSelectedTags[0]?.tags)
      }
   }, [customerSelectedTags])

   if (isTagsLoading || isSelectedTagsLoading) {
      return <InlineLoader />
   }
   if (tagsQueryError || selectedTagsQueryError) {
      console.log(tagsQueryError || selectedTagsQueryError)
   }

   return (
      <Wrapper>
         {/* <div className="skip">
            <Link href="/">
               <a>
                  Skip{' '}
                  <ChevronRight size="14px" color={theme.colors.textColor} />{' '}
               </a>
            </Link>
         </div> */}
         <h1 className="heading text3">Tell us what you’re interested in.</h1>
         <div className="center-div-wrapper">
            <CategoryTagWrap>
               {tags.map(tag => {
                  return (
                     <Button
                        backgroundColor={
                           selectedTags.findIndex(
                              selectedTag => selectedTag.id === tag.id
                           ) !== -1
                              ? theme.colors.textColor
                              : theme.colors.textColor4
                        }
                        onClick={() => tagSelection(tag)}
                        key={tag?.id}
                        isMainShadow
                        className={
                           selectedTags.findIndex(
                              selectedTag => selectedTag.id === tag.id
                           ) !== -1
                              ? 'categoryTag text8 selectedCategoryTag'
                              : 'categoryTag text8 nonSelectedCategoryTag'
                        }
                     >
                        {tag?.title}
                     </Button>
                  )
               })}
            </CategoryTagWrap>
            <div className="submitBtnWrap">
               <Button
                  onClick={handleClick}
                  disabled={isValid || loading}
                  className="submitBtn text8"
               >
                  {loading ? 'Wait...' : 'Submit'}
               </Button>
            </div>
         </div>
      </Wrapper>
   )
}

const redirect = () => {
   const inviteUrl = localStorage.getItem('bookingInviteUrl')
   if (inviteUrl) {
      window.location.href = inviteUrl
   } else {
      window.location.href = `${window.location.origin}/dashboard`
   }
}
