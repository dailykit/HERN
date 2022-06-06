import React from 'react'

const OrderAppIcon = ({ active }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M14.969 3.57166H4.52256C4.42257 3.57166 4.33794 3.49781 4.3244 3.39874L4.17982 2.34063C4.12912 1.94521 3.94954 1.58314 3.67413 1.3211C3.39873 1.05905 3.04605 0.914674 2.68104 0.914551H1.31348C1.13502 0.914551 0.963882 0.992098 0.837698 1.13013C0.711514 1.26817 0.640625 1.45538 0.640625 1.65059C0.640625 1.8458 0.711514 2.03302 0.837698 2.17105C0.963882 2.30909 1.13502 2.38663 1.31348 2.38663H2.68273C2.72405 2.38631 2.76404 2.40263 2.79507 2.4325C2.82609 2.46236 2.84598 2.50368 2.85094 2.54856L3.88713 10.3175C3.9559 10.7954 4.17805 11.2308 4.51375 11.5458C4.84944 11.8607 5.27672 12.0346 5.71896 12.0361H12.7183C13.1449 12.0367 13.5586 11.8761 13.8894 11.5813C14.2201 11.2866 14.4476 10.8758 14.5333 10.4187L15.6284 4.44755C15.6472 4.34112 15.6443 4.23146 15.6199 4.1264C15.5955 4.02134 15.5502 3.92347 15.4872 3.83979C15.4242 3.75611 15.3451 3.68869 15.2555 3.64234C15.1659 3.59599 15.0681 3.57185 14.969 3.57166ZM12.1521 13.3536C11.9048 13.3533 11.663 13.4282 11.4573 13.5688C11.2516 13.7093 11.0912 13.9092 10.9964 14.1432C10.9016 14.3771 10.8767 14.6346 10.9248 14.8831C10.9728 15.1316 11.0918 15.3599 11.2666 15.5391C11.4413 15.7183 11.6641 15.8403 11.9066 15.8899C12.1491 15.9394 12.4005 15.9141 12.629 15.8172C12.8574 15.7203 13.0527 15.5562 13.1901 15.3456C13.3275 15.135 13.4009 14.8874 13.4009 14.6341C13.4006 14.2948 13.2689 13.9695 13.0348 13.7294C12.8007 13.4894 12.4833 13.3542 12.1521 13.3536ZM5.23028 13.7516C5.45844 13.5098 5.77131 13.3671 6.10244 13.3536C6.43575 13.3524 6.75622 13.4828 6.99508 13.7166C7.23394 13.9505 7.37214 14.2692 7.38001 14.6044C7.38789 14.9396 7.26482 15.2646 7.03721 15.5095C6.8096 15.7545 6.4956 15.8999 6.16261 15.9146H6.13191C5.80056 15.9088 5.48449 15.7733 5.25082 15.5369C5.01715 15.3005 4.88429 14.9818 4.88046 14.6485C4.87662 14.3151 5.00211 13.9934 5.23028 13.7516ZM9.14041 5.72998C8.86427 5.72998 8.64041 5.95384 8.64041 6.22998V8.72998C8.64041 9.00612 8.86427 9.22998 9.14041 9.22998C9.41655 9.22998 9.64041 9.00612 9.64041 8.72998V6.22998C9.64041 5.95384 9.41655 5.72998 9.14041 5.72998ZM5.97343 6.14378C5.69998 6.18222 5.50946 6.43506 5.5479 6.70851L5.89589 9.18417C5.93432 9.45763 6.18716 9.64815 6.46062 9.60971C6.73407 9.57127 6.92459 9.31843 6.88615 9.04498L6.53816 6.56932C6.49973 6.29586 6.24689 6.10534 5.97343 6.14378ZM12.7329 6.70851C12.7714 6.43506 12.5808 6.18222 12.3074 6.14378C12.0339 6.10534 11.7811 6.29586 11.7427 6.56932L11.3947 9.04498C11.3562 9.31843 11.5467 9.57127 11.8202 9.60971C12.0937 9.64815 12.3465 9.45763 12.3849 9.18417L12.7329 6.70851Z"
            fill={active ? "#367BF5" : "#555B6E"} />
    </svg>

)
export default OrderAppIcon