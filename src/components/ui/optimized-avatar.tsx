import Image from 'next/image'
import { cn } from '@/lib/utils'

interface OptimizedAvatarProps {
  src?: string | null
  alt: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  fallback?: string
}

const sizeClasses = {
  sm: 'w-8 h-8',
  md: 'w-12 h-12',
  lg: 'w-16 h-16',
  xl: 'w-24 h-24'
}

// Optimized avatar component with fallback and Next.js Image
export const OptimizedAvatar = ({
  src,
  alt,
  size = 'md',
  className,
  fallback
}: OptimizedAvatarProps) => {
  if (!src) {
    return (
      <div className={cn(
        'rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold',
        sizeClasses[size],
        className
      )}>
        {fallback || alt.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <div className={cn('relative rounded-full overflow-hidden bg-muted', sizeClasses[size], className)}>
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        priority={size === 'xl'} // Büyük avatarlar için priority
      />
    </div>
  )
}
