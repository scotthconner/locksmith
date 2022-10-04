import React from 'react'

export const AVAX = ({ color, size, ...rest}: IconProps) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 32 32" fill={color} {...rest} >
      <path d="M16 0c8.837 0 16 7.163 16 16s-7.163 16-16 16S0 24.837 0 16 7.163 0 16 0zm.313 6.833a.77.77 0 00-.698 0c-.203.104-.364.384-.682.944L7.46 20.97c-.314.552-.47.829-.46 1.055a.77.77 0 00.35.602c.19.123.505.123 1.14.123h3.028c.712 0 1.068 0 1.386-.088.349-.104.667-.288.931-.541.243-.232.418-.54.764-1.145l.01-.018 3.926-6.95c.348-.61.52-.916.597-1.239a2.26 2.26 0 000-1.066c-.076-.32-.25-.625-.593-1.226l-.008-.014-1.536-2.686c-.318-.56-.48-.84-.682-.944zm4.664 9.482c-.2.104-.36.377-.678.925l-2.165 3.722-.007.013c-.317.548-.476.821-.464 1.046a.777.777 0 00.348.606c.15.098.387.118.802.122l4.684.001c.64 0 .962 0 1.154-.126a.768.768 0 00.348-.607c.011-.219-.142-.484-.443-1.005l-.032-.054-2.172-3.722-.025-.042c-.305-.517-.46-.778-.657-.879a.762.762 0 00-.693 0z"/>
    </svg>
)
          
AVAX.defaultProps = {
  color: '#000',
  size: 32,
}
