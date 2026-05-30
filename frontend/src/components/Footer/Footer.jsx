import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

const QUICK_LINKS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Chuyên khoa', path: '/chuyen-khoa' },
  { label: 'Tin Y tế', path: '/tin-tuc' },
  { label: 'Tìm bác sĩ', path: '/tim-kiem' },
  { label: 'Phòng khám', path: '/phong-kham' },
  { label: 'Lịch khám của tôi', path: '/lich-kham-cua-toi' },
]

const SUPPORT_LINKS = [
  { label: 'Đăng nhập', path: '/dang-nhap' },
  { label: 'Đăng ký tài khoản', path: '/dang-ky' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.grid}>
          <div className={styles.brandCol}>
            <div className={styles.brandName}>Bệnh viện Bạch Mai</div>
            <p className={styles.brandDesc}>
              Hệ thống đặt khám trực tuyến — kết nối bệnh nhân với đội ngũ bác sĩ và phòng khám của Bệnh viện Bạch
              Mai, nhanh chóng và tiện lợi.
            </p>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Đặt khám nhanh</h4>
            <ul className={styles.linkList}>
              {QUICK_LINKS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Tài khoản</h4>
            <ul className={styles.linkList}>
              {SUPPORT_LINKS.map((item) => (
                <li key={item.path}>
                  <Link to={item.path}>{item.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.col}>
            <h4 className={styles.colTitle}>Liên hệ</h4>
            <ul className={styles.contactList}>
              <li>
                <span className={styles.contactIcon}>📞</span>
                <span>Hotline: <strong>1900-2805</strong></span>
              </li>
              <li>
                <span className={styles.contactIcon}>✉️</span>
                <span>lienhe@bachmai.vn</span>
              </li>
              <li>
                <span className={styles.contactIcon}>📍</span>
                <span>78 Giải Phóng, Đống Đa, Hà Nội</span>
              </li>
              <li>
                <span className={styles.contactIcon}>🕐</span>
                <span>Thứ 2 – CN: 7:00 – 20:00</span>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.bottom}>
          <span>© {year} Bệnh viện Bạch Mai. Bảo lưu mọi quyền.</span>
          <span className={styles.bottomNote}>Dự án đặt khám bệnh viện — phiên bản demo</span>
        </div>
      </div>
    </footer>
  )
}
