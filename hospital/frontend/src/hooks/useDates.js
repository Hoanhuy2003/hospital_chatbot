import { useMemo } from 'react'
import { buildDates } from '../data/constants'

/**
 * Hook: tạo danh sách ngày khám (7 ngày tới)
 */
export function useDates(count = 7) {
  return useMemo(() => buildDates(count), [count])
}
