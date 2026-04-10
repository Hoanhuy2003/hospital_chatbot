import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import DoctorDetail from './pages/DoctorDetail/DoctorDetail'
import MyBookings from './pages/MyBookings/MyBookings'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import { BookingProvider } from './context/BookingContext'
import { AuthProvider } from './context/AuthContext'

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Routes>
          {/* Auth pages - không có Navbar/Chatbot */}
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />

          {/* App pages - có Layout (Navbar + Chatbot) */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bac-si/:id" element={<DoctorDetail />} />
                <Route path="/lich-kham-cua-toi" element={<MyBookings />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BookingProvider>
    </AuthProvider>
  )
}
