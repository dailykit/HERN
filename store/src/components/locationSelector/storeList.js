import React from 'react'

// render all available stores
export const StoreList = props => {
   const {
      setShowLocationSelectionPopup,
      settings,
      storeDistanceValidation = false,
      fulfillmentType,
      address,
      setShowRefineLocation,
      showRefineLocation = false,
   } = props
   // console.log('settings', settings)
   const { dispatch } = useConfig()
   const { addToast } = useToasts()

   const {
      showAerialDistance,
      showStoreAddress,
      showLocationLabel,
      cardSelectionStyle,
      selectionButtonLabel,
   } = LocationSelectorConfig.informationVisibility.deliveryLocationCard
   const { showStoresOnMap, disabledLocationDisplayStyle } =
      LocationSelectorConfig.informationVisibility.deliverySettings

   const [brandLocation, setBrandLocation] = useState(null)
   const [sortedBrandLocation, setSortedBrandLocation] = useState(null)
   const [selectedStore, setSelectedStore] = useState(null)
   const [showStoreOnMap, setShowStoreOnMap] = useState(false)
   const [status, setStatus] = useState('loading')

   // get distance
   const getDataWithDrivableDistance = async brandLocation => {
      try {
         const origin = isClient ? window.location.origin : ''
         const url = `${origin}/server/api/distance-matrix`
         const userLocationInLocal = JSON.parse(
            localStorage.getItem('userLocation')
         )
         brandLocation.forEach(async (eachLocation, index) => {
            const postLocationData = {
               key: get_env('GOOGLE_API_KEY'),
               lat1: userLocationInLocal.latitude,
               lon1: userLocationInLocal.longitude,
               lat2: eachLocation.location.locationAddress.locationCoordinates
                  .latitude,
               lon2: eachLocation.location.locationAddress.locationCoordinates
                  .longitude,
            }
            const data = await getDrivableData(postLocationData, url)
            const mapData = data.map(x => {
               x['distance'] = x.rows[0].elements[0].distance
               x['duration'] = x.rows[0].elements[0].duration
               return x
            })
            setBrandLocation(prev => {
               prev[index] = {
                  ...prev[index],
                  drivableDistanceDetails: mapData,
               }
               return prev
            })
         })
      } catch (error) {
         console.log('getDataWithDrivableDistance', error)
      }
   }

   if (!address) {
      return (
         <div className="hern-location-selector__stores-list">
            {brandLocation && brandLocation.length > 1 ? (
               <>
                  {showStoresOnMap.value && (
                     <div className="hern-location-selector__view-on-map">
                        <span onClick={() => setShowStoreOnMap(true)}>
                           View on map
                        </span>
                     </div>
                  )}
                  {brandLocation &&
                     brandLocation.map((eachStore, index) => {
                        const {
                           location: {
                              label,
                              id,
                              locationAddress,
                              city,
                              state,
                              country,
                              zipcode,
                           },
                        } = eachStore
                        const { line1, line2 } = locationAddress

                        return (
                           <div
                              key={index}
                              className={classNames(
                                 'hern-store-location-selector__each-store'
                              )}
                              onClick={() => {
                                 addToast('Please Enter Address', {
                                    appearance: 'info',
                                 })
                              }}
                           >
                              <div className="hern-store-location-selector__store-location-info-container">
                                 <StoreIcon />
                                 <div className="hern-store-location-selector__store-location-details">
                                    {showLocationLabel.value && (
                                       <span className="hern-store-location__store-location-label">
                                          {label}
                                       </span>
                                    )}
                                    {showStoreAddress.value && (
                                       <>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                                             {line1}
                                          </span>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                                             {line2}
                                          </span>
                                          <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                                             {city} {state} {country}
                                             {' ('}
                                             {zipcode}
                                             {')'}
                                          </span>
                                       </>
                                    )}
                                 </div>
                              </div>
                           </div>
                        )
                     })}
               </>
            ) : null}

            {/* <StoresOnMap
                showStoreOnMap={showStoreOnMap}
                setShowStoreOnMap={setShowStoreOnMap}
                brandLocation={brandLocation}
                settings={settings}
             /> */}
         </div>
      )
   }

   // auto select mode
   if (
      LocationSelectorConfig.informationVisibility.deliverySettings
         .storeLocationSelectionMethod.value.value === 'auto'
   ) {
      return null
   }

   // when no store available on user location
   if (sortedBrandLocation.length === 0) {
      return <p>No Store Available</p>
   }
   console.log('sortedBrandLocation', sortedBrandLocation)
   // when there is no stores which do not fulfill delivery time and mile range for brandRecurrences
   if (!sortedBrandLocation.some(store => store[fulfillmentStatus].status)) {
      return (
         <div className="hern-location-selector__stores-list">
            {sortedBrandLocation[0][fulfillmentStatus].message}
         </div>
      )
   }

   // when there is no stores which do not fulfill timing but does not fulfill delivery conditions (aerial distance, zipcodes, geoboundry)
   if (
      storeDistanceValidation &&
      !sortedBrandLocation.some(store => {
         const sortedStatus = store[fulfillmentStatus].result
         if (sortedStatus) {
            return store[fulfillmentStatus].status
         }
         return false
      })
   ) {
      return (
         <div className="hern-location-selector__stores-list">
            NO store Available on this location
         </div>
      )
   }

   // some store fulfill all conditions (not all store )
   return (
      <div className="hern-location-selector__stores-list">
         {showStoresOnMap.value && (
            <div className="hern-location-selector__view-on-map">
               <span onClick={() => setShowStoreOnMap(true)}>View on map</span>
            </div>
         )}
         <RefineLocationPopup
            showRefineLocation={showRefineLocation}
            address={address}
            fulfillmentType={fulfillmentType}
         />
         {sortedBrandLocation.map((eachStore, index) => {
            const {
               location: {
                  label,
                  id,
                  locationAddress,
                  city,
                  state,
                  country,
                  zipcode,
               },
               aerialDistance,
               distanceUnit,
            } = eachStore
            const { line1, line2 } = locationAddress
            if (
               !eachStore[fulfillmentStatus].status &&
               disabledLocationDisplayStyle.value?.value === 'noShow'
            ) {
               return null
            }
            return (
               <div
                  key={index}
                  className={classNames(
                     'hern-store-location-selector__each-store',
                     {
                        'hern-store-location-selector__each-store--border':
                           cardSelectionStyle.value?.value === 'border' &&
                           selectedStore &&
                           id === selectedStore.id,
                     },
                     {
                        'hern-store-location-selector__each-store--disabled':
                           disabledLocationDisplayStyle.value?.value ===
                              'disabled' &&
                           !eachStore[fulfillmentStatus].status,
                     }
                  )}
                  onClick={() => {
                     if (eachStore[fulfillmentStatus].status) {
                        console.log('selectedStore', eachStore)
                        dispatch({
                           type: 'SET_LOCATION_ID',
                           payload: eachStore.location.id,
                        })
                        dispatch({
                           type: 'SET_SELECTED_ORDER_TAB',
                           payload: selectedOrderTab,
                        })
                        localStorage.setItem(
                           'orderTab',
                           JSON.stringify(fulfillmentType)
                        )
                        localStorage.setItem(
                           'storeLocationId',
                           JSON.stringify(eachStore.location.id)
                        )
                        dispatch({
                           type: 'SET_USER_LOCATION',
                           payload: address,
                        })
                        dispatch({
                           type: 'SET_STORE_STATUS',
                           payload: {
                              status: true,
                              message: 'Store available on your location.',
                              loading: false,
                           },
                        })
                        setSelectedStore(eachStore)
                        setShowLocationSelectionPopup(false)
                     }
                  }}
               >
                  <div className="hern-store-location-selector__store-location-info-container">
                     <StoreIcon />
                     <div className="hern-store-location-selector__store-location-details">
                        {showLocationLabel.value && (
                           <span className="hern-store-location__store-location-label">
                              {label}
                           </span>
                        )}
                        {showStoreAddress.value && (
                           <>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line1">
                                 {line1}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-line2">
                                 {line2}
                              </span>
                              <span className="hern-store-location__store-location-address hern-store-location__store-location-address-c-s-c-z">
                                 {city} {state} {country}
                                 {' ('}
                                 {zipcode}
                                 {')'}
                              </span>
                           </>
                        )}
                     </div>
                  </div>
                  {cardSelectionStyle.value?.value === 'radio' &&
                     (storeDistanceValidation
                        ? !(
                             disabledLocationDisplayStyle.value?.value ===
                                'disabled' &&
                             !eachStore[fulfillmentStatus].status
                          )
                        : true) && (
                        <RadioIcon
                           size={18}
                           showTick={selectedStore && id === selectedStore.id}
                        />
                     )}
                  <div className="hern-store-location-selector__time-distance">
                     {showAerialDistance.value && (
                        <div className="hern-store-location-selector__aerialDistance">
                           <DistanceIcon />
                           <span>
                              {aerialDistance} {distanceUnit}
                           </span>
                        </div>
                     )}
                  </div>
               </div>
            )
         })}
         {/* <StoresOnMap
             showStoreOnMap={showStoreOnMap}
             setShowStoreOnMap={setShowStoreOnMap}
             brandLocation={brandLocation}
             settings={settings}
             brandRecurrences={brandRecurrences}
             address={address}
          /> */}
      </div>
   )
}
