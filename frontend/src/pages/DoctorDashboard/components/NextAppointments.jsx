import styles from './Shared.module.css'
export default function NextAppointments({ nextAppts }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Lịch hẹn tái khám — {nextAppts.length} lịch</div>
      {nextAppts.map((n,i)=>(
        <div key={i} className={styles.nextRow} style={{padding:'12px 0'}}>
          <div className={styles.nextDate}>📅 {n.date}</div>
          <div style={{flex:1}}><div className={styles.apptName}>{n.name}</div><div className={styles.apptReason}>{n.note}</div></div>
          <span className={styles.apptReason}>{n.phone}</span>
        </div>
      ))}
    </div>
  )
}