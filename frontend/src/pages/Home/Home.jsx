import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import DoctorCard from '../../components/DoctorCard/DoctorCard'
import BookingModal from '../../components/BookingModal/BookingModal'
import { specialtyService } from '../../services/api'
import { clinicService } from '../../services/clinicService'
import { doctorService } from '../../services/doctorService'
import { statisticService } from '../../services/api'
import styles from './Home.module.css'

const HOME_CLINIC_LIMIT = 12
const HOME_SPECIALTY_LIMIT = 12
const HOME_DOCTOR_LIMIT = 12

const HOME_TABS = [
  { key: 'hospital', label: 'Bệnh viện kết nối', targetId: 'home-top' },
  { key: 'doctors', label: 'Bác sĩ hoạt động', targetId: 'section-doctors' },
  { key: 'clinics', label: 'Phòng khám đa khoa', targetId: 'section-clinics' },
  { key: 'specialties', label: 'Chuyên khoa', targetId: 'section-specialties' },
]

export default function Home() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('hospital')
  const [specialties, setSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [clinics, setClinics] = useState([])
  const [activeSpec, setActiveSpec] = useState(0)
  const [modalDoctor, setModalDoctor] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [clinicsLoading, setClinicsLoading] = useState(true)
  const [clinicError, setClinicError] = useState(null)

  const [systemStats,setSystemStats] = useState({
    doctorsCount: 0,
    clinicsCount: 0,
    specialtiesCount: 0

  })

  useEffect(() => {
  const fetchHomeStats = async () => {
    try {
      const data = await statisticService.getHomeStats();
      if (data) {
        setSystemStats(data); // Đổ dữ liệu động từ map CSDL vào giao diện công khai
      }
    } catch (error) {
      console.error("Lỗi đồng bộ số liệu thống kê:", error);
    }
  };

  fetchHomeStats();
}, []);

 

  // Fetch specialties from backend
  useEffect(() => {
    // chuyên khoa
    const fetchSpecialties = async () => {
      try {
        setLoading(true)
        const data = await specialtyService.getAll()
        setSpecialties(data || [])
      } catch (err) {
        console.error('Error fetching specialties:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    // bác sỹ
    const fetchDoctor = async () => {
      try {
        setLoading(true)
        const data = await doctorService.getAll({ page: 0, size: HOME_DOCTOR_LIMIT })
        const list = data?.content ?? (Array.isArray(data) ? data : [])
        setDoctors(Array.isArray(list) ? list.slice(0, HOME_DOCTOR_LIMIT) : [])
      } catch (err) {
        console.error('Error fetching doctors:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }


    fetchSpecialties()
    fetchDoctor()
  }, [])

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setClinicsLoading(true)
        const data = await clinicService.getAll({ page: 0, size: HOME_CLINIC_LIMIT })
        const list = data?.content || data || []
        setClinics(Array.isArray(list) ? list.slice(0, HOME_CLINIC_LIMIT) : [])
      } catch (err) {
        console.error('Error fetching clinics:', err)
        setClinicError(err.message || 'Không thể tải phòng khám')
      } finally {
        setClinicsLoading(false)
      }
    }

    fetchClinics()
  }, [])

  const filteredDoctors = doctors.filter(d => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      d.fullName?.toLowerCase().includes(q) ||
      d.specialtyName?.toLowerCase().includes(q) ||
      d.clinicName?.toLowerCase().includes(q)
    )
  })

  // Nhấn Enter hoặc nút Tìm kiếm → sang trang /tim-kiem
  function handleSearch(e) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/tim-kiem?q=${encodeURIComponent(search.trim())}`)
    } else {
      navigate('/tim-kiem')
    }
  }

  function handleTabClick(tab) {
    setActiveTab(tab.key)
    const el = document.getElementById(tab.targetId)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <>
      <div id="home-top" className={styles.hero}>
        <div className={styles.heroInner}>
          <h1 className={styles.heroTitle}>Ứng dụng đặt khám trực tuyến Bệnh viện Bạch Mai</h1>
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
            <div className={styles.statItem}>
              <span className={styles.statNum}>{systemStats.doctorsCount}+</span>
              <span className={styles.statLabel}>Bác sĩ chuyên khoa</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{systemStats.clinicsCount}+</span>
              <span className={styles.statLabel}>Phòng khám chức năng</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statNum}>{systemStats.specialtiesCount}+</span>
              <span className={styles.statLabel}>Chuyên khoa điều trị</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.tabBar}>
        <div className={styles.tabBarInner}>
          {HOME_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`${styles.tabItem} ${activeTab === tab.key ? styles.tabActive : ''}`}
              onClick={() => handleTabClick(tab)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <main className={styles.main}>

        
        {/* CHUYÊN KHOA */}
<div id="section-specialties" className={styles.sectionAnchor} />
<div className={styles.sectionHeader}>
  <div>
    <div className={styles.sectionTitle}>Đặt lịch theo chuyên khoa</div>
    <div className={styles.sectionSub}>Thuận tiện, an toàn và nhanh chóng trong việc đặt lịch</div>
  </div>
  {/* Sửa lại: Xem thêm thì sang trang tìm kiếm chung, không cần truyền ID cụ thể */}
  <button className={styles.btnMore} onClick={() => navigate('/chuyen-khoa')}>
    Xem thêm
  </button>
</div>

<div className={styles.specGrid}>
  {loading ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>Đang tải chuyên khoa...</div>
  ) : error ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px', color: 'red' }}>Lỗi: {error}</div>
  ) : specialties.length === 0 ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>Chưa có chuyên khoa nào</div>
  ) : (
    specialties.slice(0, HOME_SPECIALTY_LIMIT).map((s, i) => (
      <div
        key={s.id}
        className={`${styles.specCard} ${activeSpec === i ? styles.specActive : ''}`}
        onClick={() => {
          setActiveSpec(i);
          navigate(`/tim-kiem?specialtyId=${s.id}&q=${encodeURIComponent(s.name)}`);
        }}
      >
        <div className={styles.specIcon}>
          {s.iconUrl && s.iconUrl.startsWith('http') ? (
            <img 
              src={s.iconUrl} 
              alt={s.name} 
              className={styles.iconImg}
              style={{ width: '40px', height: '40px', objectFit: 'contain' }}
              onError={(e) => {
                e.target.onerror = null; 
                e.target.src = "https://cdn-icons-png.flaticon.com/512/3063/3063176.png"; 
              }}
            />
          ) : (
            '🏥'
          )}
        </div>
        <div className={styles.specName}>{s.name}</div>
        <div className={styles.specCount}>{s.description || 'Chuyên khoa'}</div>
      </div>
    ))
  )}
</div>





        <div id="section-clinics" className={styles.sectionAnchor} />
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
  {clinicsLoading ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>
      Đang tải phòng khám...
    </div>
  ) : clinicError ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px', color: 'red' }}>
      Lỗi: {clinicError}
    </div>
  ) : clinics.length === 0 ? (
    <div style={{ textAlign: 'center', gridColumn: '1 / -1', padding: '20px' }}>
      Chưa có phòng khám nào
    </div>
  ) : (
    clinics.map(clinic => (
      <div
        key={clinic.id}
        className={styles.clinicCard}
        onClick={() => navigate(`/phong-kham/${clinic.id}`)}
      >
        <div className={styles.clinicImg}>
          {clinic.photoUrl ? (
            <img src={clinic.photoUrl} alt={clinic.name} />
          ) : (
            clinic.avatar || '🏥'
          )}
        </div>
        <div className={styles.clinicName}>{clinic.name}</div>
        <div className={styles.clinicAddr}>{clinic.address}</div>
      </div>
    ))
  )}
</div>

        

        {/* BÁC SĨ */}
        <div id="section-doctors" className={styles.sectionAnchor} />
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
            {filteredDoctors.slice(0, HOME_DOCTOR_LIMIT).map(doc => (
              <DoctorCard key={doc.id} doctor={doc} onBook={setModalDoctor} />
            ))}
          </div>
        )}

      </main>

      {modalDoctor && <BookingModal doctor={modalDoctor} onClose={() => setModalDoctor(null)} />}
    </>
  )
}