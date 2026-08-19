import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react"

export type BusinessRole =
  | "OWNER"
  | "MANAGER"
  | "STAFF"

export type Business = {
  id: string
  name: string
  slug: string
  role: BusinessRole
}

type BusinessContextValue = {
  businesses: Business[]
  setBusinesses: (businesses: Business[]) => void
}

const BusinessContext =
  createContext<BusinessContextValue | undefined>(
    undefined
  )

type BusinessProviderProps = {
  children: ReactNode
}

export function BusinessProvider({
  children,
}: BusinessProviderProps) {
  const [businesses, setBusinesses] = useState<
    Business[]
  >([])

  return (
    <BusinessContext.Provider
      value={{
        businesses,
        setBusinesses,
      }}
    >
      {children}
    </BusinessContext.Provider>
  )
}

export function useBusinesses() {
  const context = useContext(BusinessContext)

  if (!context) {
    throw new Error(
      "useBusinesses must be used inside BusinessProvider"
    )
  }

  return context
}