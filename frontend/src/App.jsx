import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home/Home'
import DoctorDetail from './pages/DoctorDetail/DoctorDetail'
import MyBookings from './pages/MyBookings/MyBookings'
import Login from './pages/Login/Login'
import Register from './pages/Register/Register'
import Clinics from './pages/Clinics/Clinics'
import ClinicDetail from './pages/ClinicDetail/ClinicDetail'
import SearchDoctors from './pages/SearchDoctors/SearchDoctors'
import DoctorDashboard from './pages/DoctorDashboard/DoctorDashboard'

// ADMIN PAGES - Đã sửa chính tả và dọn dẹp
import AdminLayout from './pages/Admin/AdminLayout'; // BẮT BUỘC PHẢI CÓ DÒNG NÀY
import AdminDashboard from './pages/Admin/AdminDashboard'
import DoctorManager from './pages/Admin/pages/DoctorManager'
import ClinicManager from './pages/Admin/pages/ClinicManeger' // Kiểm tra lại tên file thực tế của bạn
import AppointmentManager from './pages/Admin/pages/AppointmentManager'
import UserManager from './pages/Admin/pages/UserManeger'
import SpecialtyManager from './pages/Admin/pages/SpecialtyManeger'
import RecordManager from './pages/Admin/pages/RecordManager'
import PaymentManager from './pages/Admin/pages/PaymentManager'
import { BookingProvider } from './context/BookingContext'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/Auth/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <BookingProvider>
        <Routes>
          {/* 1. AUTH PAGES */}
          <Route path="/dang-nhap" element={<Login />} />
          <Route path="/dang-ky" element={<Register />} />

          {/* 2. DOCTOR AREA */}
          <Route path="/bac-si/dashboard" element={
            <ProtectedRoute allowedRoles={['DOCTOR']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />

          {/* 3. ADMIN AREA - Cấu trúc lồng nhau chuẩn */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} /> 
            <Route path="doctors" element={<DoctorManager />} />
            <Route path="users" element={<UserManager />} />
            <Route path="clinics" element={<ClinicManager />} />
            <Route path="specialties" element={<SpecialtyManager />} />
            <Route path="appointments" element={<AppointmentManager />} />
            <Route path="records" element={<RecordManager/>} />
            <Route path="payments" element={<PaymentManager/>} />
           
          </Route>

          {/* 4. PATIENT/PUBLIC AREA */}
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/bac-si/:id" element={<DoctorDetail />} />
                <Route path="/lich-kham-cua-toi" element={<MyBookings />} />
                <Route path="/tim-kiem" element={<SearchDoctors />} />
                <Route path="/phong-kham" element={<Clinics />} />
                <Route path="/phong-kham/:id" element={<ClinicDetail />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </BookingProvider>
    </AuthProvider>
  )
}