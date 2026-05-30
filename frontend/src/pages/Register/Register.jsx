import { useState } from 'react'
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateRegister, getPasswordStrength } from '../../utils/validators'
import FormField from '../../components/UI/FormField'
import PasswordInput from '../../components/UI/PasswordInput'
import { authService } from '../../services/authService'
import styles from './Register.module.css'

const GOOGLE_ICON = (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
)

export default function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [done, setDone] = useState(false)

  const { values, errors, loading, handleChange, handleSubmit } = useForm(
    { fullName: '',
       email: '',
       phone: '',
       dateOfBirth: '',
       address: '',
       gender: '',
       password: '',
       retypePassword: '',
       agree: false },
    validateRegister
  )

  const strength = getPasswordStrength(values.password)

  const onSubmit = handleSubmit(async (vals) => {
    try {
      await authService.register(vals)
      toast.success("Đăng ký thành công!")
      setDone(true)
    } catch (error) {
      toast.error(error.message || "Đăng ký thất bại")
    }
  })

  if (done) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Đăng ký thành công!</h2>
          <p className={styles.successSub}>
            Tài khoản của bạn đã được tạo thành công.<br />
            Vui lòng kiểm tra email để xác minh tài khoản.
          </p>
          <Link to="/dang-nhap" className={styles.btnPrimary} style={{ display: 'block', textAlign: 'center', textDecoration: 'none', marginTop: 20 }}>
            Đăng nhập ngay →
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>Bệnh viện <span>Bạch Mai</span></Link>
        <p className={styles.subtitle}>Tạo tài khoản để đặt lịch khám dễ dàng hơn</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <Link to="/dang-nhap" className={styles.tab}>Đăng nhập</Link>
          <span className={`${styles.tab} ${styles.tabActive}`}>Đăng ký</span>
        </div>

        <form onSubmit={onSubmit} noValidate className={styles.form} autoComplete="off">

          <FormField label="Họ và tên" error={errors.fullName}>
            <input
              name="fullName"
              value={values.fullName}
              onChange={handleChange}
              placeholder=""
              autoComplete="new-password"
              className={`${styles.input} ${errors.fullName ? styles.inputErr : ''}`}
            />
          </FormField>

          <FormField label="Số điện thoại" error={errors.phone}>
            <input
              name="phone"
              type="tel"
              value={values.phone}
              onChange={handleChange}
              placeholder=""
              autoComplete="username"
              className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`}
            />
          </FormField>

          <FormField label="Email" error={errors.email}>
            <input
              name="email"
              type="email"
              value={values.email}
              onChange={handleChange}
              placeholder=""
              autoComplete="off"
              className={`${styles.input} ${errors.email ? styles.inputErr : ''}`}
            />
          </FormField>

          <FormField label="Địa chỉ" error={errors.address}>
            <input
              name="address"
              value={values.address}
              onChange={handleChange}
              placeholder="Ví dụ: Hà Đông, Hà Nội"
              autoComplete="new-password"
              className={`${styles.input} ${errors.address ? styles.inputErr : ''}`}
            />
          </FormField>

          {/* Ngày sinh & Giới tính */}
          <div className={styles.row2}>
            <FormField label="Ngày sinh">
              <input
                name="dateOfBirth"
                type="date"
                value={values.dateOfBirth}
                onChange={handleChange}
                autoComplete="off"
                className={styles.input}
              />
            </FormField>
            <FormField label="Giới tính">
              <select name="gender" value={values.gender} onChange={handleChange} className={styles.input}>
                   <option value="">Chọn</option>
                   <option value="MALE">Nam</option>   {/* CHỮ IN HOA MỚI ĐÚNG */}
                   <option value="FEMALE">Nữ</option>
                   <option value="OTHER">Khác</option>
              </select>
            </FormField>
          </div>

          {/* Password */}
          <FormField label="Mật khẩu" error={errors.password}>
            <PasswordInput
              name="password"
              value={values.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Ít nhất 8 ký tự"
              error={errors.password}
            />
            {values.password && (
              <>
                <div className={styles.strengthBar}>
                  <div style={{ width: strength.width, background: strength.color, height: '100%', borderRadius: 2, transition: 'all .3s' }} />
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
              </>
            )}
          </FormField>

          <FormField label="Xác nhận mật khẩu" error={errors.retypePassword}>
            <PasswordInput
              name="retypePassword"
              value={values.retypePassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu"
              error={errors.retypePassword}
            />
          </FormField>

          {/* Agree */}
          <div>
            <label className={styles.checkRow}>
              <input
                type="checkbox"
                name="agree"
                checked={values.agree}
                onChange={handleChange}
                className={styles.checkbox}
              />
              <span>
                Tôi đồng ý với{' '}
                <Link to="/dieu-khoan" className={styles.link}>Điều khoản dịch vụ</Link> và{' '}
                <Link to="/bao-mat" className={styles.link}>Chính sách bảo mật</Link> của Bệnh viện Bạch Mai
              </span>
            </label>
            {errors.agree && <div className={styles.errMsg}>{errors.agree}</div>}
          </div>

          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
          </button>

          <div className={styles.divider}><span>hoặc</span></div>

          <button type="button" className={styles.btnSocial}>
            {GOOGLE_ICON}
            Đăng ký với Google
          </button>

          <p className={styles.switchText}>
            Đã có tài khoản?{' '}
            <Link to="/dang-nhap" className={styles.switchLink}>Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  )
}