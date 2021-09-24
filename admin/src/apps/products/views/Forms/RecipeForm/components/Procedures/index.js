import React from 'react'
import { useMutation } from '@apollo/react-hooks'
import {
   ButtonTile,
   Flex,
   IconButton,
   Spacer,
   Text,
   Tunnel,
   Tunnels,
   useTunnel,
   Form,
   ComboButton,
} from '@dailykit/ui'
import { toast } from 'react-toastify'
import { DragNDrop, Tooltip } from '../../../../../../../shared/components'
import { logger } from '../../../../../../../shared/utils'
import { EditIcon } from '../../../../../assets/icons'
import {
   INSTRUCTION_SET,
   INSTRUCTION_STEP,
   UPDATE_RECIPE,
} from '../../../../../graphql'
import { ProceduresTunnel, StepPhotoTunnel } from '../../tunnels'
import { Container, ContainerAction } from '../styled'
import { Image, InstructionSetContainer, ImageWrapper } from './styled'
import { DeleteIcon } from '../../../../../../../shared/assets/icons'
import { useDnd } from '../../../../../../../shared/components/DragNDrop/useDnd'

const Procedures = ({ state }) => {
   const { initiatePriority } = useDnd()

   React.useEffect(() => {
      if (state.instructionSets?.length) {
         initiatePriority({
            tablename: 'instructionSet',
            schemaname: 'instructions',
            data: state.instructionSets,
         })
         state.instructionSets.forEach(set => {
            if (set.instructionSteps.length) {
               initiatePriority({
                  tablename: 'instructionStep',
                  schemaname: 'instructions',
                  data: set.instructionSteps,
               })
            }
         })
      }
   }, [state.instructionSets])

   // Mutation
   const [updateRecipe] = useMutation(UPDATE_RECIPE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createInstructionSet] = useMutation(INSTRUCTION_SET.CREATE, {
      onCompleted: () => {
         toast.success('Instruction set added!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const addInstructionSet = () => {
      createInstructionSet({
         variables: {
            object: {
               simpleRecipeId: state.id,
            },
         },
      })
   }

   return (
      <Flex maxWidth="1280px" margin="0 auto">
         <Flex container alignItems="center" justifyContent="flex-end">
            <Form.Checkbox
               name="showProcedures"
               value={state.showProcedures}
               onChange={() =>
                  updateRecipe({
                     variables: {
                        id: state.id,
                        set: {
                           showProcedures: !state.showProcedures,
                        },
                     },
                  })
               }
            >
               <Flex container alignItems="center">
                  Show Cooking Steps on Store
                  <Tooltip identifier="recipe_show_procedures" />
               </Flex>
            </Form.Checkbox>
         </Flex>
         <Spacer size="16px" />
         {state.instructionSets?.length && (
            <DragNDrop
               list={state.instructionSets}
               droppableId="simpleRecipeInstructionSetsDroppableId"
               tablename="instructionSet"
               schemaname="instructions"
            >
               {state.instructionSets.map(({ id, title, instructionSteps }) => (
                  <InstructionSet
                     key={id}
                     id={id}
                     title={title}
                     steps={instructionSteps}
                  />
               ))}
            </DragNDrop>
         )}
         <ButtonTile
            type="secondary"
            text="Add Procedure"
            onClick={addInstructionSet}
         />
      </Flex>
   )
}

export default Procedures

const InstructionSet = ({ id, title, steps }) => {
   const [history, setHistory] = React.useState({
      title,
   })
   const [text, setText] = React.useState(title)

   // Mutation
   const [updateInstructionSet] = useMutation(INSTRUCTION_SET.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         setText(history.title)
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [deleteInstructionSet] = useMutation(INSTRUCTION_SET.DELETE, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [createInstructionStep] = useMutation(INSTRUCTION_STEP.CREATE, {
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateTitle = () => {
      updateInstructionSet({
         variables: {
            id,
            set: {
               title: text,
            },
         },
      })
   }

   const addInstructionStep = () => {
      createInstructionStep({
         variables: {
            object: {
               instructionSetId: id,
            },
         },
      })
   }

   const handleDelete = () => {
      const isConfirmed = window.confirm(
         'Are you sure you want to delete this procedure?'
      )
      if (isConfirmed) {
         deleteInstructionSet({
            variables: {
               id,
            },
         })
      }
   }

   React.useEffect(() => {
      setHistory({ title })
   }, [title])

   return (
      <InstructionSetContainer>
         <Flex container maxWidth="400px" margin="-20px 0 0 -8px">
            <Form.Text
               name={`instruction-set-${id}`}
               value={text}
               placeholder="Procedure Title"
               onChange={e => setText(e.target.value)}
               onBlur={updateTitle}
            />
            <Spacer xAxis size="16px" />
            <IconButton onClick={handleDelete} style={{ background: 'hover' }}>
               <DeleteIcon />
            </IconButton>
         </Flex>
         <Spacer size="16px" />
         <Flex padding="0 16px">
            <DragNDrop
               list={steps}
               droppableId="simpleRecipeInstructionSetStepsDroppableId"
               tablename="instructionStep"
               schemaname="instructions"
            >
               {steps.map(({ id, title, description, assets, isVisible }) => (
                  <InstructionStep
                     key={id}
                     id={id}
                     title={title}
                     description={description}
                     assets={assets}
                     isVisible={isVisible}
                  />
               ))}
            </DragNDrop>
            <ButtonTile
               type="secondary"
               text="Add Procedure Step"
               onClick={addInstructionStep}
            />
         </Flex>
         <Spacer size="16px" />
      </InstructionSetContainer>
   )
}

const InstructionStep = ({ id, title, description, assets, isVisible }) => {
   const [tunnels, openTunnel, closeTunnel] = useTunnel(1)
   const [history, setHistory] = React.useState({
      title,
      description,
      isVisible,
   })

   const [text, setText] = React.useState(title)
   const [desc, setDesc] = React.useState(description)
   const [visibility, setVisibility] = React.useState(isVisible)

   // Mutation
   const [updateInstructionStep] = useMutation(INSTRUCTION_STEP.UPDATE, {
      onCompleted: () => {
         toast.success('Updated!')
      },
      onError: error => {
         setText(history.title)
         setDesc(history.description)
         setDesc(history.isVisible)
         toast.error('Something went wrong!')
         logger(error)
      },
   })
   const [deleteInstructionStep] = useMutation(INSTRUCTION_STEP.DELETE, {
      onCompleted: () => {
         toast.success('Deleted!')
      },
      onError: error => {
         toast.error('Something went wrong!')
         logger(error)
      },
   })

   const updateFields = () => {
      updateInstructionStep({
         variables: {
            id,
            set: {
               title: text,
               description: desc,
            },
         },
      })
   }

   const updateVisibility = val => {
      setVisibility(val)
      updateInstructionStep({
         variables: {
            id,
            set: {
               isVisible: val,
            },
         },
      })
   }

   const removeImage = () => {
      updateInstructionStep({
         variables: {
            id,
            set: {
               assets: {
                  images: [],
                  videos: [],
               },
            },
         },
      })
   }

   const handleDelete = () => {
      const isConfirmed = window.confirm(
         'Are you sure you want to delete this step?'
      )
      if (isConfirmed) {
         deleteInstructionStep({
            variables: {
               id,
            },
         })
      }
   }

   React.useEffect(() => {
      setHistory({ title, description, isVisible })
   }, [title, description, isVisible])

   return (
      <Flex>
         <Tunnels tunnels={tunnels}>
            <Tunnel layer={1}>
               <StepPhotoTunnel stepId={id} closeTunnel={closeTunnel} />
            </Tunnel>
         </Tunnels>
         <Flex container maxWidth="400px">
            <Form.Text
               name={`instruction-step-${id}`}
               value={text}
               placeholder="Step Title"
               onChange={e => setText(e.target.value)}
               onBlur={updateFields}
            />
            <Spacer xAxis size="16px" />
            <Form.Toggle
               name={`instruction-visibility-${id}`}
               onChange={() => updateVisibility(!visibility)}
               value={visibility}
            >
               Visibility
            </Form.Toggle>
            <Spacer xAxis size="16px" />
            <IconButton onClick={handleDelete} style={{ background: 'none' }}>
               <DeleteIcon />
            </IconButton>
         </Flex>
         <Spacer size="16px" />
         <Flex maxWidth="400px">
            {assets.images.length ? (
               <ImageWrapper>
                  <img
                     alt={assets.images[0].title}
                     src={assets.images[0].url}
                  />
                  <Flex
                     container
                     flexDirection="column"
                     style={{ left: '100%' }}
                  >
                     <IconButton
                        onClick={() => openTunnel(1)}
                        style={{ background: 'none' }}
                     >
                        <EditIcon />
                     </IconButton>
                     <Spacer xAxis size="8px" />
                     <IconButton
                        onClick={removeImage}
                        style={{ background: 'none' }}
                     >
                        <DeleteIcon />
                     </IconButton>
                  </Flex>
               </ImageWrapper>
            ) : (
               <ButtonTile
                  type="primary"
                  size="sm"
                  text="Add Photo for this Step"
                  helper="upto 1MB - only JPG, PNG allowed"
                  onClick={() => openTunnel(1)}
               />
            )}
         </Flex>
         <Spacer size="16px" />
         <Form.TextArea
            name={`instruction-desc-${id}`}
            value={desc}
            placeholder="Step Description"
            onChange={e => setDesc(e.target.value)}
            onBlur={updateFields}
         />
         <Spacer size="16px" />
      </Flex>
   )
}
