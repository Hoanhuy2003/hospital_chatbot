import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useBooking } from '../../context/BookingContext'
import { useAuth } from '../../context/AuthContext'
import ProfileModal from '../ProfileModal/ProfileModal'
import styles from './Navbar.module.css'

export default function Navbar() {
  const [menuOpen,    setMenuOpen]    = useState(false)
  const [dropOpen,    setDropOpen]    = useState(false)
  const [showProfile, setShowProfile] = useState(false)

  const location  = useLocation()
  const navigate  = useNavigate()
  const { bookings } = useBooking()
  const { user, logout } = useAuth()
  const confirmedCount = bookings.filter(b => b.status === 'confirmed').length

  // Đóng dropdown khi click ra ngoài
  const dropRef = useRef(null)
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) {
        setDropOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const links = [
    { label: 'Đặt khám',         path: '/'         },
    { label: 'Tư vấn trực tuyến', path: '/tu-van'  },
    { label: 'Tin Y tế',          path: '/tin-tuc' },
  ]

  const avatarInitial = (user?.fullName || user?.name || 'U')
    .split(' ').pop()[0].toUpperCase()

  function handleLogout() {
    logout()
    navigate('/')
  }

  return (
    <>
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
              <div className={styles.userMenu} ref={dropRef}>
                {/* Avatar button — click mở dropdown */}
                <button
                  className={styles.avatarBtn}
                  onClick={() => setDropOpen(v => !v)}
                  title="Tài khoản của tôi"
                >
                  <div className={styles.avatar}>{avatarInitial}</div>
                  <span className={styles.userName}>
                    {user.fullName || user.name}
                  </span>
                  <span className={`${styles.chevron} ${dropOpen ? styles.chevronUp : ''}`}>▾</span>
                </button>

                {/* Dropdown menu */}
                {dropOpen && (
                  <div className={styles.dropdown}>
                    <div className={styles.dropHeader}>
                      <div className={styles.dropAvatar}>{avatarInitial}</div>
                      <div>
                        <div className={styles.dropName}>{user.fullName || user.name}</div>
                        <div className={styles.dropRole}>
                          {user.role === 'PATIENT' ? 'Bệnh nhân'
                            : user.role === 'DOCTOR' ? 'Bác sĩ'
                            : user.role || 'Người dùng'}
                        </div>
                      </div>
                    </div>

                    <div className={styles.dropDivider} />

                    <button
                      className={styles.dropItem}
                      onClick={() => { setShowProfile(true); setDropOpen(false) }}
                    >
                      <span>👤</span> Hồ sơ của tôi
                    </button>

                    <Link
                      to="/lich-kham-cua-toi"
                      className={styles.dropItem}
                      onClick={() => setDropOpen(false)}
                    >
                      <span>📋</span> Lịch khám của tôi
                    </Link>

                    <div className={styles.dropDivider} />

                    <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                      <span>🚪</span> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link to="/dang-nhap" className={styles.btnOutline}>Đăng nhập</Link>
                <Link to="/dang-ky"   className={styles.btnPrimary}>Đăng ký</Link>
              </>
            )}
          </div>

          <button className={styles.burger} onClick={() => setMenuOpen(v => !v)}>
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* Profile modal — render ngoài nav để không bị z-index cắt */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  )
}
