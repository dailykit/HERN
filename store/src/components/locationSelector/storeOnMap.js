const StoresOnMap = props => {
   const {
      brandLocation,
      settings,
      showStoreOnMap,
      setShowStoreOnMap,
      brandRecurrences,
      address,
   } = props

   // const defaultCenter = localStorage.getItem('userLocation')
   const { latitude, longitude } = React.useMemo(() => address, [address])

   // defaultProps for google map
   const defaultProps = {
      ...(JSON.parse(defaultCenter) && {
         center: {
            lat: latitude,
            lng: longitude,
         },
      }),
      zoom: 16,
   }

   const [clickedStoreId, setClickedStoreId] = useState(null)

   const StoreLocationMarker = props => {
      const { settings, storeDetails, brandRecurrences } = props
      const Service = combineRecurrenceAndBrandLocation(
         storeDetails,
         brandRecurrences
      )

      const ServiceType = () => {
         if (
            Service.type === 'ONDEMAND_DELIVERY' ||
            Service.type === 'PREORDER_DELIVERY'
         ) {
            return 'Delivery '
         } else if (
            Service.type === 'ONDEMAND_PICKUP' ||
            Service.type === 'PREORDER_PICKUP'
         ) {
            return 'Pick Up '
         } else {
            return 'Dine In '
         }
      }
      const days = [
         {
            key: 0,
            day: 'Monday',
            timeSlots: null,
         },
         {
            key: 1,
            day: 'Tuesday',
            timeSlots: null,
         },
         {
            key: 2,
            day: 'Wednesday',
            timeSlots: null,
         },
         {
            key: 3,
            day: 'Thursday',
            timeSlots: null,
         },
         {
            key: 4,
            day: 'Friday',
            timeSlots: null,
         },
         {
            key: 5,
            day: 'Saturday',
            timeSlots: null,
         },
         {
            key: 6,
            day: 'Sunday',
            timeSlots: null,
         },
      ]

      const NewDays = days.map(eachDay => {
         const DaysOutput = rrulestr(Service.rrule).options.byweekday //   [2,3,4]
         if (DaysOutput === null) {
            eachDay.timeSlots = Service.timeSlots
         } else {
            if (DaysOutput.includes(eachDay.key)) {
               eachDay.timeSlots = Service.timeSlots
            } else eachDay.timeSlots = ['Not Available']
         }
         return eachDay
      })
      useEffect(() => {
         if (clickedStoreId) {
            const fullScreenButton = document.querySelectorAll(
               '.gm-fullscreen-control'
            )
            const zoomButton = document.querySelectorAll(
               '.gm-bundled-control-on-bottom'
            )
            const bottomMapText = document.querySelectorAll('.gmnoprint')
            fullScreenButton.forEach(x => {
               x.style.display = 'none'
            })
            zoomButton.forEach(x => {
               x.style.display = 'none'
            })
            bottomMapText.forEach(x => {
               x.style.display = 'none'
            })
         } else {
            const fullScreenButton = document.querySelectorAll(
               '.gm-fullscreen-control'
            )
            const zoomButton = document.querySelectorAll(
               '.gm-bundled-control-on-bottom'
            )
            const bottomMapText = document.querySelectorAll('.gmnoprint')
            fullScreenButton.forEach(x => {
               x.style.display = 'unset'
            })
            zoomButton.forEach(x => {
               x.style.display = 'unset'
            })
            bottomMapText.forEach(x => {
               x.style.display = 'unset'
            })
         }
      }, [clickedStoreId])
      return (
         <>
            <div className="hern-store-selector__store-location-map-store-marker">
               <div>
                  <div
                     className={classNames(
                        'hern-store-selector__store-location-map-store-detail-pop',
                        {
                           'hern-store-selector__store-location-map-store-detail-pop--active':
                              clickedStoreId === storeDetails.id,
                        }
                     )}
                  >
                     <div className="hern-store-selector__store-location-map-store-detail-pop-content">
                        <div className="hern-store-selector__store-location-map-store-detail-pop-close-icon">
                           <CloseIcon
                              size={16}
                              color="#404040CC"
                              stroke="currentColor"
                              onClick={() => {
                                 setClickedStoreId(null)
                              }}
                           />
                        </div>
                        <div className="hern-store-selector__store-location-map-store-detail-pop__store">
                           <span className="hern-store-selector__store-location-map-store-detail-pop__store-label">
                              {storeDetails.location.label}
                           </span>
                           <div className="hern-store-selector__store-location-map-store-detail-pop__address">
                              <label className="hern-store-selector__store-location-map-store-detail-pop__address-label hern-store-selector__store-location-map-store-detail-pop__info-label">
                                 Address
                              </label>
                              <span className="hern-store-selector__store-location-map-store-detail-pop__address-line1 hern-store-selector__store-location-map-store-detail-pop__address__info">
                                 {storeDetails.location.locationAddress.line1}
                              </span>
                              <span className="hern-store-selector__store-location-map-store-detail-pop__address-line2 hern-store-selector__store-location-map-store-detail-pop__address__info">
                                 {storeDetails.location.locationAddress.line2}
                              </span>
                              <span className="hern-store-selector__store-location-map-store-detail-pop__address-C-S-C hern-store-selector__store-location-map-store-detail-pop__address__info">
                                 {storeDetails.location.city},{' '}
                                 {storeDetails.location.state} (
                                 {storeDetails.location.country})
                              </span>
                           </div>
                           <div className="hern-store-selector__store-location-map-store-detail-pop__timing">
                              <label className="hern-store-selector__store-location-map-store-detail-pop__timing-label hern-store-selector__store-location-map-store-detail-pop__info-label">
                                 Today’s <ServiceType /> Hours
                              </label>
                              <span className="hern-store-selector__store-location-map-store-detail-pop__timing-timing">
                                 {NewDays.map(eachDay => {
                                    return (
                                       <div className="hern-store-selector__store-location-map-store-detail-pop__timing-timing-grid">
                                          <div>{eachDay.day}</div>
                                          <div>
                                             {eachDay.timeSlots.map(
                                                eachTime => {
                                                   if (
                                                      eachTime ===
                                                      'Not Available'
                                                   ) {
                                                      return (
                                                         <span>
                                                            : {eachTime}
                                                         </span>
                                                      )
                                                   } else {
                                                      return (
                                                         <span>
                                                            : {eachTime.from}-
                                                            {eachTime.to}
                                                            <br />
                                                         </span>
                                                      )
                                                   }
                                                }
                                             )}
                                          </div>
                                       </div>
                                    )
                                 })}
                              </span>
                           </div>
                        </div>
                        <div
                           onClick={() => {
                              setShowStoreOnMap(false)
                              setClickedStoreId(null)
                              console.log(
                                 'Select Store Details',
                                 storeDetails.location
                              )
                              localStorage.setItem(
                                 'storeLocationId',
                                 JSON.stringify(storeDetails.location.id)
                              )
                           }}
                        >
                           <Button className="hern-store-selector__store-location-map-store-detail__store-btn">
                              Select Store
                           </Button>
                        </div>
                     </div>
                  </div>
               </div>
               <img
                  className={
                     'hern-store-selector__store-location-map-store-icon'
                  }
                  src={settings.brand['theme-brand'].logo.url}
                  onClick={() => {
                     setClickedStoreId(storeDetails.id)

                     console.log('storeDetails', storeDetails)
                     console.log('brandRecurrences', brandRecurrences)
                     console.log('brandLocation', brandLocation)
                     console.log('serviceTiming', Service)
                     console.log('clicked Item', clickedStoreId)
                  }}
               />
            </div>
         </>
      )
   }

   return (
      <CSSTransition
         in={showStoreOnMap}
         timeout={300}
         unmountOnExit
         classNames="hern-store-location-selector__store-on-map-css-transition"
      >
         <div className="hern-store-location-selector__store-on-map-container">
            <div className="hern-store-location-selector__store-on-map-header">
               <div className="hern-store-location-selector__store-on-map-header-right">
                  <CloseIcon
                     size={16}
                     color="#404040CC"
                     stroke="currentColor"
                     onClick={() => {
                        setShowStoreOnMap(false)
                     }}
                  />
                  <span>Stores on map</span>
               </div>
            </div>
            <div className="hern-store-location-selector__store-on-map-map">
               <GoogleMapReact
                  bootstrapURLKeys={{ key: get_env('GOOGLE_API_KEY') }}
                  defaultCenter={defaultProps.center}
                  defaultZoom={defaultProps.zoom}
                  disableDefaultUI={true}
               >
                  <UserLocationMarker lat={latitude} lng={longitude} />
                  {brandLocation.map((eachBrand, index) => {
                     const { latitude, longitude } =
                        eachBrand.location.locationAddress.locationCoordinates
                     return (
                        <StoreLocationMarker
                           key={index}
                           lat={latitude}
                           lng={longitude}
                           storeDetails={eachBrand}
                           settings={settings}
                           brandRecurrences={brandRecurrences}
                        />
                     )
                  })}
               </GoogleMapReact>
            </div>
         </div>
      </CSSTransition>
   )
}
const UserLocationMarker = () => {
   return (
      <LocationMarker
         size={48}
         style={{
            position: 'absolute',
            top: 'calc(52.5% - 24px)',
            left: '49.5%',
            zIndex: '1000',
            transform: 'translate(-50%,-50%)',
         }}
      />
   )
}
