import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from './components/StatCard'
import { StatusBadge } from './components/AdminTable'
import { toast } from 'react-toastify'
import styles from './AdminDashboard.module.css'
import api from '../../services/api'// Đảm bảo sử dụng instance axios đã cấu hình của bạn

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({ users: 0, doctors: 0, appointments: 0, revenue: '0 đ' })
  const [recentApt, setRecentApt] = useState([])
  const [specialtyStats, setSpecialtyStats] = useState([]) // State cho biểu đồ chuyên khoa
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        
        // 1. Gọi API lấy thông số tổng hợp (AdminController/AdminService)
        const statsRes = await api.get('/v1/admin/dashboard-stats')
        const data = statsRes.data
        
        setStats({
          users: data.totalUsers,
          doctors: data.totalDoctors,
          appointments: data.todayAppointments,
          revenue: data.monthlyRevenue || '0 đ'
        })
        setRecentApt(data.recentAppointments || [])

        // 2. Tận dụng API thống kê chuyên khoa đã làm để vẽ biểu đồ
        const specRes = await api.get('/v1/specialty/statistics')
        // Tính toán % đơn giản (ví dụ: lấy số lượt khám làm % để hiển thị)
        const formattedSpecs = specRes.data
          .map(s => ({
            name: s.name,
            pct: s.totalAppointments > 0 ? Math.min(s.totalAppointments, 100) : 0 
          }))
          .sort((a, b) => b.pct - a.pct) // Sắp xếp phổ biến nhất lên đầu
          .slice(0, 5) // Chỉ lấy top 5

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
        <StatCard label="Tổng người dùng"    value={stats.users}        sub="Trong hệ thống"      color="blue"  />
        <StatCard label="Bác sĩ hoạt động"   value={stats.doctors}      sub="Đang làm việc"       color="green" />
        <StatCard label="Lịch khám hôm nay"  value={stats.appointments} sub="Lượt đặt mới"        color="amber" />
        <StatCard label="Doanh thu tháng"    value={stats.revenue}      sub="Tổng tiền thu"       color="blue"  />
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
                <div className={styles.aptSub}>{a.specialtyName} · {a.timeSlot}</div>
              </div>
              <StatusBadge status={a.status} />
            </div>
          )) : <div style={{padding: '20px', textAlign: 'center', color: '#999'}}>Chưa có lịch khám mới</div>}
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>Chuyên khoa theo lượt</div>
          {specialtyStats.map(s => (
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