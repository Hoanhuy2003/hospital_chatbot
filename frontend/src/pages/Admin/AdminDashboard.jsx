import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from './components/StatCard'
import { StatusBadge } from './components/AdminTable'
import { appointmentService } from '../../services/appointmentService'
import styles from './AdminDashboard.module.css'

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats,     setStats]     = useState({ users: 0, doctors: 0, appointments: 0, revenue: 0 })
  const [recentApt, setRecentApt] = useState([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      try {
        // TODO: thay bằng adminService.getStats()
        setStats({ users: 1248, doctors: 86, appointments: 143, revenue: '48.6M đ' })
        setRecentApt([
          { id: 1, patientName: 'Nguyễn Văn An',  specialtyName: 'Nhi khoa',   timeSlot: '07:30', status: 'PENDING'    },
          { id: 2, patientName: 'Trần Thị Bích',   specialtyName: 'Tim mạch',   timeSlot: '08:00', status: 'CONFIRMED'  },
          { id: 3, patientName: 'Lê Minh Khoa',    specialtyName: 'Da liễu',    timeSlot: '08:30', status: 'DONE'       },
          { id: 4, patientName: 'Phạm Thị Dung',   specialtyName: 'Nội',        timeSlot: '09:00', status: 'DONE'       },
          { id: 5, patientName: 'Hoàng Văn Em',    specialtyName: 'Ung bướu',   timeSlot: '09:30', status: 'CANCELLED'  },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const QUICK = [
    { icon: '◉', label: 'Thêm bác sĩ',     path: '/admin/doctors'      },
    { icon: '▣', label: 'Thêm phòng khám', path: '/admin/clinics'      },
    { icon: '◇', label: 'Thêm thuốc',      path: '/admin/medicines'    },
    { icon: '▦', label: 'Xem lịch khám',   path: '/admin/appointments' },
    { icon: '▤', label: 'Xem bệnh án',     path: '/admin/records'      },
    { icon: '◈', label: 'Thanh toán',      path: '/admin/payments'     },
  ]

  const SPECIALTY_STATS = [
    { name: 'Nhi khoa',      pct: 82 },
    { name: 'Nội tổng quát', pct: 71 },
    { name: 'Tim mạch',      pct: 58 },
    { name: 'Da liễu',       pct: 45 },
    { name: 'Mắt',           pct: 32 },
  ]

  return (
    <div>
      {/* Stats */}
      <div className={styles.statsRow}>
        <StatCard label="Tổng người dùng"    value={stats.users}        sub="+12 tuần này"           color="blue"  />
        <StatCard label="Bác sĩ hoạt động"   value={stats.doctors}      sub="4 chuyên khoa"          color="green" />
        <StatCard label="Lịch khám hôm nay"  value={stats.appointments} sub="32 đã hoàn thành"       color="amber" />
        <StatCard label="Doanh thu tháng"     value={stats.revenue}      sub="+8% so tháng trước"     color="blue"  />
      </div>

      {/* Quick actions */}
      <div className={styles.quickGrid}>
        {QUICK.map(q => (
          <div key={q.path} className={styles.qaCard} onClick={() => navigate(q.path)}>
            <span className={styles.qaIcon}>{q.icon}</span>
            <span className={styles.qaLabel}>{q.label}</span>
          </div>
        ))}
      </div>

      {/* Bottom grid */}
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>
            Lịch khám mới nhất
            <span onClick={() => navigate('/admin/appointments')}>Xem tất cả →</span>
          </div>
          {recentApt.map(a => (
            <div key={a.id} className={styles.aptRow}>
              <div className={styles.aptAva}>
                {a.patientName.split(' ').slice(-2).map(w => w[0]).join('')}
              </div>
              <div className={styles.aptInfo}>
                <div className={styles.aptName}>{a.patientName}</div>
                <div className={styles.aptSub}>{a.specialtyName} · {a.timeSlot}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          ))}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Chuyên khoa theo lượt</div>
          {SPECIALTY_STATS.map(s => (
            <div key={s.name} className={styles.barRow}>
              <span className={styles.barLabel}>{s.name}</span>
              <div className={styles.barBg}>
                <div className={styles.barFill} style={{ width: s.pct + '%' }} />
              </div>
              <span className={styles.barVal}>{s.pct}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}