import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import BookingModal from '../../components/BookingModal/BookingModal'
import { specialtyService } from '../../services/api'
import { doctorService } from '../../services/doctorService'
import styles from './SearchDoctors.module.css'

export default function SearchDoctors() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeSpecId, setActiveSpecId] = useState(searchParams.get('specialtyId') || '')
  const [modalDoctor, setModalDoctor] = useState(null)

  // Khởi tạo là mảng rỗng để không bị lỗi .filter hay .map
  const [allSpecialties, setAllSpecialties] = useState([])
  const [doctors, setDoctors] = useState([])
  const [loading, setLoading] = useState(false)

  // 1. Fetch danh sách chuyên khoa
  useEffect(() => {
    specialtyService.getAll()
      .then(data => {
        // Nếu Backend trả về object có content thì lấy data.content, không thì lấy data
        const list = data?.content || data;
        if (Array.isArray(list)) setAllSpecialties(list);
      })
      .catch(err => console.error("Lỗi fetch chuyên khoa:", err))
  }, [])

  // 2. Fetch danh sách bác sĩ (Xử lý bóc tách .content)
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true)
        let result = []
        
        if (activeSpecId) {
          // Gọi API theo chuyên khoa
          const data = await specialtyService.getDoctorBySpecialty(activeSpecId)
          // Bóc tách nếu có .content (phân trang)
          result = data?.content || data
        } else {
          result = await doctorService.getAllList()
        }
        
        setDoctors(Array.isArray(result) ? result : [])
      } catch (error) {
        console.error('Lỗi fetch bác sĩ: ', error)
        setDoctors([])
      } finally {
        setLoading(false)
      }
    }
    fetchDoctors()
  }, [activeSpecId])

  // 3. Filter tìm kiếm (Dùng optional chaining ?. để an toàn)
  const filtered = useMemo(() => {
    if (!Array.isArray(doctors)) return []
    
    const q = query.toLowerCase().trim()
    return doctors.filter(d => {
      const matchQ = !q
        || d.fullName?.toLowerCase().includes(q)
        || d.clinicName?.toLowerCase().includes(q)
        || d.specialtyName?.toLowerCase().includes(q)
      return matchQ
    })
  }, [query, doctors])

  function handleSpec(specId) {
    setActiveSpecId(specId)
    setSearchParams(specId ? { specialtyId: specId } : {})
  }

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm bác sĩ, phòng khám..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button className={styles.searchBtn}>🔍</button>
      </div>

      {/* Specialty chips */}
      {/* <div className={styles.specChips}>
  <button
    className={`${styles.chip} ${activeSpecId === '' ? styles.chipActive : ''}`}
    onClick={() => handleSpec('')}
  >
    Tất cả
  </button>

  {allSpecialties.map(s => (
    <button
      key={s.id}
      // Dùng == để so sánh vì ID từ URL có thể là chuỗi "1", ID từ mảng là số 1
      className={`${styles.chip} ${activeSpecId == s.id ? styles.chipActive : ''}`}
      onClick={() => handleSpec(s.id)} // Truyền ID vào đây!
    >
      {s.name}
    </button>
  ))}
</div> */}

      <p className={styles.resultCount}>
        Tìm thấy <strong>{filtered.length}</strong> kết quả
      </p>

      {/* Danh sách bác sĩ */}
      {loading ? (
        <div className={styles.loading}>Đang tải...</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Không tìm thấy bác sĩ phù hợp.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(doc => (
            <DoctorRow key={doc.id} doctor={doc} onBook={setModalDoctor} />
          ))}
        </div>
      )}

      {/* Modal đặt lịch */}
      {modalDoctor && (
        <BookingModal doctor={modalDoctor} onClose={() => setModalDoctor(null)} />
      )}
    </div>
  )
}

function DoctorRow({ doctor, onBook }) {
  return (
    <div className={styles.doctorItem}>
      <div className={styles.avatar}>
                  {doctor.photoUrl ? (
                    <img src={doctor.photoUrl} alt={doctor.fullName} className={styles.avatar} />
                  ) : (
                    '👨‍⚕️'
                  )}
                </div>
      <div className={styles.docBody}>
        <div className={styles.docName}>{doctor.fullName}</div>
        <div className={styles.docTags}>
          <span className={styles.tag}>{doctor.specialtyName}</span>
        </div>
        <div className={styles.docAddr}>📍 {doctor.clinicName}</div>
        <div className={styles.docMeta}>
          ⭐ 5.0 · {doctor.experienceYears} năm kinh nghiệm · <strong>{doctor.price?.toLocaleString()}đ</strong>
        </div>
      </div>
      <button className={styles.btnBook} onClick={() => onBook(doctor)}>
        Đặt khám
      </button>
    </div>
  )
}