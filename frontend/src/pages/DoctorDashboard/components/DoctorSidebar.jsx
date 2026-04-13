import styles from './DoctorSidebar.module.css'

const NAV = [
  { key: 'dashboard', icon: '📊', label: 'Tổng quan'           },
  { key: 'schedule',  icon: '📅', label: 'Lịch khám hôm nay'   },
  { key: 'patients',  icon: '👥', label: 'Danh sách bệnh nhân' },
  { key: 'records',   icon: '📋', label: 'Bệnh án'              },
  { key: 'next',      icon: '🔔', label: 'Lịch hẹn lần sau'    },
]

export default function DoctorSidebar({ page, setPage }) {
  return (
    <div className={styles.sidebar}>
      <div className={styles.logo}>Med<span>Care</span> <em>Bác sĩ</em></div>

      <nav className={styles.nav}>
        {NAV.map(n => (
          <div
            key={n.key}
            className={`${styles.navItem} ${page === n.key ? styles.active : ''}`}
            onClick={() => setPage(n.key)}
          >
            <span className={styles.icon}>{n.icon}</span>
            {n.label}
          </div>
        ))}
      </nav>

      <div className={styles.doctor}>
        <div className={styles.ava}>LH</div>
        <div>
          <div className={styles.docName}>BS. Lê Thị Minh Hồng</div>
          <div className={styles.docRole}>Nhi khoa · Nhi Đồng 2</div>
        </div>
      </div>
    </div>
  )
}