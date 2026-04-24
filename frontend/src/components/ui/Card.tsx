import { type HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export default function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`
        rounded-lg bg-surface-container-lowest
        shadow-[0_0_24px_0_rgba(0,52,24,0.05)]
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
