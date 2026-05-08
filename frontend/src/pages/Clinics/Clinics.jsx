import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { clinicService } from '../../services/clinicService' // Import service
import styles from './Clinics.module.css'

export default function Clinics() {
  const navigate = useNavigate()
  const [clinics, setClinics] = useState([]) // State lưu danh sách phòng khám từ DB
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [activeSpec, setActiveSpec] = useState('')

  // 1. Fetch dữ liệu từ Backend khi component mount
  useEffect(() => {
    const fetchClinics = async () => {
      try {
        setLoading(true);
        const data = await clinicService.getAll();
        setClinics(data || []);
      } catch (err) {
        console.error("Lỗi lấy danh sách phòng khám:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchClinics();
  }, []);

  // 2. Lọc dữ liệu (Sửa CLINICS thành clinics lấy từ state)
  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return clinics.filter(c => {
      const matchQ = !q
        || c.name.toLowerCase().includes(q)
        || (c.specialty && c.specialty.toLowerCase().includes(q))
        || (c.address && c.address.toLowerCase().includes(q))
      const matchS = !activeSpec || c.specialty === activeSpec
      return matchQ && matchS
    })
  }, [query, activeSpec, clinics]) // Thêm clinics vào dependency

  if (loading) return <div className={styles.loading}>Đang tải danh sách phòng khám...</div>

  return (
    <div className={styles.page}>
      {/* ... Phần Header và Search giữ nguyên ... */}

      {/* Grid hiển thị */}
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
              {/* Nếu DB có link ảnh thì dùng, không thì dùng icon mặc định */}
              <div className={styles.cardImg}>
                {clinic.avatarUrl ? <img src={clinic.avatarUrl} alt={clinic.name} /> : '🏥'}
              </div>
              <div className={styles.cardBody}>
                <div className={styles.cardName}>{clinic.name}</div>
                <div className={styles.cardSpec}>{clinic.specialty}</div>
                <div className={styles.cardAddr}>{clinic.address}</div>
                <div className={styles.cardMeta}>
                  ⭐ {clinic.rating || '5.0'} · {clinic.price ? `${clinic.price.toLocaleString()}đ` : 'Miễn phí'}/lượt
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}