import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useForm } from '../../hooks/useForm'
import { validateRegister, getPasswordStrength } from '../../utils/validators'
import FormField from '../../components/UI/FormField'
import PasswordInput from '../../components/UI/PasswordInput'
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
    { ho: '', ten: '', email: '', phone: '', dob: '', gender: '', password: '', confirmPassword: '', agree: false },
    validateRegister
  )

  const strength = getPasswordStrength(values.password)

  const onSubmit = handleSubmit(async (vals) => {
    // TODO: thay bằng API call thực
    // const res = await fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     firstName: vals.ho,
    //     lastName: vals.ten,
    //     email: vals.email,
    //     phone: vals.phone,
    //     dateOfBirth: vals.dob,
    //     gender: vals.gender,
    //     password: vals.password,
    //   })
    // })
    await new Promise(r => setTimeout(r, 1400)) // simulate
    register({ ho: vals.ho, ten: vals.ten, email: vals.email, phone: vals.phone })
    setDone(true)
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
        <Link to="/" className={styles.logo}>Med<span>Care</span></Link>
        <p className={styles.subtitle}>Tạo tài khoản để đặt lịch khám dễ dàng hơn</p>

        {/* Tabs */}
        <div className={styles.tabs}>
          <Link to="/dang-nhap" className={styles.tab}>Đăng nhập</Link>
          <span className={`${styles.tab} ${styles.tabActive}`}>Đăng ký</span>
        </div>

        <form onSubmit={onSubmit} noValidate className={styles.form}>

          {/* Họ & Tên */}
          <div className={styles.row2}>
            <FormField label="Họ" error={errors.ho}>
              <input name="ho" value={values.ho} onChange={handleChange} placeholder="Nguyễn"
                className={`${styles.input} ${errors.ho ? styles.inputErr : ''}`} />
            </FormField>
            <FormField label="Tên" error={errors.ten}>
              <input name="ten" value={values.ten} onChange={handleChange} placeholder="Văn An"
                className={`${styles.input} ${errors.ten ? styles.inputErr : ''}`} />
            </FormField>
          </div>

          <FormField label="Email" error={errors.email}>
            <input name="email" type="email" value={values.email} onChange={handleChange}
              placeholder="example@email.com" autoComplete="email"
              className={`${styles.input} ${errors.email ? styles.inputErr : ''}`} />
          </FormField>

          <FormField label="Số điện thoại" error={errors.phone}>
            <input name="phone" type="tel" value={values.phone} onChange={handleChange}
              placeholder="0901 234 567"
              className={`${styles.input} ${errors.phone ? styles.inputErr : ''}`} />
          </FormField>

          {/* Ngày sinh & Giới tính */}
          <div className={styles.row2}>
            <FormField label="Ngày sinh">
              <input name="dob" type="date" value={values.dob} onChange={handleChange}
                className={styles.input} />
            </FormField>
            <FormField label="Giới tính">
              <select name="gender" value={values.gender} onChange={handleChange} className={styles.input}>
                <option value="">Chọn</option>
                <option value="nam">Nam</option>
                <option value="nu">Nữ</option>
                <option value="khac">Khác</option>
              </select>
            </FormField>
          </div>

          {/* Password */}
          <FormField label="Mật khẩu" error={errors.password}>
            <PasswordInput name="password" value={values.password} onChange={handleChange}
              placeholder="Ít nhất 8 ký tự" error={errors.password} />
            {values.password && (
              <>
                <div className={styles.strengthBar}>
                  <div style={{ width: strength.width, background: strength.color, height: '100%', borderRadius: 2, transition: 'all .3s' }} />
                </div>
                <span className={styles.strengthLabel} style={{ color: strength.color }}>{strength.label}</span>
              </>
            )}
          </FormField>

          <FormField label="Xác nhận mật khẩu" error={errors.confirmPassword}>
            <PasswordInput name="confirmPassword" value={values.confirmPassword} onChange={handleChange}
              placeholder="Nhập lại mật khẩu" error={errors.confirmPassword} />
          </FormField>

          {/* Agree */}
          <div>
            <label className={styles.checkRow}>
              <input type="checkbox" name="agree" checked={values.agree} onChange={handleChange}
                className={styles.checkbox} />
              <span>
                Tôi đồng ý với{' '}
                <Link to="/dieu-khoan" className={styles.link}>Điều khoản dịch vụ</Link> và{' '}
                <Link to="/bao-mat" className={styles.link}>Chính sách bảo mật</Link> của MedCare
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
