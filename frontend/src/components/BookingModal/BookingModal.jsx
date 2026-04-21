import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { useDates } from '../../hooks/useDates'
import { scheduleService } from '../../services/scheduleService' // Đảm bảo gọi đúng hàm getAvailableSlots
import { appointmentService } from '../../services/appointmentService'
import styles from './BookingModal.module.css'

export default function BookingModal({ doctor, onClose }) {

  console.log("HELLO MODAL");
  const dates = useDates(7) // Lấy danh sách 7 ngày tới
  console.log("dates:", dates) 
  const [selDateIdx, setSelDateIdx] = useState(0)
  const [selSlot, setSelSlot] = useState(null)
  const [slots, setSlots] = useState({ morning: [], afternoon: [] })
  const [loading, setLoading] = useState(false)
  const [isBooking, setIsBooking] = useState(false)

  const currentDateStr = dates[selDateIdx]?.dateStr 

  // 1. Fetch dữ liệu từ API và tự động phân loại Sáng/Chiều
  useEffect(() => {
    const fetchSlots = async () => {
      if (!doctor.id || !currentDateStr) {
        console.log("❌ Thiếu doctorId hoặc date:", doctor.id, currentDateStr)
        return
      }
      try {
        setLoading(true)
        console.log("📡 Gọi API:", doctor.id, currentDateStr)
        
        const data = await scheduleService.getAvailableSlots(doctor.id, currentDateStr)
        console.log("✅ Data nhận được:", data)
        console.log("✅ availableTimeSlots:", data.availableTimeSlots)

        const allSlots = data.availableTimeSlots || []
        console.log("✅ allSlots length:", allSlots.length)

        const morning = []
        const afternoon = []
        allSlots.forEach(slot => {
          const hour = parseInt(slot.split('_')[0].split(':')[0])
          console.log(`  slot: ${slot} → hour: ${hour} → ${hour < 12 ? 'sáng' : 'chiều'}`)
          if (hour < 12) morning.push(slot)
          else afternoon.push(slot)
        })

        console.log("🌅 morning:", morning)
        console.log("🌆 afternoon:", afternoon)
        setSlots({ morning, afternoon })

      } catch (err) {
        console.error("❌ Lỗi fetch:", err)
        console.error("❌ Status:", err.response?.status)
        console.error("❌ Message:", err.response?.data)
        setSlots({ morning: [], afternoon: [] })
      } finally {
        setLoading(false)
      }
    }
    fetchSlots()
  }, [doctor.id, currentDateStr])
  const totalSlots = slots.morning.length + slots.afternoon.length

  function handleSelectDate(i) {
    setSelDateIdx(i)
    setSelSlot(null) 
  }

  async function handleBook() {
    if (!selSlot) {
      toast.warning('Vui lòng chọn khung giờ khám!')
      return
    }

    const userId = localStorage.getItem('userId')
    if (!userId) {
      toast.error('Vui lòng đăng nhập để đặt lịch!')
      return
    }

    try {
      setIsBooking(true)
      const appointmentData = {
        patient_id: userId,
        doctor_id: doctor.id,
        booking_date: currentDateStr,
        time_slot: selSlot, // Gửi chuỗi "08:00_08:30"
        reason: "Khám bệnh tại bệnh viện"
      }

      await appointmentService.create(appointmentData)
      toast.success('Đặt lịch thành công!')
      onClose()
    } catch (err) {
      toast.error('Lỗi hệ thống, vui lòng thử lại sau!')
    } finally {
      setIsBooking(false)
    }
  }

  return (
    <div className={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>

        {/* ── HEADER ── */}
        <div className={styles.head}>
          <div className={styles.avatar}>
            {doctor.photoUrl ? (
              <img src={doctor.photoUrl} alt={doctor.fullName} className={styles.avatar} />
            ) : '👨‍⚕️'}
          </div>
          <div className={styles.headInfo}>
            <div className={styles.docName}>{doctor.fullName}</div>
            <div className={styles.docMeta}>{doctor.specialtyName} · {doctor.clinicName}</div>
            <div className={styles.tags}>
              <span className={styles.tag}>{doctor.experienceYears || 0} năm kinh nghiệm</span>
              <span className={`${styles.tag} ${styles.tagOrange}`}>{doctor.price?.toLocaleString()}đ</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* ── BODY ── */}
        <div className={styles.body}>
          <div className={styles.sectionLabel}>CHỌN NGÀY KHÁM</div>
          <div className={styles.dateTabs}>
            {dates.map((d, i) => (
              <div
                key={i}
                className={`${styles.dateTab} ${selDateIdx === i ? styles.dateTabActive : ''}`}
                onClick={() => handleSelectDate(i)}
              >
                <div className={styles.dateLabel}>{d.label}</div>
                <div className={styles.dateSub}>
                  {loading ? '...' : `${totalSlots} khung giờ`}
                </div>
              </div>
            ))}
          </div>

          {loading ? (
            <div className={styles.loadingWrap}>Đang tải khung giờ...</div>
          ) : (
            <>
              {/* Render Buổi sáng */}
              {slots.morning.length > 0 && (
                <>
                  <div className={styles.timeGroupLabel}>🌅 Buổi sáng</div>
                  <div className={styles.timeGrid}>
                    {slots.morning.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`${styles.slot} ${selSlot === slot ? styles.slotActive : ''}`}
                        onClick={() => setSelSlot(slot)}
                      >
                        {slot.replace('_', ' - ')}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Render Buổi chiều */}
              {slots.afternoon.length > 0 && (
                <>
                  <div className={styles.timeGroupLabel}>🌆 Buổi chiều</div>
                  <div className={styles.timeGrid}>
                    {slots.afternoon.map((slot, idx) => (
                      <div
                        key={idx}
                        className={`${styles.slot} ${selSlot === slot ? styles.slotActive : ''}`}
                        onClick={() => setSelSlot(slot)}
                      >
                        {slot.replace('_', ' - ')}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {totalSlots === 0 && (
                <div className={styles.emptySlots}>
                  📅 Không có khung giờ trống cho ngày này
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {selSlot
              ? <span>Đã chọn: <strong>{selSlot.replace('_', ' - ')}</strong></span>
              : <span className={styles.footerHint}>Chọn khung giờ để đặt khám</span>
            }
          </div>
          <button
            className={styles.bookBtn}
            onClick={handleBook}
            disabled={!selSlot || loading || isBooking}
          >
            {isBooking ? 'ĐANG XỬ LÝ...' : 'ĐẶT KHÁM NGAY'}
          </button>
        </div>

      </div>
    </div>
  )
}