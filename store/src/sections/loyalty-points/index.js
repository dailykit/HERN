import React from 'react'

import { useConfig } from '../../lib'
import { useTranslation, useUser } from '../../context'
import { ProfileSidebar, Form } from '../../components'
import * as moment from 'moment'
import { Right } from '../../components/tunnel'
import {
   LoyaltyPointsIllustration,
   LoyaltyPointsIllustrationNoTrx,
} from '../../assets/icons'
import { useWindowSize } from '../../utils'

export const LoyaltyPoints = () => {
   return (
      <main className="hern-account-loyalty-points__main">
         <ProfileSidebar />
         <Content />
      </main>
   )
}

const Content = () => {
   const { user } = useUser()
   const { configOf, settings } = useConfig()
   const { t, dynamicTrans, locale } = useTranslation()
   const theme = configOf('theme-color', 'Visual')
   const { width, height } = useWindowSize()

   const loyaltyPointConfig = configOf('Loyalty Points', 'rewards')
   const isLoyaltyPointsAvailable = React.useMemo(() => {
      return loyaltyPointConfig?.['Loyalty Points']?.IsLoyaltyPointsAvailable
         ?.value
   }, [loyaltyPointConfig])

   const currentLang = React.useMemo(() => locale, [locale])

   React.useEffect(() => {
      const languageTags = document.querySelectorAll(
         '[data-translation="true"]'
      )
      dynamicTrans(languageTags)
   }, [currentLang])

   return !isLoyaltyPointsAvailable ? (
      <section className="hern-account-loyalty-points">
         <header className="hern-account-loyalty-points__header">
            <h2 className="hern-account-loyalty-points__not_available_header">
               {t('This scheme is not available right now')}
            </h2>
         </header>
      </section>
   ) : (
      <section className="hern-account-loyalty-points">
         <header className="hern-account-loyalty-points__header">
            <h2
               className="hern-account-loyalty-points__header__title"
               style={{
                  color: `${theme.accent ? theme.accent : '#333333'}`,
               }}
            >
               <span data-translation="true">{t('My Loyalty Points')}</span>
            </h2>
         </header>
         {width > 767 ? (
            <div className="hern-account-loyalty-points-available">
               {/* <LoyaltyPointsIllustration height={177} width={227} /> */}
               <p className="hern-account-loyalty-points_header_subtitle">
                  <p className="hern-account-loyalty-points-your-available">
                     {t('Loyalty Points:')}
                  </p>
                  <p className="hern-account-loyalty-points-value">
                     <LoyaltyPointsCoins />
                     {user?.loyaltyPoint?.points}
                  </p>
               </p>
            </div>
         ) : (
            <div className="hern-account-loyalty-points-available">
               {/* <LoyaltyPointsIllustration height={110} width={130} /> */}
               <p className="hern-account-loyalty-points_header_subtitle">
                  <p className="hern-account-loyalty-points-your-available">
                     {t('Loyalty Points:')}
                  </p>
                  <p className="hern-account-loyalty-points-value">
                     <LoyaltyPointsCoins />
                     {user?.loyaltyPoint?.points}
                  </p>
               </p>
            </div>
         )}

         {!!user.loyaltyPoint ? (
            <>
               <Form.Label
                  style={{
                     position: 'relative',
                     bottom: '-48px',
                     color: 'black',
                     fontSize: '20px',
                     fontWeight: '600',
                     color: '#333333',
                  }}
               >
                  {t('Transction History')}
               </Form.Label>
               {user.loyaltyPoint.loyaltyPointTransactions.length > 0 ? (
                  <table className="hern-account-loyalty-points__table">
                     <thead>
                        <tr>
                           <th>{t('Sr. No.')}</th>
                           <th>{t('Type')}</th>
                           <th>{t('Points')}</th>
                           <th>{t('Created At')}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {user.loyaltyPoint.loyaltyPointTransactions.map(
                           (txn, index) => (
                              <tr key={txn.id}>
                                 <td className="hern-account-loyalty-points__table__cell">
                                    {index + 1}
                                 </td>
                                 <td
                                    className="hern-account-loyalty-points__table__cell"
                                    title={txn.type}
                                 >
                                    {txn.type}
                                 </td>
                                 <td className="hern-account-loyalty-points__table__cell">
                                    {txn.points}
                                 </td>
                                 <td className="hern-account-loyalty-points__table__cell">
                                    {moment(txn.created_at).format(
                                       'MMMM Do YYYY, h:mm:ss a'
                                    )}
                                 </td>
                              </tr>
                           )
                        )}
                     </tbody>
                  </table>
               ) : (
                  <div
                     className="hern-account-loyalty-points-illustration-no-trx"
                     //    style={{
                     //       position: 'relative',
                     //       top: '100px',
                     //       left: '320px',
                     //    }}
                  >
                     {/* <LoyaltyPointsIllustrationNoTrx /> */}
                     {/* {t('not avaiable')} */}
                     <NoHistoryIllustration />

                     <p className="hern-account-loyalty-points-title-no-trx">
                        Oops! No transaction history is available yet
                     </p>
                  </div>
               )}
            </>
         ) : (
            <div></div>
         )}
      </section>
   )
}

