import { useSubscription } from '@apollo/react-hooks'
import {
   Flex,
   Spacer,
   Text,
   Dropdown,
   ButtonGroup,
   TextButton,
   RadioGroup,
} from '@dailykit/ui'

import moment from 'moment'
import React, { useEffect, useContext } from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'
import { logger } from '../../utils'
import { ErrorState } from '../ErrorState'
import { InlineLoader } from '../InlineLoader'
import { BrandShopDateContext, BrandShopDateProvider } from './context'
import { BRANDS, LOCATIONS } from './graphql/subscription'
import { DatePicker, Space } from 'antd'
import { BrandContext } from '../../../App'

const { RangePicker } = DatePicker

//from -> initial START date of date range picker (default today)
//to -> initial END date of date range picker (default tomorrow)
//brandProvider -> props for get brand dropdown
//shopType -> props for get shop type dropdown
//datePickerProvider -> props for get date picker
// groupTimerProvider -> props from get group by button (hour,day, week, month)
//compareProvider -> props to enable compare option

//BrandShopDate component provide shopType, brands, dateRangePicker, compare & group by options
const BrandShopDate = ({
   children,
   from,
   to,
   shopTypeProvider,
   brandProvider,
   groupTimeProvider,
   datePickerProvider,
   compareProvider,
   locationProvider,
}) => {
   return (
      <BrandShopDateProvider>
         <BrandShopDateChild
            from={from}
            to={to}
            shopTypeProvider={shopTypeProvider}
            brandProvider={brandProvider}
            groupTimeProvider={groupTimeProvider}
            datePickerProvider={datePickerProvider}
            compareProvider={compareProvider}
            locationProvider={locationProvider}
         >
            {children}
         </BrandShopDateChild>
      </BrandShopDateProvider>
   )
}

const BrandShopDateChild = ({
   children,
   from,
   to,
   shopTypeProvider,
   brandProvider,
   groupTimeProvider,
   datePickerProvider,
   compareProvider,
   locationProvider,
}) => {
   const [status, setStatus] = useState({
      loading: true,
   })
   const [brands, setBrands] = useState([])
   const { brandShopDateDispatch } = React.useContext(BrandShopDateContext)

   //subscription get all brands
   const { loading: brandLoading, error: brandError } = useSubscription(
      BRANDS,
      {
         skip: !Boolean(brandProvider),
         onSubscriptionData: ({ subscriptionData }) => {
            const brandData = [
               { title: 'All', brandId: false },
               ...subscriptionData.data.brands,
            ]
            const newBrandData = brandData.map((brand, index) => ({
               ...brand,
               id: index + 1,
            }))
            setBrands(newBrandData)
         },
      }
   )

   useEffect(() => {
      if (from) {
         brandShopDateDispatch({
            type: 'FROM',
            payload: from,
         })
      }
      if (to) {
         brandShopDateDispatch({
            type: 'TO',
            payload: to,
         })
      }
      setStatus({ ...status, loading: false })
   }, [])

   if (brandLoading || (status.loading && !brandError)) {
      return <InlineLoader />
   }
   if (brandError) {
      logger(brandError)
      toast.error('Could not get the Insight data')
      return (
         <ErrorState height="320px" message="Could not get the Insight data" />
      )
   }
   return (
      <>
         <Flex padding="0px 42px 0px 42px">
            <BrandAndShop
               brands={brands}
               shopTypeProvider={shopTypeProvider}
               brandProvider={brandProvider}
               locationProvider={locationProvider}
            />
            <Spacer size="10px" />
            {datePickerProvider && (
               <DateRangePicker
                  compareProvider={compareProvider}
                  groupTimeProvider={groupTimeProvider}
               />
            )}
            {children}
         </Flex>
      </>
   )
}

