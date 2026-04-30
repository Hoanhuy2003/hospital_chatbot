import styles from './DoctorTopbar.module.css'

export default function DoctorTopbar({ title }) {
  const now = new Date()
  const dateStr = now.toLocaleDateString('vi-VN', { weekday:'long', day:'2-digit', month:'2-digit', year:'numeric' })

  return (
    <div className={styles.topbar}>
      <div className={styles.title}>{title}</div>
      <div className={styles.date}>{dateStr}</div>
    </div>
  )
}