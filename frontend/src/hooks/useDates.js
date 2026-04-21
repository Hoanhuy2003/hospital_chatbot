import { useMemo } from 'react'

const DAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

export function useDates(count = 7) {
  return useMemo(() => {
    const now = new Date()
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() + i)
      return {
        // Hiển thị: "T3, 21/04"
        label: `${DAYS_VN[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        // Gửi lên API: "2026-04-21"
        dateStr: d.toISOString().split('T')[0],
        // Object Date gốc
        date: d,
      }
    })
  }, [count])
}