// ─── SPECIALTIES ────────────────────────────────────────────────────────────
export const SPECIALTIES = [
  { id: 1, icon: '🫁', name: 'Hô hấp', doctorCount: 8 },
  { id: 2, icon: '🧠', name: 'Thần kinh', doctorCount: 12 },
  { id: 3, icon: '❤️', name: 'Tim mạch', doctorCount: 10 },
  { id: 4, icon: '🦷', name: 'Răng hàm mặt', doctorCount: 15 },
  { id: 5, icon: '👁️', name: 'Mắt', doctorCount: 7 },
  { id: 6, icon: '🦴', name: 'Cơ xương khớp', doctorCount: 9 },
  { id: 7, icon: '🩺', name: 'Nhi khoa', doctorCount: 14 },
  { id: 8, icon: '🌿', name: 'Y học cổ truyền', doctorCount: 6 },
  { id: 9, icon: '🧬', name: 'Dị ứng miễn dịch', doctorCount: 5 },
  { id: 10, icon: '💊', name: 'Nội tổng quát', doctorCount: 20 },
  { id: 11, icon: '🫀', name: 'Tiêu hoá', doctorCount: 11 },
  { id: 12, icon: '🤰', name: 'Sản phụ khoa', doctorCount: 13 },
]

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const DOCTORS = [
  {
    id: 1,
    name: 'BS. CK2 Lê Thị Minh Hồng',
    specialty: 'Nhi khoa',
    specialtyId: 7,
    hospital: 'Bệnh viện Nhi Đồng 2',
    avatar: '👩‍⚕️',
    experience: 26,
    rating: 4.9,
    reviewCount: 312,
    price: '200.000đ',
    position: 'Phó Giám Đốc Bệnh Viện Nhi Đồng 2',
    description: 'Chuyên gia hàng đầu về nhi khoa với hơn 26 năm kinh nghiệm điều trị các bệnh lý trẻ em phức tạp.',
  },
  {
    id: 2,
    name: 'PGS. TS. BS Lâm Việt Trung',
    specialty: 'Tiêu hoá · Ngoại tiết niệu',
    specialtyId: 11,
    hospital: 'Bệnh viện Chợ Rẫy',
    avatar: '👨‍⚕️',
    experience: 20,
    rating: 4.8,
    reviewCount: 245,
    price: '300.000đ',
    position: 'Trưởng khoa Ngoại tiêu hoá',
    description: 'Phó giáo sư, Tiến sĩ với nhiều công trình nghiên cứu về tiêu hoá và ngoại tiết niệu.',
  },
  {
    id: 3,
    name: 'BS. CK2 Nguyễn Thị Thu Hà',
    specialty: 'Nhi khoa',
    specialtyId: 7,
    hospital: 'Bệnh viện Nhi Đồng TP',
    avatar: '👩‍⚕️',
    experience: 18,
    rating: 4.7,
    reviewCount: 198,
    price: '180.000đ',
    position: 'Bác sĩ chuyên khoa II',
    description: 'Bác sĩ giàu kinh nghiệm trong điều trị các bệnh lý hô hấp và tiêu hoá ở trẻ em.',
  },
  {
    id: 4,
    name: 'BS. CK2 Võ Đức Hiếu',
    specialty: 'Ung bướu',
    specialtyId: 3,
    hospital: 'Bệnh viện Ung Bướu TP. HCM',
    avatar: '👨‍⚕️',
    experience: 22,
    rating: 4.9,
    reviewCount: 287,
    price: '350.000đ',
    position: 'Trưởng khoa Nội ung bướu',
    description: 'Chuyên gia ung bướu hàng đầu, từng tu nghiệp tại Pháp và Mỹ với nhiều công bố quốc tế.',
  },
  {
    id: 5,
    name: 'GS. TS. BS Nguyễn Văn An',
    specialty: 'Tim mạch',
    specialtyId: 3,
    hospital: 'Bệnh viện Chợ Rẫy',
    avatar: '👨‍⚕️',
    experience: 30,
    rating: 5.0,
    reviewCount: 420,
    price: '400.000đ',
    position: 'Giáo sư đầu ngành Tim mạch',
    description: 'Giáo sư Tiến sĩ với hơn 30 năm kinh nghiệm, chuyên gia phẫu thuật tim hàng đầu Việt Nam.',
  },
  {
    id: 6,
    name: 'BS. CK1 Trần Thị Mai',
    specialty: 'Sản phụ khoa',
    specialtyId: 12,
    hospital: 'Bệnh viện Từ Dũ',
    avatar: '👩‍⚕️',
    experience: 15,
    rating: 4.8,
    reviewCount: 356,
    price: '200.000đ',
    position: 'Bác sĩ chuyên khoa I',
    description: 'Chuyên gia sản phụ khoa với nhiều kinh nghiệm điều trị và theo dõi thai kỳ phức tạp.',
  },
  {
    id: 7,
    name: 'BS. CK2 Phạm Minh Tuấn',
    specialty: 'Thần kinh',
    specialtyId: 2,
    hospital: 'Bệnh viện Nhân dân 115',
    avatar: '👨‍⚕️',
    experience: 19,
    rating: 4.7,
    reviewCount: 178,
    price: '250.000đ',
    position: 'Trưởng khoa Thần kinh',
    description: 'Chuyên gia thần kinh học với kinh nghiệm điều trị đột quỵ và các rối loạn thần kinh phức tạp.',
  },
  {
    id: 8,
    name: 'BS. CK2 Lê Hoàng Nam',
    specialty: 'Cơ xương khớp',
    specialtyId: 6,
    hospital: 'Bệnh viện Chấn thương Chỉnh hình',
    avatar: '👨‍⚕️',
    experience: 17,
    rating: 4.6,
    reviewCount: 142,
    price: '220.000đ',
    position: 'Bác sĩ chuyên khoa II',
    description: 'Chuyên gia phẫu thuật khớp và phục hồi chức năng với nhiều ca phẫu thuật thành công.',
  },
]

