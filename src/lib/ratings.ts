import type { AgeTag, Rating, RatingKey } from '../types'

/** Words for each tap rating. Step 3 is always the best outcome for a family. */
export interface RatingDef {
  key: RatingKey
  label: string
  /** Labels for steps 1, 2, 3. */
  steps: [string, string, string]
}

export const RATING_DEFS: RatingDef[] = [
  { key: 'wait', label: 'Wait time', steps: ['Long', 'Okay', 'Short'] },
  { key: 'space', label: 'Room to move', steps: ['Tight', 'Okay', 'Roomy'] },
  { key: 'noiseAir', label: 'Noise and air', steps: ['Loud or stuffy', 'Okay', 'Calm and fresh'] },
  { key: 'service', label: 'Kid-friendly service', steps: ['Not really', 'Okay', 'Great'] },
  { key: 'seating', label: 'Stroller and high chair room', steps: ['Tight', 'Okay', 'Plenty'] },
]

export function ratingLabel(key: RatingKey, rating: Rating): string {
  const def = RATING_DEFS.find((d) => d.key === key)!
  return def.steps[rating - 1]
}

export const AGE_TAGS: { value: AgeTag; label: string }[] = [
  { value: 'newborn', label: 'Newborn' },
  { value: 'toddler', label: 'Toddler' },
  { value: 'preschool', label: 'Preschool' },
  { value: 'schoolAge', label: 'School age' },
]