//brand and shop provider
const BrandAndShop = ({
   brands,
   shopTypeProvider,
   brandProvider,
   locationProvider,
}) => {
   const { brandShopDateDispatch } = React.useContext(BrandShopDateContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)

   const brandFromBrandContext = [
      { id: 1, brandId: brandContext.brandId, title: brandContext.brandName },
   ]
   const [shopSource] = useState([
      {
         id: 1,
         title: 'All',
         payload: false,
      },
      {
         id: 2,
         title: 'Subscription',
         payload: 'subscription',
      },
      {
         id: 3,
         title: 'A-la-Carte',
         payload: 'a-la-carte',
      },
   ])
   const selectedOptionShop = option => {
      brandShopDateDispatch({
         type: 'BRANDSHOP',
         payload: {
            shopTitle: option.payload,
         },
      })
   }
   const selectedOptionBrand = option => {
      brandShopDateDispatch({
         type: 'BRANDSHOP',
         payload: {
            brandId: option.brandId,
         },
      })
   }
   const searchedOption = option => console.log(option)
   return (
      <Flex
         container
         flexDirection="row"
         width="40rem"
         alignItems="center"
         padding="0px 10px"
      >
         {shopTypeProvider && (
            <>
               <Flex container flexDirection="column" width="30rem">
                  <Text as="text1">Shop Type:</Text>
                  <Spacer size="3px" />
                  <Dropdown
                     type="single"
                     defaultValue={1}
                     options={shopSource}
                     searchedOption={searchedOption}
                     selectedOption={selectedOptionShop}
                     typeName="Shop"
                  />
               </Flex>
               <Spacer size="20px" xAxis />
            </>
         )}
         {brandProvider && (
            <>
               {brandContext.brandId == null ? (
                  <Flex container flexDirection="column" width="30rem">
                     <Text as="text1">Brand:</Text>
                     <Spacer size="3px" />
                     <Dropdown
                        type="single"
                        options={brands}
                        defaultValue={1}
                        searchedOption={searchedOption}
                        selectedOption={selectedOptionBrand}
                        typeName="Brand"
                     />
                  </Flex>
               ) : (
                  <Flex container flexDirection="column" width="30rem">
                     <Text as="text1">Brand:</Text>
                     <Spacer size="3px" />
                     <Dropdown
                        type="single"
                        options={brandFromBrandContext}
                        // defaultValue={1}
                        defaultOption={{
                           id: brandFromBrandContext[0].brandId,
                        }}
                        searchedOption={searchedOption}
                        selectedOption={selectedOptionBrand}
                        typeName="Brand"
                     />
                  </Flex>
               )}
            </>
         )}
         {locationProvider && <LocationSelector />}
      </Flex>
   )
}

const LocationSelector = () => {
   const [locationsList, setLocationsList] = useState([])
   const { brandShopDateDispatch } = React.useContext(BrandShopDateContext)
   const [brandContext, setBrandContext] = useContext(BrandContext)
   const locationFromBrandContext = [
      {
         id: 1,
         locationId: brandContext.locationId,
         title: brandContext.locationLabel,
      },
   ]

   const { loading: locationsLoading, error: locationsError } = useSubscription(
      LOCATIONS,
      {
         onSubscriptionData: ({ subscriptionData }) => {
            const locations = subscriptionData.data.brands_location
            console.log('locations, ', locations, subscriptionData)
            setLocationsList(
               [{ title: 'All', locationId: null }, ...locations].map(
                  (eachLocation, index) => {
                     return { id: index + 1, ...eachLocation }
                  }
               )
            )
         },
      }
   )
   const selectedOptionBrand = option => {
      brandShopDateDispatch({
         type: 'BRANDSHOP',
         payload: {
            locationId: option.locationId,
         },
      })
   }
   const searchedOption = option => console.log(option)
   if (locationsLoading || (locationsLoading && !locationsError)) {
      return <InlineLoader />
   }
   if (locationsError) {
      logger(locationsError)
      toast.error('Could not get the locations')
      return <p>Could not get the locations</p>
   }
   // console.log('locationsList', locationsList)
   return (
      <>
         {brandContext.locationLabel.includes('All') ? (
            <Flex container flexDirection="column" width="30rem">
               <Text as="text1">Location:</Text>
               <Spacer size="3px" />
               <Dropdown
                  type="single"
                  options={locationsList}
                  defaultValue={1}
                  searchedOption={searchedOption}
                  selectedOption={selectedOptionBrand}
                  typeName="Location"
               />
            </Flex>
         ) : (
            <Flex container flexDirection="column" width="30rem">
               <Text as="text1">Location:</Text>
               <Spacer size="3px" />
               <Dropdown
                  type="single"
                  options={locationFromBrandContext}
                  // defaultValue={1}
                  defaultOption={{
                     id: locationFromBrandContext[0].locationId,
                  }}
                  searchedOption={searchedOption}
                  selectedOption={selectedOptionBrand}
                  typeName="Location"
               />
            </Flex>
         )}
      </>
   )
}

