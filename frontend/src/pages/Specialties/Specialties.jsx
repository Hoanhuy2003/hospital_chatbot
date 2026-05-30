import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { specialtyService } from '../../services/api'
import styles from './Specialties.module.css'

const FALLBACK_ICON = 'https://cdn-icons-png.flaticon.com/512/3063/3063176.png'

export default function Specialties() {
  const navigate = useNavigate()
  const [specialties, setSpecialties] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const data = await specialtyService.getAll()
        const list = data?.content || data
        setSpecialties(Array.isArray(list) ? list : [])
      } catch (err) {
        console.error('Lỗi lấy danh sách chuyên khoa:', err)
        setSpecialties([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return specialties
    return specialties.filter(
      (s) =>
        s.name?.toLowerCase().includes(q) ||
        s.description?.toLowerCase().includes(q)
    )
  }, [query, specialties])

  function goBook(specialty) {
    navigate(`/tim-kiem?specialtyId=${specialty.id}&q=${encodeURIComponent(specialty.name || '')}`)
  }

  if (loading) {
    return <div className={styles.loading}>Đang tải danh sách chuyên khoa...</div>
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Đặt lịch theo chuyên khoa</h1>
          <p className={styles.sub}>Tất cả chuyên khoa — {specialties.length} khoa</p>
        </div>
      </div>

      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          placeholder="Tìm tên chuyên khoa, mô tả..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className={styles.searchIcon}>🔍</span>
      </div>

      <p className={styles.count}>
        Hiển thị <strong>{filtered.length}</strong> chuyên khoa
      </p>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <div style={{ fontSize: 52 }}>🩺</div>
          <p>Không tìm thấy chuyên khoa phù hợp</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((s) => (
            <div key={s.id} className={styles.card} onClick={() => goBook(s)}>
              <div className={styles.cardIcon}>
                {s.iconUrl && s.iconUrl.startsWith('http') ? (
                  <img
                    src={s.iconUrl}
                    alt={s.name}
                    className={styles.iconImg}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = FALLBACK_ICON
                    }}
                  />
                ) : (
                  '🏥'
                )}
              </div>
              <div className={styles.cardName}>{s.name}</div>
              <div className={styles.cardDesc}>{s.description || 'Chuyên khoa'}</div>
              <div className={styles.cardAction}>Đặt khám →</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
