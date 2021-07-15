import React from 'react'
import { useSubscription } from '@apollo/react-hooks'
import { Avatar, IconButton, Spinner } from '@dailykit/ui'
import {
   ChevronRight,
   EditIcon,
   LogoutIcon,
   MailIcon,
   PhoneIcon,
} from '../../../../../assets/icons'
import { useAuth, useTabs } from '../../../../../providers'
import BackButton from '../BackButton'
import { Styled } from './styled'
import { USERS } from './userQuery'
import LanguageSelect from './LanguageSelect'

const Account = ({ setIsMenuOpen, setOpen, lang, setLang }) => {
   const [isVisible, setIsVisible] = React.useState(true)
   const { user, logout } = useAuth()
   const { addTab } = useTabs()

   const fullName = (f, l) => {
      let name = ''
      if (f) name += f
      if (l) name += ` ${l}`
      return name
   }

   const { loading, data: { users = [] } = {} } = useSubscription(USERS, {
      skip: !user?.email,
      variables: {
         where: {
            email: { _eq: user?.email },
         },
      },
   })
   const getFullLanguageName = lang => {
      if (lang === 'en') return 'English'
      if (lang === 'fr') return 'Français'
      if (lang === 'es') return 'Español'
      if (lang === 'he') return 'עברית'
      if (lang === 'it') return 'Italiano'
      if (lang === 'de') return 'Deutsche'
      if (lang === 'hi') return 'हिन्दी'
   }

   if (loading)
      return (
         <Styled.Wrapper spinner>
            <Spinner loading={true} />
         </Styled.Wrapper>
      )

   return (
      <Styled.Wrapper>
         {isVisible ? (
            <>
               <BackButton setIsMenuOpen={setIsMenuOpen} setOpen={setOpen} />
               {users.length > 0 && users[0] && (
                  <Styled.InnerWrapper>
                     <Styled.EditSection>
                        <span>Account</span>
                        <IconButton
                           type="ghost"
                           size="sm"
                           onClick={() => {
                              setIsMenuOpen(false)
                              setOpen(null)
                              addTab(
                                 `${fullName(
                                    users[0]?.firstName,
                                    users[0]?.lastName
                                 )}`,
                                 `/settings/users/${users[0]?.id}`
                              )
                           }}
                        >
                           <EditIcon size={20} color="#919699" />
                        </IconButton>
                     </Styled.EditSection>
                     <Styled.ImageSection>
                        <div>
                           <Avatar
                              style={{
                                 height: '60px',
                                 width: '60px',
                                 margin: '10px',
                              }}
                              url=""
                              title={fullName(
                                 users[0]?.firstName,
                                 users[0]?.lastName
                              )}
                           />
                        </div>
                        <div>
                           <span>Admin</span>
                           <span>{user.name}</span>
                           <span>Designation</span>
                        </div>
                     </Styled.ImageSection>
                     <Styled.Contact>
                        <span>
                           <MailIcon size={12} />
                        </span>
                        <span>{user.email}</span>
                     </Styled.Contact>
                     <Styled.Contact>
                        <span>
                           <PhoneIcon size={12} />
                        </span>
                        <span>{users[0]?.phoneNo}</span>
                     </Styled.Contact>
                     <Styled.Language
                        onClick={() => {
                           setIsVisible(false)
                        }}
                     >
                        <span>Language: </span>
                        <span>
                           {getFullLanguageName(lang)}
                           <ChevronRight color="#64696E" size="20px" />
                        </span>
                     </Styled.Language>
                     <Styled.Logout>
                        <button onClick={logout}>
                           <LogoutIcon />
                           <span>Logout</span>
                        </button>
                     </Styled.Logout>
                  </Styled.InnerWrapper>
               )}
            </>
         ) : (
            <LanguageSelect
               setLang={setLang}
               setIsVisible={setIsVisible}
               getFullLanguageName={getFullLanguageName}
               lang={lang}
            />
         )}
      </Styled.Wrapper>
   )
}

export default Account
