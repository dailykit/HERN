import React from 'react'
import classNames from 'classnames'
import ReactHTMLParser from 'react-html-parser'

export const FrequentlyAskedQuestions = ({ config: faqConfig }) => {
   const config = {
      showBanner: faqConfig?.FAQ?.showBanner?.value ?? false,
      QuestionWithMultipleColor:
         faqConfig?.FAQ?.QuestionWithMultipleColor?.value,

      heading: faqConfig?.FAQ?.heading?.heading?.value ?? 'FAQ',
      showHeading: faqConfig?.FAQ?.heading?.showHeading?.value ?? true,

      subHeading: faqConfig?.FAQ?.subHeading?.subHeading?.value ?? '',
      showSubHeading:
         faqConfig?.FAQ?.subHeading?.showSubHeading?.value ?? false,

      IllustrationLeft:
         faqConfig?.FAQ?.IllustrationLeft?.illustration?.value ??
         'https://dailykit-237-breezychef.s3.us-east-2.amazonaws.com/images/52247-nounfaq610769.png',
      showLeftIllustration:
         faqConfig?.FAQ?.IllustrationLeft?.showIllustrationOnLeft?.value ??
         false,
      backgruond:
         faqConfig?.FAQ?.backgruond?.value ??
         'https://dailykit-237-breezychef.s3.us-east-2.amazonaws.com/images/87806-home-faq-first-bg.jpg',
      qna:
         faqConfig?.FAQ?.qna?.value?.map(qna => {
            return {
               question: qna.find(q => q.label === 'question').value,
               answer: qna.find(q => q.label === 'answer').value,
            }
         }) || [],
   }

   return (
      <div class="hern-faq">
         {config.showBanner && (
            <Banner
               img={config.backgruond}
               heading={config.heading}
               subHeading={
                  config.showSubHeading
                     ? ReactHTMLParser(config.subHeading)
                     : null
               }
            />
         )}

         <div
            className={classNames('hern-faq__questions', {
               'hern-faq__questions--without-ill': !config.showLeftIllustration,
            })}
         >
            {config.showLeftIllustration && (
               <div className="hern-faq__questions__illustration">
                  <img src={config.IllustrationLeft} alt="" />
               </div>
            )}
            <div className="hern-faq__questions__content">
               {config.qna.map((qna, index) => {
                  return (
                     <QuestionAndAnswer
                        key={index}
                        count={index}
                        withoutBg={!config.QuestionWithMultipleColor}
                        qna={qna}
                     />
                  )
               })}
            </div>
         </div>
      </div>
   )
}
const Banner = ({ heading, img, subHeading }) => {
   return (
      <div class="hern-faq__banner">
         <img src={img} />
         <div class="hern-faq__banner__content">
            <h2 class="hern-faq__banner__content__heading">{heading}</h2>
            {subHeading && (
               <h3 class="hern-faq__banner__content__sub-heading">
                  {subHeading}
               </h3>
            )}
         </div>
      </div>
   )
}
const QuestionAndAnswer = ({ qna, withoutBg = false, count }) => {
   const [isOpen, setIsOpen] = React.useState(false)
   const questionColor = [
      {
         text: 'rgba(124, 193, 68, 1)',
         bg: 'rgba(174, 229, 122, 0.25)',
      },
      {
         text: 'rgba(254, 139, 118, 1)',
         bg: 'rgba(255, 181, 161, 0.25)',
      },
      {
         text: 'rgba(252, 212, 95, 1)',
         bg: 'rgba(252, 212, 95, 0.25)',
      },
      {
         text: 'rgba(104, 215, 199, 1)',
         bg: 'rgba(175, 242, 229, 0.25)',
      },
   ]
   const colorIndex = Number(count) % questionColor.length
   return (
      <div
         style={{
            color: withoutBg ? '#000' : questionColor[colorIndex].text,
            backgroundColor: withoutBg ? '#fff' : questionColor[colorIndex].bg,
         }}
         className={classNames('hern-faq__qna', {
            'hern-faq__qna--without-bg': withoutBg,
         })}
      >
         <button
            onClick={() => setIsOpen(!isOpen)}
            style={{ color: '#7CC144', marginBottom: isOpen ? '16px' : '0' }}
         >
            <img src="https://dailykit-237-breezychef.s3.us-east-2.amazonaws.com/images/52865-right-arrow.png" />
            <h3>{qna.question}</h3>
         </button>
         {isOpen && <p>{qna.answer}</p>}
      </div>
   )
}
