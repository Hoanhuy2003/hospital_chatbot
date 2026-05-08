import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DoctorCard from '../../components/DoctorCard/DoctorCard'
import BookingModal from '../../components/BookingModal/BookingModal'
import { specialtyService } from '../../services/api'
import { clinicService } from '../../services/clinicService'
import { doctorService } from '../../services/doctorService'
import styles from './Home.module.css'


export default function Home() {
  const navigate = useNavigate()
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
    const fetchDoctor = async () =>{

      try{
        setLoading(true)
        const data = await doctorService.getAll()
        setDoctors(data.content || data || [])
         
      }catch(err){
        console.error("Errow", err)
        setError(err.message)

      }finally{
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
        const data = await clinicService.getAll()
        setClinics(data?.content || data || [])
      } catch (err) {
        console.error('Error fetching clinics:', err)
        setClinicError(err.message || 'Không thể tải phòng khám')
      } finally {
        setClinicsLoading(false)
      }
    }

    fetchClinics()
  }, [])

  const filteredDoctors = doctors.filter(d =>
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
  {/* Sửa lại: Xem thêm thì sang trang tìm kiếm chung, không cần truyền ID cụ thể */}
  <button className={styles.btnMore} onClick={() => navigate('/tim-kiem')}>
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
    specialties.map((s, i) => (
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