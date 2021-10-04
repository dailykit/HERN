import React from 'react'

const ReportsAppIcon = ({ active }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0.648438" y="0.22168" width="3.56097" height="15" rx="0.6" fill={active ? "#367BF5" : "#555B6E"} />
        <rect x="6.36865" y="4.29932" width="3.56097" height="10.9223" rx="0.6" fill={active ? "#367BF5" : "#555B6E"} />
        <rect x="12.0874" y="7.20654" width="3.56097" height="8.01504" rx="0.6" fill={active ? "#367BF5" : "#555B6E"} />
    </svg>
)
export default ReportsAppIcon