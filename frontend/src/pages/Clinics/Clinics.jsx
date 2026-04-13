import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { CLINICS, SPECIALTIES } from '../../data/constants'
import styles from './Clinics.module.css'

export default function Clinics() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [activeSpec, setActiveSpec] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return CLINICS.filter(c => {
      const matchQ = !q
        || c.name.toLowerCase().includes(q)
        || c.specialty.toLowerCase().includes(q)
        || c.address.toLowerCase().includes(q)
      const matchS = !activeSpec || c.specialty === activeSpec
      return matchQ && matchS
    })
  }, [query, activeSpec])

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đặt khám phòng khám</h1>
          <p className={styles.sub}>
            Đa dạng phòng khám với nhiều chuyên khoa như Sản - Nhi, Tai Mũi Họng, Da Liễu, Tiêu Hoá...
          </p>
        </div>
      </div>

      {/* Search */}
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm tên phòng khám, chuyên khoa, địa chỉ..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {/* Specialty filter chips */}
      <div className={styles.chips}>
        <button
          className={`${styles.chip} ${activeSpec === '' ? styles.chipActive : ''}`}
          onClick={() => setActiveSpec('')}
        >Tất cả</button>
        {['Sản phụ khoa','Nhi khoa','Da liễu','Tai mũi họng','Răng hàm mặt','Đa khoa'].map(s => (
          <button
            key={s}
            className={`${styles.chip} ${activeSpec === s ? styles.chipActive : ''}`}
            onClick={() => setActiveSpec(s)}
          >{s}</button>
        ))}
      </div>

      {/* Result count */}
      <p className={styles.count}>Tìm thấy <strong>{filtered.length}</strong> phòng khám</p>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 52 }}>🏥</div>
          <p>Không tìm thấy phòng khám phù hợp</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(clinic => (
            <div
              key={clinic.id}
              className={styles.card}
              onClick={() => navigate(`/phong-kham/${clinic.id}`)}
            >
              <div className={styles.cardImg}>{clinic.avatar}</div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{clinic.name}</div>
                <div className={styles.cardSpec}>{clinic.specialty}</div>
                <div className={styles.cardAddr}>{clinic.address}</div>
                <div className={styles.cardMeta}>
                  ⭐ {clinic.rating} · {clinic.price}/lượt
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}