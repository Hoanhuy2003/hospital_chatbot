import { useNavigate } from 'react-router-dom'
import styles from './DoctorCard.module.css'

export default function DoctorCard({ doctor, onBook }) {
  const navigate = useNavigate()

  return (
    <div className={styles.card}>
      <div className={styles.avatarWrap} onClick={() => navigate(`/bac-si/${doctor.id}`)}>
        <div className={styles.avatar}>{doctor.photoUrl ? (
      <img 
        src={doctor.photoUrl} 
        alt={doctor.fullName} 
        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} 
      />
    ) : (
      '👨‍⚕️'
    )}</div>
      </div>
      <div className={styles.info} onClick={() => navigate(`/bac-si/${doctor.id}`)}>
        <div className={styles.name}>{doctor.fullName}</div>
        <div className={styles.specialty}>{doctor.specialtyName}</div>
        {/* <div className={styles.hospital}>{doctor.hospital}</div> */}
        <div className={styles.meta}>
          <span className={styles.chip}>⭐ {doctor.rating}</span>
          <span className={styles.chip}>{doctor.experienceYears} năm KN</span>
          <span className={styles.chipOrange}>{doctor.price}</span>
        </div>
      </div>
      <div className={styles.action} onClick={() => onBook(doctor)}>
        <span>Đặt lịch khám</span>
        <span>→</span>
      </div>
    </div>
  )
}
