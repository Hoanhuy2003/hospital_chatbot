import { useState } from 'react'
import { useBooking } from '../../context/BookingContext'
import { useDates } from '../../hooks/useDates'
import { useSlots } from '../../hooks/useSlots'
import styles from './BookingModal.module.css'

export default function BookingModal({ doctor, onClose }) {
  const dates = useDates(7)
  const { morning, afternoon } = useSlots(doctor.id)
  const { addBooking } = useBooking()

  const [selDate, setSelDate] = useState(0)
  const [selSlot, setSelSlot] = useState(null)

  function handleBook() {
    if (!selSlot) { alert('Vui lòng chọn khung giờ khám!'); return }
    addBooking(doctor, dates[selDate].label, selSlot)
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className={styles.modal}>
        <div className={styles.head}>
          <div className={styles.avatar}>{doctor.avatar}</div>
          <div className={styles.headInfo}>
            <div className={styles.docName}>{doctor.name}</div>
            <div className={styles.docMeta}>{doctor.specialty} · {doctor.hospital}</div>
            <div className={styles.tags}>
              <span className={styles.tag}>{doctor.experience} năm kinh nghiệm</span>
              <span className={`${styles.tag} ${styles.tagGreen}`}>✓ Đã xác minh</span>
              <span className={`${styles.tag} ${styles.tagOrange}`}>{doctor.price}</span>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div className={styles.body}>
          <div className={styles.sectionLabel}>Chọn ngày khám</div>
          <div className={styles.dateTabs}>
            {dates.map((d, i) => (
              <div key={i} className={`${styles.dateTab} ${selDate === i ? styles.dateTabActive : ''}`}
                onClick={() => { setSelDate(i); setSelSlot(null) }}>
                <div className={styles.dateLabel}>{d.label}</div>
                <div className={styles.dateSlots}>{d.slots} khung giờ</div>
              </div>
            ))}
          </div>
          <div className={styles.timeGroupLabel}>🌅 Buổi sáng</div>
          <div className={styles.timeGrid}>
            {morning.map(t => (
              <div key={t} className={`${styles.slot} ${selSlot === t ? styles.slotActive : ''}`}
                onClick={() => setSelSlot(t)}>{t}</div>
            ))}
          </div>
          <div className={styles.timeGroupLabel}>🌆 Buổi chiều</div>
          <div className={styles.timeGrid}>
            {afternoon.map(t => (
              <div key={t} className={`${styles.slot} ${selSlot === t ? styles.slotActive : ''}`}
                onClick={() => setSelSlot(t)}>{t}</div>
            ))}
          </div>
          <button className={styles.bookBtn} onClick={handleBook}>ĐẶT KHÁM NGAY</button>
        </div>
      </div>
    </div>
  )
}
