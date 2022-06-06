import reshaper from 'arabic-persian-reshaper'
import iconv from 'iconv-lite'
export const convertArabicForm = text => {
   text = reshaper.ArabicShaper.convertArabic(text)
      .replace('\u200b', '')
      .replace('\u064B', '')
   const form = {
      ا: {
         isAvailable: false,
         isolated: 'ﺍ',
         end: 'ﺎ',
         middle: '',
         beginning: ''
      },
      ب: {
         isAvailable: false,
         isolated: 'ﺏ',
         end: 'ﺐ',
         middle: 'ﺒ',
         beginning: 'ﺑ'
      },
      ت: {
         isAvailable: false,
         isolated: 'ﺕ',
         end: 'ﺖ',
         middle: 'ﺘ',
         beginning: 'ﺗ'
      },
      ث: {
         isAvailable: false,
         isolated: 'ﺙ',
         end: 'ﺚ',
         middle: 'ﺜ',
         beginning: 'ﺛ'
      },
      ج: {
         isAvailable: false,
         isolated: 'ﺝ',
         end: 'ﺞ',
         middle: 'ﺠ',
         beginning: 'ﺟ'
      },
      ح: {
         isAvailable: false,
         isolated: 'ﺡ',
         end: 'ﺢ',
         middle: 'ﺤ',
         beginning: 'ﺣ'
      },
      خ: {
         isAvailable: false,
         isolated: 'ﺥ',
         end: 'ﺦ',
         middle: 'ﺨ',
         beginning: 'ﺧ'
      },
      د: {
         isAvailable: false,
         isolated: 'ﺩ',
         end: 'ﺪ',
         middle: '',
         beginning: ''
      },
      ذ: {
         isAvailable: false,
         isolated: 'ﺫ',
         end: 'ﺬ',
         middle: '',
         beginning: ''
      },
      ر: {
         isAvailable: false,
         isolated: 'ﺭ',
         end: 'ﺮ',
         middle: '',
         beginning: ''
      },
      ز: {
         isAvailable: false,
         isolated: 'ﺯ',
         end: 'ﺰ',
         middle: '',
         beginning: ''
      },
      س: {
         isAvailable: false,
         isolated: 'ﺱ',
         end: 'ﺲ',
         middle: 'ﺴ',
         beginning: 'ﺳ'
      },
      ش: {
         isAvailable: false,
         isolated: 'ﺵ',
         end: 'ﺶ',
         middle: 'ﺸ',
         beginning: 'ﺷ'
      },
      ص: {
         isAvailable: false,
         isolated: 'ﺹ',
         end: 'ﺺ',
         middle: 'ﺼ',
         beginning: 'ﺻ'
      },
      ض: {
         isAvailable: false,
         isolated: 'ﺽ',
         end: 'ﺾ',
         middle: 'ﻀ',
         beginning: 'ﺿ'
      },
      ط: {
         isAvailable: false,
         isolated: 'ﻁ',
         end: 'ﻂ',
         middle: 'ﻄ',
         beginning: 'ﻃ'
      },
      ظ: {
         isAvailable: false,
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
         isAvailable: false,
         isolated: 'ﻑ',
         end: 'ﻒ',
         middle: 'ﻔ',
         beginning: 'ﻓ'
      },
      ق: {
         isAvailable: false,
         isolated: 'ﻕ',
         end: 'ﻖ',
         middle: 'ﻘ',
         beginning: 'ﻗ'
      },
      ك: {
         isAvailable: false,
         isolated: 'ﻙ',
         end: 'ﻚ',
         middle: 'ﻜ',
         beginning: 'ﻛ'
      },
      ل: {
         isAvailable: false,
         isolated: 'ﻝ',
         end: 'ﻞ',
         middle: 'ﻠ',
         beginning: 'ﻟ'
      },
      م: {
         isAvailable: false,
         isolated: 'ﻡ',
         end: 'ﻢ',
         middle: 'ﻤ',
         beginning: 'ﻣ'
      },
      ن: {
         isAvailable: false,
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
         isAvailable: false,
         isolated: 'ﻭ',
         end: 'ﻮ',
         middle: '',
         beginning: ''
      },
      ي: {
         isAvailable: false,
         isolated: 'ﻱ',
         end: 'ﻲ',
         middle: 'ﻴ',
         beginning: 'ﻳ'
      },
      آ: {
         isAvailable: false,
         isolated: 'ﺁ',
         end: 'ﺂ',
         middle: '',
         beginning: ''
      },
      ة: {
         isAvailable: false,
         isolated: 'ﺓ',
         end: 'ﺔ',
         middle: '',
         beginning: ''
      },
      ى: {
         isAvailable: false,
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
         arabicForm['beginning'][value.beginning] = value
         arabicForm['isolated'][value.isolated] = value
      }
   })

   for (let i = 0; i < text.length; i++) {
      if (text[i] === '?') {
         break
      }
      if (arabicForm.end[text[i]]) {
         text = text.replace(text[i], arabicForm.end[text[i]].isolated)
      } else if (arabicForm.middle[text[i]]) {
         let encodedChar = iconv.encode(
            arabicForm.middle[text[i]].beginning,
            'cp864'
         )
         if (encodedChar.toString('hex') === '3f') {
            text = text.replace(text[i], arabicForm.middle[text[i]].isolated)
         } else {
            text = text.replace(text[i], arabicForm.middle[text[i]].beginning)
         }
      } else if (arabicForm.beginning[text[i]]) {
         let encodedChar = iconv.encode(
            arabicForm.beginning[text[i]].beginning,
            'cp864'
         )
         if (encodedChar.toString('hex') === '3f') {
            text = text.replace(text[i], arabicForm.beginning[text[i]].isolated)
         } else {
            text = text.replace(
               text[i],
               arabicForm.beginning[text[i]].beginning
            )
         }
      }
   }

   return text.split('').reverse().join('')
}
