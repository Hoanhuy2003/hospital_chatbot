# MedCare – Đặt lịch khám bệnh viện 🏥

Ứng dụng React đặt lịch khám bệnh viện tích hợp chatbot, xây dựng với Vite + React 18.

---

## Cách chạy

```bash
# 1. Cài dependencies
npm install

# 2. Chạy dev server (http://localhost:3000)
npm run dev

# 3. Build production
npm run build
```

---

## Cấu trúc thư mục

```
src/
├── assets/                  # Ảnh, icon tĩnh
│
├── context/
│   └── BookingContext.jsx   # Global state: danh sách lịch, chatbot msg
│
├── hooks/
│   ├── useSlots.js          # Tạo khung giờ từ schedule_templates (DB schema)
│   └── useDates.js          # Danh sách 7 ngày tới
│
├── data/
│   └── constants.js         # Mock data: DOCTORS, SPECIALTIES, SCHEDULE_TEMPLATES
│                            # Utils: generateSlots(), buildDates(), getBotReply()
│
├── components/
│   ├── Layout/              # Layout bọc toàn bộ app (Navbar + Chatbot)
│   │   ├── Layout.jsx
│   │   └── Layout.module.css
│   ├── Navbar/              # Thanh điều hướng + badge đếm lịch đã đặt
│   ├── DoctorCard/          # Card bác sĩ (click → DoctorDetail, đặt → Modal)
│   ├── BookingModal/        # Modal chọn ngày + khung giờ (dùng hooks)
│   └── Chatbot/             # Chat bot nổi góc phải (kết nối BookingContext)
│
├── pages/
│   ├── Home/                # Trang chủ: hero, chuyên khoa, danh sách bác sĩ
│   ├── DoctorDetail/        # Chi tiết bác sĩ (route: /bac-si/:id)
│   └── MyBookings/          # Lịch của tôi + huỷ lịch (route: /lich-kham-cua-toi)
│
├── App.jsx                  # Định nghĩa Routes
├── main.jsx                 # Entry point
└── index.css                # CSS variables toàn cục
```

---

## Liên kết với CSDL (`schedule_templates`)

File `src/data/constants.js` mock dữ liệu khớp với schema DB:

```sql
CREATE TABLE schedule_templates (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  doctor_id        BIGINT,
  start_time       TIME NOT NULL,
  end_time         TIME NOT NULL,
  duration_minutes INT  NOT NULL,
  max_patients     INT  NOT NULL DEFAULT 1,
  is_active        BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_template_doctor
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE,
  CONSTRAINT chk_time_range CHECK (end_time > start_time)
);
```

Hook `useSlots(doctorId)` gọi `generateSlots(template)` để tạo danh sách khung giờ
từ `start_time`, `end_time`, `duration_minutes` — giống đúng logic backend.

---

## Kết nối API thực (Spring Boot)

Thay mock data trong `constants.js` bằng `fetch`:

```js
// Lấy danh sách bác sĩ
const res = await fetch('/api/doctors')
const doctors = await res.json()

// Lấy schedule templates theo bác sĩ
const res = await fetch(`/api/schedule-templates?doctorId=${id}`)
const templates = await res.json()

// Đặt lịch
await fetch('/api/bookings', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ doctorId, date, slot })
})
```

---

## Tech stack

| Công nghệ       | Mục đích                  |
|-----------------|---------------------------|
| React 18        | UI framework              |
| React Router v6 | Client-side routing       |
| Vite            | Build tool & dev server   |
| CSS Modules     | Scoped styling            |
| Context API     | Global state management   |
| Custom Hooks    | Logic tái sử dụng         |
