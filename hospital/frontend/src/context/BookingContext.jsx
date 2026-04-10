import { createContext, useContext, useState } from 'react'

const BookingContext = createContext(null)

export function BookingProvider({ children }) {
  // Danh sách lịch đã đặt
  const [bookings, setBookings] = useState([])
  // Tin nhắn chatbot (khi đặt xong)
  const [chatMsg, setChatMsg] = useState(null)

  function addBooking(doctor, date, slot) {
    const newBooking = {
      id: Date.now(),
      doctor,
      date,
      slot,
      status: 'confirmed',
      code: 'MC' + Math.floor(Math.random() * 900000 + 100000),
      createdAt: new Date().toLocaleString('vi-VN'),
    }
    setBookings(prev => [newBooking, ...prev])

    const msg = `✅ Đặt lịch thành công!\n📋 Mã phiếu: ${newBooking.code}\n📅 ${date} · ${slot}\n👨‍⚕️ ${doctor.name}\n🏥 ${doctor.hospital}\n\nBạn sẽ nhận xác nhận qua SMS.`
    setChatMsg(msg)
    return newBooking
  }

  function cancelBooking(id) {
    setBookings(prev =>
      prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b)
    )
  }

  return (
    <BookingContext.Provider value={{ bookings, addBooking, cancelBooking, chatMsg, setChatMsg }}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}
