import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from './components/StatCard'
import { StatusBadge } from './components/AdminTable'
import { toast } from 'react-toastify'
import styles from './AdminDashboard.module.css'
import api from '../../services/api'// Đảm bảo sử dụng instance axios đã cấu hình của bạn

function formatVnd(amount) {
  if (!amount && amount !== 0) return '0 đ'
  return new Intl.NumberFormat('vi-VN').format(Math.round(amount)) + ' đ'
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    users: 0, doctors: 0, appointments: 0,
    monthlyRevenue: 0, totalRevenue: 0, paidCount: 0, pendingCount: 0
  })
  const [recentApt, setRecentApt] = useState([])
  const [specialtyStats, setSpecialtyStats] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)

        const [statsRes, specRes] = await Promise.all([
          api.get('/v1/admin/dashboard-stats'),
          api.get('/v1/specialty/statistics'),
        ])

        const data = statsRes.data
        setStats({
          users:          data.totalUsers        ?? 0,
          doctors:        data.totalDoctors       ?? 0,
          appointments:   data.todayAppointments  ?? 0,
          monthlyRevenue: data.monthlyRevenue     ?? 0,
          totalRevenue:   data.totalRevenue       ?? 0,
          paidCount:      data.paidCount          ?? 0,
          pendingCount:   data.pendingCount       ?? 0,
        })
        setRecentApt(data.recentAppointments || [])

        const maxApts = Math.max(1, ...specRes.data.map(s => s.totalAppointments || 0))
        const formattedSpecs = specRes.data
          .map(s => ({
            name: s.name,
            count: s.totalAppointments || 0,
            pct: Math.round(((s.totalAppointments || 0) / maxApts) * 100),
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)

        setSpecialtyStats(formattedSpecs)
      } catch (err) {
        toast.error('Không thể cập nhật dữ liệu thống kê')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const QUICK = [
    { icon: '◉', label: 'Thêm bác sĩ',     path: '/admin/doctors'      },
    { icon: '▣', label: 'Thêm phòng khám', path: '/admin/clinics'      },
    { icon: '◇', label: 'Thêm thuốc',      path: '/admin/medicines'    },
    { icon: '▦', label: 'Xem lịch khám',   path: '/admin/appointments' },
    { icon: '▤', label: 'Xem bệnh án',     path: '/admin/records'      },
    { icon: '◈', label: 'Thanh toán',      path: '/admin/payments'     },
  ]

  if (loading) return <div className={styles.loading}>Đang tải dữ liệu...</div>

  return (
    <div>
      {/* Stats Row */}
      <div className={styles.statsRow}>
        <StatCard label="Tổng người dùng"   value={stats.users}                     sub="Trong hệ thống"           color="blue"   />
        <StatCard label="Bác sĩ hoạt động"  value={stats.doctors}                   sub="Đang làm việc"            color="green"  />
        <StatCard label="Lịch khám hôm nay" value={stats.appointments}              sub="Lượt đặt trong ngày"      color="amber"  />
        <StatCard label="Doanh thu tháng"   value={formatVnd(stats.monthlyRevenue)} sub={`Tổng: ${formatVnd(stats.totalRevenue)}`} color="blue" />
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
            <span onClick={() => navigate('/admin/appointments')} style={{cursor: 'pointer'}}>Xem tất cả →</span>
          </div>
          {recentApt.length > 0 ? recentApt.map(a => (
            <div key={a.id} className={styles.aptRow}>
              <div className={styles.aptAva}>
                {/* Lấy chữ cái đầu của tên bệnh nhân từ Database */}
                {a.patientName ? a.patientName.split(' ').slice(-1)[0][0] : '?'}
              </div>
              <div className={styles.aptInfo}>
                <div className={styles.aptName}>{a.patientName}</div>
                <div className={styles.aptSub}>{a.specialtyName} · {a.appointmentTime}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          )) : <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Chưa có lịch khám mới</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Top chuyên khoa theo lượt khám</div>
          {specialtyStats.length === 0 && (
            <div style={{ padding: '20px', textAlign: 'center', color: '#999', fontSize: 13 }}>
              Chưa có dữ liệu
            </div>
          )}
          {specialtyStats.map(s => (
            <div key={s.name} className={styles.barRow}>
              <span className={styles.barLabel}>{s.name}</span>
              <div className={styles.barBg}>
                <div className={styles.barFill} style={{ width: s.pct + '%' }} />
              </div>
              <span className={styles.barVal}>{s.count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}