import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createRepositories, type Repositories } from '../data'

const DataContext = createContext<Repositories | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const repos = useMemo(() => createRepositories(), [])
  return <DataContext.Provider value={repos}>{children}</DataContext.Provider>
}

export function useRepositories(): Repositories {
  const repos = useContext(DataContext)
  if (!repos) throw new Error('useRepositories must be used inside DataProvider')
  return repos
}
