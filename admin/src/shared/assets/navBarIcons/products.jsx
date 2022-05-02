import React from 'react'

const ProductsAppIcon = ({ active }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <mask id="path-1-inside-1" fill="white">
            <path fillRule="evenodd" clipRule="evenodd" d="M2.75262 9.81585C2.86284 9.8231 2.95267 9.91195 2.95267 10.0224V12.4146C2.95267 13.5191 3.8481 14.4146 4.95267 14.4146H10.1372C11.2417 14.4146 12.1372 13.5191 12.1372 12.4145V10.0224C12.1372 9.91195 12.227 9.8231 12.3372 9.81585C13.8498 9.71639 15.0449 8.49739 15.0449 7.00825C15.0449 5.45404 13.7431 4.1941 12.1372 4.1941C11.6111 4.1941 11.1177 4.3293 10.692 4.56575C10.5644 4.6366 10.3961 4.56784 10.3534 4.42833C9.99718 3.264 8.88358 2.41455 7.56498 2.41455C6.24015 2.41455 5.12225 3.27204 4.77152 4.44484C4.72911 4.58667 4.55702 4.65641 4.42848 4.58299C3.99587 4.33588 3.49138 4.1941 2.95267 4.1941C1.34677 4.1941 0.0449219 5.45404 0.0449219 7.00825C0.0449219 8.49738 1.24004 9.71637 2.75262 9.81585ZM8.0091 7.70283C8.0091 7.42669 7.78524 7.20283 7.5091 7.20283C7.23295 7.20283 7.0091 7.42669 7.0091 7.70283V9.45701C7.0091 9.73315 7.23295 9.95701 7.5091 9.95701C7.78524 9.95701 8.0091 9.73315 8.0091 9.45701V7.70283ZM5.41332 7.84035C5.34749 7.57217 5.07672 7.40813 4.80854 7.47396C4.54036 7.53979 4.37632 7.81055 4.44215 8.07874L4.84474 9.71882C4.91056 9.987 5.18133 10.151 5.44951 10.0852C5.7177 10.0194 5.88173 9.74861 5.8159 9.48043L5.41332 7.84035ZM10.6471 8.07874C10.7129 7.81056 10.5489 7.53979 10.2807 7.47396C10.0125 7.40813 9.74173 7.57216 9.6759 7.84034L9.27331 9.48043C9.20748 9.74861 9.37152 10.0194 9.6397 10.0852C9.90788 10.151 10.1786 9.98701 10.2445 9.71882L10.6471 8.07874Z" />
        </mask>
        <path fillRule="evenodd" clipRule="evenodd" d="M2.75262 9.81585C2.86284 9.8231 2.95267 9.91195 2.95267 10.0224V12.4146C2.95267 13.5191 3.8481 14.4146 4.95267 14.4146H10.1372C11.2417 14.4146 12.1372 13.5191 12.1372 12.4145V10.0224C12.1372 9.91195 12.227 9.8231 12.3372 9.81585C13.8498 9.71639 15.0449 8.49739 15.0449 7.00825C15.0449 5.45404 13.7431 4.1941 12.1372 4.1941C11.6111 4.1941 11.1177 4.3293 10.692 4.56575C10.5644 4.6366 10.3961 4.56784 10.3534 4.42833C9.99718 3.264 8.88358 2.41455 7.56498 2.41455C6.24015 2.41455 5.12225 3.27204 4.77152 4.44484C4.72911 4.58667 4.55702 4.65641 4.42848 4.58299C3.99587 4.33588 3.49138 4.1941 2.95267 4.1941C1.34677 4.1941 0.0449219 5.45404 0.0449219 7.00825C0.0449219 8.49738 1.24004 9.71637 2.75262 9.81585ZM8.0091 7.70283C8.0091 7.42669 7.78524 7.20283 7.5091 7.20283C7.23295 7.20283 7.0091 7.42669 7.0091 7.70283V9.45701C7.0091 9.73315 7.23295 9.95701 7.5091 9.95701C7.78524 9.95701 8.0091 9.73315 8.0091 9.45701V7.70283ZM5.41332 7.84035C5.34749 7.57217 5.07672 7.40813 4.80854 7.47396C4.54036 7.53979 4.37632 7.81055 4.44215 8.07874L4.84474 9.71882C4.91056 9.987 5.18133 10.151 5.44951 10.0852C5.7177 10.0194 5.88173 9.74861 5.8159 9.48043L5.41332 7.84035ZM10.6471 8.07874C10.7129 7.81056 10.5489 7.53979 10.2807 7.47396C10.0125 7.40813 9.74173 7.57216 9.6759 7.84034L9.27331 9.48043C9.20748 9.74861 9.37152 10.0194 9.6397 10.0852C9.90788 10.151 10.1786 9.98701 10.2445 9.71882L10.6471 8.07874Z"
            fill={active ? "#367BF5" : "#555B6E"} />
        <path d="M2.75262 9.81585L2.70012 10.6141H2.70012L2.75262 9.81585ZM12.3372 9.81585L12.2847 9.01758L12.2847 9.01758L12.3372 9.81585ZM10.692 4.56575L11.0804 5.26512V5.26512L10.692 4.56575ZM10.3534 4.42833L9.58844 4.66239L9.58844 4.6624L10.3534 4.42833ZM4.77152 4.44484L5.53798 4.67406V4.67406L4.77152 4.44484ZM4.42848 4.58299L4.03169 5.27765L4.03169 5.27765L4.42848 4.58299ZM4.80854 7.47396L4.99925 8.25089L4.99925 8.25089L4.80854 7.47396ZM5.41332 7.84035L4.63638 8.03106L5.41332 7.84035ZM4.44215 8.07874L3.66521 8.26945V8.26945L4.44215 8.07874ZM4.84474 9.71882L5.62167 9.52811L5.62167 9.52811L4.84474 9.71882ZM5.44951 10.0852L5.2588 9.30828L5.2588 9.30828L5.44951 10.0852ZM5.8159 9.48043L5.03897 9.67114V9.67114L5.8159 9.48043ZM10.2807 7.47396L10.4714 6.69702H10.4714L10.2807 7.47396ZM10.6471 8.07874L9.87014 7.88802V7.88802L10.6471 8.07874ZM9.6759 7.84034L8.89897 7.64963V7.64963L9.6759 7.84034ZM9.27331 9.48043L10.0502 9.67115V9.67114L9.27331 9.48043ZM10.2445 9.71882L11.0214 9.90954V9.90954L10.2445 9.71882ZM3.75267 10.0224C3.75267 9.45676 3.30136 9.05021 2.80513 9.01758L2.70012 10.6141C2.42433 10.596 2.15267 10.3671 2.15267 10.0224H3.75267ZM3.75267 12.4146V10.0224H2.15267V12.4146H3.75267ZM4.95267 13.6146C4.28993 13.6146 3.75267 13.0773 3.75267 12.4146H2.15267C2.15267 13.9609 3.40627 15.2146 4.95267 15.2146V13.6146ZM10.1372 13.6146H4.95267V15.2146H10.1372V13.6146ZM11.3372 12.4145C11.3372 13.0773 10.7999 13.6146 10.1372 13.6146V15.2146C11.6836 15.2146 12.9372 13.9609 12.9372 12.4145H11.3372ZM11.3372 10.0224V12.4145H12.9372V10.0224H11.3372ZM12.2847 9.01758C11.7885 9.05021 11.3372 9.45676 11.3372 10.0224H12.9372C12.9372 10.3672 12.6655 10.596 12.3897 10.6141L12.2847 9.01758ZM14.2449 7.00825C14.2449 8.05101 13.4021 8.9441 12.2847 9.01758L12.3897 10.6141C14.2975 10.4887 15.8449 8.94378 15.8449 7.00825H14.2449ZM12.1372 4.9941C13.3261 4.9941 14.2449 5.92034 14.2449 7.00825H15.8449C15.8449 4.98774 14.16 3.3941 12.1372 3.3941V4.9941ZM11.0804 5.26512C11.3895 5.09347 11.7495 4.9941 12.1372 4.9941V3.3941C11.4728 3.3941 10.8459 3.56513 10.3035 3.86639L11.0804 5.26512ZM9.58844 4.6624C9.7786 5.28386 10.5036 5.58551 11.0804 5.26512L10.3035 3.86639C10.6253 3.68769 11.0136 3.85182 11.1184 4.19426L9.58844 4.6624ZM7.56498 3.21455C8.5371 3.21455 9.33659 3.83928 9.58844 4.66239L11.1184 4.19426C10.6578 2.68872 9.23006 1.61455 7.56498 1.61455V3.21455ZM5.53798 4.67406C5.78585 3.84522 6.58819 3.21455 7.56498 3.21455V1.61455C5.8921 1.61455 4.45866 2.69887 4.00506 4.21563L5.53798 4.67406ZM4.03169 5.27765C4.61183 5.60903 5.34948 5.30438 5.53798 4.67406L4.00506 4.21563C4.10874 3.86895 4.50221 3.70379 4.82528 3.88833L4.03169 5.27765ZM2.95267 4.9941C3.34964 4.9941 3.71768 5.09829 4.03169 5.27765L4.82528 3.88833C4.27406 3.57347 3.63312 3.3941 2.95267 3.3941V4.9941ZM0.844922 7.00825C0.844922 5.92034 1.76372 4.9941 2.95267 4.9941V3.3941C0.929811 3.3941 -0.755078 4.98774 -0.755078 7.00825H0.844922ZM2.80513 9.01758C1.68773 8.94408 0.844922 8.05099 0.844922 7.00825H-0.755078C-0.755078 8.94378 0.79236 10.4887 2.70012 10.6141L2.80513 9.01758ZM7.5091 8.00283C7.34341 8.00283 7.2091 7.86852 7.2091 7.70283H8.8091C8.8091 6.98486 8.22707 6.40283 7.5091 6.40283V8.00283ZM7.8091 7.70283C7.8091 7.86852 7.67478 8.00283 7.5091 8.00283V6.40283C6.79112 6.40283 6.2091 6.98486 6.2091 7.70283H7.8091ZM7.8091 9.45701V7.70283H6.2091V9.45701H7.8091ZM7.5091 9.15701C7.67478 9.15701 7.8091 9.29132 7.8091 9.45701H6.2091C6.2091 10.175 6.79112 10.757 7.5091 10.757V9.15701ZM7.2091 9.45701C7.2091 9.29132 7.34341 9.15701 7.5091 9.15701V10.757C8.22707 10.757 8.8091 10.175 8.8091 9.45701H7.2091ZM7.2091 7.70283V9.45701H8.8091V7.70283H7.2091ZM4.99925 8.25089C4.83834 8.29039 4.67588 8.19197 4.63638 8.03106L6.19025 7.64963C6.0191 6.95236 5.3151 6.52586 4.61783 6.69702L4.99925 8.25089ZM5.21909 7.88802C5.25858 8.04893 5.16016 8.21139 4.99925 8.25089L4.61783 6.69702C3.92056 6.86818 3.49406 7.57218 3.66521 8.26945L5.21909 7.88802ZM5.62167 9.52811L5.21909 7.88802L3.66521 8.26945L4.0678 9.90953L5.62167 9.52811ZM5.2588 9.30828C5.41971 9.26878 5.58217 9.3672 5.62167 9.52811L4.0678 9.90953C4.23896 10.6068 4.94296 11.0333 5.64023 10.8621L5.2588 9.30828ZM5.03897 9.67114C4.99947 9.51023 5.0979 9.34777 5.2588 9.30828L5.64023 10.8621C6.3375 10.691 6.764 9.98699 6.59284 9.28972L5.03897 9.67114ZM4.63638 8.03106L5.03897 9.67114L6.59284 9.28972L6.19025 7.64963L4.63638 8.03106ZM10.09 8.25089C9.92906 8.21139 9.83064 8.04893 9.87014 7.88802L11.424 8.26945C11.5952 7.57218 11.1687 6.86818 10.4714 6.69702L10.09 8.25089ZM10.4528 8.03106C10.4133 8.19197 10.2509 8.29039 10.09 8.25089L10.4714 6.69702C9.77413 6.52586 9.07013 6.95236 8.89897 7.64963L10.4528 8.03106ZM10.0502 9.67114L10.4528 8.03106L8.89897 7.64963L8.49637 9.28971L10.0502 9.67114ZM9.83041 9.30828C9.99132 9.34777 10.0897 9.51024 10.0502 9.67115L8.49637 9.28971C8.32521 9.98699 8.75171 10.691 9.44898 10.8621L9.83041 9.30828ZM9.46754 9.52811C9.50704 9.3672 9.6695 9.26878 9.83041 9.30828L9.44898 10.8621C10.1463 11.0333 10.8503 10.6068 11.0214 9.90954L9.46754 9.52811ZM9.87014 7.88802L9.46754 9.52811L11.0214 9.90954L11.424 8.26945L9.87014 7.88802Z"
            fill={active ? "#367BF5" : "#555B6E"} mask="url(#path-1-inside-1)" />
    </svg>

)
export default ProductsAppIcon