import styles from './Shared.module.css'

export default function DashboardHome({ appointments = [], nextAppts = [], openPatient, setPage }) {
  
  // 1. Logic tính toán dựa trên Status chuẩn từ Backend (viết hoa hoặc viết thường)
  const getCount = (statusArr) => {
    return appointments.filter(a => 
      statusArr.includes(a.status?.toUpperCase()) || 
      statusArr.includes(a.status?.toLowerCase())
    ).length
  }

  const doneCount   = getCount(['DONE','COMPLETED', 'completed'])
  const pendingCount = getCount(['PENDING', 'wait'])
  const cancelCount = getCount(['CANCELLED', 'cancel'])

  // 2. Map class CSS và Label cho đồng bộ
  const badge = s => {
    const status = s?.toUpperCase()
    if (status === 'PENDING') return 'badgeWait'
    if (status === 'CONFIRMED') return 'badgeConfirm'
    if (status === 'COMPLETED') return 'badgeDone'
    if (status === 'CANCELLED') return 'badgeCancel'
    return 'badgeWait'
  }

  const label = s => {
    const status = s?.toUpperCase()
    if (status === 'PENDING') return 'Chờ xác nhận'
    if (status === 'CONFIRMED') return 'Đã xác nhận'
    if (status === 'COMPLETED') return 'Đã khám xong'
    if (status === 'CANCELLED') return 'Đã hủy'
    return s
  }

  return (
    <>
      {/* Hàng thống kê: Các số liệu sẽ nhảy dựa trên appointments truyền từ API */}
      <div className={styles.statsRow}>
        {[
          ['Tổng lịch hôm nay', appointments.length, 'blue'],
          ['Đã khám xong', doneCount, 'green'],
          ['Chờ xử lý', pendingCount, 'orange'],
          ['Đã hủy', cancelCount, 'red']
        ].map(([l, n, c]) => (
          <div key={l} className={styles.statCard}>
            <div className={styles.statLabel}>{l}</div>
            <div className={`${styles.statNum} ${styles[c]}`}>{n}</div>
          </div>
        ))}
      </div>

      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Lịch khám hôm nay <span onClick={() => setPage('schedule')} style={{cursor:'pointer'}}>Xem tất cả →</span>
          </div>

          {appointments.length === 0 ? (
            <p style={{padding: '20px', color: '#888'}}>Chưa có bệnh nhân nào đặt lịch hôm nay.</p>
          ) : (
            appointments.slice(0, 5).map(a => (
              <div key={a.id} className={styles.apptItem} onClick={() => openPatient(a.id)}>
                {/* Lấy giờ từ timeSlot "14:00_14:30" -> "14:00" */}
                <span className={styles.apptTime}>{a.timeSlot?.split('_')[0] || a.time}</span>
                
                {/* Avatar lấy chữ cái cuối của tên bệnh nhân */}
                <div className={styles.apptAva}>
                  {(a.patientName || a.name || '?').split(' ').pop()[0]}
                </div>
                
                <div className={styles.apptInfo}>
                  <div className={styles.apptName}>{a.patientName || a.name}</div>
                  <div className={styles.apptReason}>{a.reason || 'Khám bệnh'}</div>
                </div>

                <span className={`${styles.badge} ${styles[badge(a.status)]}`}>
                  {label(a.status)}
                </span>
              </div>
            ))
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Lịch hẹn lần sau <span onClick={() => setPage('next')}>Xem tất cả →</span></div>
          {nextAppts.length === 0 ? (
            <p style={{padding: '20px', color: '#888'}}>Không có lịch hẹn tái khám.</p>
          ) : (
            nextAppts.map((n, i) => (
              <div key={i} className={styles.nextRow}>
                <div className={styles.nextDate}>📅 {n.follow_up_date}</div>
                <div>
                  <div className={styles.apptName}>{n.name}</div>
                  <div className={styles.apptReason}>{n.note}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )
}