//date range picker with grouped time option
const DateRangePicker = ({ compareProvider, groupTimeProvider }) => {
   const [compareOptions, setCompareOptions] = useState(undefined)
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const from = brandShopDateState.from
   const to = brandShopDateState.to
   console.table(brandShopDateState)
   useEffect(() => {
      handleCompareClick()
   }, [brandShopDateState.from, brandShopDateState.to])

   //handle date change in datePicker
   const onChange = (dates, dateStrings) => {
      if (dates) {
         brandShopDateDispatch({ type: 'FROM', payload: dateStrings[0] })
         brandShopDateDispatch({ type: 'TO', payload: dateStrings[1] })
      } else {
         brandShopDateDispatch({
            type: 'FROM',
            payload: moment().format('YYYY-MM-DD'),
         })
         brandShopDateDispatch({
            type: 'TO',
            payload: moment().add(1, 'd').format('YYYY-MM-DD'),
         })
      }
   }

   const handleCompareClick = () => {
      // this function will manage compare dropdown options according to date range
      /*
       option would be Last period, Last Week, Last Month, Last Year
       */
      const dateDifference = moment(to).diff(from, 'days')

      const toBeDropdownOptions = [
         {
            id: 1,
            title: 'Last Period',
            description: `${moment(from)
               .subtract(moment(to).diff(from, 'days') + 1, 'day')
               .format('ll')} to ${moment(from)
               .subtract(1, 'day')
               .format('ll')}`,
            payload: {
               from: moment(from)
                  .subtract(moment(to).diff(from, 'days') + 1, 'day')
                  .format('YYYY-MM-DD'),
               to: moment(from).subtract(1, 'day').format('YYYY-MM-DD'),
            },
         },
      ]

      if (dateDifference <= 7) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Week',
            description: `${moment(from)
               .subtract(1, 'week')
               .format('ll')} to ${moment(to)
               .subtract(1, 'week')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'week').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'week').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      if (dateDifference <= 30) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Month',
            description: `${moment(from)
               .subtract(1, 'month')
               .format('ll')} to ${moment(to)
               .subtract(1, 'month')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'month').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'month').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      if (dateDifference < 365) {
         const newOption = {
            id: toBeDropdownOptions.length + 1,
            title: 'Last Year',
            description: `${moment(from)
               .subtract(1, 'year')
               .format('ll')} to ${moment(to)
               .subtract(1, 'year')
               .format('ll')}`,
            payload: {
               from: moment(from).subtract(1, 'year').format('YYYY-MM-DD'),
               to: moment(to).subtract(1, 'year').format('YYYY-MM-DD'),
            },
         }
         toBeDropdownOptions.push(newOption)
      }
      setCompareOptions(toBeDropdownOptions)
   }

   const selectedOption = option => {
      brandShopDateDispatch({
         type: 'COMPARE',
         payload: {
            isSkip: false,
            from: option.payload.from,
            to: option.payload.to,
         },
      })
   }
   const searchedOption = option => console.log(option)
   return (
      <>
         <Flex
            container
            justifyContent="space-between"
            alignItems="center"
            padding="0px 10px"
         >
            <Flex container alignItems="center">
               <Space direction="vertical" size={12}>
                  <RangePicker
                     allowClear={false}
                     defaultValue={[
                        moment(from, 'YYYY-MM-DD'),
                        moment(to, 'YYYY-MM-DD'),
                     ]}
                     ranges={{
                        Today: [moment(), moment()],
                        'This Week': [moment().startOf('week'), moment()],
                        'Last Week': [
                           moment().subtract(1, 'week').startOf('week'),
                           moment().subtract(1, 'week').endOf('week'),
                        ],
                        'This Month': [
                           moment().startOf('month'),
                           moment().endOf('month'),
                        ],
                        'Last Month': [
                           moment().subtract(1, 'month').startOf('month'),
                           moment().subtract(1, 'month').endOf('month'),
                        ],
                        'This Year': [moment().startOf('year'), moment()],
                        'Last Year': [
                           moment().subtract(1, 'year').startOf('year'),
                           moment().subtract(1, 'year').endOf('year'),
                        ],
                        'All Time': [moment('2017-01-01'), moment()],
                     }}
                     onChange={onChange}
                  />
               </Space>
               <Spacer xAxis size="10px" />
               {compareProvider && !brandShopDateState.compare.isCompare && (
                  <ButtonGroup align="left">
                     <TextButton
                        type="ghost"
                        size="sm"
                        onClick={() => {
                           brandShopDateDispatch({
                              type: 'COMPARE',
                              payload: {
                                 isCompare: true,
                              },
                           })

                           handleCompareClick()
                        }}
                     >
                        Compare
                     </TextButton>
                  </ButtonGroup>
               )}
               {brandShopDateState.compare.isCompare && (
                  <>
                     {compareOptions && (
                        <Flex container width="14rem">
                           <Dropdown
                              type="single"
                              options={compareOptions}
                              searchedOption={searchedOption}
                              selectedOption={selectedOption}
                              typeName="compare range"
                           />
                        </Flex>
                     )}
                     <ButtonGroup align="left">
                        <TextButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              brandShopDateDispatch({
                                 type: 'COMPARE',
                                 payload: {
                                    isCompare: false,
                                    isSkip: true,
                                 },
                              })
                           }}
                        >
                           Close
                        </TextButton>
                     </ButtonGroup>
                  </>
               )}
            </Flex>
            {groupTimeProvider && (
               <Flex>
                  <GroupByButtons />
               </Flex>
            )}
         </Flex>
      </>
   )
}

