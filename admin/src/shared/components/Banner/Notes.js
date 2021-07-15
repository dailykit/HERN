import React from 'react'
import { Link, useHistory } from 'react-router-dom'
import { PlayIcon } from '../../assets/icons'
import { Glass, Plate, Plant1, Plant2 } from './assets/illustrations'
import ActionButtons from './components/ActionButtons'
import Styled, { Wrapper } from './styles.js'

const Notes = ({ data }) => {
   const [isOpen, setIsOpen] = React.useState(true)

   return (
      <Wrapper>
         <ActionButtons isMinimized={isOpen} setIsMinimized={setIsOpen} />

         {isOpen && (
            <Styled.MainWrapper>
               <Styled.Wrapper>
                  <Styled.Header>Notes</Styled.Header>
                  {data.data.map((note, index) => (
                     <Note note={note} key={index} />
                  ))}
                  <Styled.Decorator>
                     <Plate className="plate" />
                     <Glass className="glass" />
                     <Plant1 className="plant1" />
                     <Plant2 className="plant2" />
                  </Styled.Decorator>
               </Styled.Wrapper>
            </Styled.MainWrapper>
         )}
      </Wrapper>
   )
}

export default Notes

const Note = ({ note }) => {
   const [isGifOpen, setIsGifOpen] = React.useState(false)
   const history = useHistory()

   return (
      <Styled.Item noMargin={!!!note.pointCount}>
         <Styled.Count>
            {note.pointCount && `${note.pointCount}. `}
         </Styled.Count>
         <Styled.Text>
            {note.description}
            {note.tutorialLink && (
               <Styled.TutorialLink
                  onClick={() => history.push(note.tutorialLink)}
               >
                  Watch Tutorial
               </Styled.TutorialLink>
            )}
         </Styled.Text>
         {note.gif && (
            <>
               <Styled.Button onClick={() => setIsGifOpen(true)}>
                  <PlayIcon />
                  <span>PLAY</span>
               </Styled.Button>

               {isGifOpen && (
                  <Styled.Image onClick={() => setIsGifOpen(false)}>
                     <div>
                        <img src={note.gif} alt="play" />
                     </div>
                  </Styled.Image>
               )}
            </>
         )}
      </Styled.Item>
   )
}
