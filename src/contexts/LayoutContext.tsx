import React, { createContext, useContext, useState, ReactNode } from 'react'

type PaddingMode = 'default' | 'minimal' | 'full-width'

interface LayoutContextType {
  paddingMode: PaddingMode
  setPaddingMode: (mode: PaddingMode) => void
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined)

interface LayoutProviderProps {
  children: ReactNode
}

export const LayoutProvider: React.FC<LayoutProviderProps> = ({ children }) => {
  const [paddingMode, setPaddingMode] = useState<PaddingMode>('default')

  return (
    <LayoutContext.Provider value={{ paddingMode, setPaddingMode }}>
      {children}
    </LayoutContext.Provider>
  )
}

export const useLayout = (): LayoutContextType => {
  const context = useContext(LayoutContext)
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider')
  }
  return context
}