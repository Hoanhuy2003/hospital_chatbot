import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateLogin } from '../../utils/validators'
import FormField from '../../components/UI/FormField'
import PasswordInput from '../../components/UI/PasswordInput'
import styles from './Login.module.css'
import { authService } from '../../services/authService' // 1. Import service của bạn

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [done, setDone] = useState(false)
  const [serverError, setServerError] = useState('') // Thêm state để hiện lỗi từ Java

  const { values, errors, loading, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    validateLogin
  )

  // 2. Sửa lại hàm onSubmit thực tế
  const onSubmit = handleSubmit(async (vals) => {
    try {
      setServerError(''); // Xóa lỗi cũ trước khi gửi

      // Gọi API thực tế thông qua service
      const data = await authService.login(vals.email, vals.password);

      // Lưu token vào localStorage (Để Interceptor tự lấy dùng)
      localStorage.setItem('token', data.accessToken);
      
      // Lưu thông tin vào Context (AuthContext)
      login({ 
        id: data.userId, 
        fullName: data.fullName, 
        role: data.role 
      });

      // Hiển thị màn hình thành công
      setDone(true);

      // Điều hướng dựa trên vai trò người dùng sau 1.5s
      setTimeout(() => {
        if (data.role === 'ADMIN') {
          navigate('/admin');
        } else if (data.role === 'DOCTOR') {
          navigate('/doctor/dashboard');
        } else {
          navigate('/'); // Bệnh nhân về trang chủ
        }
      }, 1500);

    } catch (err) {
      // Bắt lỗi từ Backend (Sai mật khẩu, 401,...)
      const message = err.response?.data?.message || "Số điện thoại hoặc mật khẩu không chính xác!";
      setServerError(message);
      console.error("Login failed:", err);
    }
  })

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Đăng nhập thành công!</h2>
          <p className={styles.successSub}>Chào mừng bạn quay trở lại MedCare. Đang chuyển về trang chủ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>Med<span>Care</span></Link>
        <p className={styles.subtitle}>Hệ thống đặt lịch khám bệnh viện trực tuyến</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <span className={`${styles.tab} ${styles.tabActive}`}>Đăng nhập</span>
          <Link to="/dang-ky" className={styles.tab}>Đăng ký</Link>
        </div>

        {/* Hiển thị lỗi từ server nếu có */}
        {serverError && (
          <p style={{ color: '#e74c3c', textAlign: 'center', fontSize: '14px', marginBottom: '10px' }}>
            {serverError}
          </p>
        )}

        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <FormField label="Email hoặc số điện thoại" error={errors.email}>
            <input
              name="email"
              type="text"
              value={values.email}
              onChange={handleChange}
              placeholder="098xxx hoặc example@email.com"
              className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
              autoComplete="username"
            />
          </FormField>

          <FormField label="Mật khẩu" error={errors.password}>
            <PasswordInput
              name="password"
              value={values.password}
              onChange={handleChange}
              placeholder="Nhập mật khẩu"
              error={errors.password}
            />
          </FormField>

          <div className={styles.forgotRow}>
            <Link to="/quen-mat-khau" className={styles.forgotLink}>Quên mật khẩu?</Link>
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Đang kiểm tra...' : 'Đăng nhập'}
          </button>

          <div className={styles.divider}><span>hoặc</span></div>

          <button type="button" className={styles.btnSocial}>
            {GOOGLE_ICON}
            Tiếp tục với Google
          </button>

          <p className={styles.switchText}>
            Chưa có tài khoản? <Link to="/dang-ky" className={styles.switchLink}>Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  )
}