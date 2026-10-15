import { useRepositories } from './DataProvider'
import { useAsync } from './useAsync'

/** Household, both adults, and which adult is holding this phone. */
export function useHousehold() {
  const { household } = useRepositories()
  const state = useAsync(async () => {
    const [h, members, currentId] = await Promise.all([
      household.getHousehold(),
      household.listMembers(),
      household.getCurrentMemberId(),
    ])
    const current = members.find((m) => m.id === currentId) ?? members[0]
    return { household: h, members, current }
  })
  return state
}
