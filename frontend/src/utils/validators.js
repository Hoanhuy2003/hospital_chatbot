// ─── VALIDATORS ──────────────────────────────────────────────────────────────

export function validateLogin(values) {
  const errors = {}

  const phone = values.phone?.replace(/\s/g, '')
  if (!phone) {
    errors.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^0\d{9}$/.test(phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu'
  } else if (values.password.length < 6) {
    errors.password = 'Mật khẩu ít nhất 6 ký tự'
  }

  return errors
}

export function validateRegister(values) {
  const errors = {}

  if (!values.fullName?.trim()) errors.fullName = 'Vui lòng nhập họ và tên'

  if (!values.email?.trim()) {
    errors.email = 'Vui lòng nhập email'
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = 'Email không đúng định dạng'
  }

  const phone = values.phone?.replace(/\s/g, '')
  if (!phone) {
    errors.phone = 'Vui lòng nhập số điện thoại'
  } else if (!/^0\d{9}$/.test(phone)) {
    errors.phone = 'Số điện thoại không hợp lệ (10 số, bắt đầu bằng 0)'
  }

  if (!values.password) {
    errors.password = 'Vui lòng nhập mật khẩu'
  } else if (values.password.length < 8) {
    errors.password = 'Mật khẩu ít nhất 8 ký tự'
  }

  if (!values.retypePassword) {
    errors.retypePassword = 'Vui lòng xác nhận mật khẩu'
  } else if (values.password !== values.retypePassword) {
    errors.retypePassword = 'Mật khẩu không khớp'
  }

  if (!values.agree) {
    errors.agree = 'Bạn cần đồng ý với điều khoản dịch vụ'
  }

  return errors
}

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: 'transparent', width: '0%' }

  let score = 0
  if (password.length >= 8)           score++
  if (/[A-Z]/.test(password))         score++
  if (/[0-9]/.test(password))         score++
  if (/[^A-Za-z0-9]/.test(password))  score++

  const map = [
    { label: '',           color: 'transparent', width: '0%'   },
    { label: 'Yếu',        color: '#E53935',     width: '25%'  },
    { label: 'Trung bình', color: '#FB8C00',     width: '50%'  },
    { label: 'Mạnh',       color: '#43A047',     width: '75%'  },
    { label: 'Rất mạnh',   color: '#1B5E20',     width: '100%' },
  ]

  return { score, ...map[score] }
}