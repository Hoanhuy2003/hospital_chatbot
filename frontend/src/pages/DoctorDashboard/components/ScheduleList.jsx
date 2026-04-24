import styles from './Shared.module.css'

// 1. Map đúng Status từ Backend (PENDING, CONFIRMED, DONE, CANCELLED)
const badge = s => ({
  pending:   'badgeWait',    // Màu cam
  confirmed: 'badgeConfirm', // Màu xanh lá
  done:      'badgeDone',    // Màu xanh dương
  cancelled: 'badgeCancel'   // Màu đỏ
}[s] || 'badgeWait')

const label = s => ({
  pending:   'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  done:      'Đã khám xong',
  cancelled: 'Đã hủy'
}[s] || s)

export default function ScheduleList({ appointments, openPatient }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>
        Lịch khám hôm nay — {appointments.length} bệnh nhân
      </div>
      
      {/* Kiểm tra nếu mảng rỗng thì báo chưa có dữ liệu */}
      {appointments.length === 0 ? (
        <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
          Chưa có bệnh nhân nào đặt lịch trong danh sách này.
        </div>
      ) : (
        appointments.map(a => (
          <div key={a.id} className={styles.apptItem} onClick={() => openPatient(a.id)}>
            {/* Giờ khám (Lấy từ timeSlot: "14:00_14:30" -> lấy "14:00") */}
            <span className={styles.apptTime}>
              {a.time || a.timeSlot?.split('_')[0]}
            </span>
            
            {/* Avatar lấy chữ cái cuối của tên bệnh nhân */}
            <div className={styles.apptAva}>
              {a.name ? a.name.split(' ').pop()[0] : (a.patientName ? a.patientName.split(' ').pop()[0] : '?')}
            </div>
            
            <div className={styles.apptInfo}>
              <div className={styles.apptName}>
                {/* Ưu tiên lấy patientName từ API thật */}
                {a.patientName || a.name} 
                <span style={{ fontSize: '13px', color: '#666', marginLeft: '8px', fontWeight: 'normal' }}>
                  • {a.queueNumber}
                </span>
              </div>
              
              <div className={styles.apptReason}>
                <strong>Lý do:</strong> {a.reason || "Khám định kỳ"}
              </div>
            </div>

            {/* Trạng thái từ Database */}
            <span className={`${styles.badge} ${styles[badge(a.status?.toLowerCase())]}`}>
              {label(a.status?.toLowerCase())}
            </span>
          </div>
        ))
      )}
    </div>
  )
}