// group by time buttons
const GroupByButtons = () => {
   const [options, setOptions] = React.useState(null)
   const { brandShopDateState, brandShopDateDispatch } =
      React.useContext(BrandShopDateContext)
   const from = brandShopDateState.from
   const to = brandShopDateState.to
   const groupByDispatcher = groupArr => {
      brandShopDateDispatch({ type: 'GROUPBY', payload: groupArr })
   }
   const buttonMagic = () => {
      if (moment(to).diff(from, 'days') <= 7) {
         groupByDispatcher(['year', 'month', 'week', 'day', 'hour'])
         return setOptions([
            {
               id: 1,
               title: 'Hour',
            },
            {
               id: 2,
               title: 'Day',
            },
         ])
      } else if (
         moment(to).diff(from, 'days') > 7 &&
         moment(to).diff(from, 'days') <= 28
      ) {
         groupByDispatcher(['year', 'month', 'week', 'day'])
         return setOptions([
            {
               id: 1,
               title: 'Day',
            },
            {
               id: 2,
               title: 'Week',
            },
         ])
      } else if (
         moment(to).diff(from, 'days') > 28 &&
         moment(to).diff(from, 'days') <= 365
      ) {
         groupByDispatcher(['year', 'month', 'week'])
         return setOptions([
            {
               id: 1,
               title: 'Week',
            },
            {
               id: 2,
               title: 'Month',
            },
         ])
      } else {
         groupByDispatcher(['year', 'month'])
         return setOptions([
            {
               id: 1,
               title: 'Week',
            },
            {
               id: 2,
               title: 'Month',
            },
         ])
      }
   }
   useEffect(() => {
      buttonMagic()
   }, [from, to])
   const handleOnChangeRadio = option => {
      if (option == null) {
         groupByDispatcher(options.map(x => x.title))
      } else {
         if (option.title == 'Hour') {
            groupByDispatcher(['year', 'month', 'week', 'day', 'hour'])
         } else if (option.title == 'Day') {
            groupByDispatcher(['year', 'month', 'week', 'day'])
         } else if (option.title == 'Week') {
            groupByDispatcher(['year', 'month', 'week'])
         } else {
            groupByDispatcher(['year', 'month'])
         }
      }
   }
   if (options == null) {
      return <InlineLoader />
   }
   return (
      <>
         <RadioGroup
            options={options}
            active={1}
            onChange={option => handleOnChangeRadio(option)}
         />
      </>
   )
}

export default BrandShopDate
