import { useBooking } from '../../context/BookingContext'
import styles from './MyBookings.module.css'

const STATUS_MAP = {
  confirmed: { label: 'Đã xác nhận', color: '#2E7D32', bg: '#E8F5E9' },
  cancelled: { label: 'Đã huỷ',      color: '#C62828', bg: '#FFEBEE' },
  done:      { label: 'Hoàn thành',  color: '#1565C0', bg: '#E3F2FD' },
}

export default function MyBookings() {
  const { bookings, cancelBooking } = useBooking()

  if (bookings.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📋</div>
        <h2>Bạn chưa có lịch khám nào</h2>
        <p>Hãy đặt lịch khám với các bác sĩ hàng đầu của chúng tôi.</p>
        <a href="/" className={styles.btnBack}>Đặt lịch ngay →</a>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1 className={styles.title}>Lịch khám của tôi</h1>
        <span className={styles.count}>{bookings.length} lịch</span>
      </div>

      <div className={styles.list}>
        {bookings.map(b => {
          const s = STATUS_MAP[b.status] || STATUS_MAP.confirmed
          return (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.avatar}>{b.doctor.avatar}</div>
              </div>
              <div className={styles.cardBody}>
                <div className={styles.docName}>{b.doctor.name}</div>
                <div className={styles.docSpec}>{b.doctor.specialty}</div>
                <div className={styles.meta}>
                  <span>🏥 {b.doctor.hospital}</span>
                  <span>📅 {b.date}</span>
                  <span>🕐 {b.slot}</span>
                </div>
                <div className={styles.code}>Mã phiếu: <strong>{b.code}</strong></div>
                <div className={styles.createdAt}>Đặt lúc: {b.createdAt}</div>
              </div>
              <div className={styles.cardRight}>
                <span className={styles.status} style={{ color: s.color, background: s.bg }}>
                  {s.label}
                </span>
                {b.status === 'confirmed' && (
                  <button
                    className={styles.btnCancel}
                    onClick={() => {
                      if (window.confirm('Bạn chắc chắn muốn huỷ lịch khám này?'))
                        cancelBooking(b.id)
                    }}
                  >
                    Huỷ lịch
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
