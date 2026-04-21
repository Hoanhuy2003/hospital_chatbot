import { useState } from 'react'
import { toast } from 'react-toastify'
import { useDates }   from '../../hooks/useDates'
import { useSlots }   from '../../hooks/useSlots'
import { appointmentService } from '../../services/appointmentService'
import styles from './BookingModal.module.css'

export default function BookingModal({ doctor, onClose }) {
  const dates = useDates(7)
  const [selDateIdx, setSelDateIdx] = useState(0)
  const [selSlot, setSelSlot] = useState(null) // Lưu giá trị timeSlot (ví dụ: "08:00_08:30")
  const [isBooking, setIsBooking] = useState(false)

  const currentDateStr = dates[selDateIdx]?.fullDate

  // Lấy dữ liệu từ Hook (Hook này cần trả về morning và afternoon là mảng Object)
  const { morning, afternoon, loading, error } = useSlots(doctor.id, currentDateStr)

  const totalSlots = (morning?.length || 0) + (afternoon?.length || 0)

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
        time_slot: selSlot, // Gửi chuỗi gốc "08:00_08:30" lên Backend
        reason: "Khám định kỳ"
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
    <div
      className={styles.overlay}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={styles.modal}>

        {/* ── HEADER ── */}
        <div className={styles.head}>
          <div className={styles.avatar}>
            {doctor.photoUrl ? (
              <img src={doctor.photoUrl} alt={doctor.fullName} className={styles.avatar} />
            ) : (
              '👨‍⚕️'
            )}
          </div>
          <div className={styles.headInfo}>
            <div className={styles.docName}>{doctor.fullName}</div>
            <div className={styles.docMeta}>
              {doctor.specialtyName} · {doctor.clinicName}
            </div>
            <div className={styles.tags}>
              <span className={styles.tag}>
                {doctor.experienceYears || 0} năm kinh nghiệm
              </span>
              <span className={`${styles.tag} ${styles.tagGreen}`}>
                ✓ Đã xác minh
              </span>
              <span className={`${styles.tag} ${styles.tagOrange}`}>
                {doctor.price?.toLocaleString()}đ
              </span>
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
                <div className={styles.dateSlots}>
                  {loading ? '...' : `${totalSlots} khung giờ`}
                </div>
              </div>
            ))}
          </div>

          {loading && (
            <div className={styles.loadingWrap}>
              <div className={styles.spinner} />
              <span>Đang tải khung giờ...</span>
            </div>
          )}

          {error && !loading && (
            <div className={styles.errorMsg}>
              ⚠ Không tải được khung giờ khám.
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Buổi sáng - Trỏ vào t.timeSlot */}
              {morning?.length > 0 && (
                <>
                  <div className={styles.timeGroupLabel}>🌅 Buổi sáng</div>
                  <div className={styles.timeGrid}>
                    {morning.map((t, idx) => (
                      <div
                        key={idx}
                        className={`${styles.slot} ${selSlot === t.timeSlot ? styles.slotActive : ''}`}
                        onClick={() => setSelSlot(t.timeSlot)}
                      >
                        {/* Hiển thị đẹp hơn: 08:00 - 08:30 */}
                        {t.timeSlot.replace('_', ' - ')}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Buổi chiều - Trỏ vào t.timeSlot */}
              {afternoon?.length > 0 && (
                <>
                  <div className={styles.timeGroupLabel}>🌆 Buổi chiều</div>
                  <div className={styles.timeGrid}>
                    {afternoon.map((t, idx) => (
                      <div
                        key={idx}
                        className={`${styles.slot} ${selSlot === t.timeSlot ? styles.slotActive : ''}`}
                        onClick={() => setSelSlot(t.timeSlot)}
                      >
                        {t.timeSlot.replace('_', ' - ')}
                      </div>
                    ))}
                  </div>
                </>
              )}

              {totalSlots === 0 && (
                <div className={styles.emptySlots}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📅</div>
                  <div>Không có khung giờ trống cho ngày này</div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ── FOOTER ── */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {selSlot
              ? <span>Đã chọn: <strong>{dates[selDateIdx].label} · {selSlot.replace('_', ' - ')}</strong></span>
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