const NoHistoryIllustration = () => {
   return (
      <svg
         width="201"
         height="200"
         viewBox="0 0 201 200"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M34.1766 74.2504C33.7329 74.2435 33.2925 74.3291 32.8831 74.5018C32.4736 74.6746 32.1038 74.9308 31.7971 75.2548C31.4904 75.5788 31.2535 75.9635 31.1018 76.3848C30.95 76.8061 30.8868 77.2546 30.9162 77.702L30.9162 77.7023L36.54 163.49L51.2529 109.761C51.4314 109.109 52.0238 108.657 52.6997 108.657H163.762C164.227 108.657 164.666 108.873 164.95 109.241C165.234 109.609 165.331 110.087 165.214 110.537L159.999 130.487C159.789 131.288 158.97 131.768 158.168 131.559C157.367 131.349 156.887 130.53 157.096 129.728L161.82 111.657H53.8441L37.5935 171.001H140.664C142.255 170.984 143.798 170.445 145.058 169.466C146.335 168.474 147.25 167.085 147.66 165.514L147.661 165.512L152.379 147.557C152.589 146.756 153.409 146.277 154.211 146.487C155.012 146.698 155.491 147.518 155.28 148.319L150.563 166.272L150.562 166.274C149.986 168.481 148.698 170.437 146.899 171.835C145.34 173.047 143.472 173.78 141.52 173.959C141.406 173.987 141.287 174.001 141.165 174.001H140.68L140.61 174.002L140.606 174.002H35.6274C35.1597 174.002 34.7187 173.783 34.4349 173.412C34.381 173.341 34.3339 173.266 34.2939 173.189C34.2358 173.076 34.1915 172.955 34.1633 172.828C34.1452 172.746 34.1339 172.664 34.1295 172.581L27.9227 77.8989L27.9227 77.8986C27.8662 77.0396 27.9876 76.178 28.2793 75.3682C28.571 74.5583 29.0268 73.8174 29.6184 73.1925C30.21 72.5675 30.9245 72.0721 31.717 71.7377C32.5058 71.405 33.3546 71.2391 34.2104 71.2506H57.3526C58.6551 71.2452 59.9408 71.5442 61.1079 72.1237C62.2724 72.7018 63.2867 73.5432 64.0714 74.581L71.188 83.7194H141.165C141.993 83.7194 142.665 84.391 142.665 85.2194V97.6882C142.665 98.5167 141.993 99.1882 141.165 99.1882C140.337 99.1882 139.665 98.5167 139.665 97.6882V86.7194H70.4549C69.9923 86.7194 69.5556 86.506 69.2714 86.141L61.6976 76.4153L61.6833 76.3967C61.1775 75.7258 60.5237 75.183 59.7738 74.8107C59.024 74.4384 58.1985 74.2468 57.3626 74.2505L57.3558 74.2506H34.1997L34.1766 74.2504ZM99.1199 155.215C100.397 153.943 102.121 153.231 103.917 153.231C105.712 153.231 107.436 153.943 108.713 155.215C109.496 155.995 110.762 155.992 111.542 155.21C112.321 154.427 112.319 153.161 111.536 152.381C109.511 150.364 106.773 149.231 103.917 149.231C101.061 149.231 98.3221 150.364 96.297 152.381C95.5145 153.161 95.512 154.427 96.2915 155.21C97.0711 155.992 98.3374 155.995 99.1199 155.215ZM77.084 135.095C77.084 133.991 77.9794 133.095 79.084 133.095H85.2921C86.3966 133.095 87.2921 133.991 87.2921 135.095C87.2921 136.2 86.3966 137.095 85.2921 137.095H79.084C77.9794 137.095 77.084 136.2 77.084 135.095ZM122.541 133.095C121.436 133.095 120.541 133.991 120.541 135.095C120.541 136.2 121.436 137.095 122.541 137.095H128.749C129.853 137.095 130.749 136.2 130.749 135.095C130.749 133.991 129.853 133.095 128.749 133.095H122.541Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M170.52 81.8116C169.212 82.9122 166.615 81.0481 164.814 78.8458L164.815 78.8435C164.267 78.1424 163.806 77.378 163.436 76.5668C162.562 76.9112 161.656 77.1664 160.732 77.335C159.418 77.5835 158.073 77.6203 156.745 77.4464C155.018 77.143 154.57 76.4487 154.479 75.8767C154.386 75.304 154.587 74.5075 156.096 73.6545C157.275 73.0249 158.55 72.597 159.866 72.3868C161.336 72.0988 162.848 72.1017 164.315 72.3986L164.862 72.5863C166.396 73.2811 167.737 74.347 168.76 75.6892C169.647 76.7052 170.357 77.8643 170.864 79.1146C171.303 80.6738 170.932 81.4471 170.52 81.8114L170.52 81.8116ZM156.54 74.7802C155.689 75.2806 155.534 75.6249 155.557 75.668C155.578 75.7103 155.557 75.668 156.167 75.8772C156.371 75.9773 156.586 76.0512 156.811 76.098C158.013 76.274 159.238 76.2439 160.431 76.0065C161.237 75.8604 162.03 75.6495 162.799 75.3751L163.019 74.7286L163.019 74.7309C162.181 74.7202 161.343 74.7825 160.516 74.9164C159.21 74.632 157.864 74.5852 156.54 74.7802L156.54 74.7802ZM169.602 79.5473C169.14 78.4456 168.506 77.4255 167.723 76.5232C167.193 75.8584 166.592 75.2525 165.932 74.7192L165.723 75.3341C166.115 76.0371 166.575 76.7029 167.094 77.3187C169.065 79.6524 170.748 80.3024 170.984 80.1318C171.222 79.9597 169.842 80.4245 169.602 79.5473L169.602 79.5473Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M146.301 106.344C146.298 106.068 146.072 105.846 145.796 105.849C145.52 105.853 145.298 106.079 145.301 106.355L146.301 106.344ZM145.416 103.173C145.393 103.448 145.597 103.69 145.872 103.713C146.148 103.736 146.389 103.532 146.413 103.257L145.416 103.173ZM146.824 100.203C146.875 99.9319 146.696 99.6707 146.424 99.6201C146.153 99.5695 145.892 99.7485 145.841 100.02L146.824 100.203ZM146.585 96.925C146.506 97.1898 146.658 97.4679 146.922 97.5462C147.187 97.6245 147.465 97.4733 147.544 97.2085L146.585 96.925ZM148.57 94.3012C148.675 94.0459 148.554 93.7536 148.298 93.6484C148.043 93.5431 147.751 93.6648 147.645 93.9201L148.57 94.3012ZM149.008 91.0412C148.877 91.2846 148.969 91.5877 149.212 91.7182C149.455 91.8488 149.758 91.7574 149.889 91.5141L149.008 91.0412ZM151.481 88.8681C151.635 88.6387 151.573 88.3281 151.344 88.1745C151.114 88.0208 150.804 88.0823 150.65 88.3118L151.481 88.8681ZM152.543 85.7517C152.369 85.966 152.401 86.2809 152.615 86.455C152.83 86.6292 153.145 86.5967 153.319 86.3824L152.543 85.7517ZM155.372 84.0724C155.564 83.8741 155.559 83.5576 155.361 83.3654C155.162 83.1732 154.846 83.1782 154.654 83.3765L155.372 84.0724ZM156.96 81.1876C156.752 81.3693 156.731 81.6851 156.913 81.8931C157.094 82.1011 157.41 82.1225 157.618 81.9409L156.96 81.1876ZM160.031 80.002C160.253 79.838 160.301 79.525 160.137 79.3028C159.973 79.0806 159.66 79.0334 159.437 79.1974L160.031 80.002ZM162.076 77.4225C161.84 77.5657 161.764 77.8732 161.908 78.1093C162.051 78.3454 162.358 78.4207 162.594 78.2774L162.076 77.4225ZM146.354 107.894C146.324 107.37 146.307 106.853 146.301 106.344L145.301 106.355C145.307 106.88 145.325 107.411 145.356 107.951L146.354 107.894ZM146.413 103.257C146.501 102.204 146.641 101.186 146.824 100.203L145.841 100.02C145.652 101.036 145.508 102.087 145.416 103.173L146.413 103.257ZM147.544 97.2085C147.842 96.1982 148.187 95.2293 148.57 94.3012L147.645 93.9201C147.25 94.8791 146.893 95.8806 146.585 96.925L147.544 97.2085ZM149.889 91.5141C150.388 90.5835 150.923 89.7018 151.481 88.8681L150.65 88.3118C150.075 89.1711 149.523 90.0806 149.008 91.0412L149.889 91.5141ZM153.319 86.3824C153.994 85.5519 154.684 84.7823 155.372 84.0724L154.654 83.3765C153.947 84.1058 153.237 84.8971 152.543 85.7517L153.319 86.3824ZM157.618 81.9409C158.468 81.1987 159.284 80.5532 160.031 80.002L159.437 79.1974C158.671 79.7633 157.833 80.4259 156.96 81.1876L157.618 81.9409ZM162.594 78.2774C163.011 78.0245 163.344 77.8368 163.571 77.7131C163.685 77.6513 163.772 77.6054 163.83 77.5754C163.859 77.5603 163.881 77.5493 163.895 77.5421C163.902 77.5386 163.907 77.536 163.91 77.5344C163.912 77.5336 163.913 77.533 163.914 77.5327C163.914 77.5325 163.914 77.5324 163.914 77.5324C163.914 77.5324 163.914 77.5324 163.914 77.5324C163.914 77.5324 163.914 77.5324 163.914 77.5324C163.914 77.5324 163.914 77.5324 163.914 77.5324C163.914 77.5325 163.914 77.5325 163.693 77.084C163.472 76.6355 163.472 76.6355 163.472 76.6355C163.472 76.6355 163.472 76.6356 163.472 76.6356C163.472 76.6356 163.472 76.6356 163.472 76.6357C163.472 76.6357 163.471 76.6358 163.471 76.6359C163.471 76.6362 163.47 76.6364 163.47 76.6368C163.468 76.6374 163.466 76.6383 163.464 76.6395C163.459 76.6418 163.453 76.6452 163.444 76.6495C163.427 76.6581 163.402 76.6707 163.37 76.6873C163.306 76.7204 163.213 76.7696 163.093 76.8349C162.853 76.9655 162.507 77.1609 162.076 77.4225L162.594 78.2774Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M86.3095 106.424C86.3216 106.148 86.555 105.934 86.8309 105.947C87.1068 105.959 87.3206 106.192 87.3085 106.468L86.3095 106.424ZM87.3784 103.545C87.3773 103.821 87.1526 104.044 86.8765 104.043C86.6004 104.042 86.3774 103.817 86.3784 103.541L87.3784 103.545ZM86.3293 100.631C86.3189 100.355 86.5341 100.123 86.8101 100.112C87.086 100.102 87.3181 100.317 87.3286 100.593L86.3293 100.631ZM87.1564 97.6671C87.1784 97.9423 86.9732 98.1834 86.6979 98.2054C86.4227 98.2275 86.1816 98.0222 86.1596 97.747L87.1564 97.6671ZM85.8668 94.8704C85.8329 94.5963 86.0276 94.3467 86.3016 94.3128C86.5757 94.2789 86.8253 94.4736 86.8592 94.7477L85.8668 94.8704ZM86.4335 91.8314C86.4794 92.1037 86.2958 92.3617 86.0235 92.4076C85.7512 92.4535 85.4933 92.2699 85.4474 91.9976L86.4335 91.8314ZM84.9042 89.1586C84.8463 88.8886 85.0183 88.6228 85.2883 88.5649C85.5583 88.507 85.8241 88.679 85.882 88.949L84.9042 89.1586ZM85.2041 86.0963C85.2739 86.3635 85.1139 86.6367 84.8467 86.7064C84.5795 86.7762 84.3063 86.6162 84.2366 86.349L85.2041 86.0963ZM83.4405 83.5572C83.3588 83.2934 83.5065 83.0134 83.7703 82.9318C84.0341 82.8502 84.3142 82.9978 84.3958 83.2616L83.4405 83.5572ZM83.4651 80.4736C83.5583 80.7335 83.4231 81.0198 83.1632 81.113C82.9032 81.2062 82.6169 81.071 82.5237 80.8111L83.4651 80.4736ZM81.489 78.1127C81.3845 77.8571 81.5071 77.5652 81.7627 77.4608C82.0183 77.3563 82.3102 77.4788 82.4147 77.7344L81.489 78.1127ZM81.2445 75.0391C81.3599 75.29 81.25 75.5869 80.9992 75.7023C80.7483 75.8177 80.4514 75.7079 80.336 75.457L81.2445 75.0391ZM79.068 72.8483C78.9421 72.6026 79.0392 72.3013 79.285 72.1753C79.5307 72.0494 79.832 72.1465 79.958 72.3923L79.068 72.8483ZM78.5638 69.8057C78.6998 70.0461 78.6152 70.3511 78.3749 70.4872C78.1346 70.6232 77.8295 70.5386 77.6935 70.2983L78.5638 69.8057ZM76.2172 67.8088C76.0716 67.5741 76.1438 67.2659 76.3784 67.1203C76.6131 66.9747 76.9213 67.0469 77.0669 67.2815L76.2172 67.8088ZM75.4726 64.8216C75.6273 65.0504 75.5672 65.3612 75.3385 65.5159C75.1097 65.6706 74.7989 65.6105 74.6442 65.3818L75.4726 64.8216ZM72.9719 63.008C72.8086 62.7853 72.8568 62.4724 73.0794 62.3091C73.3021 62.1458 73.615 62.194 73.7783 62.4167L72.9719 63.008ZM71.9967 60.0793C72.1681 60.2958 72.1316 60.6103 71.9151 60.7817C71.6986 60.9531 71.3841 60.9165 71.2127 60.7L71.9967 60.0793ZM69.3717 58.4585C69.1927 58.2482 69.218 57.9326 69.4283 57.7536C69.6385 57.5746 69.9541 57.5999 70.1331 57.8102L69.3717 58.4585ZM68.1926 55.6096C68.3788 55.8135 68.3643 56.1298 68.1604 56.3159C67.9564 56.5021 67.6402 56.4877 67.454 56.2837L68.1926 55.6096ZM65.4643 54.176C65.2715 53.9784 65.2753 53.6618 65.473 53.469C65.6706 53.2761 65.9872 53.28 66.18 53.4776L65.4643 54.176ZM64.0999 51.414C64.299 51.6053 64.3054 51.9218 64.1141 52.121C63.9228 52.3201 63.6062 52.3264 63.4071 52.1351L64.0999 51.414ZM61.286 50.1605C61.081 49.9755 61.0647 49.6593 61.2497 49.4543C61.4347 49.2493 61.7509 49.2331 61.9559 49.418L61.286 50.1605ZM59.7468 47.4852C59.9574 47.6638 59.9832 47.9794 59.8045 48.1899C59.6259 48.4005 59.3103 48.4263 59.0998 48.2477L59.7468 47.4852ZM56.8581 46.4022C56.6423 46.2298 56.6071 45.9152 56.7795 45.6994C56.9518 45.4837 57.2664 45.4485 57.4822 45.6208L56.8581 46.4022ZM55.1661 43.8254C55.3867 43.9914 55.431 44.3049 55.265 44.5255C55.099 44.7462 54.7856 44.7905 54.5649 44.6245L55.1661 43.8254ZM52.2204 42.9129C51.995 42.7533 51.9417 42.4412 52.1014 42.2159C52.261 41.9905 52.573 41.9373 52.7984 42.0969L52.2204 42.9129ZM50.373 40.4305C50.6028 40.5836 50.665 40.894 50.5119 41.1239C50.3588 41.3537 50.0484 41.4159 49.8186 41.2628L50.373 40.4305ZM47.3718 39.6832C47.1377 39.5368 47.0665 39.2283 47.2129 38.9942C47.3593 38.76 47.6678 38.6889 47.9019 38.8353L47.3718 39.6832ZM45.4044 37.3245C45.6428 37.4639 45.7231 37.7701 45.5837 38.0085C45.4443 38.2469 45.1381 38.3272 44.8997 38.1878L45.4044 37.3245ZM42.3566 36.7551C42.1138 36.6235 42.0236 36.3201 42.1551 36.0773C42.2866 35.8345 42.59 35.7442 42.8329 35.8758L42.3566 36.7551ZM40.2433 34.5355C40.4912 34.6572 40.5934 34.9568 40.4717 35.2047C40.35 35.4525 40.0504 35.5548 39.8025 35.4331L40.2433 34.5355ZM86.2306 107.89C86.2619 107.399 86.2882 106.91 86.3095 106.424L87.3085 106.468C87.287 106.961 87.2603 107.456 87.2286 107.954L86.2306 107.89ZM86.3784 103.541C86.3821 102.559 86.3655 101.59 86.3293 100.631L87.3286 100.593C87.3653 101.566 87.3822 102.549 87.3784 103.545L86.3784 103.541ZM86.1596 97.747C86.0818 96.776 85.9839 95.8172 85.8668 94.8704L86.8592 94.7477C86.9781 95.7086 87.0774 96.6818 87.1564 97.6671L86.1596 97.747ZM85.4474 91.9976C85.2857 91.0383 85.1043 90.092 84.9042 89.1586L85.882 88.949C86.0851 89.8967 86.2693 90.8575 86.4335 91.8314L85.4474 91.9976ZM84.2366 86.349C83.9899 85.4046 83.7241 84.474 83.4405 83.5572L84.3958 83.2616C84.6838 84.1925 84.9536 85.1373 85.2041 86.0963L84.2366 86.349ZM82.5237 80.8111C82.1961 79.8972 81.8507 78.9978 81.489 78.1127L82.4147 77.7344C82.7818 78.6328 83.1324 79.5458 83.4651 80.4736L82.5237 80.8111ZM80.336 75.457C79.929 74.5722 79.5058 73.7027 79.068 72.8483L79.958 72.3923C80.4021 73.259 80.8314 74.1412 81.2445 75.0391L80.336 75.457ZM77.6935 70.2983C77.2149 69.4525 76.7222 68.6227 76.2172 67.8088L77.0669 67.2815C77.5789 68.1067 78.0784 68.948 78.5638 69.8057L77.6935 70.2983ZM74.6442 65.3818C74.0978 64.5737 73.5398 63.7825 72.9719 63.008L73.7783 62.4167C74.3536 63.2012 74.9189 64.0028 75.4726 64.8216L74.6442 65.3818ZM71.2127 60.7C70.6072 59.9351 69.9929 59.188 69.3717 58.4585L70.1331 57.8102C70.7618 58.5485 71.3836 59.3048 71.9967 60.0793L71.2127 60.7ZM67.454 56.2837C66.7954 55.5622 66.1315 54.8597 65.4643 54.176L66.18 53.4776C66.8547 54.169 67.5263 54.8796 68.1926 55.6096L67.454 56.2837ZM63.4071 52.1351C62.7004 51.4562 61.9925 50.798 61.286 50.1605L61.9559 49.418C62.67 50.0624 63.3855 50.7276 64.0999 51.414L63.4071 52.1351ZM59.0998 48.2477C58.3471 47.6089 57.5988 46.9938 56.8581 46.4022L57.4822 45.6208C58.2304 46.2185 58.9863 46.8399 59.7468 47.4852L59.0998 48.2477ZM54.5649 44.6245C53.769 44.0258 52.9861 43.4553 52.2204 42.9129L52.7984 42.0969C53.5716 42.6446 54.3622 43.2207 55.1661 43.8254L54.5649 44.6245ZM49.8186 41.2628C48.9713 40.6983 48.1535 40.1719 47.3718 39.6832L47.9019 38.8353C48.6915 39.3289 49.5174 39.8605 50.373 40.4305L49.8186 41.2628ZM44.8997 38.1878C43.968 37.6431 43.115 37.1658 42.3566 36.7551L42.8329 35.8758C43.6003 36.2915 44.4628 36.774 45.4044 37.3245L44.8997 38.1878ZM39.8025 35.4331C39.384 35.2276 39.0594 35.0745 38.8402 34.9731C38.7306 34.9224 38.6473 34.8847 38.5919 34.8598C38.5641 34.8473 38.5433 34.838 38.5297 34.832C38.5229 34.829 38.5178 34.8268 38.5146 34.8253C38.513 34.8246 38.5118 34.8241 38.5111 34.8238C38.5107 34.8236 38.5105 34.8235 38.5103 34.8235C38.5103 34.8234 38.5102 34.8234 38.5102 34.8234C38.5102 34.8234 38.5102 34.8234 38.5102 34.8234C38.5102 34.8234 38.5103 34.8234 38.5103 34.8234C38.5103 34.8234 38.5103 34.8235 38.7104 34.3652C38.9105 33.907 38.9105 33.907 38.9105 33.907C38.9105 33.907 38.9106 33.9071 38.9106 33.9071C38.9106 33.9071 38.9107 33.9071 38.9107 33.9071C38.9108 33.9072 38.911 33.9072 38.9111 33.9073C38.9114 33.9074 38.9119 33.9076 38.9124 33.9079C38.9136 33.9084 38.9151 33.909 38.9171 33.9099C38.9212 33.9117 38.927 33.9143 38.9346 33.9177C38.9499 33.9244 38.9723 33.9344 39.0016 33.9476C39.0604 33.974 39.1469 34.0132 39.2599 34.0655C39.4859 34.17 39.8175 34.3264 40.2433 34.5355L39.8025 35.4331Z"
            fill="#333333"
            fill-opacity="0.6"
         />
         <path
            d="M47.6329 32.0907C47.5562 33.803 44.4622 34.449 41.6157 34.3384L41.6178 34.3372C40.7049 34.287 39.7962 34.145 38.911 33.9168C38.5693 34.8036 38.1352 35.6543 37.6186 36.4526C36.9094 37.5923 36.0286 38.6145 35.0041 39.4769C33.643 40.5345 32.8018 40.4125 32.3364 40.1224C31.869 39.8335 31.3884 39.0881 31.7829 37.3941C32.1558 36.1078 32.7166 34.8841 33.4465 33.7628C34.2076 32.4753 35.2175 31.3526 36.4159 30.4627L37.011 30.1366C38.56 29.4695 40.2473 29.2012 41.9263 29.3496C43.2668 29.4069 44.5932 29.6617 45.8596 30.1093C47.4218 30.8478 47.7387 31.6449 47.6327 32.0907L47.6329 32.0907ZM33.0409 37.7163C32.8167 38.6553 32.9961 38.9854 33.0411 38.9987C33.0861 39.012 33.1909 38.9167 33.5779 38.7046L34.1749 38.3775C35.1145 37.6023 35.9182 36.6766 36.5546 35.6364C37.0048 34.9396 37.3803 34.1997 37.6783 33.4263L37.4501 33.0063C36.8637 33.6313 36.3385 34.3095 35.8786 35.0333C34.803 35.8017 33.8654 36.7493 33.1056 37.8354L33.0409 37.7163ZM45.4198 31.3618C44.2988 30.9483 43.12 30.7265 41.9272 30.7076C41.0938 30.6545 40.2538 30.6836 39.4221 30.7976L39.732 31.3681C40.5129 31.5531 41.3123 31.6628 42.1152 31.6947C45.1481 31.8605 46.7901 31.0367 46.8084 30.7175C46.8277 30.3951 46.2539 31.759 45.4198 31.3618L45.4198 31.3618Z"
            fill="#333333"
            fill-opacity="0.6"
         />
      </svg>
   )
}

