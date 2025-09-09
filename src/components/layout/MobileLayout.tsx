import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MobileLayoutProps {
  children: ReactNode
  className?: string
  withPadding?: boolean
}

export function MobileLayout({ 
  children, 
  className,
  withPadding = true 
}: MobileLayoutProps) {
  return (
    <div className={cn(
      "w-full min-h-screen bg-background overflow-x-hidden",
      withPadding && "px-4",
      className
    )}>
      {children}
    </div>
  )
}