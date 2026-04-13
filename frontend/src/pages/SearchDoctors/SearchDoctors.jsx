import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { DOCTORS, SPECIALTIES } from '../../data/constants'
import BookingModal from '../../components/BookingModal/BookingModal'
import styles from './SearchDoctors.module.css'

export default function SearchDoctors() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [activeSpec, setActiveSpec] = useState(searchParams.get('specialty') || '')
  const [modalDoctor, setModalDoctor] = useState(null)

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return DOCTORS.filter(d => {
      const matchQ = !q
        || d.name.toLowerCase().includes(q)
        || d.specialty.toLowerCase().includes(q)
        || d.hospital.toLowerCase().includes(q)
      const matchS = !activeSpec || d.specialty.includes(activeSpec)
      return matchQ && matchS
    })
  }, [query, activeSpec])

  function handleSpec(spec) {
    setActiveSpec(spec)
    setSearchParams(spec ? { specialty: spec } : {})
  }

  function handleSearch(e) {
    setQuery(e.target.value)
  }

  return (
    <div className={styles.page}>
      {/* Search bar */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm theo triệu chứng, bác sĩ, bệnh viện..."
          value={query}
          onChange={handleSearch}
        />
        <button className={styles.searchBtn}>🔍</button>
      </div>

      {/* Filter row */}
      <div className={styles.filters}>
        <div className={styles.filterPill}>Nơi khám: Bác sĩ ▾</div>
        <div className={styles.filterPill}>📍 Khu vực</div>
        <div className={styles.filterPill}>🎯 Gần nhất</div>
      </div>

      {/* Specialty chips */}
      <div className={styles.specChips}>
        <button
          className={`${styles.chip} ${activeSpec === '' ? styles.chipActive : ''}`}
          onClick={() => handleSpec('')}
        >Tất cả</button>
        {SPECIALTIES.map(s => (
          <button
            key={s.id}
            className={`${styles.chip} ${activeSpec === s.name ? styles.chipActive : ''}`}
            onClick={() => handleSpec(s.name)}
          >
            {s.icon} {s.name}
          </button>
        ))}
      </div>

      {/* Result count */}
      <p className={styles.resultCount}>
        Tìm thấy <strong>{filtered.length}</strong> kết quả
        {activeSpec && <> cho chuyên khoa <strong>{activeSpec}</strong></>}
      </p>

      {/* Doctor list */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 52 }}>🔍</div>
          <p>Không tìm thấy bác sĩ phù hợp</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(doc => (
            <DoctorRow key={doc.id} doctor={doc} onBook={setModalDoctor} />
          ))}
        </div>
      )}

      {/* Booking modal */}
      {modalDoctor && (
        <BookingModal doctor={modalDoctor} onClose={() => setModalDoctor(null)} />
      )}
    </div>
  )
}

function DoctorRow({ doctor, onBook }) {
  return (
    <div className={styles.doctorItem}>
      <div className={styles.avatar}>{doctor.avatar}</div>
      <div className={styles.docBody}>
        <div className={styles.docName}>{doctor.name}</div>
        <div className={styles.docTags}>
          <span className={styles.tag}>{doctor.specialty}</span>
        </div>
        <div className={styles.docAddr}>📍 {doctor.hospital}</div>
        <div className={styles.docMeta}>
          ⭐ {doctor.rating} ({doctor.reviewCount} đánh giá) · {doctor.price}/lượt
          · {doctor.experience} năm kinh nghiệm
        </div>
      </div>
      <button className={styles.btnBook} onClick={() => onBook(doctor)}>
        Đặt khám
      </button>
    </div>
  )
}