import type { ReactNode } from 'react'

export function Page({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
  return (
    <div className="page">
      <header className="page__header">
        <h1>{title}</h1>
        {action}
      </header>
      {children}
    </div>
  )
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty">{children}</p>
}
