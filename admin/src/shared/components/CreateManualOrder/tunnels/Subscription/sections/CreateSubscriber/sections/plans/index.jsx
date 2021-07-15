import React from 'react'
import { toast } from 'react-toastify'
import styled from 'styled-components'
import { useQuery } from '@apollo/react-hooks'
import { Dropdown, Text, Filler, Spacer } from '@dailykit/ui'

import { useSub } from '../../state'
import { QUERIES } from '../../../../../../graphql'
import { useManual } from '../../../../../../state'
import { InlineLoader } from '../../../../../../..'
import { logger } from '../../../../../../../../utils'
import EmptyIllo from '../../../../../../../../../apps/carts/assets/svgs/EmptyIllo'

export const SelectPlan = () => {
   const { brand, customer } = useManual()
   const { plan, serving, itemCount, dispatch } = useSub()
   const [plans, setPlans] = React.useState([])
   const [isPlansEmpty, setIsPlansEmpty] = React.useState(false)
   const [isPlansLoading, setIsPlansLoading] = React.useState(true)
   const [hasPlansError, setHasPlansError] = React.useState(false)
   useQuery(QUERIES.SUBSCRIPTION.PLANS, {
      variables: {
         isDemo: customer?.isDemo,
         where: {
            isActive: { _eq: true },
            isDemo: { _eq: customer?.isDemo },
            brands: { brandId: { _eq: brand.id }, isActive: { _eq: true } },
         },
      },
      onCompleted: ({ plans = [] } = {}) => {
         if (plans.length === 0) {
            setIsPlansLoading(false)
            setIsPlansEmpty(true)
            setHasPlansError(false)
            return
         }
         const _plans = plans
            .map(plan => ({
               ...plan,
               servings: plan.servings
                  .filter(serving => serving.itemCounts.length > 0)
                  .map(serving => ({
                     title: `${serving.size} serving${
                        serving.size > 1 ? 's' : ''
                     }`,
                     ...serving,
                     itemCounts: serving.itemCounts.map(node => ({
                        title: `${node.count} count${
                           node.count > 1 ? 's' : ''
                        }`,
                        ...node,
                     })),
                  })),
            }))
            .filter(plan => plan.servings.length > 0)

         if (_plans.length === 0) {
            setIsPlansLoading(false)
            setIsPlansEmpty(true)
            setHasPlansError(false)
            return
         }
         setPlans(_plans)
         setIsPlansLoading(false)
         setHasPlansError(false)
      },
      onError: error => {
         logger(error)
         toast.error('Failed to fetch plans, please try again!')
         setIsPlansLoading(false)
         setIsPlansEmpty(false)
         setHasPlansError(true)
      },
   })
   if (isPlansLoading) return <InlineLoader />
   if (hasPlansError)
      return (
         <Filler
            message="Failed to fetch plans, please try again!"
            illustration={<EmptyIllo />}
         />
      )
   if (isPlansEmpty)
      return (
         <Filler
            message="There are currently no plans available."
            illustration={<EmptyIllo />}
         />
      )
   return (
      <>
         <Styles.PlanFields>
            <li>
               <Text as="text1">Select Plan</Text>
               <Spacer size="8px" />
               <Dropdown
                  type="single"
                  variant="revamp"
                  options={plans}
                  defaultOption={plan.selected}
                  searchedOption={() => {}}
                  placeholder="search plans..."
                  selectedOption={option =>
                     dispatch({ type: 'SET_PLAN', payload: option })
                  }
               />
            </li>
            <li>
               <Text as="text1">Select Serving</Text>
               <Spacer size="8px" />
               <Dropdown
                  type="single"
                  variant="revamp"
                  searchedOption={() => {}}
                  placeholder="search serving..."
                  defaultOption={serving.selected}
                  disabled={!Boolean(plan.selected)}
                  options={plan.selected?.servings || []}
                  selectedOption={option =>
                     dispatch({ type: 'SET_SERVING', payload: option })
                  }
               />
            </li>
            <li>
               <Text as="text1">Select Item Count</Text>
               <Spacer size="8px" />
               <Dropdown
                  type="single"
                  variant="revamp"
                  searchedOption={() => {}}
                  defaultOption={itemCount.selected}
                  placeholder="search item count..."
                  disabled={!Boolean(serving.selected)}
                  options={serving.selected?.itemCounts || []}
                  selectedOption={option =>
                     dispatch({ type: 'SET_ITEM_COUNT', payload: option })
                  }
               />
            </li>
         </Styles.PlanFields>
      </>
   )
}
const Styles = {
   PlanFields: styled.ul`
      display: flex;
      align-items: center;
      :nth-of-type(2) {
         margin: 0 14px;
      }
      li {
         flex: 1;
         list-style: none;
      }
   `,
}
