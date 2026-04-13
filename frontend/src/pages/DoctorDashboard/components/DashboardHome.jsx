import styles from './Shared.module.css'
export default function DashboardHome({ appointments, nextAppts, openPatient, setPage }) {
  const done   = appointments.filter(a=>a.status==='done').length
  const wait   = appointments.filter(a=>a.status==='wait').length
  const cancel = appointments.filter(a=>a.status==='cancel').length
  const badge = s => ({wait:'badgeWait',done:'badgeDone',confirm:'badgeConfirm',cancel:'badgeCancel'}[s])
  const label = s => ({wait:'Chờ khám',done:'Đã khám',confirm:'Đã xác nhận',cancel:'Đã hủy'}[s])
  return (
    <>
      <div className={styles.statsRow}>
        {[['Tổng lịch hôm nay',appointments.length,'blue'],['Đã khám xong',done,'green'],['Chờ khám',wait,'orange'],['Đã hủy',cancel,'red']].map(([l,n,c])=>(
          <div key={l} className={styles.statCard}><div className={styles.statLabel}>{l}</div><div className={`${styles.statNum} ${styles[c]}`}>{n}</div></div>
        ))}
      </div>
      <div className={styles.grid2}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Lịch khám hôm nay <span onClick={()=>setPage('schedule')}>Xem tất cả →</span></div>
          {appointments.slice(0,5).map(a=>(
            <div key={a.id} className={styles.apptItem} onClick={()=>openPatient(a.id)}>
              <span className={styles.apptTime}>{a.time}</span>
              <div className={styles.apptAva}>{a.name.split(' ').pop()[0]}</div>
              <div className={styles.apptInfo}><div className={styles.apptName}>{a.name}</div><div className={styles.apptReason}>{a.reason}</div></div>
              <span className={`${styles.badge} ${styles[badge(a.status)]}`}>{label(a.status)}</span>
            </div>
          ))}
        </div>
        <div className={styles.card}>
          <div className={styles.cardTitle}>Lịch hẹn lần sau <span onClick={()=>setPage('next')}>Xem tất cả →</span></div>
          {nextAppts.map((n,i)=>(
            <div key={i} className={styles.nextRow}>
              <div className={styles.nextDate}>📅 {n.date}</div>
              <div><div className={styles.apptName}>{n.name}</div><div className={styles.apptReason}>{n.note}</div></div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}