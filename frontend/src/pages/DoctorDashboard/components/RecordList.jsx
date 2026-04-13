import styles from './Shared.module.css'
export default function RecordList({ appointments, openPatient }) {
  const done = appointments.filter(a=>a.status==='done')
  return (
    <div className={styles.card}>
      <div className={styles.cardTitle}>Bệnh án đã lập hôm nay</div>
      {done.length === 0
        ? <div className={styles.empty}>Chưa có bệnh án nào hôm nay</div>
        : done.map(a=>(
            <div key={a.id} className={styles.apptItem}>
              <div className={styles.apptAva}>{a.name.split(' ').pop()[0]}</div>
              <div className={styles.apptInfo}><div className={styles.apptName}>{a.name} · {a.age} tuổi</div><div className={styles.apptReason}>{a.reason}</div></div>
              <button className={`${styles.btn} ${styles.btnOutline}`} onClick={()=>openPatient(a.id,2)}>Bệnh án</button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={()=>openPatient(a.id,3)}>Đơn thuốc</button>
            </div>
          ))
      }
    </div>
  )
}