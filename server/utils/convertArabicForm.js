export const convertArabicForm = text => {
   const form = {
      ا: {
         isolated: 'ﺍ',
         end: 'ﺎ',
         middle: '',
         beginning: ''
      },
      ب: {
         isolated: 'ﺏ',
         end: 'ﺐ',
         middle: 'ﺒ',
         beginning: 'ﺑ'
      },
      ت: {
         isolated: 'ﺕ',
         end: 'ﺖ',
         middle: 'ﺘ',
         beginning: 'ﺗ'
      },
      ث: {
         isolated: 'ﺙ',
         end: 'ﺚ',
         middle: 'ﺜ',
         beginning: 'ﺛ'
      },
      ج: {
         isolated: 'ﺝ',
         end: 'ﺞ',
         middle: 'ﺠ',
         beginning: 'ﺟ'
      },
      ح: {
         isolated: 'ﺡ',
         end: 'ﺢ',
         middle: 'ﺤ',
         beginning: 'ﺣ'
      },
      خ: {
         isolated: 'ﺥ',
         end: 'ﺦ',
         middle: 'ﺨ',
         beginning: 'ﺧ'
      },
      د: {
         isolated: 'ﺩ',
         end: 'ﺪ',
         middle: '',
         beginning: ''
      },
      ذ: {
         isolated: 'ﺫ',
         end: 'ﺬ',
         middle: '',
         beginning: ''
      },
      ر: {
         isolated: 'ﺭ',
         end: 'ﺮ',
         middle: '',
         beginning: ''
      },
      ز: {
         isolated: 'ﺯ',
         end: 'ﺰ',
         middle: '',
         beginning: ''
      },
      س: {
         isolated: 'ﺱ',
         end: 'ﺲ',
         middle: 'ﺴ',
         beginning: 'ﺳ'
      },
      ش: {
         isolated: 'ﺵ',
         end: 'ﺶ',
         middle: 'ﺸ',
         beginning: 'ﺷ'
      },
      ص: {
         isolated: 'ﺹ',
         end: 'ﺺ',
         middle: 'ﺼ',
         beginning: 'ﺻ'
      },
      ض: {
         isolated: 'ﺽ',
         end: 'ﺾ',
         middle: 'ﻀ',
         beginning: 'ﺿ'
      },
      ط: {
         isolated: 'ﻁ',
         end: 'ﻂ',
         middle: 'ﻄ',
         beginning: 'ﻃ'
      },
      ظ: {
         isolated: 'ﻅ',
         end: 'ﻆ',
         middle: 'ﻈ',
         beginning: 'ﻇ'
      },
      ع: {
         isAvailable: true,
         isolated: 'ﻉ',
         end: 'ﻊ',
         middle: 'ﻌ',
         beginning: 'ﻋ'
      },
      غ: {
         isAvailable: true,
         isolated: 'ﻍ',
         end: 'ﻎ',
         middle: 'ﻐ',
         beginning: 'ﻏ'
      },
      ف: {
         isolated: 'ﻑ',
         end: 'ﻒ',
         middle: 'ﻔ',
         beginning: 'ﻓ'
      },
      ق: {
         isolated: 'ﻕ',
         end: 'ﻖ',
         middle: 'ﻘ',
         beginning: 'ﻗ'
      },
      ك: {
         isolated: 'ﻙ',
         end: 'ﻚ',
         middle: 'ﻜ',
         beginning: 'ﻛ'
      },
      ل: {
         isolated: 'ﻝ',
         end: 'ﻞ',
         middle: 'ﻠ',
         beginning: 'ﻟ'
      },
      م: {
         isolated: 'ﻡ',
         end: 'ﻢ',
         middle: 'ﻤ',
         beginning: 'ﻣ'
      },
      ن: {
         isolated: 'ﻥ',
         end: 'ﻦ',
         middle: 'ﻨ',
         beginning: 'ﻧ'
      },
      ه: {
         isAvailable: true,
         isolated: 'ﻩ',
         end: 'ﻪ',
         middle: 'ﻬ',
         beginning: 'ﻫ'
      },
      و: {
         isolated: 'ﻭ',
         end: 'ﻮ',
         middle: '',
         beginning: ''
      },
      ي: {
         isolated: 'ﻱ',
         end: 'ﻲ',
         middle: 'ﻴ',
         beginning: 'ﻳ'
      },
      آ: {
         isolated: 'ﺁ',
         end: 'ﺂ',
         middle: '',
         beginning: ''
      },
      ة: {
         isolated: 'ﺓ',
         end: 'ﺔ',
         middle: '',
         beginning: ''
      },
      ى: {
         isolated: 'ﻯ',
         end: 'ﻰ',
         middle: '',
         beginning: ''
      }
   }

   let arabicForm = {
      end: {},
      middle: {},
      beginning: {},
      isolated: {}
   }
   Object.entries(form).forEach(([key, value]) => {
      if (!value.hasOwnProperty('isAvailable') || !value.isAvailable) {
         arabicForm['end'][value.end] = value
         arabicForm['middle'][value.middle] = value
      }
   })

   console.log(arabicForm)

   for (let i = 0; i < text.length; i++) {
      if (arabicForm.end[text[i]]) {
         console.log(text[i])
         console.log('inside else if end')
         text = text.replace(text[i], arabicForm.end[text[i]].isolated)
      } else if (arabicForm.middle[text[i]]) {
         console.log(text[i])
         console.log('inside elseif middle')
         text = text.replace(text[i], arabicForm.middle[text[i]].beginning)
      }
   }
   return text
}
