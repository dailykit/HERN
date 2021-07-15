import React from 'react'
import { SearchIcon } from '@dailykit/ui'
import { SearchBox, SearchWrapper } from './styled'
import { useOnClickOutside } from '@dailykit/ui'

const Search = ({ setOpen }) => {
   const [search, setSearch] = React.useState('')
   const searchRef = React.useRef()

   useOnClickOutside(searchRef, () => setOpen(null))
   return (
      <SearchWrapper>
         <SearchBox ref={searchRef}>
            <span>
               <SearchIcon color="#919699" size={25} />
            </span>
            <input
               type="text"
               placeholder={`type what you're looking for`}
               value={search}
               onChange={e => setSearch(e.target.value)}
            />
         </SearchBox>
      </SearchWrapper>
   )
}

export default Search
