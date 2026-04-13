import { useMemo } from 'react'
import { SCHEDULE_TEMPLATES, generateSlots } from '../data/constants'

/**
 * Hook: lấy danh sách khung giờ của bác sĩ
 * Dựa trên bảng schedule_templates (doctor_id, start_time, end_time, duration_minutes)
 */
export function useSlots(doctorId) {
  return useMemo(() => {
    const templates = SCHEDULE_TEMPLATES.filter(
      t => t.doctor_id === doctorId && t.is_active
    )

    const allSlots = templates.flatMap(t => generateSlots(t))

    const morning = allSlots.filter(s => parseInt(s.split(':')[0]) < 12)
    const afternoon = allSlots.filter(s => parseInt(s.split(':')[0]) >= 12)

    // fallback nếu chưa có template
    const defaultMorning = [
      '07:00–07:30','07:30–08:00','08:00–08:30','08:30–09:00','09:00–09:30',
      '09:30–10:00','10:00–10:30','10:30–11:00','11:00–11:30','11:30–12:00',
    ]
    const defaultAfternoon = [
      '13:00–13:30','13:30–14:00','14:00–14:30','14:30–15:00','15:00–15:30',
      '15:30–16:00','16:00–16:30','16:30–17:00','17:00–17:30','17:30–18:00',
    ]

    return {
      morning: morning.length > 0 ? morning : defaultMorning,
      afternoon: afternoon.length > 0 ? afternoon : defaultAfternoon,
    }
  }, [doctorId])
}
