import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { clinicService } from '../../services/clinicService'
import { doctorService } from '../../services/doctorService'
import BookingModal from '../../components/BookingModal/BookingModal'
import styles from './ClinicDetail.module.css'

const TABS = ['Thông tin', 'Dịch vụ', 'Bác sĩ']

export default function ClinicDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  
  // States để lưu dữ liệu từ API
  const [clinic, setClinic] = useState(null)
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState(0)
  const [modalDoctor, setModalDoctor] = useState(null)
  const [showBooking, setShowBooking] = useState(false)

  // Fetch dữ liệu khi ID thay đổi
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        // Gọi song song 2 API lấy chi tiết phòng khám và bác sĩ của nó
        const [clinicData, doctorData] = await Promise.all([
          clinicService.getById(id),
          doctorService.getDoctorByClinic(id)
        ])
        setClinic(clinicData)
        setDoctors(doctorData || [])
      } catch (err) {
        console.error("Lỗi tải chi tiết phòng khám:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [id])

  if (loading) return <div className={styles.loading}>Đang tải thông tin...</div>
  if (!clinic) return <div className={styles.notFound}>Không tìm thấy phòng khám</div>

  // Đối tượng bác sĩ đại diện để đặt lịch nhanh theo phòng khám
  const bookingDefault = doctors.length > 0 ? doctors[0] : {
    name: clinic.name,
    specialty: clinic.specialty,
    hospital: clinic.address,
    photoUrl: clinic.photoUrl
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
        <div className={styles.docAvatar}>
          {clinic.photoUrl ? <img src={clinic.photoUrl} alt={clinic.name} /> : '🏥'}
        </div>
        <div className={styles.clinicInfo}>
          <h1 className={styles.clinicName}>{clinic.name}</h1>
          <div className={styles.clinicMeta}>
            <span className={styles.specTag}>{clinic.specialty || 'Đa khoa'}</span>
            <span className={styles.metaItem}>⭐ {clinic.rating || '5.0'}</span>
            <span className={styles.metaItem}>👨‍⚕️ {doctors.length} bác sĩ</span>
          </div>
          <div className={styles.metaItem} style={{ marginTop: 6 }}>📍 {clinic.address}</div>
          <div className={styles.metaItem}>🕐 {clinic.workingHours || '08:00 - 17:00'}</div>
          <div className={styles.metaItem}>📞 {clinic.phone}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        {TABS.map((t, i) => (
          <button
            key={t}
            className={`${styles.tab} ${tab === i ? styles.tabActive : ''}`}
            onClick={() => setTab(i)}
          >
            {t} {t === 'Bác sĩ' && `(${doctors.length})`}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className={styles.tabContent}>
        {tab === 0 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Giới thiệu</h3>
            <p className={styles.desc}>{clinic.description || 'Thông tin phòng khám đang được cập nhật.'}</p>
          </div>
        )}

        {tab === 2 && (
          <div className={styles.infoSection}>
            <h3 className={styles.sectionTitle}>Đội ngũ bác sĩ ({doctors.length})</h3>
            <div className={styles.doctorList}>
              {doctors.length === 0 ? (
                <p>Phòng khám hiện chưa cập nhật danh sách bác sĩ.</p>
              ) : (
                doctors.map(doc => (
                  <div key={doc.id} className={styles.doctorRow}>
                    <div className={styles.docAvatar}>
                       {doc.photoUrl ? <img src={doc.photoUrl} alt={doc.fullName} /> : '👨‍⚕️'}
                    </div>
                    <div className={styles.docInfo}>
                      <div className={styles.docName}>{doc.fullName}</div>
                      <div className={styles.docMeta}>
                        {doc.experienceYears || 5} năm kinh nghiệm · {doc.qualification || 'Bác sĩ'}
                      </div>
                      <div className={styles.docSpec}>{doc.specialtyName}</div>
                    </div>
                    <button className={styles.btnBookSm} onClick={() => setModalDoctor(doc)}>Đặt khám</button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Sticky bottom bar */}
      <div className={styles.stickyBar}>
        <div>
          <div className={styles.stickyLabel}>Giá khám dự kiến</div>
          <div className={styles.stickyPhone}>
            {clinic.price ? `${clinic.price.toLocaleString()}đ` : 'Đang cập nhật'}
          </div>
        </div>
        <button className={styles.btnBookNow} onClick={() => setShowBooking(true)}>
          Đặt khám ngay
        </button>
      </div>

      {/* Modal */}
      {(showBooking || modalDoctor) && (
        <BookingModal
          doctor={modalDoctor || bookingDefault}
          onClose={() => { setShowBooking(false); setModalDoctor(null) }}
        />
      )}
    </div>
  )
}