import React, { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/router'
import { Wrapper, MobileViewFilterContainer } from './styles'
import { FilterIcon, ChevronDown, ChevronUp } from '../Icons'
import Input from '../Input'
import MultiRangeSlider from '../MultiRangeSlider'
import Modal from '../Modal'
import { theme } from '../../theme'
import { isEmpty, useWindowDimensions } from '../../utils'
export default function FilterComp({ children, ...props }) {
   const { width } = useWindowDimensions()
   const router = useRouter()
   const [isModalVisible, setIsModalVisible] = useState(false)
   const [elemShowingMore, setElemShowingMore] = useState([])
   const [queryParameters, setQueryParameters] = useState(null)
   const [isFilterSidebarVisible, setIsFilterSidebarVisible] = useState(true)
   const [selectedPanels, setSelectedPanels] = useState([])
   let [value, setValue] = useState({ start: 25, end: 75 })
   const handleSinglePanelClick = (item, index) => {
      const alreadySelectedIndex = selectedPanels.findIndex(
         el => el.id === index
      )
      if (alreadySelectedIndex === -1) {
         setSelectedPanels(prev => [
            ...prev,
            {
               ...item,
               id: index
            }
         ])
      } else {
         let updatedSelection = selectedPanels
         updatedSelection.splice(alreadySelectedIndex, 1)
         setSelectedPanels([...updatedSelection])
      }
   }

   const checkIfSelected = (key, value) => {
      if (!queryParameters) return false
      const selectedFilter = queryParameters
      return Boolean(
         selectedFilter.hasOwnProperty(key) &&
            selectedFilter[key].includes(value)
      )
   }

   const addToFilter = (key, value) => {
      let updatedParams = {}
      if (!isEmpty(router.query)) {
         if (!isEmpty(router.query[key])) {
            const prev = Array.isArray(router.query[key])
               ? router.query[key]
               : [router.query[key]]
            const updatedKeyValue = prev.includes(value)
               ? prev.filter(el => el !== value)
               : [...prev, value]
            updatedParams = {
               ...router.query,
               [key]: updatedKeyValue
            }
         } else {
            updatedParams = {
               ...router.query,
               [key]: [value]
            }
         }
      } else {
         updatedParams = {
            [key]: [value]
         }
      }
      return updatedParams
   }

   const handleCheckboxClick = async (key, value) => {
      const updatedParams = await addToFilter(key, value)
      setQueryParameters(updatedParams)
      router.push({
         pathname: router.pathname,
         query: updatedParams
      })
   }

   const handleSliderChange = async ({ min, max }) => {
      setQueryParameters({ ...router.query, startPrice: min, endPrice: max })
      router.push({
         pathname: router.pathname,
         query: { ...router.query, startPrice: min, endPrice: max }
      })
   }

   const clearFilterHandler = () => {
      setQueryParameters(null)
      router.push({
         pathname: router.pathname,
         query: {}
      })
   }

   const handleShowMore = (title, index) => {
      setElemShowingMore(prev => {
         const prevValueByIndex = prev.find(el => el.id === `${title}-${index}`)
         if (prevValueByIndex) {
            prevValueByIndex.isShowingMore = !prevValueByIndex.isShowingMore
            return [...prev]
         } else {
            return [...prev, { id: `${title}-${index}`, isShowingMore: true }]
         }
      })
   }

   const openModal = () => {
      setIsModalVisible(true)
   }
   const closeModal = () => {
      setIsModalVisible(false)
   }

   useEffect(() => {
      let elements = Array.from(
         document.getElementsByClassName('single-panel-content')
      )
      console.log({ elements })
      elements.forEach(el => {
         const height = el.scrollHeight
         const id = el.id
         const isShowingMore = Boolean(
            elemShowingMore.find(elem => elem.id === id)?.isShowingMore
         )
         if (isShowingMore) {
            console.log({ height })
            el.style.height = `${height}px`
         } else {
            el.style.height = height > 150 ? '150px' : `${height}px`
         }
      })
   }, [elemShowingMore])

   useEffect(() => {
      if (!isEmpty(router.query)) {
         setQueryParameters(router.query)
      }
   }, [router.query])

   return (
      <Wrapper isFilterSidebarVisible={isFilterSidebarVisible} {...props}>
         <div className="filter-panel-heading">
            <div className="filter-button-bar">
               <button
                  className="button-toggle-filter"
                  onClick={() =>
                     width > 769
                        ? setIsFilterSidebarVisible(prev => !prev)
                        : openModal()
                  }
               >
                  <div className="flex">
                     <FilterIcon size="20" color={theme.colors.textColor4} />
                     <span>Filter</span>
                  </div>
               </button>
               <div className="filter-sort-options">
                  <select className="sort-select">
                     <option disabled>Sort</option>
                     <option value="newest">Newest</option>
                     <option value="most-popular">Most Popular</option>
                     <option value="highest-rated">Highest Rated</option>
                  </select>
               </div>
               {queryParameters && (
                  <button
                     className="clear-filter-button"
                     onClick={clearFilterHandler}
                  >
                     Clear filter
                  </button>
               )}
            </div>
            <span className="filter-result-count-heading">
               {props?.resultCount} results
            </span>
         </div>
         <div className="filter-panel-container">
            <div className="filter-panel-sidebar">
               <div>
                  {props.filterOptions.map((item, index) => (
                     <div className="sidebar-single-panel" key={index}>
                        <div
                           className="single-panel-title-header"
                           onClick={() => handleSinglePanelClick(item, index)}
                        >
                           <h3 className="title">
                              {item?.title.toUpperCase()}
                           </h3>
                           {selectedPanels.some(el => el.id === index) ? (
                              <ChevronUp
                                 size="20"
                                 color={theme.colors.textColor4}
                              />
                           ) : (
                              <ChevronDown
                                 size="20"
                                 color={theme.colors.textColor4}
                              />
                           )}
                        </div>
                        <div
                           className={
                              selectedPanels.some(el => el.id === index)
                                 ? 'single-panel-content-wrapper active'
                                 : 'single-panel-content-wrapper'
                           }
                        >
                           {item?.type === 'checkbox' && (
                              <ul
                                 id={`${item?.title}-${index}`}
                                 className="single-panel-content"
                              >
                                 {item?.options.map(option => (
                                    <label key={option?.id}>
                                       <Input
                                          type="checkbox"
                                          border="1px solid #fff"
                                          customWidth="20px"
                                          customHeight="20px"
                                          checked={checkIfSelected(
                                             item?.title,
                                             option?.title
                                          )}
                                          onChange={() =>
                                             handleCheckboxClick(
                                                item?.title,
                                                option?.title
                                             )
                                          }
                                       />
                                       <li>{option?.title}</li>
                                    </label>
                                 ))}
                              </ul>
                           )}

                           {item?.type === 'multi-range' && (
                              <div
                                 id={`${item?.title}-${index}`}
                                 className="single-panel-content"
                              >
                                 <MultiRangeSlider
                                    forPrice={true}
                                    min={Number(item?.option?.min)}
                                    max={Number(item?.option?.max)}
                                    onChange={handleSliderChange}
                                 />
                              </div>
                           )}
                           <button
                              className="read-more-btn"
                              onClick={() => handleShowMore(item?.title, index)}
                           >
                              {Boolean(
                                 elemShowingMore.find(
                                    el => el.id === `${item?.title}-${index}`
                                 )?.isShowingMore
                              )
                                 ? 'Show Less'
                                 : 'Show More'}
                           </button>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
            <div className="filter-panel-filtered-list">{children}</div>
         </div>

         <Modal type="bottomDrawer" isOpen={isModalVisible} close={closeModal}>
            <MobileViewFilterContainer>
               <div className="flex">
                  <span className="filter-result-count-heading">
                     {props?.resultCount} results
                  </span>
                  {queryParameters && (
                     <button
                        className="clear-filter-button"
                        onClick={clearFilterHandler}
                     >
                        Clear filter
                     </button>
                  )}
               </div>
               <div className="filter-panel-container">
                  <div className="filter-panel-sidebar">
                     <div>
                        {props.filterOptions.map((item, index) => (
                           <div className="sidebar-single-panel" key={index}>
                              <div
                                 className="single-panel-title-header"
                                 onClick={() =>
                                    handleSinglePanelClick(item, index)
                                 }
                              >
                                 <h3 className="title">
                                    {item?.title.toUpperCase()}
                                 </h3>
                                 {selectedPanels.some(el => el.id === index) ? (
                                    <ChevronUp
                                       size="20"
                                       color={theme.colors.textColor4}
                                    />
                                 ) : (
                                    <ChevronDown
                                       size="20"
                                       color={theme.colors.textColor4}
                                    />
                                 )}
                              </div>
                              <div
                                 className={
                                    selectedPanels.some(el => el.id === index)
                                       ? 'single-panel-content-wrapper active'
                                       : 'single-panel-content-wrapper'
                                 }
                              >
                                 {item?.type === 'checkbox' && (
                                    <ul
                                       id={`${item?.title}-${index}`}
                                       className="single-panel-content"
                                    >
                                       {item?.options.map(option => (
                                          <label key={option?.id}>
                                             <Input
                                                type="checkbox"
                                                border="1px solid #fff"
                                                customWidth="20px"
                                                customHeight="20px"
                                                checked={checkIfSelected(
                                                   item?.title,
                                                   option?.title
                                                )}
                                                onChange={() =>
                                                   handleCheckboxClick(
                                                      item?.title,
                                                      option?.title
                                                   )
                                                }
                                             />
                                             <li>{option?.title}</li>
                                          </label>
                                       ))}
                                    </ul>
                                 )}

                                 {item?.type === 'multi-range' && (
                                    <div
                                       id={`${item?.title}-${index}`}
                                       className="single-panel-content"
                                    >
                                       <MultiRangeSlider
                                          forPrice={true}
                                          min={Number(item?.option?.min)}
                                          max={Number(item?.option?.max)}
                                          onChange={handleSliderChange}
                                       />
                                    </div>
                                 )}
                                 <button
                                    className="read-more-btn"
                                    onClick={() =>
                                       handleShowMore(item?.title, index)
                                    }
                                 >
                                    {Boolean(
                                       elemShowingMore.find(
                                          el =>
                                             el.id === `${item?.title}-${index}`
                                       )?.isShowingMore
                                    )
                                       ? 'Show Less'
                                       : 'Show More'}
                                 </button>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </div>
            </MobileViewFilterContainer>
         </Modal>
      </Wrapper>
   )
}
