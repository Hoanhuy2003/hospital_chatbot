import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { CLINICS } from '../../data/constants'
import BookingModal from '../../components/BookingModal/BookingModal'
import styles from './ClinicDetail.module.css'

// Bác sĩ giả của phòng khám (sau thay bằng API)
const MOCK_DOCTORS = [
  { id: 101, name: 'BS. CK2 Nguyễn Thị A', specialty: 'Theo chuyên khoa PK', hospital: '', avatar: '👩‍⚕️', experience: 15, rating: 4.8, reviewCount: 120, price: '200.000đ' },
  { id: 102, name: 'ThS. BS Trần Văn B',    specialty: 'Theo chuyên khoa PK', hospital: '', avatar: '👨‍⚕️', experience: 10, rating: 4.6, reviewCount: 87,  price: '200.000đ' },
]

const TABS = ['Thông tin', 'Dịch vụ', 'Bác sĩ']

export default function ClinicDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const clinic = CLINICS.find(c => c.id === Number(id))
  const [tab, setTab] = useState(0)
  const [modalDoctor, setModalDoctor] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  if (!clinic) {
    return (
      <div className={styles.notFound}>
        <div style={{ fontSize: 52 }}>😕</div>
        <h2>Không tìm thấy phòng khám</h2>
        <button onClick={() => navigate('/phong-kham')}>← Quay lại</button>
      </div>
    )
  }

  // Dùng bác sĩ đầu tiên để mở modal đặt lịch chung cho phòng khám
  const bookingDoctor = {
    ...MOCK_DOCTORS[0],
    name: clinic.name,
    specialty: clinic.specialty,
    hospital: clinic.address,
    avatar: clinic.avatar,
  }

  return (
    <div className={styles.page}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <span onClick={() => navigate('/')} className={styles.breadLink}>Trang chủ</span>
        <span className={styles.sep}>/</span>
        <span onClick={() => navigate('/phong-kham')} className={styles.breadLink}>Phòng khám</span>
        <span className={styles.sep}>/</span>
        <span className={styles.breadCurrent}>{clinic.name}</span>
      </div>

      {/* Clinic header */}
      <div className={styles.clinicHeader}>
        <div className={styles.clinicAvatar}>{clinic.avatar}</div>
        <div className={styles.clinicInfo}>
          <h1 className={styles.clinicName}>{clinic.name}</h1>
          <div className={styles.clinicMeta}>
            <span className={styles.specTag}>{clinic.specialty}</span>
            <span className={styles.metaItem}>⭐ {clinic.rating} ({clinic.reviewCount} đánh giá)</span>
            <span className={styles.metaItem}>💰 {clinic.price}/lượt</span>
          </div>
          <div className={styles.metaItem} style={{ marginTop: 6 }}>📍 {clinic.address}</div>
          <div className={styles.metaItem}>🕐 {clinic.workingHours}</div>
          <div className={styles.metaItem}>📞 {clinic.phone}</div>
        </div>
        <button className={styles.btnFav}>🔖 Yêu thích</button>
      </div>

      {/* Image gallery */}
      <div className={styles.gallery}>
        <div className={styles.galleryMain}>{clinic.images[0]}</div>
        <div className={styles.galleryThumbs}>
          {clinic.images.slice(1).map((img, i) => (
            <div key={i} className={styles.galleryThumb}>{img}</div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
            onClick={() => setTab(i)}
          >{t}</button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {tab === 0 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Giới thiệu</h3>
            <p className={styles.desc}>{clinic.description}</p>
            <h3 className={styles.sectionTitle} style={{ marginTop: 20 }}>Thông tin liên hệ</h3>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Địa chỉ</span><span>{clinic.address}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Điện thoại</span><span>{clinic.phone}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Giờ làm việc</span><span>{clinic.workingHours}</span></div>
              <div className={styles.infoItem}><span className={styles.infoLabel}>Chuyên khoa</span><span>{clinic.specialty}</span></div>
            </div>
          </div>
        )}

        {tab === 1 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Dịch vụ cung cấp</h3>
            <div className={styles.serviceList}>
              {clinic.services.map((s, i) => (
                <div key={i} className={styles.serviceItem}>
                  <span className={styles.serviceDot} />
                  <span>{s}</span>
                  <span className={styles.servicePrice}>{clinic.price}</span>
                  <button className={styles.btnBookSm} onClick={() => setShowBooking(true)}>Đặt khám</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 2 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Đội ngũ bác sĩ</h3>
            <div className={styles.doctorList}>
              {MOCK_DOCTORS.map(doc => (
                <div key={doc.id} className={styles.doctorRow}>
                  <div className={styles.docAvatar}>{doc.avatar}</div>
                  <div className={styles.docInfo}>
                    <div className={styles.docName}>{doc.name}</div>
                    <div className={styles.docMeta}>{doc.experience} năm kinh nghiệm · ⭐ {doc.rating}</div>
                  </div>
                  <button className={styles.btnBookSm} onClick={() => setModalDoctor(doc)}>Đặt khám</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className={styles.stickyBar}>
        <div>
          <div className={styles.stickyLabel}>Hỗ trợ đặt khám</div>
          <div className={styles.stickyPhone}>{clinic.phone}</div>
        </div>
        <button className={styles.btnBookNow} onClick={() => setShowBooking(true)}>
          Đặt khám ngay
        </button>
      </div>

      {/* Modal */}
      {(showBooking || modalDoctor) && (
        <BookingModal
          doctor={modalDoctor || bookingDoctor}
          onClose={() => { setShowBooking(false); setModalDoctor(null) }}
        />
      )}
    </div>
  )
}