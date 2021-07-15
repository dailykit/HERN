import { Flex, Form, Spacer, Text, TextButton } from '@dailykit/ui'
import React, { useState } from 'react'
import '../../../styled/datepicker.css'
import { checkDateField } from '../../../utils/checkDateField'
import { isObject } from '../../../utils/isObject'
import { optionsMap } from '../../../utils/optionsMap'
import { fromMixed } from '../../../utils/textTransform'
import { Dropdown, DropdownItem } from '../DropdownMenu'

export default function Filters({
   filters,
   optionsState,
   setOptionsState,
   newOptionsState,
   setNewOptionsState,
   handleApply,
   handleReset,
   isDiff,
}) {
   return Object.keys(filters).map(filter => (
      <Filter
         key={filter}
         filter={filter}
         filters={filters}
         optionsState={optionsState}
         setOptionsState={setOptionsState}
         newOptionsState={newOptionsState}
         setNewOptionsState={setNewOptionsState}
         handleApply={handleApply}
         handleReset={handleReset}
         isDiff={isDiff}
      />
   ))
}

function Filter({
   filter,
   filters,
   optionsState,
   setOptionsState,
   newOptionsState,
   setNewOptionsState,
   handleApply,
   handleReset,
   isDiff,
}) {
   const [show, setShow] = useState(false)
   const [filterable, setFilterable] = useState(false)

   const handleFilterApply = isNewOption => {
      setShow(false)
      handleApply(isNewOption)
   }

   const handleFilterReset = isNewOption => {
      setShow(false)
      setFilterable(false)
      handleReset(isNewOption)
   }

   const renderApplyButton = () => {
      return (
         <Flex container margin="12px 0 0 12px">
            {isDiff ? (
               <>
                  <TextButton
                     type="solid"
                     onClick={() => handleFilterApply(true)}
                  >
                     Apply New
                  </TextButton>
                  <Spacer xAxis size="12px" />

                  <TextButton
                     type="solid"
                     onClick={() => handleFilterReset(true)}
                  >
                     Reset New
                  </TextButton>
                  <Spacer xAxis size="12px" />
               </>
            ) : null}
            <TextButton type="solid" onClick={() => handleFilterApply(false)}>
               Apply
            </TextButton>
            <Spacer xAxis size="12px" />

            <TextButton type="solid" onClick={() => handleFilterReset(false)}>
               Reset
            </TextButton>
         </Flex>
      )
   }

   const renderOption = (option, parent) => {
      /**
       *
       * @param {string} option
       * @param {string} parent
       */
      const renderOptionName = (option, parent) => {
         if (checkDateField(parent)) {
            return optionsMap['created_at'][option]
         }

         return optionsMap[option] || option
      }

      const handleChange = (value, field, isNewOption) => {
         if (isNewOption) {
            setNewOptionsState({
               ...optionsState,
               [parent]: {
                  ...newOptionsState[parent],
                  [field]: value || null,
               },
            })
         } else {
            setOptionsState({
               ...optionsState,
               [parent]: {
                  ...optionsState[parent],
                  [field]: value || null,
               },
            })
         }
      }

      if (option.startsWith('_')) {
         return (
            <Flex
               container
               alignItems="flex-end"
               justifyContent="space-between"
            >
               {checkDateField(parent) ? (
                  <>
                     {isDiff ? (
                        <>
                           <Form.Group>
                              <Form.Label
                                 htmlFor={parent + option}
                                 title="diifDateInput"
                              >
                                 {renderOptionName(option, parent)}
                              </Form.Label>
                              <Form.Date
                                 id={parent + option}
                                 name={renderOptionName(option, parent)}
                                 value={newOptionsState[parent]?.[option] || ''}
                                 onChange={e => {
                                    setFilterable(true)
                                    handleChange(e.target.value, option, true)
                                 }}
                              />
                           </Form.Group>
                           <Spacer xAxis size="10px" />
                        </>
                     ) : null}
                     <Form.Group>
                        <Form.Label htmlFor={parent + option} title="dateInput">
                           {renderOptionName(option, parent)}
                        </Form.Label>
                        <Form.Date
                           id={parent + option}
                           name={renderOptionName(option, parent)}
                           value={optionsState[parent]?.[option] || ''}
                           onChange={e => {
                              setFilterable(true)
                              handleChange(e.target.value, option, false)
                           }}
                        />
                     </Form.Group>
                  </>
               ) : (
                  <>
                     {isDiff ? (
                        <>
                           <Form.Group>
                              <Form.Label
                                 htmlFor={parent + option}
                                 title="diffInput"
                              >
                                 {renderOptionName(option, parent)}
                              </Form.Label>
                              <Form.Text
                                 id={parent + option}
                                 value={newOptionsState[parent]?.[option] || ''}
                                 onChange={e => {
                                    setFilterable(true)
                                    handleChange(e.target.value, option, true)
                                 }}
                                 placeholder={renderOptionName(option, parent)}
                                 name={option}
                              />
                           </Form.Group>
                           <Spacer xAxis size="10px" />
                        </>
                     ) : null}
                     <Form.Group>
                        <Form.Label htmlFor={parent + option} title="diffInput">
                           {renderOptionName(option, parent)}
                        </Form.Label>

                        <Form.Text
                           placeholder={renderOptionName(option, parent)}
                           type="text"
                           value={optionsState[parent]?.[option] || ''}
                           onChange={e => {
                              setFilterable(true)
                              handleChange(e.target.value, option, false)
                           }}
                           name={option}
                           id={parent + option}
                        />
                     </Form.Group>
                  </>
               )}
            </Flex>
         )
      }
   }
   return (
      <>
         <Spacer xAxis size="16px" />
         <Dropdown
            title={fromMixed(filter.split('  ')[1])}
            withIcon
            show={show}
            setShow={setShow}
         >
            {isDiff ? (
               <DropdownItem width="100%">
                  <Flex container justifyContent="space-between">
                     <Text as="h4">New Filters</Text>
                     <Text as="h4">Base Filters</Text>
                  </Flex>
               </DropdownItem>
            ) : null}
            {isObject(filters[filter]) &&
               Object.keys(filters[filter]).map(filterName => (
                  <DropdownItem key={filterName}>
                     {renderOption(filterName, filter)}
                  </DropdownItem>
               ))}

            {filterable && renderApplyButton()}
         </Dropdown>
      </>
   )
}
