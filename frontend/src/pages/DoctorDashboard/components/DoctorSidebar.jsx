import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import styles from './DoctorSidebar.module.css'

// THÊM ĐỐI TƯỢNG PROFILE VÀO MẢNG NAV
const NAV = [
  { key: 'dashboard',         icon: '📊', label: 'Tổng quan'           },
  { key: 'schedule',          icon: '📅', label: 'Lịch khám hôm nay'   },
  { key: 'register_schedule', icon: '🗓️', label: 'Đăng ký lịch trực'   },
  { key: 'records',           icon: '📋', label: 'Bệnh án'             },
  { key: 'next',              icon: '🔔', label: 'Lịch hẹn lần sau'    },
  { key: 'profile',           icon: '👤', label: 'Thông tin cá nhân'   }, // <-- THÊM MỤC NÀY
]

export default function DoctorSidebar({ page, setPage }) {
  const navigate = useNavigate();

  // 1. Lấy thông tin bác sĩ từ localStorage đã lưu khi Login
  const fullName = localStorage.getItem('fullName') || 'Bác sĩ';
  const role = localStorage.getItem('role') || 'DOCTOR';
  
  // Hàm xử lý lấy chữ cái đầu của tên để làm Avatar (Ví dụ: Hoàn -> H)
  const getInitial = (name) => {
    return name ? name.split(' ').pop()[0].toUpperCase() : 'D';
  }

  // 2. Hàm đăng xuất
  const handleLogout = () => {
    if (window.confirm('Bạn chắc chắn muốn đăng xuất chứ?')) {
      localStorage.clear(); // Xóa hết token, userId, fullName...
      toast.info("Đã đăng xuất");
      navigate('/dang-nhap'); // Chuyển về trang login
    }
  }

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

      {/* PHẦN THÔNG TIN BÁC SĨ & ĐĂNG XUẤT */}
      <div className={styles.doctorWrapper}>
        <div className={styles.doctor}>
          <div className={styles.ava}>{getInitial(fullName)}</div>
          <div>
            <div className={styles.docName}>BS. {fullName}</div>
            <div className={styles.docRole}>{role === 'DOCTOR' ? 'Bác sĩ chuyên khoa' : role}</div>
          </div>
        </div>
        
        <button className={styles.logoutBtn} onClick={handleLogout}>
          <span className={styles.logoutIcon}></span> Đăng xuất
        </button>
      </div>
    </div>
  )
}