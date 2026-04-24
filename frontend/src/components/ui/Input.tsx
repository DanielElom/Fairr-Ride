'use client'

import { type InputHTMLAttributes, forwardRef, useState } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', id, ...props }, ref) => {
    const [focused, setFocused] = useState(false)
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, '-')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-xs font-medium text-on-surface-variant font-body"
        >
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className={[
            'w-full rounded-md px-4 py-3 text-sm text-on-surface font-body',
            'transition-all duration-150 outline-none',
            focused
              ? 'bg-surface-container-lowest border border-primary'
              : 'bg-surface-container-low border border-transparent',
            error ? 'border-error' : '',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-error font-body">{error}</p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
export default Input
