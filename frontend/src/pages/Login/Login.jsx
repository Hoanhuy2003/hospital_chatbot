import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateLogin } from '../../utils/validators'
import FormField from '../../components/UI/FormField'
import PasswordInput from '../../components/UI/PasswordInput'
import styles from './Login.module.css'
import { authService } from '../../services/authService'

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
  const [serverError, setServerError] = useState('')

  const { values, errors, loading, handleChange, handleSubmit } = useForm(
    { phone: '', password: '' },
    validateLogin
  )

  const onSubmit = handleSubmit(async (vals) => {
    try {
      setServerError('')

      const data = await authService.login(vals.phone, vals.password)

      // Lưu token và thông tin cơ bản
      localStorage.setItem('token',    data.accessToken)
      localStorage.setItem('userId',   data.userId)
      localStorage.setItem('fullName', data.fullName)
      localStorage.setItem('role',     data.role)

      // Nếu là DOCTOR thì lưu thêm doctorId và clinicId
      if (data.role === 'DOCTOR') {
        if (data.doctorId) localStorage.setItem('doctorId', data.doctorId)
        if (data.clinicId) localStorage.setItem('clinicId', data.clinicId)
      }

      // Lưu vào AuthContext
      login({
        id:       data.userId,
        fullName: data.fullName,
        role:     data.role,
        avatar:   (data.fullName || 'U').charAt(0).toUpperCase(),
      })

      setDone(true)

      // ✅ Sửa timeout từ 1500 → 1000 cho nhanh hơn
      setTimeout(() => {
        // ✅ Dùng data.role (từ API) thay vì user.role (từ context chưa cập nhật kịp)
        if (data.role === 'ADMIN') {
          navigate('/admin', { replace: true })
        } else if (data.role === 'DOCTOR') {
          navigate('/bac-si/dashboard', { replace: true })
        } else {
          navigate('/', { replace: true })
        }
      }, 1000)

    } catch (err) {
      const message = err.response?.data?.message || 'Số điện thoại hoặc mật khẩu không chính xác!'
      setServerError(message)
      console.error('Login failed:', err)
    }
  })

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Đăng nhập thành công!</h2>
          <p className={styles.successSub}>
            {/* ✅ Hiện đúng trang đang chuyển đến */}
            Đang chuyển đến{' '}
            {localStorage.getItem('role') === 'ADMIN'
              ? 'trang Admin...'
              : localStorage.getItem('role') === 'DOCTOR'
              ? 'Dashboard bác sĩ...'
              : 'trang chủ...'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Bệnh viện <span>Bạch Mai</span></Link>
        <p className={styles.subtitle}>Hệ thống đặt lịch khám bệnh viện trực tuyến</p>

        <div className={styles.tabs}>
          <span className={`${styles.tab} ${styles.tabActive}`}>Đăng nhập</span>
          <Link to="/dang-ky" className={styles.tab}>Đăng ký</Link>
        </div>

        {serverError && (
          <div className={styles.serverError}>{serverError}</div>
        )}

        <form onSubmit={onSubmit} noValidate className={styles.form}>
          <FormField label="Số điện thoại" error={errors.phone}>
            <input
              name="phone"
              type="text"
              value={values.phone}
              onChange={handleChange}
              placeholder="0901234567"
              className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
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
            Chưa có tài khoản?{' '}
            <Link to="/dang-ky" className={styles.switchLink}>Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  )
}