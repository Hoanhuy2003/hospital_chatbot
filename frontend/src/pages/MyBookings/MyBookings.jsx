import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointmentService';
import { notificationService } from '../../services/notificationService';
import styles from './MyBookings.module.css';

const STATUS_MAP = {
  PENDING: { label: 'Chờ xác nhận', color: '#F57C00', bg: '#FFF3E0' },
  CONFIRMED: { label: 'Đã xác nhận', color: '#2E7D32', bg: '#E8F5E9' },
  CANCELLED: { label: 'Đã huỷ',      color: '#C62828', bg: '#FFEBEE' },
  DONE:      { label: 'Hoàn thành',  color: '#1565C0', bg: '#E3F2FD' },
};

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) return;
      try {
        setLoading(true);
        // 1. Gọi API lấy lịch khám
        const data = await appointmentService.getByPatient(userId);
        console.log("Dữ liệu thực tế từ API:", data);
        setBookings(data || []);

        // 2. Gọi API lấy thông báo
        const notiData = await notificationService.getByUserId(userId);
        setNotifications(notiData || []);
      } catch (err) {
        console.error("Lỗi tải dữ liệu:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className={styles.loading}>Đang tải lịch khám...</div>;

  return (
    <div className={styles.wrapper}>
      {/* PHẦN THÔNG BÁO (Lấy từ DB thông báo) */}
      {/* {notifications.length > 0 && (
        <div className={styles.notiBox}>
          <h3>📢 Thông báo mới nhất</h3>
          {notifications.map(n => (
            <div key={n.id} className={styles.notiItem}>{n.message}</div>
          ))}
        </div>
      )} */}

      <h1 className={styles.title}>Danh sách bác sĩ đã đặt</h1>
      
      <div className={styles.list}>
        {bookings.map((b) => {
          const s = STATUS_MAP[b.status] || STATUS_MAP.PENDING;

          return (
            <div key={b.id} className={styles.card}>
              <div className={styles.cardLeft}>
                <div className={styles.avatar}>
          
          {b.photoUrl ? (
            <img 
              src={b.photoUrl} 
              alt={b.doctorName} 
              className={styles.avatar} 
            />
          ) : (
            <span className={styles.defaultIcon}>👨‍⚕️</span>
          )}
        </div>
              </div>
              
              <div className={styles.cardBody}>
                {/* SỬA Ở ĐÂY: Gọi trực tiếp b.doctorName theo API của bạn */}
                <div className={styles.docName}>BS. {b.doctorName || "Chưa có tên"}</div>
                <div className={styles.docSpec}>{b.specialtyName}</div>
                
                <div className={styles.meta}>
                  <div>🏥 {b.clinicName}</div>
                  <div>📅 Ngày khám: <strong>{b.date}</strong></div>
                  <div>🕐 Giờ khám: <strong>{b.timeSlot?.replace('_', ' - ')}</strong></div>
                </div>

                <div className={styles.footerInfo}>
                  <span className={styles.code}>Mã phiếu: <strong>{b.queueNumber}</strong></span>
                </div>
              </div>

              <div className={styles.cardRight}>
                <span className={styles.status} style={{ color: s.color, background: s.bg }}>
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}