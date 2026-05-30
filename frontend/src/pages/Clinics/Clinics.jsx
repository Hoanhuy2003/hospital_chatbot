import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clinicService } from '../../services/clinicService'
import styles from './Clinics.module.css'

export default function Clinics() {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeSpec, setActiveSpec] = useState('')

  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true)
        const list = await clinicService.getAllList()
        setClinics(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Lỗi lấy danh sách phòng khám:', err)
        setClinics([])
      } finally {
        setLoading(false)
      }
    }
    fetchClinics()
  }, [])

  const specialtyOptions = useMemo(() => {
    const names = clinics
      .map((c) => c.specialtyName)
      .filter(Boolean)
    return [...new Set(names)].sort()
  }, [clinics])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return clinics.filter((c) => {
      const spec = c.specialtyName || ''
      const matchQ =
        !q ||
        c.name?.toLowerCase().includes(q) ||
        spec.toLowerCase().includes(q) ||
        c.address?.toLowerCase().includes(q)
      const matchS = !activeSpec || spec === activeSpec
      return matchQ && matchS
    })
  }, [query, activeSpec, clinics])

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách phòng khám...</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đặt khám phòng khám</h1>
          <p className={styles.sub}>Danh sách tất cả phòng khám — {clinics.length} phòng</p>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm tên phòng khám, chuyên khoa, địa chỉ..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      {specialtyOptions.length > 0 && (
        <div className={styles.chips}>
          <button
            type="button"
            className={`${styles.chip} ${activeSpec === '' ? styles.chipActive : ''}`}
            onClick={() => setActiveSpec('')}
          >
            Tất cả
          </button>
          {specialtyOptions.map((name) => (
            <button
              key={name}
              type="button"
              className={`${styles.chip} ${activeSpec === name ? styles.chipActive : ''}`}
              onClick={() => setActiveSpec(name)}
            >
              {name}
            </button>
          ))}
        </div>
      )}

      <p className={styles.count}>
        Hiển thị <strong>{filtered.length}</strong> phòng khám
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 52 }}>🏥</div>
          <p>Không tìm thấy phòng khám phù hợp</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((clinic) => (
            <div
              key={clinic.id}
              className={styles.card}
              onClick={() => navigate(`/phong-kham/${clinic.id}`)}
            >
              <div className={styles.cardImg}>
                {clinic.photoUrl ? (
                  <img src={clinic.photoUrl} alt={clinic.name} />
                ) : (
                  '🏥'
                )}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{clinic.name}</div>
                <div className={styles.cardSpec}>{clinic.specialtyName || '—'}</div>
                <div className={styles.cardAddr}>{clinic.address || '—'}</div>
                {clinic.phone && (
                  <div className={styles.cardMeta}>📞 {clinic.phone}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
