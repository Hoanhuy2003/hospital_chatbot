import styles from './Shared.module.css'
const badge = s=>({wait:'badgeWait',done:'badgeDone',confirm:'badgeConfirm',cancel:'badgeCancel'}[s])
const label = s=>({wait:'Chờ khám',done:'Đã khám',confirm:'Đã xác nhận',cancel:'Đã hủy'}[s])
export default function ScheduleList({ appointments, openPatient }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Lịch khám hôm nay — {appointments.length} bệnh nhân</div>
      {appointments.map(a=>(
        <div key={a.id} className={styles.apptItem} onClick={()=>openPatient(a.id)}>
          <span className={styles.apptTime}>{a.time}</span>
          <div className={styles.apptAva}>{a.name.split(' ').pop()[0]}</div>
          <div className={styles.apptInfo}>
            <div className={styles.apptName}>{a.name} · {a.age} tuổi · {a.gender}</div>
            <div className={styles.apptReason}>{a.reason}</div>
          </div>
          <span className={`${styles.badge} ${styles[badge(a.status)]}`}>{label(a.status)}</span>
        </div>
      ))}
    </div>
  )
}