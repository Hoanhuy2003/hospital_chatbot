import styles from './Shared.module.css'
import dash from './DashboardHome.module.css'

// Helpers
const toUpper = (s) => s?.toUpperCase() || ''

const BADGE_CLASS = {
  PENDING:   styles.badgeWait,
  CONFIRMED: styles.badgeConfirm,
  COMPLETED: styles.badgeDone,
  DONE:      styles.badgeDone,
  CANCELLED: styles.badgeCancel,
}
const BADGE_LABEL = {
  PENDING:   'Chờ xác nhận',
  CONFIRMED: 'Đã xác nhận',
  COMPLETED: 'Đã khám xong',
  DONE:      'Đã khám xong',
  CANCELLED: 'Đã hủy',
}

const badgeClass  = (s) => BADGE_CLASS[toUpper(s)]  || styles.badgeWait
const badgeLabel  = (s) => BADGE_LABEL[toUpper(s)]  || s

// Format ngày dd/MM
const fmtDate = (dateStr) => {
  if (!dateStr) return ''
  const [y, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

const isToday = (dateStr) => {
  return dateStr === new Date().toISOString().split('T')[0]
}

// Lấy chữ cái đầu cuối tên
const initial = (name) => (name || '?').split(' ').pop()[0].toUpperCase()

export default function DashboardHome({ appointments = [], nextAppts = [], openPatient, setPage }) {

  // --- Thống kê ---
  const getCount = (statuses) =>
    appointments.filter((a) => statuses.includes(toUpper(a.status))).length

  const totalCount   = appointments.length
  const pendingCount = getCount(['PENDING'])
  const doneCount    = getCount(['DONE', 'COMPLETED'])
  const cancelCount  = getCount(['CANCELLED'])

  // --- Lịch khám mới nhất: loại bỏ đã hủy, sort ngày gần nhất trước ---
  const latestAppts = [...appointments]
    .filter((a) => toUpper(a.status) !== 'CANCELLED')
    .sort((a, b) => {
      // Sort: ngày gần nhất trước, cùng ngày thì giờ sớm trước
      const dateCmp = (a.date || '').localeCompare(b.date || '')
      if (dateCmp !== 0) return dateCmp
      return (a.time || '').localeCompare(b.time || '')
    })
    .slice(0, 8)

  return (
    <>
      {/* ============ STATS ROW ============ */}
      <div className={styles.statsRow}>
        {[
          { label: 'Tổng lịch',     value: totalCount,   color: 'blue'   },
          { label: 'Chờ xử lý',     value: pendingCount, color: 'orange' },
          { label: 'Đã khám xong',  value: doneCount,    color: 'green'  },
          { label: 'Đã hủy',        value: cancelCount,  color: 'red'    },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.statCard}>
            <div className={styles.statLabel}>{label}</div>
            <div className={`${styles.statNum} ${styles[color]}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* ============ LỊCH KHÁM MỚI NHẤT (full width) ============ */}
      <div className={dash.latestCard}>
        <div className={dash.latestHeader}>
          <div className={dash.latestTitle}>
            <span className={dash.dot} />
            Lịch khám mới nhất
            {totalCount > 0 && (
              <span className={dash.countBadge}>{totalCount}</span>
            )}
          </div>
          <button className={dash.linkBtn} onClick={() => setPage('schedule')}>
            Xem lịch hôm nay →
          </button>
        </div>

        {latestAppts.length === 0 ? (
          <div className={dash.empty}>
            Chưa có lịch khám nào được đặt.
          </div>
        ) : (
          <div className={dash.apptList}>
            {latestAppts.map((a) => (
              <div
                key={a.id}
                className={dash.apptRow}
                onClick={() => openPatient(a.id)}
              >
                {/* Ngày / Hôm nay */}
                <div className={dash.dateBadge}>
                  <span className={`${dash.dateDay} ${isToday(a.date) ? dash.today : ''}`}>
                    {isToday(a.date) ? 'Hôm nay' : fmtDate(a.date)}
                  </span>
                  <span className={dash.dateTime}>{a.time || '--:--'}</span>
                </div>

                {/* Avatar */}
                <div className={dash.ava}>{initial(a.name)}</div>

                {/* Thông tin bệnh nhân */}
                <div className={dash.info}>
                  <div className={dash.name}>
                    {a.name}
                    {a.queueNumber && (
                      <span className={dash.queue}>#{a.queueNumber}</span>
                    )}
                  </div>
                  <div className={dash.reason}>{a.reason || 'Khám bệnh'}</div>
                </div>

                {/* Trạng thái */}
                <span className={`${styles.badge} ${badgeClass(a.status)}`}>
                  {badgeLabel(a.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============ GRID 2 CỘT: hôm nay + tái khám ============ */}
      <div className={styles.grid2}>

        {/* Hôm nay */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Hôm nay
            <span onClick={() => setPage('schedule')}>Xem tất cả →</span>
          </div>
          {appointments.filter((a) => isToday(a.date)).length === 0 ? (
            <p style={{ padding: '20px 0', color: '#888', fontSize: 13 }}>
              Chưa có bệnh nhân nào đặt lịch hôm nay.
            </p>
          ) : (
            appointments
              .filter((a) => isToday(a.date))
              .slice(0, 5)
              .map((a) => (
                <div key={a.id} className={styles.apptItem} onClick={() => openPatient(a.id)}>
                  <span className={styles.apptTime}>{a.time}</span>
                  <div className={styles.apptAva}>{initial(a.name)}</div>
                  <div className={styles.apptInfo}>
                    <div className={styles.apptName}>{a.name}</div>
                    <div className={styles.apptReason}>{a.reason || 'Khám bệnh'}</div>
                  </div>
                  <span className={`${styles.badge} ${badgeClass(a.status)}`}>
                    {badgeLabel(a.status)}
                  </span>
                </div>
              ))
          )}
        </div>

        {/* Tái khám */}
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Lịch hẹn tái khám
            <span onClick={() => setPage('next')}>Xem tất cả →</span>
          </div>
          {nextAppts.length === 0 ? (
            <p style={{ padding: '20px 0', color: '#888', fontSize: 13 }}>
              Không có lịch hẹn tái khám.
            </p>
          ) : (
            nextAppts.slice(0, 5).map((n, i) => (
              <div key={i} className={styles.nextRow}>
                <div className={styles.nextDate}>📅 {n.date}</div>
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
