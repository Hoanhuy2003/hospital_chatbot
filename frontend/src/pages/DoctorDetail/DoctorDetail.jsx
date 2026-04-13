import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { DOCTORS } from '../../data/constants'
import BookingModal from '../../components/BookingModal/BookingModal'
import styles from './DoctorDetail.module.css'

export default function DoctorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const doctor = DOCTORS.find(d => d.id === Number(id))
  const [showModal, setShowModal] = useState(false)

  if (!doctor) {
    return (
      <div className={styles.notFound}>
        <div style={{ fontSize: 56 }}>😕</div>
        <h2>Không tìm thấy bác sĩ</h2>
        <button onClick={() => navigate('/')}>← Về trang chủ</button>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <button className={styles.backBtn} onClick={() => navigate(-1)}>← Quay lại</button>

      <div className={styles.card}>
        {/* Profile */}
        <div className={styles.profile}>
          <div className={styles.avatar}>{doctor.avatar}</div>
          <div className={styles.info}>
            <h1 className={styles.name}>{doctor.name}</h1>
            <div className={styles.position}>{doctor.position}</div>
            <div className={styles.tags}>
              <span className={styles.tag}>✓ Đã xác minh</span>
              <span className={styles.tag}>{doctor.experience} năm kinh nghiệm</span>
              <span className={styles.tagOrange}>{doctor.price}/lượt</span>
            </div>
            <div className={styles.meta}>
              <div><strong>Chuyên khoa:</strong> <span className={styles.blue}>{doctor.specialty}</span></div>
              <div><strong>Nơi công tác:</strong> {doctor.hospital}</div>
              <div><strong>Đánh giá:</strong> ⭐ {doctor.rating} ({doctor.reviewCount} lượt)</div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Giới thiệu</h2>
          <p className={styles.desc}>{doctor.description}</p>
        </div>

        {/* Book button */}
        <div className={styles.bookBar}>
          <div>
            <div className={styles.bookBarLabel}>Hỗ trợ đặt khám</div>
            <div className={styles.bookBarPhone}>1900-2805</div>
          </div>
          <button className={styles.bookBtn} onClick={() => setShowModal(true)}>
            ĐẶT KHÁM NGAY
          </button>
        </div>
      </div>

      {showModal && (
        <BookingModal doctor={doctor} onClose={() => setShowModal(false)} />
      )}
    </div>
  )
}
