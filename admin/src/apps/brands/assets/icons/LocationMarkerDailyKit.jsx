import React from 'react'

const LocationMarker = (props) => {
    const { size = 18 } = props
    return (
        <svg
            width={size}
            height={size}
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            {...props}
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M8.99894 1.56226C11.9824 1.56226 14.3996 4.00087 14.3996 7.00822C14.3996 10.0153 8.99894 16.5623 8.99894 16.5623C8.99894 16.5623 3.59961 10.0152 3.59961 7.00822C3.59961 4.00087 6.01683 1.56226 8.99894 1.56226V1.56226ZM8.99981 4.37593C6.97208 4.37593 5.32802 7.00816 5.32802 7.00816C5.32802 7.00816 6.97208 9.64023 8.99981 9.64023C10.8431 9.64023 12.3695 7.46484 12.6316 7.06946L12.6714 7.00818C12.6714 7.00818 11.0276 4.37595 8.99985 4.37595L8.99981 4.37593ZM8.99894 5.61986C9.75932 5.61986 10.3755 6.24247 10.3755 7.00816C10.3755 7.77364 9.75932 8.39624 8.99894 8.39624C8.23984 8.39624 7.62346 7.77364 7.62346 7.00816C7.62346 6.24247 8.23984 5.61986 8.99894 5.61986Z"
                fill="#367BF5" />
        </svg>

    )
}

export default LocationMarker 