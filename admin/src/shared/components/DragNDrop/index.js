import React, { useState, useRef } from 'react'
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'
import { Flex } from '@dailykit/ui'
// import { set } from 'lodash'
import { useDnd } from './useDnd'
export default function DragNDrop({
   list,
   droppableId,
   children,
   tablename,
   schemaname,
   direction,
   isDefaultDrag = true,
   customDragStyle = {},
   componentHeight,
}) {
   const { priorityMutation } = useDnd()
   const [data, setData] = useState(list)
   const getItemStyle = (style, snapshot, index, size) => {
      let height = Number(componentHeight)
      if (style.transform) {
         let axisLockY = ''
         if (
            Number(
               style.transform.slice(
                  style.transform.indexOf(',') + 1,
                  style.transform.length - 3
               )
            ) >=
            height * (size - index+1)
         ) {
            axisLockY = `translate(0px, ${height * (size - index - 1)}px`
         } else if (
            Number(
               style.transform.slice(
                  style.transform.indexOf(',') + 1,
                  style.transform.length - 3
               )
            ) <=
            -height * (size - (size - (index + 1)))
         ) {
            axisLockY = `translate(0px, ${
               -height * (size - (size - (index + 1)) - 1)
            }px`
         } else {
            axisLockY = `translate(0px ${style.transform.slice(
               style.transform.indexOf(','),
               style.transform.length
            )}`
         }
         //console.log(axisLockY,"axisLockY")
         return {
            ...style,
            cursor: `${snapshot.isDragging ? 'move' : 'default'}`,
            transform: axisLockY,
         }
      }
      return {
         ...style,
         cursor: `${snapshot.isDragging ? 'move' : 'default'}`,
      }
   }
   
   const onDragEnd = result => {
      //return if item was dropped outside
      if (!result.destination) return

      // return if item was dropped to the same place
      if (
         result.source.droppableId === result.destination.droppableId &&
         result.source.index === result.destination.index
      )
         return

      //get the items array
      const newItems = [...list]
      let items = []
      //get the draggedItems
      let draggedItems = newItems[result.source.index]
      const length = newItems.length
      console.log(result.destination.index)

      //delete the item from the source position and insert it to the destination position
      newItems.splice(result.source.index, 1)
      newItems.splice(result.destination.index, 0, draggedItems)

      //when middle items are dragged in the any middle position except top and bottom
      if (
         result.destination.index !== 0 &&
         result.destination.index !== length - 1
      ) {
         console.log(
            'when middle items are dragged in another middle position except top and bottom'
         )

         const beforePosition = newItems[result.destination.index - 1].position
         const afterPosition = newItems[result.destination.index + 1].position
         draggedItems.position = (beforePosition + afterPosition) / 2
         items = [draggedItems]
      }
      //when any items are dragged in the top position
      else if (result.destination.index === 0) {
         console.log('when any items are dragged in the top position')
         if (length === 2) {
            console.log('when there is only two item')
            draggedItems.position = 1000000
            newItems[length - 1].position = 0
            items = [draggedItems, newItems[length - 1]]
         } else {
            const afterPosition =
               newItems[result.destination.index + 2].position
            draggedItems.position = 1000000
            newItems[result.destination.index + 1].position =
               (draggedItems.position + afterPosition) / 2
            items = [draggedItems, newItems[result.destination.index + 1]]
         }
      }
      //when any items are dragged in the bottom position
      else if (result.destination.index === length - 1) {
         console.log('when any items are dragged in the bottom position')
         if (length === 2) {
            console.log('when there is only two item')

            draggedItems.position = 0
            newItems[0].position = 1000000
            items = [draggedItems, newItems[0]]
         } else {
            const beforePosition = newItems[length - 3].position
            draggedItems.position = 0
            newItems[length - 2].position = (beforePosition + 0) / 2
            items = [draggedItems, newItems[length - 2]]
         }
      }

      //check for top and bottom position
      if (
         newItems[0].position !== 1000000 &&
         newItems[length - 1].position !== 0
      ) {
         console.log('case 1')
         newItems[0].position = 1000000
         newItems[length - 1].position = 0
      }
      //check for top position
      else if (newItems[0].position !== 1000000) {
         console.log('case 2')
         newItems[0].position = 1000000
         items = [...items, newItems[0]]
      }
      //check for bottom position
      else if (newItems[length - 1].position !== 0) {
         console.log('case 3')
         newItems[length - 1].position = 0
         items = [...items, newItems[length - 1]]
      }

      //create a new data
      console.log(items)
      if (items.length > 0) {
         priorityMutation({
            variables: {
               arg: {
                  tablename,
                  schemaname,
                  data1: items,
               },
            },
         })
      }

      const newData = {
         ...data,
         items: newItems,
      }

      //update state
      setData(newData)
   }
   return (
      <div style={{ cursor: `${isDefaultDrag ? 'grabbing' : 'move'}` }}>
         <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
               droppableId={droppableId}
               direction={direction || 'vertical'}
            >
               {provided => (
                  <div
                     {...provided.droppableProps}
                     style={{
                        display: `${
                           direction === 'horizontal' ? 'flex' : 'block'
                        }`,
                        cursor: `${isDefaultDrag ? 'grabbing' : 'move'}`,
                     }}
                     ref={provided.innerRef}
                  >
                     {children.map((item, index) => (
                        <Draggable
                           key={index}
                           draggableId={'' + index}
                           index={index}
                        >
                           {(provided, snapshot) =>
                              isDefaultDrag ? (
                                 <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                 >
                                    {item}
                                 </div>
                              ) : (
                                 <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    style={getItemStyle(
                                       provided.draggableProps.style,
                                       snapshot,
                                       index,
                                       children.length
                                    )}
                                 >
                                    <div
                                       style={{
                                          cursor: 'default',
                                       }}
                                    >
                                       <div
                                          {...provided.dragHandleProps}
                                          style={customDragStyle}
                                       >
                                          {index + 1}
                                       </div>
                                       <div
                                          style={{
                                             display: 'inline-block',
                                             cursor: 'default',
                                          }}
                                       >
                                          {item}
                                       </div>
                                    </div>
                                 </div>
                              )
                           }
                        </Draggable>
                     ))}
                     {provided.placeholder}
                  </div>
               )}
            </Droppable>
         </DragDropContext>
      </div>
   )
}
