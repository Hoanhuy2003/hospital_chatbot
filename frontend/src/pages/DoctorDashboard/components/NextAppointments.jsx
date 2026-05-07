import styles from './Shared.module.css'
import { useState, useEffect } from 'react'
import { medicalRecordService } from '../../../services/medicalRecordService'
import { toast } from 'react-toastify'

export default function NextAppointments() {
  // 1. Khai báo state là 'list'
  const [list, setList] = useState([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFollowUps = async () => {
      try {
        setLoading(true);
        const doctorId = localStorage.getItem('userId'); 
        if (doctorId) {
          const data = await medicalRecordService.getNextAppointment(doctorId);
          // 2. Cập nhật vào 'list'
          setList(data || []); 
        }
      } catch (error) {
        console.error("Lỗi:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchFollowUps();
  }, []); // Có [] để không bị lặp vô hạn

  if (loading) return <div className={styles.card}>Đang tải...</div>;

  return (
    <div className={styles.card}>
      {/* 3. Dùng 'list.length' thay vì 'nextAppts.length' */}
      <div className={styles.cardTitle}>Lịch hẹn tái khám — {list.length} lịch</div>
      
      {/* 4. Dùng 'list.map' thay vì 'nextAppts.map' */}
      {list.map((n, i) => (
        <div key={i} className={styles.nextRow} style={{padding: '12px 0'}}>
          <div className={styles.nextDate}>📅 {n.date}</div>
          <div style={{flex: 1}}>
            <div className={styles.apptName}>{n.name}</div>
            <div className={styles.apptReason}>{n.note}</div>
          </div>
          <span className={styles.apptReason}>{n.phone}</span>
        </div>
      ))}
    </div>
  )
}