// ─── HOSPITALS ───────────────────────────────────────────────────────────────
export const HOSPITALS = [
  { id: 1, name: 'Bệnh viện Chợ Rẫy', address: '201B Nguyễn Chí Thanh, Q.5, TP.HCM', specialties: 40, icon: '🏥' },
  { id: 2, name: 'Bệnh viện Nhi Đồng 1', address: '341 Sư Vạn Hạnh, Q.10, TP.HCM', specialties: 25, icon: '🏥' },
  { id: 3, name: 'Bệnh viện Từ Dũ', address: '284 Cống Quỳnh, Q.1, TP.HCM', specialties: 15, icon: '🏥' },
  { id: 4, name: 'Bệnh viện Nhân dân 115', address: '527 Sư Vạn Hạnh, Q.10, TP.HCM', specialties: 30, icon: '🏥' },
]

// ─── SCHEDULE TEMPLATE (matching your DB schema) ─────────────────────────────
// Mirrors: schedule_templates(doctor_id, start_time, end_time, duration_minutes, max_patients)
export const SCHEDULE_TEMPLATES = [
  { id: 1, doctor_id: 1, start_time: '07:00', end_time: '12:00', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 2, doctor_id: 1, start_time: '13:00', end_time: '17:00', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 3, doctor_id: 2, start_time: '08:00', end_time: '11:30', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 4, doctor_id: 2, start_time: '14:00', end_time: '17:30', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 5, doctor_id: 3, start_time: '07:30', end_time: '11:30', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 6, doctor_id: 4, start_time: '08:00', end_time: '12:00', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 7, doctor_id: 5, start_time: '09:00', end_time: '12:00', duration_minutes: 30, max_patients: 1, is_active: true },
  { id: 8, doctor_id: 6, start_time: '07:00', end_time: '11:00', duration_minutes: 30, max_patients: 1, is_active: true },
]

// ─── CHATBOT REPLIES ─────────────────────────────────────────────────────────
export const BOT_REPLIES = {
  'nhi khoa': 'Tôi tìm thấy 14 bác sĩ nhi khoa đang nhận lịch. BS. CK2 Lê Thị Minh Hồng tại Nhi Đồng 2 có khung giờ sáng. Bạn muốn đặt không?',
  'tim mạch': 'BV Chợ Rẫy và BV Nhân dân 115 có chuyên khoa tim mạch. Hiện có 10 bác sĩ đang nhận lịch tuần này.',
  'đau đầu': 'Đau đầu có thể do nhiều nguyên nhân. Tôi khuyên khám chuyên khoa Thần kinh trước. Bạn có thêm triệu chứng gì không (sốt, buồn nôn...)?',
  'lịch sử': 'Bạn chưa đăng nhập. Vui lòng đăng nhập để xem lịch sử đặt khám.',
  'hô hấp': 'Chuyên khoa Hô hấp có 8 bác sĩ đang hoạt động. BV Phổi Trung ương có lịch trống buổi chiều nay.',
  'sản phụ khoa': 'Bệnh viện Từ Dũ là địa chỉ uy tín nhất về sản phụ khoa. BS. CK1 Trần Thị Mai hiện đang nhận lịch.',
  'xương khớp': 'BV Chấn thương Chỉnh hình có đội ngũ bác sĩ cơ xương khớp hàng đầu. Hiện có 9 bác sĩ nhận lịch.',
  'giá': 'Phí khám dao động từ 180.000đ – 400.000đ tuỳ bác sĩ. Giá đã bao gồm phí tư vấn và phiếu khám.',
  'bảo hiểm': 'Hiện tại MedCare hỗ trợ thanh toán BHYT tại một số bệnh viện công. Vui lòng kiểm tra khi đặt lịch.',
}

export const DAYS_VN = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

// ─── UTILS ───────────────────────────────────────────────────────────────────

/**
 * Generate time slots from schedule_template
 * Matches schema: start_time, end_time, duration_minutes
 */
export function generateSlots(template) {
  const slots = []
  const [sh, sm] = template.start_time.split(':').map(Number)
  const [eh, em] = template.end_time.split(':').map(Number)
  let current = sh * 60 + sm
  const end = eh * 60 + em

  while (current + template.duration_minutes <= end) {
    const startH = String(Math.floor(current / 60)).padStart(2, '0')
    const startM = String(current % 60).padStart(2, '0')
    const next = current + template.duration_minutes
    const endH = String(Math.floor(next / 60)).padStart(2, '0')
    const endM = String(next % 60).padStart(2, '0')
    slots.push(`${startH}:${startM}–${endH}:${endM}`)
    current = next
  }
  return slots
}

export function buildDates(count = 7) {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(now)
    d.setDate(now.getDate() + i)
    return {
      label: `${DAYS_VN[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
      slots: Math.floor(Math.random() * 15) + 20,
      date: d,
    }
  })
}

export function getBotReply(q) {
  const lq = q.toLowerCase()
  for (const key in BOT_REPLIES) {
    if (lq.includes(key)) return BOT_REPLIES[key]
  }
  return `Tôi hiểu bạn hỏi về "${q.slice(0, 25)}...". Bạn có thể mô tả thêm triệu chứng hoặc cần hỗ trợ gì không?`
}
