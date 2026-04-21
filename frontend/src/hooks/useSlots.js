import { useState, useEffect } from 'react'
import { scheduleService } from '../services/scheduleService'

export function useSlots(doctorId, dateStr) {
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!doctorId || !dateStr) return

    async function fetchSlots() {
      try {
        setLoading(true)
        // Gọi API: /api/v1/schedules/doctor/7?date=2026-04-22
        const res = await scheduleService.getDoctorSchedule(doctorId, dateStr)
        
        console.log("Dữ liệu từ Postman đã về React:", res)

        if (Array.isArray(res)) {
          // Chỉ lấy những slot nào còn trống (AVAILABLE)
          // Biến "08:00_08:30" thành "08:00 - 08:30" cho đẹp
          const formattedSlots = res
            .filter(s => s.status === 'AVAILABLE')
            .map(s => s.timeSlot.replace('_', ' - '))
          
          setSlots(formattedSlots)
        }
      } catch (err) {
        console.error("Lỗi fetch lịch:", err)
        setSlots([])
      } finally {
        setLoading(false)
      }
    }

    fetchSlots()
  }, [doctorId, dateStr]) // Chạy lại khi đổi bác sĩ hoặc đổi ngày trên Tab

  return { slots, loading }
}