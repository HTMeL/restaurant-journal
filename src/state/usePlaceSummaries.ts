import { summarize } from '../lib/filters'
import { useRepositories } from './DataProvider'
import { useAsync } from './useAsync'

/** Every place joined with its visits, signal and cover photo. */
export function usePlaceSummaries() {
  const { places, visits } = useRepositories()
  return useAsync(async () => {
    const [p, v] = await Promise.all([places.list(), visits.list()])
    return summarize(p, v)
  })
}
