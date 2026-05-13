import { useState } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import { AuthProvider } from '../../context/AuthContext'
import styles from './AdminLayout.module.css'

const NAV = [
  { key: 'dashboard',    icon: '◈', label: 'Tổng quan',           path: '/admin'                },
  { key: 'users',        icon: '◎', label: 'Người dùng',          path: '/admin/users'          },
  { key: 'doctors',      icon: '◉', label: 'Bác sĩ',              path: '/admin/doctors'        },
  { key: 'clinics',      icon: '▣', label: 'Phòng khám',          path: '/admin/clinics'        },
  { key: 'specialties',  icon: '◆', label: 'Chuyên khoa',         path: '/admin/specialties'    },
  { key: 'appointments', icon: '▦', label: 'Lịch khám',           path: '/admin/appointments'   },
  { key: 'medicines',    icon: '◇', label: 'Danh mục thuốc',      path: '/admin/medicines'      },
  { key: 'records',      icon: '▤', label: 'Bệnh án',             path: '/admin/records'        },
  { key: 'payments',     icon: '◈', label: 'Thanh toán',          path: '/admin/payments'       },
  { key: 'settings',     icon: '◎', label: 'Cài đặt',             path: '/admin/settings'       },
]

const PAGE_TITLES = Object.fromEntries(NAV.map(n => [n.path, n.label]))

export default function AdminLayout() {
  const navigate  = useNavigate()
  const location  = useLocation()

  const title = PAGE_TITLES[location.pathname] || 'Admin'
  const now   = new Date().toLocaleDateString('vi-VN', {
    weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric'
  })

  return (
    <div className={styles.shell}>

      {/* ── SIDEBAR ── */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          Med<span>Care</span>
          <em>Admin</em>
        </div>

        <nav className={styles.nav}>
          {NAV.map(n => (
            <div
              key={n.key}
              className={`${styles.navItem} ${location.pathname === n.path ? styles.active : ''}`}
              onClick={() => navigate(n.path)}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {n.label}
            </div>
          ))}
        </nav>

        <div className={styles.sidebarUser}>
          <div className={styles.userAva}>AD</div>
          <div className={styles.userName}>Admin hệ thống</div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div className={styles.main}>

        {/* Topbar */}
        <header className={styles.topbar}>
          <span className={styles.pageTitle}>{title}</span>
          <div className={styles.topbarRight}>
            <span className={styles.dateText}>{now}</span>
            <button className={styles.iconBtn} title="Thông báo">◎</button>
          </div>
        </header>

        {/* Page content */}
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}