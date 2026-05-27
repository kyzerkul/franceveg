'use client'

import { useState } from 'react'
import Image from 'next/image'

type Props = Omit<React.ComponentProps<typeof Image>, 'src'> & {
  src: string | null | undefined
}

export function ImageWithFallback({ src, alt, className, ...props }: Props) {
  const [broken, setBroken] = useState(false)

  if (!src || broken) {
    return (
      <div className={`absolute inset-0 flex items-center justify-center bg-gray-100 ${className ?? ''}`}>
        <span className="text-5xl select-none">🌿</span>
      </div>
    )
  }

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      onError={() => setBroken(true)}
      {...props}
    />
  )
}