const LoyaltyPointsCoins = () => {
   return (
      <svg
         width="25"
         height="25"
         viewBox="0 0 25 25"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M14.4103 1.55664C16.3317 1.55572 18.1953 2.21372 19.6904 3.42089C21.1854 4.62806 22.2215 6.31143 22.6259 8.19025C23.0302 10.0691 22.7783 12.0297 21.9123 13.7453C21.0462 15.4608 19.6183 16.8276 17.8668 17.6175C17.3069 18.8556 16.4551 19.9394 15.3845 20.7759C14.3139 21.6124 13.0564 22.1767 11.7199 22.4204C10.3834 22.6641 9.00776 22.5799 7.71093 22.175C6.41409 21.7702 5.23479 21.0567 4.27416 20.0958C3.31353 19.135 2.60024 17.9554 2.19547 16.6583C1.79069 15.3611 1.70651 13.9851 1.95014 12.6483C2.19377 11.3114 2.75794 10.0537 3.59427 8.98281C4.4306 7.91196 5.51414 7.05999 6.75194 6.49997C7.41776 5.02641 8.49443 3.77626 9.85281 2.89945C11.2112 2.02263 12.7936 1.55639 14.4103 1.55664ZM10.2105 7.85789C9.3832 7.85789 8.564 8.02088 7.79969 8.33755C7.03537 8.65421 6.34089 9.11836 5.75591 9.70348C5.17092 10.2886 4.70689 10.9833 4.3903 11.7478C4.07371 12.5123 3.91076 13.3316 3.91076 14.1591C3.91076 14.9866 4.07371 15.806 4.3903 16.5705C4.70689 17.335 5.17092 18.0297 5.75591 18.6148C6.34089 19.1999 7.03537 19.6641 7.79969 19.9807C8.564 20.2974 9.3832 20.4604 10.2105 20.4604C11.8813 20.4604 13.4836 19.7965 14.6651 18.6148C15.8465 17.4331 16.5102 15.8303 16.5102 14.1591C16.5102 12.4879 15.8465 10.8852 14.6651 9.70348C13.4836 8.52177 11.8813 7.85789 10.2105 7.85789ZM11.2604 8.9081V9.95831H13.3604V12.0587H9.16053C9.02935 12.0585 8.90282 12.1074 8.80588 12.1958C8.70893 12.2842 8.64859 12.4057 8.63674 12.5364C8.62488 12.6671 8.66238 12.7975 8.74183 12.9019C8.82129 13.0063 8.93695 13.0772 9.06604 13.1005L9.16053 13.1089H11.2604C11.9566 13.1089 12.6243 13.3855 13.1165 13.8779C13.6088 14.3703 13.8853 15.0381 13.8853 15.7345C13.8853 16.4308 13.6088 17.0986 13.1165 17.591C12.6243 18.0834 11.9566 18.36 11.2604 18.36V19.4102H9.16053V18.36H7.06062V16.2596H11.2604C11.3916 16.2598 11.5182 16.2109 11.6151 16.1225C11.712 16.0341 11.7724 15.9126 11.7842 15.7819C11.7961 15.6512 11.7586 15.5208 11.6791 15.4164C11.5997 15.312 11.484 15.2411 11.3549 15.2178L11.2604 15.2093H9.16053C8.46437 15.2093 7.79672 14.9327 7.30446 14.4404C6.8122 13.948 6.53565 13.2802 6.53565 12.5838C6.53565 11.8875 6.8122 11.2197 7.30446 10.7273C7.79672 10.2349 8.46437 9.95831 9.16053 9.95831V8.9081H11.2604ZM14.4103 3.65706C13.5207 3.65602 12.6409 3.84393 11.8293 4.20838C11.0177 4.57282 10.2927 5.10548 9.70231 5.77113C10.889 5.69907 12.0775 5.87982 13.1892 6.30143C14.3009 6.72303 15.3104 7.37589 16.1511 8.21683C16.9917 9.05777 17.6443 10.0676 18.0657 11.1796C18.487 12.2916 18.6676 13.4804 18.5954 14.6674C19.5501 13.8185 20.2241 12.6993 20.5282 11.4583C20.8323 10.2174 20.752 8.91326 20.2981 7.71897C19.8441 6.52468 19.0379 5.49664 17.9864 4.77121C16.9349 4.04577 15.6877 3.65721 14.4103 3.65706Z"
            fill="#FFDD15"
         />
      </svg>
   )
}
