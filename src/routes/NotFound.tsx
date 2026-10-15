import { EmptyState, Page } from '../components/Page'

export function NotFound() {
  return (
    <Page title="Not found">
      <EmptyState>That page doesn't exist.</EmptyState>
    </Page>
  )
}
