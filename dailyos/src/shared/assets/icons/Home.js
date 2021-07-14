import React from 'react'

const HomeIcon = ({ color = '#367BF5', size = '15px' }) => {
   return (
      <svg
         width={size}
         height={size}
         viewBox="0 0 15 14"
         fill="none"
         xmlns="http://www.w3.org/2000/svg"
      >
         <path
            d="M13.8299 7.22679L7.52537 0.221711C7.25988 -0.0739036 6.74991 -0.0739036 6.48442 0.221711L0.179847 7.22679C0.0892652 7.32743 0.0297898 7.45216 0.00861758 7.58589C-0.0125546 7.71962 0.00548375 7.85663 0.0605501 7.98032C0.115616 8.10402 0.205351 8.20911 0.318895 8.28287C0.432438 8.35663 0.564926 8.3959 0.700324 8.39594H2.10134V13.2995C2.10134 13.4853 2.17514 13.6635 2.30651 13.7948C2.43789 13.9262 2.61606 14 2.80185 14H11.2079C11.3937 14 11.5719 13.9262 11.7033 13.7948C11.8346 13.6635 11.9085 13.4853 11.9085 13.2995V8.39594H13.3095C13.4451 8.39651 13.578 8.35761 13.692 8.28396C13.8059 8.21031 13.8959 8.1051 13.9511 7.98116C14.0063 7.85722 14.0242 7.71991 14.0027 7.58596C13.9812 7.45201 13.9212 7.32721 13.8299 7.22679ZM7.0049 9.79695C6.44754 9.79695 5.91301 9.57554 5.51889 9.18143C5.12478 8.78732 4.90337 8.25279 4.90337 7.69543C4.90337 7.13807 5.12478 6.60354 5.51889 6.20943C5.91301 5.81532 6.44754 5.59391 7.0049 5.59391C7.56225 5.59391 8.09678 5.81532 8.4909 6.20943C8.88501 6.60354 9.10642 7.13807 9.10642 7.69543C9.10642 8.25279 8.88501 8.78732 8.4909 9.18143C8.09678 9.57554 7.56225 9.79695 7.0049 9.79695Z"
            fill={color}
         />
      </svg>
   )
}

export default HomeIcon
