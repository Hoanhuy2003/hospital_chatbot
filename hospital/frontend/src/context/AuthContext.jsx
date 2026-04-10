import { createContext, useContext, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // null = chưa đăng nhập

  function login(data) {
    // data: { email, name }
    // TODO: gọi API POST /api/auth/login
    setUser({ ...data, avatar: data.name?.charAt(0)?.toUpperCase() || 'U' })
  }

  function register(data) {
    // data: { ho, ten, email, phone, dob, gender }
    // TODO: gọi API POST /api/auth/register
    setUser({
      name: `${data.ho} ${data.ten}`,
      email: data.email,
      phone: data.phone,
      avatar: data.ho?.charAt(0)?.toUpperCase() || 'U',
    })
  }

  function logout() {
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
