import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SPECIALTIES, DOCTORS } from '../../data/constants'
import { CLINICS } from '../../data/constants'
import DoctorCard from '../../components/DoctorCard/DoctorCard'
import BookingModal from '../../components/BookingModal/BookingModal'
import styles from './Home.module.css'


export default function Home() {
  const navigate = useNavigate()
  const [activeSpec, setActiveSpec] = useState(0)
  const [modalDoctor, setModalDoctor] = useState(null)
  const [search, setSearch] = useState('')

  const filteredDoctors = DOCTORS.filter(d =>
    search === '' ||
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.specialty.toLowerCase().includes(search.toLowerCase()) ||
    d.hospital.toLowerCase().includes(search.toLowerCase())
  )

  // Nhấn Enter hoặc nút Tìm kiếm → sang trang /tim-kiem
  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/tim-kiem')
    }
  }

  // Click chuyên khoa → sang trang /tim-kiem?specialty=...
  function handleSpecClick(s, i) {
    setActiveSpec(i)
    navigate(`/tim-kiem?specialty=${encodeURIComponent(s.name)}`)
  }

  return (
    <>
      <div className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Ứng dụng đặt khám bệnh viện</h1>
          <p className={styles.heroSub}>
            Đặt khám với hơn 1000 bác sĩ, 25 bệnh viện, 100 phòng khám để có số thứ tự và khung giờ khám trước.
          </p>
          <form className={styles.searchBox} onSubmit={handleSearch}>
            <input
              placeholder="Triệu chứng, bác sĩ, bệnh viện..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            <button type="submit">Tìm kiếm</button>
          </form>
          <div className={styles.stats}>
            {[['25+','Bệnh viện kết nối'],['1000+','Bác sĩ hoạt động'],['100+','Phòng khám đa khoa'],['40+','Chuyên khoa']].map(([n, l]) => (
              <div key={l} className={styles.statItem}>
                <span className={styles.statNum}>{n}</span>
                <span className={styles.statLabel}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {['Bệnh viện kết nối','Bác sĩ hoạt động','Phòng khám đa khoa','Chuyên khoa'].map((t, i) => (
            <div key={t} className={`${styles.tabItem} ${i === 0 ? styles.tabActive : ''}`}>{t}</div>
          ))}
        </div>
      </div>

      <main className={styles.main}>

        {/* CHUYÊN KHOA */}
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>Đặt lịch theo chuyên khoa</div>
            <div className={styles.sectionSub}>Thuận tiện, an toàn và nhanh chóng trong việc đặt lịch</div>
          </div>
          <button className={styles.btnMore} onClick={() => navigate('/tim-kiem')}>
            Xem thêm
          </button>
        </div>
        <div className={styles.specGrid}>
          {SPECIALTIES.map((s, i) => (
            <div
              key={s.id}
              className={`${styles.specCard} ${activeSpec === i ? styles.specActive : ''}`}
              onClick={() => handleSpecClick(s, i)}
            >
              <div className={styles.specIcon}>{s.icon}</div>
              <div className={styles.specName}>{s.name}</div>
              <div className={styles.specCount}>{s.doctorCount} bác sĩ</div>
            </div>
          ))}
        </div>

        <div className={styles.sectionHeader}>
  <div>
    <div className={styles.sectionTitle}>Đặt khám phòng khám</div>
    <div className={styles.sectionSub}>
      Đa dạng phòng khám với nhiều chuyên khoa như Sản - Nhi, Da Liễu, Tai Mũi Họng...
    </div>
  </div>
  <button className={styles.btnMore} onClick={() => navigate('/phong-kham')}>
    Xem thêm
  </button>
</div>
<div className={styles.clinicGrid}>
  {CLINICS.slice(0, 4).map(clinic => (
    <div
      key={clinic.id}
      className={styles.clinicCard}
      onClick={() => navigate(`/phong-kham/${clinic.id}`)}
    >
      <div className={styles.clinicImg}>{clinic.avatar}</div>
      <div className={styles.clinicName}>{clinic.name}</div>
      <div className={styles.clinicAddr}>{clinic.address}</div>
    </div>
  ))}
</div>

        

        {/* BÁC SĨ */}
        <div className={styles.sectionHeader}>
          <div>
            <div className={styles.sectionTitle}>Đặt khám bác sĩ</div>
            <div className={styles.sectionSub}>Phiếu khám kèm số thứ tự và thời gian của bạn được xác nhận</div>
          </div>
          <button className={styles.btnMore} onClick={() => navigate('/tim-kiem')}>
            Xem thêm
          </button>
        </div>

        {filteredDoctors.length === 0 ? (
          <div className={styles.empty}>
            <div>Không tìm thấy bác sĩ phù hợp với "{search}"</div>
          </div>
        ) : (
          <div className={styles.docGrid}>
            {filteredDoctors.map(doc => (
              <DoctorCard key={doc.id} doctor={doc} onBook={setModalDoctor} />
            ))}
          </div>
        )}

      </main>

      {modalDoctor && <BookingModal doctor={modalDoctor} onClose={() => setModalDoctor(null)} />}
    </>
  )
}