import React from 'react'
import { RRule } from 'rrule'
import { Text, Flex, Spacer, Form } from '@dailykit/ui'
import { Tooltip } from '../'

import { getUTCDate, getPSQLRule, reversePSQLObject } from './utils'

const Component = ({ value, onChange }) => {
   const [state, setState] = React.useState({
      freq: 1,
      dtstart: '',
      until: '',
      count: 30,
      interval: '1',
      wkst: 0,
      byweekday: [],
      bymonth: [],
   })

   // Handlers
   const toggleByDay = value => {
      const index = state.byweekday.findIndex(
         wk => RRule[wk].weekday === RRule[value].weekday
      )
      if (index === -1) {
         const copy = state.byweekday
         copy.push(value)
         setState({ ...state, byweekday: [...copy] })
      } else {
         const copy = state.byweekday
         copy.splice(index, 1)
         setState({ ...state, byweekday: [...copy] })
      }
   }

   const toggleByMonth = value => {
      const index = state.bymonth.findIndex(mon => mon === +value)
      if (index === -1) {
         const copy = state.bymonth
         copy.push(+value)
         setState({ ...state, bymonth: [...copy] })
      } else {
         const copy = state.bymonth
         copy.splice(index, 1)
         setState({ ...state, bymonth: [...copy] })
      }
   }

   // Effects
   React.useEffect(() => {
      const rule = { ...state }
      if (!state.byweekday.length) {
         delete rule.byweekday
      }
      if (!state.bymonth.length) {
         delete rule.bymonth
      }
      if (state.dtstart) {
         rule.dtstart = getUTCDate(state.dtstart)
      } else {
         const d = new Date().toISOString().split('T')[0]
         rule.dtstart = getUTCDate(d)
      }
      if (state.until) {
         rule.until = getUTCDate(state.until)
      } else {
         delete rule.until
      }
      if (state.byweekday.length) {
         rule.byweekday = state.byweekday.map(day => RRule[day])
      }
      const rruleObj = new RRule(rule)
      const output = {
         object: rruleObj,
         psqlObject: getPSQLRule(rule),
         string: rruleObj.toString(),
         text: rruleObj.toText(),
      }
      output.psqlObject.text = output.text
      onChange(output)
   }, [state])

   React.useEffect(() => {
      if (value) {
         const rruleObject = reversePSQLObject(value)
         setState({ ...state, ...rruleObject })
      }
   }, [])

   return (
      <>
         <Text as="subtitle">
            <Flex container alignItems="center">
               Repeat
               <Tooltip identifier="rrule_repeat" />
            </Flex>
         </Text>
         <Flex container>
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="freq"
                  value={0}
                  checked={state.freq === 0}
                  onChange={e => setState({ ...state, freq: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Yearly</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="freq"
                  value={1}
                  checked={state.freq === 1}
                  onChange={e => setState({ ...state, freq: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Monthly</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="freq"
                  value={2}
                  checked={state.freq === 2}
                  onChange={e => setState({ ...state, freq: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Weekly</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="freq"
                  value={3}
                  checked={state.freq === 3}
                  onChange={e => setState({ ...state, freq: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Daily</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="freq"
                  value={4}
                  checked={state.freq === 4}
                  onChange={e => setState({ ...state, freq: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Hourly</Text>
            </Flex>
         </Flex>
         <Spacer size="16px" />
         <Flex container alignItems="center">
            <Form.Group>
               <Form.Label htmlFor="dtstart" title="Start Date">
                  <Flex container alignItems="center">
                     Start Date*
                     <Tooltip identifier="rrule_start_date" />
                  </Flex>
               </Form.Label>
               <Form.Date
                  id="dtstart"
                  name="dtstart"
                  onChange={e =>
                     setState({ ...state, dtstart: e.target.value })
                  }
                  value={state.dtstart}
               />
            </Form.Group>
            <Spacer xAxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor="until" title="End Date">
                  <Flex container alignItems="center">
                     End Date
                     <Tooltip identifier="rrule_end_date" />
                  </Flex>
               </Form.Label>
               <Form.Date
                  id="until"
                  name="until"
                  onChange={e => setState({ ...state, until: e.target.value })}
                  value={state.until}
               />
            </Form.Group>
         </Flex>
         <Spacer size="16px" />
         <Flex container alignItems="center">
            <Form.Group>
               <Form.Label htmlFor="count" title="count">
                  <Flex container alignItems="center">
                     Count*
                     <Tooltip identifier="rrule_count" />
                  </Flex>
               </Form.Label>
               <Form.Number
                  id="count"
                  name="count"
                  onChange={e => setState({ ...state, count: e.target.value })}
                  value={state.count}
                  placeholder="Enter count"
               />
            </Form.Group>
            <Spacer xAxis size="16px" />
            <Form.Group>
               <Form.Label htmlFor="interval" title="interval">
                  <Flex container alignItems="center">
                     Interval*
                     <Tooltip identifier="rrule_interval" />
                  </Flex>
               </Form.Label>
               <Form.Number
                  id="interval"
                  name="interval"
                  onChange={e =>
                     setState({ ...state, interval: e.target.value })
                  }
                  value={state.interval}
                  placeholder="Enter interval"
               />
            </Form.Group>
         </Flex>
         <Spacer size="16px" />
         <Text as="subtitle">
            <Flex container alignItems="center">
               Week starts on
               <Tooltip identifier="rrule_wkst" />
            </Flex>
         </Text>
         <Flex container>
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={0}
                  checked={state.wkst === 0}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Monday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={1}
                  checked={state.wkst === 1}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Tuesday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={2}
                  checked={state.wkst === 2}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Wednesday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={3}
                  checked={state.wkst === 3}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Thursday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={4}
                  checked={state.wkst === 4}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Friday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={5}
                  checked={state.wkst === 5}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Saturday</Text>
            </Flex>
            <Spacer xAxis size="16px" />
            <Flex container alignItems="center">
               <input
                  type="radio"
                  name="wkst"
                  value={6}
                  checked={state.wkst === 6}
                  onChange={e => setState({ ...state, wkst: +e.target.value })}
               />
               <Spacer xAxis size="8px" />
               <Text as="p">Sunday</Text>
            </Flex>
         </Flex>
         <Spacer size="16px" />
         <Text as="subtitle">
            <Flex container alignItems="center">
               On every
               <Tooltip identifier="rule_byday" />
            </Flex>
         </Text>
         <Flex container>
            <Form.Checkbox
               id="byMonday"
               name="byMonday"
               value={state.byweekday.includes('MO')}
               onChange={() => toggleByDay('MO')}
            >
               Monday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="byTuesday"
               name="byTuesday"
               value={state.byweekday.includes('TU')}
               onChange={() => toggleByDay('TU')}
            >
               Tuesday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="byWednesday"
               name="byWednesday"
               value={state.byweekday.includes('WE')}
               onChange={() => toggleByDay('WE')}
            >
               Wednesday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="byThursday"
               name="byThursday"
               value={state.byweekday.includes('TH')}
               onChange={() => toggleByDay('TH')}
            >
               Thursday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="byFriday"
               name="byFriday"
               value={state.byweekday.includes('FR')}
               onChange={() => toggleByDay('FR')}
            >
               Friday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="bySaturday"
               name="bySaturday"
               value={state.byweekday.includes('SA')}
               onChange={() => toggleByDay('SA')}
            >
               Saturday
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="bySunday"
               name="bySunday"
               value={state.byweekday.includes('SU')}
               onChange={() => toggleByDay('SU')}
            >
               Sunday
            </Form.Checkbox>
         </Flex>
         <Spacer size="16px" />
         <Text as="subtitle">
            <Flex container alignItems="center">
               In
               <Tooltip identifier="rrule_bymonth" />
            </Flex>
         </Text>
         <Flex container>
            <Form.Checkbox
               id="Jan"
               name="Jan"
               value={state.bymonth.includes(1)}
               onChange={() => toggleByMonth(1)}
            >
               January
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Feb"
               name="Feb"
               value={state.bymonth.includes(2)}
               onChange={() => toggleByMonth(2)}
            >
               February
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Mar"
               name="Mar"
               value={state.bymonth.includes(3)}
               onChange={() => toggleByMonth(3)}
            >
               March
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Apr"
               name="Apr"
               value={state.bymonth.includes(4)}
               onChange={() => toggleByMonth(4)}
            >
               April
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="May"
               name="May"
               value={state.bymonth.includes(5)}
               onChange={() => toggleByMonth(5)}
            >
               May
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Jun"
               name="Jun"
               value={state.bymonth.includes(6)}
               onChange={() => toggleByMonth(6)}
            >
               June
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Jul"
               name="Jul"
               value={state.bymonth.includes(7)}
               onChange={() => toggleByMonth(7)}
            >
               July
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Aug"
               name="Aug"
               value={state.bymonth.includes(8)}
               onChange={() => toggleByMonth(8)}
            >
               August
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Sep"
               name="Sep"
               value={state.bymonth.includes(9)}
               onChange={() => toggleByMonth(9)}
            >
               September
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Oct"
               name="Oct"
               value={state.bymonth.includes(10)}
               onChange={() => toggleByMonth(10)}
            >
               October
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Nov"
               name="Nov"
               value={state.bymonth.includes(11)}
               onChange={() => toggleByMonth(11)}
            >
               November
            </Form.Checkbox>
            <Spacer xAxis size="16px" />
            <Form.Checkbox
               id="Dec"
               name="Dec"
               value={state.bymonth.includes(12)}
               onChange={() => toggleByMonth(12)}
            >
               December
            </Form.Checkbox>
         </Flex>
      </>
   )
}

export default Component
