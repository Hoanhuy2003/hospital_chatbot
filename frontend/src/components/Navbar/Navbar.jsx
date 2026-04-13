import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { bookings } = useBooking()
  const { user, logout } = useAuth()
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

  const links = [
    { label: 'Đặt khám', path: '/' },
    { label: 'Tư vấn trực tuyến', path: '/tu-van' },
    { label: 'Tin Y tế', path: '/tin-tuc' },
  ]

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <nav className={styles.nav}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>Med<span>Care</span></Link>

        <div className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
          {links.map(l => (
            <Link key={l.path} to={l.path}
              className={`${styles.link} ${location.pathname === l.path ? styles.active : ''}`}
              onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
        </div>

        <div className={styles.actions}>
          <Link to="/lich-kham-cua-toi" className={styles.bookingsLink}>
            📋 Lịch của tôi
            {confirmedCount > 0 && <span className={styles.badge}>{confirmedCount}</span>}
          </Link>

          {user ? (
            <div className={styles.userMenu}>
              <div className={styles.avatar}>{user.avatar}</div>
              <span className={styles.userName}>{user.name}</span>
              <button className={styles.btnLogout} onClick={handleLogout}>Đăng xuất</button>
            </div>
          ) : (
            <>
              <Link to="/dang-nhap" className={styles.btnOutline}>Đăng nhập</Link>
              <Link to="/dang-ky" className={styles.btnPrimary}>Đăng ký</Link>
            </>
          )}
        </div>

        <button className={styles.burger} onClick={() => setMenuOpen(v => !v)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}
