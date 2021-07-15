import React from 'react'
import { useQuery, useLazyQuery } from '@apollo/react-hooks'
import { TunnelHeader, Input, Text, Dropdown, Loader } from '@dailykit/ui'
import gql from 'graphql-tag'
import ReactRRule from '../ReactRRule'
import styled, { css } from 'styled-components'
import { useConditions } from './context'
import { FACTS } from './graphql'
import Banner from '../Banner'

const FactTunnel = ({ closeTunnel }) => {
   const [factObj, setFactObj] = React.useState({})
   const [facts, setFacts] = React.useState([])
   const [selectedFact, setSelectedFact] = React.useState('')
   const [selectedOperator, setSelectedOperator] = React.useState('')
   const [value, setValue] = React.useState('')

   const FACTS_QUERY = React.useRef('')
   const DATA_QUERY = React.useRef('')

   const [valueData, setValueData] = React.useState([])
   const [duration, setDuration] = React.useState({
      typed: '',
      selected: 'year',
   })

   const { addFact } = useConditions()

   // Queries
   const [dataQuery, { loading: dataLoading, error: dataError }] = useLazyQuery(
      DATA_QUERY.current,
      {
         onCompleted: data => {
            const value = Object.values(data)[0]
            setValueData(value)
         },
         onError: error => {
            console.log(error)
         },
      }
   )

   const [
      factsQuery,
      { loading: factsLoading, error: factsError },
   ] = useLazyQuery(FACTS_QUERY.current, {
      onCompleted: data => {
         const facts = Object.values(data.facts[0])
         facts.pop()
         setFacts(facts)
      },
      onError: error => {
         console.log(error)
      },
   })

   const { loading: queryLoading, error: queryError } = useQuery(FACTS, {
      onCompleted: data => {
         if (data.facts.length) {
            FACTS_QUERY.current = gql`
               ${data.facts[0].query}
            `
            factsQuery()
         }
      },
      onError: error => {
         console.log(error)
      },
   })

   const save = () => {
      const fact = {
         id: Math.floor(Math.random() * 1000),
         fact: selectedFact,
         operator: selectedOperator,
         value: value,
      }
      if (factObj.value.duration) {
         fact.duration = `${duration.typed} ${duration.selected}`
      }
      if (factObj.value.type === 'rrule') {
         fact.value = value.psqlObject
         fact.text = value.text
      }
      if (factObj.value.type === 'int') {
         fact.value = +value
      }
      if (factObj.value.type === 'select') {
         if (factObj.value.multi) {
            fact.text = value.map(item => item.title).join(', ')
            fact.value = value.map(item => item[factObj.value.select])
         } else {
            fact.text = value.title
            fact.value = value[factObj.value.select]
         }
      }
      console.log(fact)
      addFact(fact)
      closeTunnel(2)
   }

   const getReadableText = fact => {
      return fact
         .replace(/([A-Z])/g, ' $1')
         .replace(/^./, char => char.toUpperCase())
   }

   React.useEffect(() => {
      if (selectedFact) {
         const currFactObj = Object.values(facts).find(
            fact => fact.fact === selectedFact
         )
         console.log(currFactObj)
         setFactObj(currFactObj)
         if (currFactObj.value.datapoint === 'query') {
            DATA_QUERY.current = gql`
               ${currFactObj.value.query}
            `
            dataQuery()
         }
      }
   }, [selectedFact])

   if (queryLoading || factsLoading) return <Loader />

   return (
      <>
         <TunnelHeader
            title="Add Fact"
            right={{ action: save, title: 'Add' }}
            close={() => closeTunnel(2)}
         />
         <Banner id="condition-add-fact-tunnel-top" />
         <TunnelBody>
            <StyledSection>
               <Text as="subtitle">Select Fact</Text>
               <Dropdown
                  type="single"
                  options={facts}
                  searchedOption={text => console.log(text)}
                  selectedOption={fact => setSelectedFact(fact.fact)}
                  placeholder="type what you're looking for..."
               />
            </StyledSection>
            <StyledSection>
               {Boolean(factObj.operators) && (
                  <>
                     <Text as="subtitle">Choose Operator</Text>
                     <StyledTagGroup>
                        {factObj.operators.map(operator => (
                           <StyledTag
                              active={selectedOperator === operator}
                              onClick={() => setSelectedOperator(operator)}
                           >
                              {getReadableText(operator)}
                           </StyledTag>
                        ))}
                     </StyledTagGroup>
                  </>
               )}
            </StyledSection>
            <StyledSection>
               {Boolean(factObj.value) && (
                  <>
                     <Text as="subtitle">Enter Value</Text>
                     {Boolean(factObj.value.type === 'int') && (
                        <Input
                           type="number"
                           name="value"
                           placeholder="Enter value"
                           value={value}
                           onChange={e => setValue(e.target.value)}
                        />
                     )}
                     {Boolean(factObj.value.type === 'text') && (
                        <Input
                           type="text"
                           name="value"
                           placeholder="Enter value"
                           value={value}
                           onChange={e => setValue(e.target.value)}
                        />
                     )}
                     {Boolean(
                        factObj.value.type === 'select' &&
                           factObj.value.datapoint === 'query'
                     ) && (
                        <Dropdown
                           type={factObj.value.multi ? 'multi' : 'single'}
                           options={valueData}
                           searchedOption={text => console.log(text)}
                           selectedOption={value => setValue(value)}
                           placeholder="type what you're looking for..."
                        />
                     )}
                     {Boolean(
                        factObj.value.type === 'select' &&
                           factObj.value.datapoint === 'list'
                     ) && (
                        <Dropdown
                           type={factObj.value.multi ? 'multi' : 'single'}
                           options={factObj.value.list}
                           searchedOption={text => console.log(text)}
                           selectedOption={value => setValue(value)}
                           placeholder="type what you're looking for..."
                        />
                     )}
                     {Boolean(factObj.value.type === 'rrule') && (
                        <ReactRRule onChange={val => setValue(val)} />
                     )}
                  </>
               )}
            </StyledSection>
            <StyledSection>
               {Boolean(factObj.value && factObj.value.duration) && (
                  <>
                     <Text as="subtitle">Enter Duration</Text>
                     <StyledInputWrapper>
                        <Input
                           type="number"
                           name="value"
                           value={duration.typed}
                           onChange={e =>
                              setDuration({
                                 ...duration,
                                 typed: e.target.value,
                              })
                           }
                        />
                        <StyledSelect
                           onChange={e =>
                              setDuration({
                                 ...duration,
                                 selected: e.target.value,
                              })
                           }
                        >
                           <option value="years">Year(s)</option>
                           <option value="months">Month(s)</option>
                           <option value="days">Day(s)</option>
                           <option value="hours">Hour(s)</option>
                           <option value="minutes">Minute(s)</option>
                        </StyledSelect>
                     </StyledInputWrapper>
                  </>
               )}
            </StyledSection>
         </TunnelBody>
         <Banner id="condition-add-fact-tunnel-bottom" />
      </>
   )
}

export default FactTunnel

const TunnelBody = styled.div`
   padding: 16px;
   overflow-y: scroll;
   height: calc(100vh - 40px - 64px);
`

const StyledSection = styled.div`
   margin-bottom: 32px;
`

const StyledSelect = styled.select`
   padding: 8px;
   border: none;
   border-bottom: 1px solid #888d9d;
   color: #888d9d;
   outline: none;
   width: 100%;
   max-width: 480px;
   display: block;
`

const StyledTagGroup = styled.div`
   display: flex;
   flex-wrap: wrap;
`

const StyledTag = styled.span`
   margin-right: 4px;
   padding: 4px;
   border: 1px solid #888d9d;
   color: #888d9d;
   border-radius: 2px;
   cursor: pointer;
   margin-bottom: 4px;
   font-size: 14px;
   ${props =>
      props.active &&
      css`
         border-color: #00a7e1;
         color: #fff;
         background: #00a7e1;
      `}
`

const StyledInputWrapper = styled.div`
   display: flex;
   align-items: center;
`
